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
  verifyReplyToEmailAddress,
} from "./resolve-email-address";
import { sq } from "./clients/mailer/src/index.js";

interface MailServiceSendMailOptions {
  envelope: EmailEnvelope;
  body: string;
  authorizationUser: {
    id: string;
    authorization: string;
  };
}

interface MailerService {
  sendMail(options: MailServiceSendMailOptions): Promise<void>;
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
  async sendMail({
    envelope,
    body,
    authorizationUser,
  }: MailServiceSendMailOptions): Promise<void> {
    if (!envelope.to || envelope.to.length === 0) {
      throw new Error("No to address provided");
    }

    let resolvedFrom: ResolvedFromEmail;

    if (envelope.from) {
      // This means that there is no from address provided or given by the template
      // we need to resolve it from the authorization user

      resolvedFrom = await resolveFromEmailAddress(
        envelope.from,
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
      envelope.to.map(async (to) => {
        return await lookupEmailAddress(to, authorizationUser);
      })
    );

    const resolvedReplyTo = envelope.replyTo
      ? await lookupEmailAddress(envelope.replyTo, authorizationUser)
      : undefined;

    const emailConfiguration = resolvedFrom.emailConfiguration;

    if (!emailConfiguration) {
      throw new Error("No email configuration found");
    }

    console.log("Sendmail");

    // Get length of bodt in bytes
    const bodyLength = Buffer.byteLength(body, "utf8");

    console.log("Body length: ", bodyLength, body.length);

    // In kb
    console.log("Body length: ", bodyLength / 1000);

    if (bodyLength > 1000000) {
      throw new GraphQLError("Email body is too long");
    }

    sq.mutate((m) => {
      m.sendMail({
        mailOptions: JSON.parse(
          JSON.stringify({
            from: `"${resolvedFrom.firstName} ${resolvedFrom.lastName}" <${resolvedFrom.emailAddress}>`,
            to: resolvedTo,
            replyTo: resolvedReplyTo,
            subject: envelope.subject || "No subject",
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
    }).then((result) => {
      console.log("Result: ", result);
    });
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
    envelope: EmailEnvelope,
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

        const templateEnvelope = template.getEnvelope();

        envelope = { ...envelope, ...templateEnvelope };

        if (template.emailTemplate.verifyReplyTo !== undefined) {
          if (envelope.replyTo && authorizationUser) {
            await verifyReplyToEmailAddress(
              envelope.replyTo,
              authorizationUser
            );
          } else {
            // reply to verification failed error
            throw new GraphQLError(
              `Verification of reply to email address failed`
            );
          }
        }

        if (templateEnvelope?.from) {
          // Override authorization to from email address authorization
          const templateAuthorizationUser = template.getAuthorizationUser();

          if (templateAuthorizationUser) {
            authorizationUser = templateAuthorizationUser;
          }

          console.log(
            `Overriding authorizationUser to ${authorizationUser} for template ${this.templateId} from ${templateEnvelope.from}`
          );
        }

        if (template.emailTemplate.confirmationTemplateId) {
          const mailer = new EmailEngine(
            template.emailTemplate.confirmationTemplateId,
            this.mailerService
          );

          await mailer.scheduleMail(
            {
              to: envelope.replyTo ? [envelope.replyTo] : [],
              subject: envelope.subject,
              from: envelope.from,
              replyTo: undefined,
            },
            body,
            authorizationUser,
            values
          );
        }
      }

      if (!authorizationUser) {
        throw new GraphQLError(
          `One of authorizationUser or template ${this.templateId} authorizationUser must be provided`
        );
      }

      await this.mailerService.sendMail({
        envelope,
        body,
        authorizationUser,
      });

      return "Mail scheduled";
    } catch (error) {
      console.error(error);
      throw new GraphQLError(`Failed to send email: ${error}`);
    }
  }
}
