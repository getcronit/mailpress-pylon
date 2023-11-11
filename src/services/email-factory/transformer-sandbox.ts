import ivm from "isolated-vm";
import { EmailTemplate } from "../../repository/.generated";
import repository from "../../repository";
import { $Enums } from "@prisma/client";
import { diff } from "deep-object-diff";
import { EmailEnvelope } from "./email-template-factory";

export interface SandboxTemplate {
  id: string;
  description: string;
  transformer: string | null;
  createdAt: Date;
  updatedAt: Date;
  envelope?: {
    subject?: string;
    to: Array<{
      value: string;
      type: $Enums.EmailAddressType;
    }>;

    from?: {
      value: string;
      type: $Enums.EmailAddressType;
    };
    replyTo?: {
      value: string;
      type: $Enums.EmailAddressType;
    };
  } | null;
  verifyReplyTo?: boolean;
}

export const executeInSandbox = async (args: {
  input: {
    envelope: EmailEnvelope;
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
    const emailEnvelope = await template.envelope();

    if (emailEnvelope) {
      const to = await emailEnvelope.to();
      const from = await emailEnvelope.from();
      const replyTo = await emailEnvelope.replyTo();

      return {
        subject: emailEnvelope.subject || undefined,
        to: to.map((to) => ({
          value: to.value,
          type: to.type,
        })),
        from: from
          ? {
              value: from?.value || undefined,
              type: from?.type || undefined,
            }
          : (undefined as any),
        replyTo: replyTo
          ? {
              value: replyTo?.value || undefined,
              type: replyTo?.type || undefined,
            }
          : (undefined as any),
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

  const isolate = new ivm.Isolate({ memoryLimit: 128 });

  // Create a new context within this isolate. Each context has its own copy of all the builtin
  // Objects. So for instance if one context does Object.prototype.foo = 1 this would not affect any
  // other contexts.
  const context = isolate.createContextSync();

  // Get a Reference{} to the global object within the context.
  const jail = context.global;

  // This makes the global object available in the context as `global`. We use `derefInto()` here
  // because otherwise `global` would actually be a Reference{} object in the new isolate.
  jail.setSync("global", jail.derefInto());

  const hostile = await isolate.compileScript(`
    const template = ${JSON.stringify(args.template)};
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

  // Execute hostile code in the context.
  const result = await hostile.run(context, {
    copy: true,
  });

  return result;
};
