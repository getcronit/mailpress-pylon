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
  const cwd = process.cwd();
  const pathToTemplate = path.resolve(cwd, "templates", templatePath);
  return fs.readFileSync(pathToTemplate, "utf8");
};

const ballonsBallonsOrderEmail = (wholesale: boolean) => ({
  content: importLocalTemplate("ballons-ballons-order-email.html"),
  envelope: {
    from: {
      value: "mailpress@snek.at",
      type: EmailAddressType.EMAIL_ADDRESS,
    },
    to: [
      {
        value: "office@ballons-ballons.at",
        type: EmailAddressType.EMAIL_ADDRESS,
      },
    ],
    subject: "Neue Anfrage auf Ballons & Ballons",
  },
  authorizationUser: {
    id: "74e7de97-48e5-40e0-bca6-e05daa6e466d",
    authorization,
  },
  variables: {
    cart: {
      isRequired: true,
      // isConstant: true,
      // defaultValue: [
      //   {
      //     name: "Ballon",
      //     price: 1.5,
      //     quantity: 1,
      //     sku: "B-15211",
      //     imgSrc:
      //       "https://w7.pngwing.com/pngs/904/855/png-transparent-balloon-red-ballons-blue-heart-color-thumbnail.png",
      //   },
      //   {
      //     name: "Ballon 2",
      //     price: 62,
      //     quantity: 4,
      //     sku: "B-1521A",
      //     imgSrc:
      //       "https://w7.pngwing.com/pngs/904/855/png-transparent-balloon-red-ballons-blue-heart-color-thumbnail.png",
      //   },
      //   {
      //     name: "Ballon 4",
      //     price: 23,
      //     quantity: 7,
      //     sku: "B-15213",
      //     imgSrc:
      //       "https://w7.pngwing.com/pngs/904/855/png-transparent-balloon-red-ballons-blue-heart-color-thumbnail.png",
      //   },
      // ],
    },
    order: {
      isRequired: true,
      // isConstant: true,
      // defaultValue: {
      //   id: "123456789",
      //   totalPrice: 123.45,
      //   currency: "EUR",
      //   note: "Bitte an der Haustür abstellen",
      // },
    },
    customer: {
      isRequired: true,
      // isConstant: true,
      // defaultValue: {
      //   emailAddress: "schett@snek.at",
      //   firstName: "Nico",
      //   lastName: "Schett",
      //   phone: "+43 000 111 222 333"
      // },
    },
    wholesale: {
      isRequired: true,
      // isConstant: true,
      // defaultValue: wholesale,
    }
  },
  verifyReplyTo: wholesale,
  linkedEmailTemplates: [
    {
      content: importLocalTemplate(
        "ballons-ballons-order-confirmation-email.html"
      ),
      variables: {
        cart: {
          isRequired: true,
          // isConstant: true,
          // defaultValue: [
          //   {
          //     name: "Ballon",
          //     price: 1.5,
          //     quantity: 1,
          //     sku: "B-15211",
          //     imgSrc:
          //       "https://w7.pngwing.com/pngs/904/855/png-transparent-balloon-red-ballons-blue-heart-color-thumbnail.png",
          //   },
          //   {
          //     name: "Ballon 2",
          //     price: 62,
          //     quantity: 4,
          //     sku: "B-1521A",
          //     imgSrc:
          //       "https://w7.pngwing.com/pngs/904/855/png-transparent-balloon-red-ballons-blue-heart-color-thumbnail.png",
          //   },
          //   {
          //     name: "Ballon 4",
          //     price: 23,
          //     quantity: 7,
          //     sku: "B-15213",
          //     imgSrc:
          //       "https://w7.pngwing.com/pngs/904/855/png-transparent-balloon-red-ballons-blue-heart-color-thumbnail.png",
          //   },
          // ],
        },
        order: {
          isRequired: true,
          // isConstant: true,
          // defaultValue: {
          //   id: "123456789",
          //   totalPrice: 123.45,
          //   currency: "EUR",
          //   note: "Bitte an der Haustür abstellen",
          // },
        },
        customer: {
          isRequired: true,
          // isConstant: true,
          // defaultValue: {
          //   emailAddress: "schett@snek.at",
          //   firstName: "Nico",
          //   lastName: "Schett",
          //   phone: "+43 000 111 222 333"
          // },
        },
        wholesale: {
          isRequired: true,
          // isConstant: true,
          // defaultValue: wholesale,
        }
      },
      envelope: {
        subject: "Ihre Anfrage auf Ballons & Ballons",
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
})

EmailTemplateFactory.createTemplate("BALLOONS_CONTACT_EMAIL", {
  content: importLocalTemplate("ballons-ballons-contact-email.html"),
  variables: {
    firstName: { isRequired: true },
    lastName: { isRequired: true },
    email: { isRequired: true },
    phone:  { isRequired: false },
    message: { isRequired: true },
    invokedOnUrl: { isRequired: true },
  },
  envelope: {
    from: {
      value: "mailpress@snek.at",
      type: EmailAddressType.EMAIL_ADDRESS,
    },
    to: [
      {
        value: "office@ballons-ballons.at",
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
        firstName: { isRequired: true },
        lastName: { isRequired: true },
        email: { isRequired: true },
        phone:  { isRequired: false },
        message: { isRequired: true },
        invokedOnUrl: { isRequired: true },
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

EmailTemplateFactory.createTemplate("BALLOONS_ORDER_EMAIL", ballonsBallonsOrderEmail(false));

EmailTemplateFactory.createTemplate("BALLOONS_ORDER_WHOLESALE_EMAIL", ballonsBallonsOrderEmail(true));

EmailTemplateFactory.createTemplate("AGT_CONTACT_MAIL", {
  content: importLocalTemplate("agt-contact-email.html"),
  variables: {
    name: { isRequired: true },
    email: { isRequired: true },
    message: { isRequired: true },
    invokedOnUrl: { isRequired: true },
  },
  envelope: {
    from: {
      value: "mailpress@snek.at",
      type: EmailAddressType.EMAIL_ADDRESS,
    },
    to: [
      {
        value: "info@agt-guntrade.at",
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
      content: importLocalTemplate("agt-contact-confirmation-email.html"),
      variables: {
        name: { isRequired: true },
        email: { isRequired: true },
        message: { isRequired: true },
        invokedOnUrl: { isRequired: true },
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

EmailTemplateFactory.createTemplate("AGT_ORDER_MAIL", {
  content: importLocalTemplate("agt-order-email.html"),
  variables: {
    name: { isRequired: true },
    email: { isRequired: true },
    message: { isRequired: true },
    invokedOnUrl: { isRequired: true },
  },
  envelope: {
    from: {
      value: "mailpress@snek.at",
      type: EmailAddressType.EMAIL_ADDRESS,
    },
    to: [
      {
        value: "info@agt-guntrade.at",
        type: EmailAddressType.EMAIL_ADDRESS,
      },
    ],
    subject: "Neue Bestellung auf AGT Gun Trade",
  },
  authorizationUser: {
    id: "74e7de97-48e5-40e0-bca6-e05daa6e466d",
    authorization,
  },
  linkedEmailTemplates: [
    {
      content: importLocalTemplate("agt-order-confirmation-email.html"),
      variables: {
        name: { isRequired: true },
        email: { isRequired: true },
        message: { isRequired: true },
        invokedOnUrl: { isRequired: true },
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
