import { ObjectManager } from "@netsnek/prisma-repository";

import { EmailRepository } from "../.generated";
import { client } from "../client";

export class Email extends EmailRepository {
  static objects = new ObjectManager<"Email", typeof Email>(
    client.email,
    Email
  );
}
