import { PylonAPI, auth, defineService, logger } from "@cronitio/pylon";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

import { Email } from "./repository/models/Email";
import { EmailTemplate } from "./repository/models/EmailTemplate";
import { Organization } from "./repository/models/Organization";
import { User } from "./repository/models/User";
import { MailFactory } from "./services/mail-factory";
import * as oidcGoogle from "./services/oauth/google";
import * as oidcAzure from "./services/oauth/azure";
import { OAuthApp } from "./repository/models/OAuthApp";

dotenv.config();

// Method to generate a random string

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
      emailCreate: Email.create,
      emailUpdate: Email.update,
      emailDelete: Email.delete,
      organizationSetSenderEmail: Organization.setSenderEmail,

      oauthAppCreate: OAuthApp.create,
      oauthAppDelete: OAuthApp.delete,

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

  app.get("/oauth/google", oidcGoogle.handler);
  app.use("/oauth/google/callback", oidcGoogle.handlerCb);

  app.get("/oauth/azure", oidcAzure.handler);
  app.use("/oauth/azure/callback", oidcAzure.handlerCb);
};

export default service;
