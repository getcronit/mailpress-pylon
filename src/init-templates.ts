import fs from "fs";
import path from "path";

import {
  EmailTemplateFactory,
  EmailAddressType,
  EmailTemplate,
} from "./email-template-factory";

const authorization = process.env.MAILPRESS_AUTHORIZATION;

if (!authorization) {
  throw new Error("No Authorization");
}

const importLocalTemplate = (templatePath: string) => {
  const cwd = process.cwd() + "/src";
  const pathToTemplate = path.resolve(cwd, "templates", templatePath);
  return fs.readFileSync(pathToTemplate, "utf8");
};

EmailTemplateFactory.createTemplate("BALLOONS_CONTACT_EMAIL", {
  content: importLocalTemplate("ballons-ballons-contact-email.html"),
  variables: {
    name: { isRequired: true },
    email: {},
    subject: {},
    message: {},
    invokedOnUrl: {},
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
  linkedEmailTemplates: [
    {
      content: importLocalTemplate(
        "ballons-ballons-contact-confirmation-email.html"
      ),
      variables: {
        name: { isRequired: true },
        email: {},
        subject: {},
        message: {},
        invokedOnUrl: {},
      },
      $transformer: ({ envelope }) => {
        console.log("parentTemplateenvelope", envelope);

        if (envelope) {
          envelope.to = envelope.replyTo ? [envelope.replyTo] : [];
          envelope.replyTo = undefined;
        }

        return {
          envelope,
        };
      },
    },
  ],
});

EmailTemplateFactory.createTemplate("BALLOONS_ORDER_EMAIL", {
  content: importLocalTemplate("ballons-ballons-order-email.html"),
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
    subject: "Neue Bestellung auf Ballons & Ballons",
  },
  authorizationUser: {
    id: "74e7de97-48e5-40e0-bca6-e05daa6e466d",
    authorization,
  },
  variables: {
    cart: {
      isRequired: true,
      isConstant: true,
      defaultValue: [
        { name: "Ballon", price: 1.5, quantity: 1, sku: "B-15211" },
        { name: "Ballon 2", price: 62, quantity: 4, sku: "B-15212" },
        { name: "Ballon 3", price: 23, quantity: 7, sku: "B-15213" },
      ],
    },
    order: {
      isRequired: true,
      isConstant: true,
      defaultValue: {
        id: "123456789",
        totalPrice: 123.45,
        currency: "EUR",
      },
    },
    customer: {
      isRequired: true,
      isConstant: true,
      defaultValue: {
        emailAddress: "schett@snek.at",
        fullName: "Nico Schett",
      },
    },
  },
  verifyReplyTo: true,
  linkedEmailTemplates: [
    {
      content: importLocalTemplate(
        "ballons-ballons-order-confirmation-email.html"
      ),
      variables: {
        cart: {
          isRequired: true,
          isConstant: true,
          defaultValue: [
            { name: "Ballon", price: 1.5, quantity: 1, sku: "B-15211" },
            { name: "Ballon 2", price: 62, quantity: 4, sku: "B-1521A" },
            { name: "Ballon 3", price: 23, quantity: 7, sku: "B-15213" },
          ],
        },
        order: {
          isRequired: true,
          isConstant: true,
          defaultValue: {
            id: "123456789",
            totalPrice: 123.45,
            currency: "EUR",
          },
        },
        customer: {
          isRequired: true,
          isConstant: true,
          defaultValue: {
            emailAddress: "schett@snek.at",
            fullName: "Nico Schett",
          },
        },
      },
      envelope: {
        subject: "Ihre Bestellung auf Ballons & Ballons",
      },
      $transformer: ({ envelope }) => {
        console.log("Parent envelope", envelope);

        return {
          envelope: {
            to: envelope.replyTo ? [envelope.replyTo] : [],
            replyTo: undefined,
          },
        };
      },
    },
  ],
});
