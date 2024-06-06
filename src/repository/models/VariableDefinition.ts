import { ObjectManager } from "@getcronit/prisma-extended-models";

import { client } from "../client";
import { VariableDefinitionRepository } from "../.generated";

export class VariableDefinition extends VariableDefinitionRepository {
  static objects = new ObjectManager<
    "VariableDefinition",
    typeof VariableDefinition
  >(client.variableDefinition, VariableDefinition);

  // Custom logic here...
}
