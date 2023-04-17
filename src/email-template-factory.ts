import { sanitizeHtml } from "./sanitize-html";
import {
  TemplateAlreadyExistsError,
  TemplateNotFoundError,
  TemplateVariableValueNotProvidedError,
  EnvelopeNotFoundError,
  FromEmailAddressNotAuthorizedError,
} from "./errors";

interface TemplateMetadata {
  id: string;
  template: EmailTemplate;
}

interface EmailTemplate {
  content: string;
  variables?: TemplateVariables;
  envelope?: EmailEnvelope;
  authorizationUser?: {
    id: string;
    authorization: string;
  };
  confirmationTemplateId?: string;
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
  type: string;
  defaultValue?: string;
  isRequired?: boolean;
}

export interface TemplateVariableValues {
  [variableName: string]: string;
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

  private static renderTemplate(
    templateId: string,
    values: TemplateVariableValues = {}
  ): string {
    const template = EmailTemplateFactory.getTemplate(templateId);
    if (!template) {
      throw new TemplateNotFoundError(templateId);
    }

    let renderedTemplate = template.content;

    for (const variableName in template.variables) {
      if (template.variables.hasOwnProperty(variableName)) {
        const variable = template.variables[variableName];

        if (variable.isRequired && !(variableName in values)) {
          throw new TemplateVariableValueNotProvidedError(variableName);
        }

        const value = values[variableName] || variable.defaultValue || "";
        if (variable.type === "html") {
          renderedTemplate = renderedTemplate.replace(
            new RegExp(`{{${variableName}}}`, "g"),
            this.sanitizeHtml(value)
          );
        } else {
          renderedTemplate = renderedTemplate.replace(
            new RegExp(`{{${variableName}}}`, "g"),
            value
          );
        }
      }
    }

    return renderedTemplate;
  }

  private static sanitizeHtml(value: string): string {
    return sanitizeHtml(value);
  }

  templateId: string;
  emailTemplate: EmailTemplate;

  constructor(templateId: string) {
    const template = EmailTemplateFactory.getTemplate(templateId);

    if (!template) {
      throw new TemplateNotFoundError(templateId);
    }

    this.templateId = templateId;
    this.emailTemplate = template;
  }

  render(values?: TemplateVariableValues): string {
    try {
      return EmailTemplateFactory.renderTemplate(this.templateId, values);
    } catch (error) {
      if (
        error instanceof TemplateNotFoundError ||
        error instanceof EnvelopeNotFoundError ||
        error instanceof TemplateVariableValueNotProvidedError
      ) {
        throw error;
      } else {
        throw new Error(
          `Failed to render template with id ${this.templateId}: ${error}`
        );
      }
    }
  }

  getEnvelope(): EmailEnvelope | undefined {
    const template = EmailTemplateFactory.getTemplate(this.templateId);

    if (!template) {
      throw new TemplateNotFoundError(this.templateId);
    }

    const envelope = template.envelope;

    return envelope;
  }

  getAuthorizationUser(): EmailTemplate["authorizationUser"] {
    const template = EmailTemplateFactory.getTemplate(this.templateId);

    if (!template) {
      throw new TemplateNotFoundError(this.templateId);
    }

    if (!template.authorizationUser) {
      const envelope = template.envelope;

      if (envelope?.from) {
        throw new FromEmailAddressNotAuthorizedError(envelope.from.value);
      }

      throw new Error(
        `Template with id ${this.templateId} does not have an authorizationUser`
      );
    }

    return template.authorizationUser;
  }
}
