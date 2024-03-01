import { ObjectManager } from "@netsnek/prisma-repository";

import {client} from "../client";
import {OAuthConfigRepository} from "../.generated";


export class OAuthConfig extends OAuthConfigRepository {

  static objects = new ObjectManager<"OAuthConfig", typeof OAuthConfig>(client.oAuthConfig,OAuthConfig);

  // Custom logic here...
}