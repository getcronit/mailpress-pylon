import { ObjectManager } from "@getcronit/prisma-extended-models";

import { client } from "../client";
import { SMTPConfigRepository } from "../.generated";
import { requireAuth } from "@getcronit/pylon";
import service from "../../";

export class SMTPConfig extends SMTPConfigRepository {
  static objects = new ObjectManager<"SMTPConfig", typeof SMTPConfig>(
    client.sMTPConfig,
    SMTPConfig
  );

  // Custom logic here...
}
