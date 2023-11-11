import { GraphQLError } from "graphql";

import {
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

import { sq } from "../../clients/mailer/src/index.js";

import repository from "../../repository";
import { executeInSandbox } from "./transformer-sandbox.js";
import { AuthorizationUser } from "../../repository/.generated.js";

interface MailServiceSendMailOptions {
  envelope: EmailEnvelope;
  bodyHTML?: string;
  body: string;
  authorizationUser: {
    userId: string;
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
          type: "USER_ID",
          value: authorizationUser.userId,
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

    if (!config?.id) {
      throw new GraphQLError("No config found for from address");
    } else if (!config.isEnabled) {
      throw new GraphQLError(
        "This email address is not enabled for sending emails"
      );
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
  template?: InstanceType<typeof repository.EmailTemplate>;
  authorizationUser?: {
    userId: string;
    authorization: string;
  };

  constructor(options: {
    template?: InstanceType<typeof repository.EmailTemplate>;
    authorizationUser?: {
      userId: string;
      authorization: string;
    };
  }) {
    this.template = options.template;
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
      const templateEnvelope = await this.template.envelope();

      if (templateEnvelope) {
        if (templateEnvelope.subject) {
          envelope.subject = templateEnvelope.subject;
        }
        const from = await templateEnvelope.from();
        if (from) {
          envelope.from = from;
        }
        const to = await templateEnvelope.to();
        if (to.length > 0) {
          envelope.to = to;
        }
        const replyTo = await templateEnvelope.replyTo();
        if (replyTo) {
          envelope.replyTo = replyTo;
        }
      }

      if (this.template.transformer) {
        const parentTemplate = await this.template.parent();

        // transformer is a stringified function that is evaluated
        // and returns a transformed email template

        const transformedTemplate = await executeInSandbox({
          input: {
            envelope,
            values: values || {},
            body,
            bodyHTML,
          },
          template: this.template,
          parentTemplate,
        });

        if (transformedTemplate) {
          if (transformedTemplate.verifyReplyTo !== undefined) {
            this.template.verifyReplyTo = transformedTemplate.verifyReplyTo;
          }

          if (transformedTemplate.envelope) {
            envelope = {
              ...envelope,
              ...transformedTemplate.envelope,
            };
          }
        }
      }

      const variables = await this.template.variables();

      console.log(
        "variables",
        Object.values(variables).reduce(
          (acc, variable) => ({
            ...acc,
            [variable.name]: variable,
          }),
          {}
        ),
        values
      );

      bodyHTML = EmailTemplateFactory.render(
        {
          content: this.template.content,
          variables: Object.values(variables).reduce(
            (acc, variable) => ({
              ...acc,
              [variable.name]: variable,
            }),
            {}
          ),
        },
        values
      );

      body = "";

      if (this.template.verifyReplyTo) {
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

      // const emailTemplateEnvelope = await emailTemplate.envelope();

      // const from = await emailTemplateEnvelope?.from();

      const authorizationUser = await this.template.authorizationUser();

      if (authorizationUser) {
        this.authorizationUser = authorizationUser;
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

    const linkedEmailTemplates = await this.template?.linked();

    if (linkedEmailTemplates) {
      for (const linkedEmailTemplate of linkedEmailTemplates) {
        let linkedEmailEngine = new EmailEngine({
          template: linkedEmailTemplate,
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
