import { PylonAPI, auth, defineService, logger } from "@cronitio/pylon";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { User } from "./repository/models/User";
import { EmailTemplate } from "./repository/models/EmailTemplate";
import { Email } from "./repository/models/Email";
import { MailFactory } from "./services/mail-factory";
import { Organization } from "./repository/models/Organization";

dotenv.config();

export const service = defineService(
  {
    Query: {
      me: User.me,
      template: EmailTemplate.get,
      allTemplate: EmailTemplate.all,
    },
    Mutation: {
      templateCreate: EmailTemplate.create,
      templateUpdate: EmailTemplate.update,
      templateDelete: EmailTemplate.delete,
      templateTransformer: EmailTemplate.setTransformer,
      senderEmailCreate: Email.create,
      senderEmailUpdate: Email.update,
      senderEmailDelete: Email.delete,
      organizationSetSenderEmail: Organization.setSenderEmail,

      sendMail: MailFactory.sendMail,
      sendTemplateMail: MailFactory.sendTemplateMail,
    },
  },
  {
    context: async (c) => {
      const auth = c.get("auth");

      let ctx: typeof c & {
        user?: User;
      } = c;

      if (auth) {
        let user: User;

        try {
          user = await User.objects.get({ id: auth.sub });
        } catch {
          logger.info(`Creating user with id: ${auth.sub}`);

          const organizationId = auth["urn:zitadel:iam:org:id"] as string;

          user = await User.objects.create({
            id: auth.sub,
            organization: {
              connectOrCreate: {
                create: {
                  id: organizationId,
                },
                where: {
                  id: organizationId,
                },
              },
            },
          });
        }

        // Add user to context
        ctx.user = user;
      }

      return ctx;
    },
  }
);

export const configureApp: PylonAPI["configureApp"] = async (app) => {
  app.use("*", auth.initialize());
};

export default service;
