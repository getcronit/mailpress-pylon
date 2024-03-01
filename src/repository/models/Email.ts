import { ObjectManager } from "@netsnek/prisma-repository";

import { requireAuth } from "@cronitio/pylon";
import { $Enums } from "@prisma/client";

import { client } from "../client";
import { EmailRepository } from "../.generated";
import service from "../..";

export class Email extends EmailRepository {
  static objects = new ObjectManager<"Email", typeof Email>(
    client.email,
    Email
  );

  @requireAuth({})
  static async create(data: {
    email: string;
    smtpConfig?: {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
    };
    oauthConfig?: {
      provider: $Enums.OAuthProvider;
      accessToken: string;
    };
  }) {
    const ctx = await service.getContext(this);

    return await ctx.user!.$emailAdd({
      email: data.email,
      smtpConfig: {
        create: data.smtpConfig,
      },
      oauthConfig: {
        create: data.oauthConfig,
      },
    });
  }

  @requireAuth({})
  static async update(
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
      oauthConfig?: {
        provider?: $Enums.OAuthProvider;
        accessToken?: string;
      };
    }
  ) {
    const ctx = await service.getContext(this);

    return await ctx.user!.$emailUpdate(
      {
        email: data.email,
        smtpConfig: {
          update: data.smtpConfig,
        },
        oauthConfig: {
          update: data.oauthConfig,
        },
      },
      { id }
    );
  }

  @requireAuth({})
  static async delete(id: number) {
    const ctx = await service.getContext(this);

    return await ctx.user!.$emailDelete({});
  }
}
