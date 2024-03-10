import * as Sentry from "@sentry/bun";
import { PrismaClient } from "@prisma/client";
export const client = new PrismaClient();

Sentry.addIntegration(new Sentry.Integrations.Prisma({ client }));
