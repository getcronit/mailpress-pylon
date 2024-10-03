import { ObjectManager } from "@getcronit/prisma-extended-models";

import * as oidcGoogle from "../../services/oauth/google";
import * as oidcAzure from "../../services/oauth/azure";
import { client } from "../client";
import { OAuthConfigRepository } from "../.generated";
import { ServiceError } from "@getcronit/pylon";
import { PYLON_URL } from "../../config";
import { Organization } from "./Organization";

export class OAuthConfig extends OAuthConfigRepository {
  static objects = new ObjectManager<"OAuthConfig", typeof OAuthConfig>(
    client.oAuthConfig,
    OAuthConfig
  );

  // Custom logic here...

  async $freshAccessToken() {
    // Get fresh token set

    const organization = await Organization.objects.get({
      users: {
        some: {
          email: {
            oauthConfig: {
              id: this.id,
            },
          },
        },
      },
    });

    if (this.provider === "GOOGLE") {
      // Get token set from Google

      if (this.accessTokenExpiresAt > new Date()) {
        // Token is still valid
        return this.$accessToken;
      }

      try {
        const { client } = await oidcGoogle.getClient(organization);

        const tokenSet = await client.refresh(this.$refreshToken);

        await OAuthConfig.objects.update(
          {
            accessToken: tokenSet.access_token,
            accessTokenExpiresAt: new Date(tokenSet.expires_at! * 1000),
          },
          {
            id: this.id,
          }
        );

        return tokenSet.access_token!;
      } catch (e) {
        console.error(e);

        throw new ServiceError("Failed to refresh token", {
          code: "FAILED_TO_REFRESH_TOKEN",
          statusCode: 500,
          details: {
            description: "Failed to refresh token. Please re-authenticate.",
            loginUrl: `${PYLON_URL}/oauth/google`,
            provider: "GOOGLE",
          },
        });
      }
    } else if (this.provider === "AZURE") {
      // Get token set from Azure

      if (this.accessTokenExpiresAt > new Date()) {
        // Token is still valid
        return this.$accessToken;
      }

      try {
        const { client } = await oidcAzure.getClient(organization);

        const tokenSet = await client.refresh(this.$refreshToken);

        await OAuthConfig.objects.update(
          {
            accessToken: tokenSet.access_token,
            accessTokenExpiresAt: new Date(tokenSet.expires_at! * 1000),
          },
          {
            id: this.id,
          }
        );

        return tokenSet.access_token!;
      } catch (e) {
        throw new ServiceError("Failed to refresh token", {
          code: "FAILED_TO_REFRESH_TOKEN",
          statusCode: 500,
          details: {
            description: "Failed to refresh token. Please re-authenticate.",
            loginUrl: `${PYLON_URL}/oauth/azure`,
            provider: "AZURE",
          },
        });
      }
    }

    throw new Error(`Provider ${this.provider} not supported`);
  }
}
