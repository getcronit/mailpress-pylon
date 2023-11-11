import { defineService } from "@snek-at/function";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

import { emailFactoryService } from "./services/email-factory";
import { emailTemplateService } from "./services/email-template";

dotenv.config();

export default defineService(
  {
    Query: {
      template: emailTemplateService.get,
      allTemplate: emailTemplateService.all,
    },
    Mutation: {
      templateCreate: emailTemplateService.create,
      templateUpdate: emailTemplateService.update,
      templateDelete: emailTemplateService.delete,
      mailSchedule: emailFactoryService.mailSchedule,
    },
  }
  // {
  //   configureApp: () => {
  //     import("./init-templates");
  //   },
  // }
);
