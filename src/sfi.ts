import {
  Context,
  decorator,
  defineService,
  withContext,
} from "@snek-at/function";
import {
  AuthenticationContext,
  AuthenticationRequiredError,
  requireAnyAuth,
} from "@snek-functions/jwt";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { EmailEngine } from "./email-engine";
import {
  EmailEnvelope,
  EmailTemplateFactory,
  TemplateVariableValues,
} from "./email-template-factory";

dotenv.config();

const optionalAnyAuth = decorator(async (context, args) => {
  let ctx: Context<{
    auth?: AuthenticationContext["auth"];
    multiAuth?: AuthenticationContext["multiAuth"];
  }> = context;

  try {
    ctx = await requireAnyAuth(context, args);
  } catch (e) {
    if (!(e instanceof AuthenticationRequiredError)) {
      throw e;
    }
  }

  return ctx;
});

export default defineService(
  {
    Query: {
      template: EmailTemplateFactory.getTemplate,
      allTemplate: EmailTemplateFactory.getTemplates,
    },
    Mutation: {
      mailSchedule: withContext(
        (context) =>
          async (
            envelop: EmailEnvelope,
            body?: string,
            template?: {
              id: string;
              values?: TemplateVariableValues;
            }
          ) => {
            const originUserId = context.multiAuth?.[0].userId;

            console.log("originUserId", originUserId);

            const engine = new EmailEngine(template?.id);

            return await engine.scheduleMail(
              envelop,
              body,
              originUserId
                ? {
                    id: originUserId,
                    authorization: context.req.headers.authorization!,
                  }
                : undefined,
              template?.values
            );
          },
        {
          decorators: [optionalAnyAuth],
        }
      ),
      createTemplate: EmailTemplateFactory.createTemplate,
    },
  },
  {
    configureApp: () => {
      import("./init-templates");
    },
  }
);
