import { ObjectManager } from "@getcronit/prisma-extended-models";

import { OrganizationRepository } from "../.generated";
import { client } from "../client";
import { requireAuth } from "@getcronit/pylon";
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
    }
  ) {
    const ctx = await service.getContext();

    return await Email.objects.create({
      email,
      smtpConfig: {
        create: smtpConfig,
      },
      organization: {
        connect: {
          id: ctx.user!.$organizationId,
        },
      },
    });
  }
}
