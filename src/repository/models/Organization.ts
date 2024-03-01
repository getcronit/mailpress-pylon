import { ObjectManager } from "@netsnek/prisma-repository";

import { OrganizationRepository } from "../.generated";
import { client } from "../client";
import { requireAuth } from "@cronitio/pylon";
import { $Enums } from "@prisma/client";
import { Email } from "./Email";
import service from "../..";

export class Organization extends OrganizationRepository {
  static objects = new ObjectManager<"Organization", typeof Organization>(
    client.organization,
    Organization
  );

  @requireAuth({
    roles: ["mailpress:admin"],
  })
  static async setSenderEmail(
    email: string,
    smtpConfig?: {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
    },
    oauthConfig?: {
      provider: $Enums.OAuthProvider;
      accessToken: string;
    }
  ) {
    const ctx = await service.getContext(this);

    return await Email.objects.create({
      email,
      smtpConfig: {
        create: smtpConfig,
      },
      oauthConfig: {
        create: oauthConfig,
      },
      organization: {
        connect: {
          id: ctx.user!.$organizationId,
        },
      },
    });
  }
}
