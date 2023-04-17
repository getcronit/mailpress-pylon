import { GraphQLError, GraphQLErrorExtensions } from "graphql";

export class TemplateNotFoundError extends GraphQLError {
  extensions: GraphQLErrorExtensions;
  constructor(templateId: string) {
    const message = `No template found with id ${templateId}`;
    super(message);
    this.extensions = {
      statusCode: 404,
      code: "TEMPLATE_NOT_FOUND",
      description: "No template was found with the given id",
    };
  }
}

export class EnvelopeNotFoundError extends GraphQLError {
  extensions: GraphQLErrorExtensions;
  constructor(templateId: string) {
    const message = `No envelop found for template ${templateId}`;
    super(message);
    this.extensions = {
      statusCode: 404,
      code: "ENVELOP_NOT_FOUND",
      description: "No envelop was found for the given template",
    };
  }
}

export class TemplateAlreadyExistsError extends GraphQLError {
  extensions: GraphQLErrorExtensions;
  constructor(templateId: string) {
    const message = `Template with id ${templateId} already exists`;
    super(message);
    this.extensions = {
      statusCode: 409,
      code: "TEMPLATE_ALREADY_EXISTS",
      description: "A template with the given id already exists",
    };
  }
}

export class TemplateVariableValueNotProvidedError extends GraphQLError {
  extensions: GraphQLErrorExtensions;
  constructor(variableName: string) {
    const message = `Value for variable "${variableName}" is required but was not provided`;
    super(message);
    this.extensions = {
      statusCode: 400,
      code: "VARIABLE_VALUE_NOT_PROVIDED",
      description: `A value for the required variable '${variableName}' was not provided`,
    };
  }
}

export class FromEmailAddressNotAuthorizedError extends GraphQLError {
  extensions: GraphQLErrorExtensions;
  constructor(from: string) {
    const message = `From email address ${from} is not authorized`;
    super(message);
    this.extensions = {
      statusCode: 403,
      code: "FROM_EMAIL_ADDRESS_NOT_AUTHORIZED",
      description: `The from email address ${from} is not authorized`,
    };
  }
}
