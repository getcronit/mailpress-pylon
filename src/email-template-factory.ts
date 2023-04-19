import Twig from "twig";
import { minify } from "html-minifier";

Twig.extendFilter("format_currency", (value: number, params: false | any[]) => {
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: params ? params[0] : "EUR",
  }).format(value);
});

import {
  TemplateAlreadyExistsError,
  TemplateNotFoundError,
  TemplateVariableValueNotProvidedError,
  EnvelopeNotFoundError,
  FromEmailAddressNotAuthorizedError,
  TemplateVariableIsConstantError,
} from "./errors";

export interface TemplateMetadata {
  id: string;
  template: EmailTemplate;
}

export interface EmailTemplate {
  content: string;
  variables?: TemplateVariables;
  envelope?: EmailEnvelope;
  /**
   * If true, the replyTo address of the email will be verified against the
   * authorized email addresses of the user that is sending the email.
   *
   * If the replyTo address is not authorized, an error will be thrown.
   *
   * If false, the replyTo address will not be verified.
   * This is useful for e.g. contact forms where the email address of the sender
   * is not known. A replyTo address is still required, but it can be any email
   * address.
   */
  verifyReplyTo?: boolean;
  authorizationUser?: {
    id: string;
    authorization: string;
  };
  linkedEmailTemplates?: EmailTemplate[];
  $transformer?: (context: { envelope: EmailEnvelope }) => any;
}

interface TemplateVariables {
  [variableName: string]: VariableDefinition;
}

export interface EmailEnvelope {
  from?: EmailAddress;
  to?: EmailAddress[];
  subject?: string;
  replyTo?: EmailAddress;
}

export interface EmailAddress {
  value: string;
  type: EmailAddressType;
}

export enum EmailAddressType {
  EMAIL_ADDRESS = "EMAIL_ADDRESS",
  EMAIL_ID = "EMAIL_ID",
  USER_ID = "USER_ID",
}

interface VariableDefinition {
  defaultValue?: any;
  isRequired?: boolean;
  isConstant?: boolean;
}

export interface TemplateVariableValues {
  [variableName: string]: any;
}

export class EmailTemplateFactory {
  private static templates: TemplateMetadata[] = [];

  private static getTemplateMetadata(id: string): TemplateMetadata {
    const metadata = EmailTemplateFactory.templates.find(
      (metadata) => metadata.id === id
    );

    if (!metadata) {
      throw new TemplateNotFoundError(id);
    }

    return metadata;
  }

  private static getAllTemplatesMetadata(): TemplateMetadata[] {
    return [...EmailTemplateFactory.templates];
  }

  private static minifyRenderedTemplate(template: string): string {
    const result = minify(template, {
      collapseWhitespace: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeEmptyElements: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
    });

    return result;
  }

  static createTemplate(id: string, template: EmailTemplate): EmailTemplate {
    if (EmailTemplateFactory.templates.some((metadata) => metadata.id === id)) {
      throw new TemplateAlreadyExistsError(id);
    }

    const metadata: TemplateMetadata = {
      id,
      template,
    };

    EmailTemplateFactory.templates.push(metadata);

    return template;
  }

  static getTemplate(id: string): EmailTemplate {
    return EmailTemplateFactory.getTemplateMetadata(id).template;
  }

  static getTemplates() {
    return EmailTemplateFactory.getAllTemplatesMetadata().map(
      (metadata) => metadata.template
    );
  }

  private static getContext(
    template: EmailTemplate,
    values: TemplateVariableValues
  ): any {
    const context: any = {};

    for (const variableName in template.variables) {
      if (template.variables.hasOwnProperty(variableName)) {
        const variable = template.variables[variableName];

        // Check if variable is a constant and has a value provided
        if (variable.isConstant && variableName in values) {
          throw new TemplateVariableIsConstantError(variableName);
        }

        // Check if variable is required and has no value provided
        if (
          !variable.isConstant &&
          !(variableName in values) &&
          variable.isRequired
        ) {
          throw new TemplateVariableValueNotProvidedError(variableName);
        }

        // Set the context variable to the provided value or default value
        context[variableName] =
          values[variableName] || variable.defaultValue || null;
      }
    }

    // Add default variables
    // context.currentTime = () => new Date().toLocaleString();

    return context;
  }

  private static renderTemplate(
    template: EmailTemplate,
    values: TemplateVariableValues = {}
  ): string {
    const twigTemplate = Twig.twig({ data: template.content });

    const context = EmailTemplateFactory.getContext(template, values);

    const result = twigTemplate.render(context);

    return EmailTemplateFactory.minifyRenderedTemplate(result);
  }

  templateId: string;
  emailTemplate: EmailTemplate;

  static render(
    emailTemplate: EmailTemplate,
    values: TemplateVariableValues = {}
  ): string {
    try {
      return EmailTemplateFactory.renderTemplate(emailTemplate, values);
    } catch (error) {
      if (
        error instanceof TemplateNotFoundError ||
        error instanceof EnvelopeNotFoundError ||
        error instanceof TemplateVariableValueNotProvidedError
      ) {
        throw error;
      } else {
        throw new Error(`Failed to render template: ${error}`);
      }
    }
  }
}
