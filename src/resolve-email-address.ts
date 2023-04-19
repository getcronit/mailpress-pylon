import { GraphQLError } from "graphql";
import { asEnumKey } from "snek-query";

import { sq } from "./clients/iam/src/index.js";
import { Email, LookupTypeInput } from "./clients/iam/src/schema.generated.js";
import { EmailAddress, EmailAddressType } from "./email-template-factory.js";

export interface ResolvedFromEmail {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  emailAddress: string;
  emailConfiguration: Email["emailConfiguration"];
}

export async function resolveFromEmailAddress(
  email: EmailAddress,
  authorizationUser: {
    id: string;
    authorization: string;
  }
): Promise<ResolvedFromEmail> {
  const { value, type } = email;

  const [resolvedEmail, errors] = await sq.query(
    (q) => {
      const user = q.user({
        id: authorizationUser.id,
      });

      let email: Email | undefined;

      switch (type) {
        case EmailAddressType.EMAIL_ADDRESS:
          email = user.email({ filter: { emailAddress: value } });
          break;
        case EmailAddressType.EMAIL_ID:
          email = user.email({ filter: { emailId: value } });
          break;
        case EmailAddressType.USER_ID:
          email = user.email();
          break;
        default:
          throw new GraphQLError("Invalid email address type");
      }

      return {
        firstName: user.details?.firstName,
        lastName: user.details?.lastName,
        emailAddress: email.emailAddress,
        emailConfiguration: email.emailConfiguration,
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

  return resolvedEmail;
}

export async function lookupEmailAddress(
  email: EmailAddress,
  authorizationUser: {
    id: string;
    authorization: string;
  }
) {
  const { value, type } = email;

  if (type === EmailAddressType.EMAIL_ADDRESS) return email.value;

  const [lookupedEmail, errors] = await sq.query(
    (q) => {
      if (type === EmailAddressType.USER_ID) {
        return q.emailLookup({
          id: value,
          type: asEnumKey(LookupTypeInput, "USER_ID"),
        })?.emailAddress;
      } else if (type === EmailAddressType.EMAIL_ID) {
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

  console.log("lookupedEmail: ", lookupedEmail);

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
    id: string;
    authorization: string;
  }
) {
  console.log("replyTo: ", replyTo, authorizationUser);

  const [_, errors] = await sq.query(
    (q) => {
      const user = q.user({
        id: authorizationUser.id,
      });

      if (replyTo.type === EmailAddressType.USER_ID) {
        return user.email().emailAddress;
      } else if (replyTo.type === EmailAddressType.EMAIL_ID) {
        return user.email({ filter: { emailId: replyTo.value } }).emailAddress;
      } else if (replyTo.type === EmailAddressType.EMAIL_ADDRESS) {
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
