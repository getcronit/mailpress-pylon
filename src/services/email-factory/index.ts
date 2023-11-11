import { $Enums } from "@prisma/client";
import { withContext } from "@snek-at/function";

import repository from "../../repository";
import { EmailEngine } from "./email-engine";
import { optionalAnyAuth } from "../../decorators";

export class EmailFactoryService {
  mailSchedule = withContext(
    (context) =>
      async (
        envelope: {
          subject?: string;
          to?: Array<{
            value: string;
            type: $Enums.EmailAddressType;
          }>;

          from?: {
            value: string;
            type: $Enums.EmailAddressType;
          };
          replyTo?: {
            value: string;
            type: $Enums.EmailAddressType;
          };
        },
        body?: string,
        bodyHTML?: string,
        template?: {
          id: string;
          values?: {
            [variableName: string]: any;
          };
        }
      ) => {
        const originUserId = context.multiAuth?.[0].userId;

        const emailTemplate = template?.id
          ? await repository.EmailTemplate.objects.get({
              where: {
                id: template.id,
              },
            })
          : undefined;

        const engine = new EmailEngine({
          template: emailTemplate,
          authorizationUser: originUserId
            ? {
                userId: originUserId,
                authorization: context.req.headers.authorization!,
              }
            : undefined,
        });

        return await engine.scheduleMail({
          envelope,
          body,
          bodyHTML,
          values: template?.values,
        });
      },
    {
      decorators: [optionalAnyAuth],
    }
  );
}

export const emailFactoryService = new EmailFactoryService();
