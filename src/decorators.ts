import { decorator } from "@snek-at/function";
import { requireAdminForResource } from "@snek-functions/jwt";

export const requireAdminOnMailpress = decorator(async (context, args) => {
  const ctx = await requireAdminForResource(context, [
    "8e111dc0-f6d2-4c95-8b46-abc336b76a14",
  ]);

  return ctx;
});
