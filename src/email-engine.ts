import { GraphQLError } from "graphql";

import {
  EmailAddressType,
  EmailEnvelope,
  EmailTemplate,
  EmailTemplateFactory,
} from "./email-template-factory";
import {
  ResolvedFromEmail,
  lookupEmailAddress,
  resolveFromEmailAddress,
  verifyReplyToEmailAddress,
} from "./resolve-email-address";

import { sq } from "./clients/mailer/src/index.js";

interface MailServiceSendMailOptions {
  envelope: EmailEnvelope;
  bodyHTML?: string;
  body: string;
  authorizationUser: {
    id: string;
    authorization: string;
  };
}

interface MailerService {
  sendMail(options: MailServiceSendMailOptions): Promise<void>;
}

class MailerMailerService implements MailerService {
  async sendMail({
    envelope,
    body,
    bodyHTML,
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

    const config = resolvedFrom.config;

    if (!config) {
      throw new Error("No email config found");
    }

    // // Get length of bodt in bytes
    // const bodyLength = Buffer.byteLength(body, "utf8");

    // console.log("Body length: ", bodyLength, body.length);

    // // In kb
    // console.log("Body length: ", bodyLength / 1000);

    // if (bodyLength > 1000000) {
    //   throw new GraphQLError("Email body is too long");
    // }

    // console.log("config", config);

    if (config.externalCredential.smtp) {
      sq.mutate((m) => {
        m.sendMailSMTP({
          mailOptions: JSON.parse(
            JSON.stringify({
              from: `"${resolvedFrom.firstName} ${resolvedFrom.lastName}" <${resolvedFrom.emailAddress}>`,
              to: resolvedTo,
              replyTo: resolvedReplyTo,
              subject: envelope.subject || "No subject",
              html: bodyHTML,
              text: body,
            })
          ),
          smtpOptions: {
            host: config.externalCredential.smtp?.host!,
            port: config.externalCredential.smtp?.port!,
            secure: config.externalCredential.smtp?.secure!,
            user: config.externalCredential.smtp?.username!,
            password: config.externalCredential.smtp?.password!,
          },
        });
      });
    } else if (config.externalCredential.oauth) {
      if (config.externalCredential.oauth.provider === "azure") {
        sq.mutate((m) => {
          m.sendMailAzure({
            mailOptions: JSON.parse(
              JSON.stringify({
                from: `"${resolvedFrom.firstName} ${resolvedFrom.lastName}" <${resolvedFrom.emailAddress}>`,
                to: resolvedTo,
                replyTo: resolvedReplyTo,
                subject: envelope.subject || "No subject",
                html: bodyHTML,
                text: body,
              })
            ),
            oauthOptions: {
              accessToken: config.externalCredential.oauth?.accessToken!,
            },
          });
        });
      } else if (config.externalCredential.oauth.provider === "google") {
        sq.mutate((m) => {
          m.sendMailGoogle({
            mailOptions: JSON.parse(
              JSON.stringify({
                from: `"${resolvedFrom.firstName} ${resolvedFrom.lastName}" <${resolvedFrom.emailAddress}>`,
                to: resolvedTo,
                replyTo: resolvedReplyTo,
                subject: envelope.subject || "No subject",
                html: bodyHTML,
                text: body,
              })
            ),
            oauthOptions: {
              accessToken: config.externalCredential.oauth?.accessToken!,
            },
          });
        });
      }
    }
  }
}

export class EmailEngine {
  template?: EmailTemplate;
  parentTemplate?: EmailTemplate;
  authorizationUser?: {
    id: string;
    authorization: string;
  };

  constructor(options: {
    template?: EmailTemplate;
    parentTemplate?: EmailTemplate;
    authorizationUser?: {
      id: string;
      authorization: string;
    };
  }) {
    this.template = options.template;
    this.parentTemplate = options.parentTemplate;
    this.authorizationUser = options.authorizationUser;
  }

  async scheduleMail({
    envelope,
    body = "",
    bodyHTML,
    values,
  }: {
    envelope: EmailEnvelope;
    body?: string;
    bodyHTML?: string;
    values?: Record<string, string>;
  }) {
    if (this.template) {
      let emailTemplate = this.template;

      if (emailTemplate.$transformer) {
        if (!this.parentTemplate) {
          throw new GraphQLError(
            "No parent template provided. This is required for linked email templates"
          );
        }

        const transformedTemplate = emailTemplate.$transformer({
          envelope,
        });

        if (transformedTemplate) {
          // Deep-Merge the transformed template with the email template
          emailTemplate = {
            ...emailTemplate,
            ...transformedTemplate,
            envelope: {
              ...emailTemplate.envelope,
              ...transformedTemplate.envelope,
            },
          };
        }
      }

      bodyHTML = EmailTemplateFactory.render(this.template, values);
      body = "";

      envelope = {
        ...envelope,
        ...emailTemplate.envelope,
      };

      if (emailTemplate.verifyReplyTo !== undefined) {
        if (envelope.replyTo && this.authorizationUser) {
          await verifyReplyToEmailAddress(
            envelope.replyTo,
            this.authorizationUser
          );
        } else {
          // reply to verification failed error
          throw new GraphQLError(
            `Verification of reply to email address failed`
          );
        }
      }

      if (emailTemplate.envelope?.from) {
        if (emailTemplate.authorizationUser) {
          this.authorizationUser = emailTemplate.authorizationUser;
        }
      }
    }

    if (!this.authorizationUser) {
      throw new GraphQLError("No authorization user provided");
    }

    const mailer = new MailerMailerService();

    await mailer.sendMail({
      envelope,
      body,
      bodyHTML,
      authorizationUser: this.authorizationUser,
    });

    if (this.template?.linkedEmailTemplates) {
      const linkedEmailTemplates = this.template.linkedEmailTemplates;

      for (const linkedEmailTemplate of linkedEmailTemplates) {
        let linkedEmailEngine = new EmailEngine({
          template: linkedEmailTemplate,
          parentTemplate: this.template,
          authorizationUser: this.authorizationUser,
        });

        await linkedEmailEngine.scheduleMail({
          envelope,
          body,
          bodyHTML,
          values,
        });
      }
    }

    return "Email scheduled and will be sent shortly";
  }
}
