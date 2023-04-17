import {
  EmailTemplateFactory,
  EmailAddressType,
} from "./email-template-factory";

const authorization = process.env.MAILPRESS_AUTHORIZATION;

if (!authorization) {
  throw new Error("No Authorization");
}

EmailTemplateFactory.createTemplate("SNEK_CONTACT_EMAIL", {
  content: `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>New Contact Form Submission</title>
    </head>
    <body>
      <h1>New Contact Form Submission</h1>
      <p>A new contact form submission has been received with the following details:</p>
      <ul>
        <li><strong>Name:</strong> {{name}}</li>
        <li><strong>Email:</strong> {{email}}</li>
        <li><strong>Subject:</strong> {{subject}}</li>
        <li><strong>Message:</strong> {{message}}</li>
      </ul>
    </body>
  </html>
`,
  variables: {
    name: { type: "text", isRequired: true },
    email: { type: "text" },
    subject: { type: "text" },
    message: { type: "html" },
  },
  envelope: {
    from: {
      value: "mailpress@snek.at",
      type: EmailAddressType.EMAIL_ADDRESS,
    },
    to: [
      {
        value: "schett@snek.at",
        type: EmailAddressType.EMAIL_ADDRESS,
      },
    ],
    subject: "New Contact Form Submission",
  },
  authorizationUser: {
    id: "74e7de97-48e5-40e0-bca6-e05daa6e466d",
    authorization,
  },
});

EmailTemplateFactory.createTemplate("BALLOONS_CONTACT_EMAIL", {
  content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Neue Kontaktanfrage</title><style>body{font-family:Arial,sans-serif;background-color:#f7f7f7;}h1{color:#333;text-align:center;margin-top:30px;}p{font-size:18px;color:#555;margin:20px;text-align:justify;}a{color:#007bff;text-decoration:none;}ul{list-style:none;margin:0;padding:0;font-size:16px;color:#333;}li{margin:10px 0;}strong{font-weight:bold;}img{display:block;margin:auto;width:100%; max-height:200px;}</style></head><body><img src="https://ballons.snek.at/static/2aac62fe8ca21b7ea3ed53738270c178/7463d/bg.avif" alt="Random Image"><h1>Neue Kontaktanfrage</h1><p>Eine neue Kontaktanfrage wurde über das Kontaktformular auf der Website <a href="https://www.ballons-ballons.de">Ballons &amp; Ballons</a> erstellt.</p><ul><li><strong>Name:</strong>{{name}}</li><li><strong>Email:</strong>{{email}}</li><li><strong>Subject:</strong>{{subject}}</li><li><strong>Message:</strong>{{message}}</li></ul></body></html>
  `,
  variables: {
    name: { type: "text", isRequired: true },
    email: { type: "text" },
    subject: { type: "text" },
    message: { type: "html" },
  },
  envelope: {
    from: {
      value: "mailpress@snek.at",
      type: EmailAddressType.EMAIL_ADDRESS,
    },
    to: [
      {
        value: "schett@snek.at",
        type: EmailAddressType.EMAIL_ADDRESS,
      },
    ],
    subject: "Neue Kontaktanfrage",
  },
  authorizationUser: {
    id: "74e7de97-48e5-40e0-bca6-e05daa6e466d",
    authorization,
  },
  confirmationTemplateId: "BALLOONS_CONTACT_CONFIRMATION_EMAIL",
});

EmailTemplateFactory.createTemplate("BALLOONS_CONTACT_CONFIRMATION_EMAIL", {
  content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Kontaktanfrage erhalten</title><style>body{font-family:Arial,sans-serif;background-color:#f7f7f7;}h1{color:#333;text-align:center;margin-top:30px;}p{font-size:18px;color:#555;margin:20px;text-align:justify;}a{color:#007bff;text-decoration:none;}ul{list-style:none;margin:0;padding:0;font-size:16px;color:#333;}li{margin:10px 0;}strong{font-weight:bold;}img{display:block;margin:auto;width:100%; max-height:200px;}</style></head><body><img src="https://ballons.snek.at/static/2aac62fe8ca21b7ea3ed53738270c178/7463d/bg.avif" alt="Random Image"><h1>Kontaktanfrage erhalten</h1><p>Vielen Dank für Ihre Kontaktanfrage. Wir werden uns so schnell wie möglich bei Ihnen melden.</p><ul><li><strong>Name:</strong>{{name}}</li><li><strong>Email:</strong>{{email}}</li><li><strong>Subject:</strong>{{subject}}</li><li><strong>Message:</strong>{{message}}</li></ul></body></html>`,
  variables: {
    name: { type: "text", isRequired: true },
    email: { type: "text" },
    subject: { type: "text" },
    message: { type: "html" },
  },
});
