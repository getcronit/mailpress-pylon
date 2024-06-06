import { ObjectManager } from "@getcronit/prisma-extended-models";
import { requireAuth } from "@getcronit/pylon";

import { client } from "../client";
import { UserRepository } from "../.generated";
import service from "../../index";
import { Email } from "./Email";
import { encrypt } from "../../services/crypt";

export class User extends UserRepository {
  static objects = new ObjectManager<"User", typeof User>(client.user, User);

  // Custom logic here...

  @requireAuth({})
  static async me() {
    const ctx = await service.getContext();
    return ctx.user;
  }

  @requireAuth({})
  static async createEmail(
    email: string,
    smtpConfig?: {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
    }
  ) {
    const ctx = await service.getContext();

    if (smtpConfig?.password) {
      smtpConfig.password = encrypt(smtpConfig.password);
    }

    return await Email.objects.upsert(
      {
        email: email,
        smtpConfig: {
          create: smtpConfig,
        },
      },
      {
        email: email,
        smtpConfig: {
          update: smtpConfig,
        },
      },
      {
        userId: ctx.user!.id,
      }
    );
  }

  @requireAuth({})
  static async updateEmail(
    id: string,
    data: {
      email?: string;
      smtpConfig?: {
        host?: string;
        port?: number;
        secure?: boolean;
        username?: string;
        password?: string;
      };
    }
  ) {
    const ctx = await service.getContext();

    return await ctx.user!.$emailUpdate(
      {
        email: data.email,
        smtpConfig: {
          update: data.smtpConfig,
        },
      },
      { id }
    );
  }

  @requireAuth({})
  static async deleteEmail(id: string) {
    const ctx = await service.getContext();

    return await ctx.user!.$emailDelete({ id });
  }

  @requireAuth({})
  async $getAuthenticatedEmail() {
    const ctx = await service.getContext();

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
