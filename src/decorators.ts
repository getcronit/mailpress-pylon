import { Context, decorator } from "@snek-at/function";
import {
  AuthenticationContext,
  AuthenticationRequiredError,
  requireAdminForResource,
  requireAnyAuth,
} from "@snek-functions/jwt";

const MAILPRESS_RESOURCE_ID =
  process.env.MAILPRESS_RESOURCE_ID || "8e111dc0-f6d2-4c95-8b46-abc336b76a14";

console.log(`MAILPRESS_RESOURCE_ID: ${MAILPRESS_RESOURCE_ID}`);

export const requireAdminOnMailpress = decorator(async (context, args) => {
  const ctx = await requireAdminForResource(context, [MAILPRESS_RESOURCE_ID]);

  return ctx;
});

export const optionalAnyAuth = decorator(async (context, args) => {
  let ctx: Context<{
    auth?: AuthenticationContext["auth"];
    multiAuth?: AuthenticationContext["multiAuth"];
  }> = context;

  try {
    ctx = await requireAnyAuth(context, args);
  } catch (e) {
    if (!(e instanceof AuthenticationRequiredError)) {
      throw e;
    }
  }

  return ctx;
});
