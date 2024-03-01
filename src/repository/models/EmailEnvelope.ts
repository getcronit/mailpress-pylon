import { ObjectManager } from "@netsnek/prisma-repository";

import {client} from "../client";
import {EmailEnvelopeRepository} from "../.generated";


export class EmailEnvelope extends EmailEnvelopeRepository {

  static objects = new ObjectManager<"EmailEnvelope", typeof EmailEnvelope>(client.emailEnvelope,EmailEnvelope);

  // Custom logic here...
}