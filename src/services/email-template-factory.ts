import { minify } from "html-minifier";
import Twig from "twig";

Twig.extendFilter("format_currency", (value: number, params: false | any[]) => {
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: params ? params[0] : "EUR",
  }).format(value);
});

import {
  EnvelopeNotFoundError,
  TemplateNotFoundError,
  TemplateVariableIsConstantError,
  TemplateVariableValueNotProvidedError,
} from "../errors";

export interface EmailTemplate {
  content: string;
  variables?: TemplateVariables;
}

interface TemplateVariables {
  [variableName: string]: VariableDefinition;
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
