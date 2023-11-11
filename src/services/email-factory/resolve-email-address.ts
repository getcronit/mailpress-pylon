import { GraphQLError } from "graphql";
import { asEnumKey } from "snek-query";

import { sq } from "../../clients/iam/src/index.js";
import {
  Email,
  LookupTypeInput,
} from "../../clients/iam/src/schema.generated.js";
import { EmailAddress } from "./email-template-factory.js";
import { AuthorizationUser } from "../../repository/.generated.js";

export interface ResolvedFromEmail {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  emailAddress: string;
  config: Email["config"];
}

export async function resolveFromEmailAddress(
  email: EmailAddress,
  authorizationUser: {
    userId: string;
    authorization: string;
  }
): Promise<ResolvedFromEmail> {
  const { value, type } = email;

  const [resolvedEmail, errors] = await sq.query(
    (q) => {
      const user = q.user({
        id: authorizationUser.userId,
      });

      let email: Email | undefined;

      switch (type) {
        case "EMAIL_ADDRESS":
          email = user.email({ filter: { emailAddress: value } });
          break;
        case "EMAIL_ID":
          email = user.email({ filter: { emailId: value } });
          break;
        case "USER_ID":
          email = user.email();
          break;
        default:
          throw new GraphQLError(`Invalid email type: ${type}`);
      }

      return {
        firstName: user.details?.firstName,
        lastName: user.details?.lastName,
        emailAddress: email.emailAddress,
        config: {
          id: email.config?.id,
          isEnabled: email.config?.isEnabled,
          externalCredential: {
            id: email.config?.externalCredential?.id,
            smtp: email.config?.externalCredential?.smtp,
            oauth: email.config?.externalCredential?.oauth,
          },
        },
      };
    },
    {
      headers: {
        authorization: authorizationUser.authorization,
      },
    }
  );

  if (errors) {
    console.error(errors);
    throw new GraphQLError(errors[0].message);
  }

  return resolvedEmail as ResolvedFromEmail;
}

export async function lookupEmailAddress(
  email: EmailAddress,
  authorizationUser: {
    userId: string;
    authorization: string;
  }
) {
  const { value, type } = email;

  if (type === "EMAIL_ADDRESS") return email.value;

  const [lookupedEmail, errors] = await sq.query(
    (q) => {
      if (type === "USER_ID") {
        return q.emailLookup({
          id: value,
          type: asEnumKey(LookupTypeInput, "USER_ID"),
        })?.emailAddress;
      } else if (type === "EMAIL_ID") {
        return q.emailLookup({
          id: value,
          type: asEnumKey(LookupTypeInput, "EMAIL_ID"),
        })?.emailAddress;
      }
    },
    {
      headers: {
        authorization: authorizationUser.authorization,
      },
    }
  );

  if (errors) {
    console.error(errors);
    throw new GraphQLError(errors[0].message);
  }

  if (!lookupedEmail) throw new GraphQLError("Email not found");

  return lookupedEmail;
}

export async function verifyReplyToEmailAddress(
  replyTo: EmailAddress,
  authorizationUser: {
    userId: string;
    authorization: string;
  }
) {
  const [_, errors] = await sq.query(
    (q) => {
      const user = q.user({
        id: authorizationUser.userId,
      });

      if (replyTo.type === "USER_ID") {
        return user.email().emailAddress;
      } else if (replyTo.type === "EMAIL_ID") {
        return user.email({ filter: { emailId: replyTo.value } }).emailAddress;
      } else if (replyTo.type === "EMAIL_ADDRESS") {
        return user.email({ filter: { emailAddress: replyTo.value } })
          .emailAddress;
      }

      throw new GraphQLError("Invalid replyTo type");
    },
    {
      headers: {
        authorization: authorizationUser.authorization,
      },
    }
  );

  if (errors) {
    console.error(errors);
    throw new GraphQLError(errors[0].message);
  }
}
