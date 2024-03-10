import { PylonAPI, auth, defineService, logger } from "@cronitio/pylon";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

import { EmailTemplate } from "./repository/models/EmailTemplate";
import { OAuthApp } from "./repository/models/OAuthApp";
import { Organization } from "./repository/models/Organization";
import { User } from "./repository/models/User";
import { MailFactory } from "./services/mail-factory";
import * as oidcAzure from "./services/oauth/azure";
import * as oidcGoogle from "./services/oauth/google";

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
      userEmailCreate: User.createEmail,
      userEmailUpdate: User.updateEmail,
      userEmailDelete: User.deleteEmail,
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

      if (auth.active) {
        const organizationId = auth[
          "urn:zitadel:iam:user:resourceowner:id"
        ] as string;

        const user = await User.objects.upsert(
          {
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
          },
          {},
          {
            id: auth.sub,
            organizationId,
          }
        );

        // Add user to context
        ctx.user = user;
      }

      return ctx;
    },
  }
);

export const configureApp: PylonAPI["configureApp"] = async (app) => {
  logger.info("started");

  app.use("*", auth.initialize());

  app.use("/oauth/google", oidcGoogle.handler);

  app.use("/oauth/google/callback", oidcGoogle.handlerCb);

  app.use("/oauth/azure", oidcAzure.handler);

  app.use("/oauth/azure/callback", oidcAzure.handlerCb);
};

export default service;
