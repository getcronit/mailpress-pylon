import { ObjectManager } from "@netsnek/prisma-repository";

import {client} from "../client";
import {SMTPConfigRepository} from "../.generated";


export class SMTPConfig extends SMTPConfigRepository {

  static objects = new ObjectManager<"SMTPConfig", typeof SMTPConfig>(client.sMTPConfig,SMTPConfig);

  // Custom logic here...

}