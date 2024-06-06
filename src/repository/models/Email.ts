import { ObjectManager } from "@getcronit/prisma-extended-models";

import { EmailRepository } from "../.generated";
import { client } from "../client";

export class Email extends EmailRepository {
  static objects = new ObjectManager<"Email", typeof Email>(
    client.email,
    Email
  );
}
