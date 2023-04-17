import { GraphQLError } from "graphql";
import {
  EmailTemplateFactory,
  EmailEnvelope,
  EmailAddressType,
} from "./email-template-factory";
import {
  resolveFromEmailAddress,
  lookupEmailAddress,
  ResolvedFromEmail,
} from "./resolve-email-address";
import { sq } from "./clients/mailer/src/index.js";

interface MailerService {
  sendMail(
    envelop: EmailEnvelope,
    body: string,
    authorizationUser: {
      id: string;
      authorization: string;
    }
  ): Promise<void>;
}

// class ConsoleMailerService implements MailerService {
//   async sendMail(
//     envelop: EmailEnvelope,
//     body: string,
//     authorizationUser: {
//       id: string;
//       authorization: string;
//     }
//   ): Promise<void> {
//     console.log("Envelop: ", envelop);
//     console.log("body: ", body);

//     if (!envelop.to || envelop.to.length === 0) {
//       throw new Error("No to address provided");
//     }

//     let resolvedFrom: any;

//     if (envelop.from) {
//       // This means that there is no from address provided or given by the template
//       // we need to resolve it from the authorization user

//       resolvedFrom = await resolveFromEmailAddress(
//         envelop.from,
//         authorizationUser
//       );
//     } else {
//       resolvedFrom = await resolveFromEmailAddress(
//         {
//           type: EmailAddressType.USER_ID,
//           value: authorizationUser.id,
//         },
//         authorizationUser
//       );
//     }

//     const resolvedTo = await Promise.all(
//       envelop.to.map(async (to) => {
//         return await lookupEmailAddress(to, authorizationUser);
//       })
//     );

//     const resolvedReplyTo = envelop.replyTo
//       ? await lookupEmailAddress(envelop.replyTo, authorizationUser)
//       : undefined;

//     // Send email
//     console.log("Resolved from: ", resolvedFrom);
//     console.log("Resolved to: ", resolvedTo);
//     console.log("Resolved replyTo: ", resolvedReplyTo);

//     console.log("Sending email: ", body);

//     return Promise.resolve();
//   }
// }

class MailerMailerService implements MailerService {
  async sendMail(
    envelop: EmailEnvelope,
    body: string,
    authorizationUser: {
      id: string;
      authorization: string;
    }
  ): Promise<void> {
    console.log("Envelop: ", envelop);
    console.log("body: ", body);

    if (!envelop.to || envelop.to.length === 0) {
      throw new Error("No to address provided");
    }

    let resolvedFrom: ResolvedFromEmail;

    if (envelop.from) {
      // This means that there is no from address provided or given by the template
      // we need to resolve it from the authorization user

      resolvedFrom = await resolveFromEmailAddress(
        envelop.from,
        authorizationUser
      );
    } else {
      resolvedFrom = await resolveFromEmailAddress(
        {
          type: EmailAddressType.USER_ID,
          value: authorizationUser.id,
        },
        authorizationUser
      );
    }

    const resolvedTo = await Promise.all(
      envelop.to.map(async (to) => {
        return await lookupEmailAddress(to, authorizationUser);
      })
    );

    const resolvedReplyTo = envelop.replyTo
      ? await lookupEmailAddress(envelop.replyTo, authorizationUser)
      : undefined;

    // Send email
    console.log("Resolved from: ", resolvedFrom);
    console.log("Resolved to: ", resolvedTo);
    console.log("Resolved replyTo: ", resolvedReplyTo);

    console.log("Sending email: ", body);

    const emailConfiguration = resolvedFrom.emailConfiguration;

    if (!emailConfiguration) {
      throw new Error("No email configuration found");
    }

    console.log("options", {
      mailOptions: JSON.parse(
        JSON.stringify({
          from: `"${resolvedFrom.firstName} ${resolvedFrom.lastName}" <${resolvedFrom.emailAddress}>`,
          to: resolvedTo,
          replyTo: resolvedReplyTo,
          subject: envelop.subject || "No subject",
          html: body,
        })
      ),
      smtp: {
        host: emailConfiguration.smtpHost,
        port: emailConfiguration.smtpPort,
        secure: emailConfiguration.secure,
        user: emailConfiguration.username,
        password: emailConfiguration.password,
      },
    });

    const [_, errors] = await sq.mutate((m) => {
      m.sendMail({
        mailOptions: JSON.parse(
          JSON.stringify({
            from: `"${resolvedFrom.firstName} ${resolvedFrom.lastName}" <${resolvedFrom.emailAddress}>`,
            to: resolvedTo,
            replyTo: resolvedReplyTo,
            subject: envelop.subject || "No subject",
            html: body,
          })
        ),
        smtpOptions: {
          host: emailConfiguration.smtpHost,
          port: emailConfiguration.smtpPort,
          secure: emailConfiguration.secure,
          user: emailConfiguration.username,
          password: emailConfiguration.password,
        },
      });
    });

    console.log("Errors: ", errors);

    if (errors) {
      throw new Error(errors[0].message);
    }
  }
}

export class EmailEngine {
  private mailerService: MailerService;

  private templateId?: string;

  constructor(
    templateId: string | undefined,
    mailerService: MailerService = new MailerMailerService()
  ) {
    this.templateId = templateId;
    this.mailerService = mailerService;
  }

  async scheduleMail(
    envelop: EmailEnvelope,
    body: string = "",
    authorizationUser?: {
      id: string;
      authorization: string;
    },
    values?: Record<string, string>
  ): Promise<string> {
    try {
      if (this.templateId) {
        const template = new EmailTemplateFactory(this.templateId);

        body = template.render(values);

        const templateEnvelop = template.getEnvelop();

        if (templateEnvelop.from) {
          // Override authorization to from email address authorization
          const templateAuthorizationUser = template.getAuthorizationUser();

          if (templateAuthorizationUser) {
            authorizationUser = templateAuthorizationUser;
          }

          console.log(
            `Overriding authorizationUser to ${authorizationUser} for template ${this.templateId} from ${templateEnvelop.from}`
          );
        }

        envelop = { ...envelop, ...templateEnvelop };
      }

      if (!authorizationUser) {
        throw new GraphQLError(
          `One of authorizationUser or template ${this.templateId} authorizationUser must be provided`
        );
      }

      await this.mailerService.sendMail(envelop, body, authorizationUser);

      return "Mail scheduled";
    } catch (error) {
      console.error(error);
      throw new GraphQLError(`Failed to send email: ${error}`);
    }
  }
}
