import { ServiceError, logger, requireAuth } from "@cronitio/pylon";
import { htmlToText } from "html-to-text";
import { EmailTemplate } from "../repository/models/EmailTemplate";
import { Email } from "../repository/models/Email";
import { EmailTemplateFactory } from "../services/email-template-factory";
import { executeInSandbox } from "../services/transformer-sandbox";
import { sq } from "../clients/mailer/src";
import { service } from "..";

export class MailFactory {
  private static async send(
    senderEmail: Email,
    envelope: {
      subject: string;
      to: string[];
      replyTo?: string;
    },
    body: string,
    bodyHTML?: string
  ) {
    try {
      const smtpConfig = await senderEmail.smtpConfig();
      if (smtpConfig) {
        if (!smtpConfig) {
          throw new Error(
            "No email configuration found. This should not happen"
          );
        }

        const [data, errors] = await sq.mutate((m) =>
          m.sendMailSMTP({
            mailOptions: {
              from: senderEmail.email,
              to: envelope.to,
              replyTo: envelope.replyTo,
              subject: envelope.subject,
              html: bodyHTML,
              text: body,
            },
            smtpOptions: {
              host: smtpConfig.host,
              port: smtpConfig.port,
              secure: smtpConfig.secure,
              user: smtpConfig.username,
              password: smtpConfig.password,
            },
          })
        );

        if (errors) {
          throw new Error(errors[0].message);
        }

        return data;
      }

      const oauthConfig = await senderEmail.oauthConfig();

      if (oauthConfig) {
        if (!oauthConfig) {
          throw new Error(
            "No email configuration found. This should not happen"
          );
        }

        const token = await oauthConfig.$freshAccessToken();

        if (oauthConfig.provider === "AZURE") {
          const [data, errors] = await sq.mutate((m) =>
            m.sendMailAzure({
              mailOptions: {
                from: senderEmail.email,
                to: envelope.to,
                replyTo: envelope.replyTo,
                subject: envelope.subject,
                html: bodyHTML,
                text: body,
              },
              oauthOptions: {
                accessToken: token,
              },
            })
          );

          if (errors) {
            throw new Error(errors[0].message);
          }

          return data;
        } else if (oauthConfig.provider === "GOOGLE") {
          const [data, errors] = await sq.mutate((m) =>
            m.sendMailGoogle({
              mailOptions: {
                from: senderEmail.email,
                to: envelope.to,
                replyTo: envelope.replyTo,
                subject: envelope.subject,
                html: bodyHTML,
                text: body,
              },
              oauthOptions: {
                accessToken: token,
              },
            })
          );

          if (errors) {
            throw new Error(errors[0].message);
          }

          return data;
        }
      } else {
        throw new Error("No email configuration found");
      }
    } catch (e) {
      console.error(e);
      throw new ServiceError("Error sending mail", {
        code: "MAIL_SEND_ERROR",
        statusCode: 500,
        details: {
          error: e.toString(),
          stack: e.stack,
        },
      });
    }
  }

  static async sendTemplateMail(
    id: string,
    envelope?: {
      subject?: string;
      to?: string[];
      replyTo?: string;
    },
    values?: {
      [variableName: string]: any;
    }
  ) {
    const emailTemplate = await EmailTemplate.objects.get({ id });

    const emailEnvelope = await emailTemplate.envelope();

    let combinedEnvelope = {
      subject: emailEnvelope?.subject || envelope?.subject || "No subject",
      to: emailEnvelope?.to || envelope?.to || [],
      replyTo: emailEnvelope?.replyTo || envelope?.replyTo || undefined,
    };

    const variables = await emailTemplate?.variables();

    const bodyHTML = EmailTemplateFactory.render(
      {
        content: emailTemplate?.content,
        variables: Object.values(variables.nodes).reduce(
          (acc, variable) => ({
            ...acc,
            [variable.name]: variable,
          }),
          {}
        ),
      },
      values
    );

    const body = htmlToText(bodyHTML, {});

    if (emailTemplate.transformer) {
      const parentTemplate = await emailTemplate.parent();

      const transformedTemplate = await executeInSandbox({
        input: {
          envelope: combinedEnvelope,
          values: values || {},
          body,
          bodyHTML,
        },
        template: emailTemplate,
        parentTemplate,
      });

      if (transformedTemplate) {
        if (transformedTemplate.verifyReplyTo !== undefined) {
          emailTemplate.verifyReplyTo = transformedTemplate.verifyReplyTo;
        }

        if (transformedTemplate.envelope) {
          combinedEnvelope = {
            ...combinedEnvelope,
            ...transformedTemplate.envelope,
          };
        }
      }
    }

    if (emailTemplate.verifyReplyTo) {
      // Check if user has verified the replyTo email
      const ctx = await service.getContext(this);

      const auth = ctx.get("auth");

      if (
        !(
          auth &&
          auth.email &&
          auth.email_verified &&
          auth.email === combinedEnvelope.replyTo
        )
      ) {
        throw new Error(
          "Verification of replyTo email failed. Possible reasons: User is not authenticated, email is not verified or email does not match the replyTo email"
        );
      }
    }

    const senderEmail = await Email.objects.get({
      organization: {
        users: {
          some: {
            id: emailTemplate.$creatorId,
          },
        },
      },
    });

    MailFactory.send(senderEmail, combinedEnvelope, body, bodyHTML);

    // Call links
    const links = (await emailTemplate.links()).nodes;

    for (const link of links) {
      await MailFactory.sendTemplateMail(link.id, combinedEnvelope, values);
    }

    return "Mail scheduled successfully";
  }

  @requireAuth({})
  static async sendMail(
    envelope: {
      subject: string;
      to: string[];
      replyTo?: string;
    },
    body?: string,
    bodyHTML?: string
  ) {
    if (!body && !bodyHTML) {
      throw new Error("No body or bodyHTML provided");
    }
    const ctx = await service.getContext(this);

    const senderEmail = await ctx.user!.email();

    logger.info("Mail sent", envelope);

    if (!senderEmail) {
      throw new Error("No sender email found");
    }

    if (bodyHTML) {
      body = htmlToText(bodyHTML, {});
    }

    if (body === undefined) {
      throw new Error("No body provided. This should not happen");
    }

    await MailFactory.send(senderEmail, envelope, body, bodyHTML);

    return "Mail scheduled successfully";
  }
}
