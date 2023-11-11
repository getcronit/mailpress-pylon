import { withContext } from "@snek-at/function";
import { $Enums } from "@prisma/client";

import Repository from "../repository";
import { requireAdminForResource, requireAnyAuth } from "@snek-functions/jwt";

export class EmailTemplateService {
  all = withContext(
    (context) => async () => {
      const { resourceId } = context.multiAuth[0];

      await requireAdminForResource(context, [resourceId]);

      return Repository.EmailTemplate.objects.filter({
        where: { resourceId },
      });
    },
    {
      decorators: [requireAnyAuth],
    }
  );

  get = withContext(
    (context) => async (id: string) => {
      const { resourceId } = context.multiAuth[0];

      await requireAdminForResource(context, [resourceId]);

      return Repository.EmailTemplate.objects.get({
        where: {
          id,
          resourceId,
        },
      });
    },
    {
      decorators: [requireAnyAuth],
    }
  );

  create = withContext(
    (context) =>
      async (data: {
        content: string;
        description: string;
        authorizationUser?: {
          userId: string;
          authorization: string;
        };
        variables?: {
          name: string;

          isRequired?: boolean;
          isConstant?: boolean;
          description?: string;
          defaultValue?: string;
        }[];

        envelope?: {
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
        };
      }) => {
        const { userId, resourceId } = context.multiAuth[0];

        await requireAdminForResource(context, [resourceId]);

        return Repository.EmailTemplate.objects.create({
          data: {
            createdBy: userId,
            resourceId,
            content: data.content,
            description: data.description,
            authorizationUser: data.authorizationUser
              ? {
                  create: {
                    userId: data.authorizationUser.userId,
                    authorization: data.authorizationUser.authorization,
                  },
                }
              : undefined,
            variables: data.variables
              ? {
                  createMany: {
                    data: data.variables,
                  },
                }
              : undefined,

            envelope: data.envelope
              ? {
                  create: {
                    subject: data.envelope.subject,
                    from: data.envelope.from
                      ? {
                          create: {
                            value: data.envelope.from.value,
                            type: data.envelope.from.type,
                          },
                        }
                      : undefined,
                    to: {
                      create: data.envelope.to?.map((to) => ({
                        value: to.value,
                        type: to.type,
                      })),
                    },
                    replyTo: data.envelope.replyTo
                      ? {
                          create: {
                            value: data.envelope.replyTo.value,
                            type: data.envelope.replyTo.type,
                          },
                        }
                      : undefined,
                  },
                }
              : undefined,
          },
        });
      },
    {
      decorators: [requireAnyAuth],
    }
  );

  update = withContext(
    (context) =>
      async (
        id: string,
        data: {
          content?: string;
          description?: string;
          transformer?: string;
          authorizationUser?: {
            userId: string;
            authorization: string;
          };
          envelope?: {
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
          };
          parentId?: string;
          linkedIds?: string[];
          variables?: {
            id?: string;
            name: string;
            isRequired?: boolean;
            isConstant?: boolean;
            description?: string;
            defaultValue?: string;
          }[];
        }
      ) => {
        const { resourceId } = context.multiAuth[0];

        await requireAdminForResource(context, [resourceId]);

        return Repository.EmailTemplate.objects.update({
          where: {
            id,
            resourceId,
          },
          data: {
            content: data.content,
            description: data.description,
            transformer: data.transformer,
            authorizationUser: data.authorizationUser
              ? {
                  upsert: {
                    create: {
                      userId: data.authorizationUser.userId,
                      authorization: data.authorizationUser.authorization,
                    },
                    update: {
                      userId: data.authorizationUser.userId,
                      authorization: data.authorizationUser.authorization,
                    },
                  },
                }
              : undefined,
            envelope: data.envelope
              ? {
                  create: {
                    subject: data.envelope.subject,
                    from: data.envelope.from
                      ? {
                          create: {
                            value: data.envelope.from.value,
                            type: data.envelope.from.type,
                          },
                        }
                      : undefined,
                    to: {
                      create: data.envelope.to?.map((to) => ({
                        value: to.value,
                        type: to.type,
                      })),
                    },
                    replyTo: data.envelope.replyTo
                      ? {
                          create: {
                            value: data.envelope.replyTo.value,
                            type: data.envelope.replyTo.type,
                          },
                        }
                      : undefined,
                  },
                }
              : undefined,
            parent: data.parentId
              ? {
                  connect: {
                    id: data.parentId,
                  },
                }
              : undefined,
            linked: {
              connect: data.linkedIds?.map((id) => ({
                id,
              })),
            },
            variables: data.variables
              ? {
                  upsert: data.variables.map((variable) => ({
                    where: {
                      // Ugly hack to make Prisma accept undefined
                      id: variable.id || "00000000-0000-0000-0000-000000000000",
                    },
                    create: {
                      name: variable.name,
                      isRequired: variable.isRequired,
                      isConstant: variable.isConstant,
                      description: variable.description,
                      defaultValue: variable.defaultValue,
                    },
                    update: {
                      name: variable.name,
                      isRequired: variable.isRequired,
                      isConstant: variable.isConstant,
                      description: variable.description,
                      defaultValue: variable.defaultValue,
                    },
                  })),
                }
              : undefined,
          },
        });
      },
    {
      decorators: [requireAnyAuth],
    }
  );

  delete = withContext(
    (context) => async (id: string) => {
      const { resourceId } = context.multiAuth[0];

      await requireAdminForResource(context, [resourceId]);

      return Repository.EmailTemplate.objects.delete({
        where: {
          id,
          resourceId,
        },
      });
    },
    {
      decorators: [requireAnyAuth],
    }
  );
}

export const emailTemplateService = new EmailTemplateService();
