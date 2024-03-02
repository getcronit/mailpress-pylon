import { ObjectManager } from "@netsnek/prisma-repository";

import { requireAuth } from "@cronitio/pylon";

import service from "../..";
import { EmailRepository } from "../.generated";
import { client } from "../client";

export class Email extends EmailRepository {
  static objects = new ObjectManager<"Email", typeof Email>(
    client.email,
    Email
  );

  @requireAuth({})
  static async create(
    email: string,
    smtpConfig?: {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
    }
  ) {
    const ctx = await service.getContext(this);

    return await ctx.user!.$emailAdd({
      email: email,
      smtpConfig: {
        create: smtpConfig,
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
    }
  ) {
    const ctx = await service.getContext(this);

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
  static async delete(id: number) {
    const ctx = await service.getContext(this);

    return await ctx.user!.$emailDelete({});
  }
}
