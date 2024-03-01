// import ivm from "isolated-vm";
import { EmailTemplate } from "../repository/models/EmailTemplate";
import { EmailEnvelope } from "../repository/models/EmailEnvelope";

export interface SandboxTemplate {
  id: string;
  description: string;
  transformer: string | null;
  createdAt: Date;
  updatedAt: Date;
  envelope?: {
    subject?: string;
    to: string[];
    replyTo?: string;
  } | null;
  verifyReplyTo?: boolean;
}

export const executeInSandbox = async (args: {
  input: {
    envelope: { subject?: string; to: string[]; replyTo?: string };
    values: Record<string, string>;
    body?: string;
    bodyHTML?: string;
  };
  template: EmailTemplate;
  parentTemplate: EmailTemplate | null;
}): Promise<{
  verifyReplyTo: boolean | undefined;
  envelope: Partial<SandboxTemplate["envelope"]>;
}> => {
  const code = args.template.transformer;

  if (!code) {
    throw new Error("No transformer code");
  }

  const buildEnvelopeFromTemplate = async (
    template: EmailTemplate
  ): Promise<Partial<SandboxTemplate["envelope"]>> => {
    template;
    const emailEnvelope = await template.envelope();

    if (emailEnvelope) {
      const to = emailEnvelope.to;
      const replyTo = emailEnvelope.replyTo || undefined;

      return {
        subject: emailEnvelope.subject || undefined,
        to,
        replyTo,
      };
    }
  };

  const templateEnvelope = await buildEnvelopeFromTemplate(args.template);
  const parentTemplateEnvelope = args.parentTemplate
    ? await buildEnvelopeFromTemplate(args.parentTemplate)
    : undefined;

  // const sandboxTemplate: SandboxTemplate = {
  //   id: emailTemplate.id,
  //   description: emailTemplate.description,
  //   transformer: emailTemplate.transformer,
  //   createdAt: emailTemplate.createdAt,
  //   updatedAt: emailTemplate.updatedAt,
  //   envelope,
  // };

  // const isolate = new ivm.Isolate({ memoryLimit: 128 });

  // Create a new context within this isolate. Each context has its own copy of all the builtin
  // Objects. So for instance if one context does Object.prototype.foo = 1 this would not affect any
  // other contexts.
  // const context = isolate.createContextSync();

  // Get a Reference{} to the global object within the context.
  // const jail = context.global;

  // This makes the global object available in the context as `global`. We use `derefInto()` here
  // because otherwise `global` would actually be a Reference{} object in the new isolate.
  // jail.setSync("global", jail.derefInto());

  // const hostile = await isolate.compileScript(`
  //   const template = ${JSON.stringify(args.template)};
  //   const parentTemplate = ${JSON.stringify(args.parentTemplate)};

  //   const templateEnvelope = ${JSON.stringify(templateEnvelope)};
  //   const parentTemplateEnvelope = ${JSON.stringify(parentTemplateEnvelope)};
  //   const input = ${JSON.stringify(args.input)};

  //   let result = {
  //     verifyReplyTo: undefined,
  //     envelope: {},
  //   };
  //   ${code}
  //   result;
  // `);

  // Execute hostile code in the context.
  // const result = await hostile.run(context, {
  //   copy: true,
  // });

  // IMPORTANT: The following code is unsafe but currently necessary to run the transformer code.
  // Only unsafe-transformer roles can set the transformer code, so it is assumed to be safe.
  const result = eval(`const template = ${JSON.stringify(args.template)};
  const parentTemplate = ${JSON.stringify(args.parentTemplate)};

  const templateEnvelope = ${JSON.stringify(templateEnvelope)};
  const parentTemplateEnvelope = ${JSON.stringify(parentTemplateEnvelope)};
  const input = ${JSON.stringify(args.input)};

  let result = {
    verifyReplyTo: undefined,
    envelope: {},
  };

  ${code}

  result;
  `);

  return result;
};
