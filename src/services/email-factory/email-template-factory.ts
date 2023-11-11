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
} from "../../errors/email-factory.errors";

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
  from?: EmailAddress | null;
  to?: EmailAddress[] | null;
  subject?: string | null;
  replyTo?: EmailAddress | null;
}

export interface EmailAddress {
  value: string;
  type: "EMAIL_ADDRESS" | "EMAIL_ID" | "USER_ID";
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

  private static getContext(
    variables: TemplateVariables,
    values: TemplateVariableValues
  ): any {
    const context: any = {};

    for (const variableName in variables) {
      if (variables.hasOwnProperty(variableName)) {
        const variable = variables[variableName];

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
    template: {
      content: string;
      variables: TemplateVariables;
    },
    values: TemplateVariableValues = {}
  ): string {
    const twigTemplate = Twig.twig({ data: template.content });

    const context = EmailTemplateFactory.getContext(template.variables, values);

    const result = twigTemplate.render(context);

    return EmailTemplateFactory.minifyRenderedTemplate(result);
  }

  templateId: string;
  emailTemplate: EmailTemplate;

  static render(
    template: {
      content: string;
      variables: TemplateVariables;
    },
    values: TemplateVariableValues = {}
  ): string {
    try {
      return EmailTemplateFactory.renderTemplate(template, values);
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
