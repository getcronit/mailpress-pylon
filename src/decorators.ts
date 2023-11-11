import { Context, decorator } from "@snek-at/function";
import {
  AuthenticationContext,
  AuthenticationRequiredError,
  requireAdminForResource,
  requireAnyAuth,
} from "@snek-functions/jwt";

export const requireAdminOnMailpress = decorator(async (context, args) => {
  const ctx = await requireAdminForResource(context, [
    "8e111dc0-f6d2-4c95-8b46-abc336b76a14",
  ]);

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
