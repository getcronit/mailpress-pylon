import { ObjectManager } from "@netsnek/prisma-repository";
import { requireAuth } from "@cronitio/pylon";

import { client } from "../client";
import { UserRepository } from "../.generated";
import service from "../../index";

export class User extends UserRepository {
  static objects = new ObjectManager<"User", typeof User>(client.user, User);

  // Custom logic here...

  @requireAuth({})
  static async me() {
    const ctx = await service.getContext(this);
    return ctx.user;
  }

  @requireAuth({})
  async $getAuthenticatedEmail() {
    const ctx = await service.getContext(this);

    const baseUrl = process.env.AUTH_ISSUER;

    const res = await fetch(`${baseUrl}/auth/v1/users/me/email`, {
      headers: {
        Authorization: `Bearer ${ctx.req.header("authorization")}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user email");
    }

    const data = (await res.json()) as {
      email: {
        email: string;
        isEmailVerified: boolean;
      };
    };

    if (!data.email.isEmailVerified) {
      throw new Error("User email is not verified");
    }

    return data.email.email;
  }
}
