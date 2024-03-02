import { Issuer, generators } from "openid-client";
import { Handler } from "hono";
import { setSignedCookie, getSignedCookie } from "hono/cookie";
import { auth } from "@cronitio/pylon";
import { client as prisma } from "../../repository/client";
import { PYLON_SECRET, PYLON_URL } from "../../config";
import { Organization } from "../../repository/models/Organization";
import { OAuthApp } from "../../repository/models/OAuthApp";

const issuer = await Issuer.discover(
  "https://login.microsoftonline.com/common/v2.0"
);

export const getClient = async (organization: Organization) => {
  const app = await organization.oAuthApp({ type: "AZURE" });

  const client = new issuer.Client({
    client_id: app.clientId,
    client_secret: app.$clientSecret,
    redirect_uris: [`${PYLON_URL}/oauth/azure/callback`],
    response_types: ["code"],
  });

  return { client, app };
};

export const handler: Handler = async (c) => {
  await auth.require({})(c, () => Promise.resolve());

  const sub = c.get("auth")!.sub;

  // store the userId in your framework's session mechanism, if it is a cookie based solution
  // it should be httpOnly (not readable by javascript) and encrypted.
  await setSignedCookie(c, "google-oauth-sub", sub, PYLON_SECRET, {
    httpOnly: true,
    secure: true,
  });

  const code_verifier = generators.codeVerifier();

  await setSignedCookie(
    c,
    "google-oauth-code-verifier",
    code_verifier,
    PYLON_SECRET,
    {
      httpOnly: true,
      secure: true,
    }
  );

  const code_challenge = generators.codeChallenge(code_verifier);

  const organization = await Organization.objects.get({
    users: {
      some: {
        id: sub,
      },
    },
  });

  const { client } = await getClient(organization);

  const url = client.authorizationUrl({
    scope: "openid email profile Mail.send offline_access",
    code_challenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
  });

  return c.redirect(url);
};

export const handlerCb: Handler = async (c) => {
  const sub = await getSignedCookie(c, PYLON_SECRET, "google-oauth-sub");
  const code_verifier = await getSignedCookie(
    c,
    PYLON_SECRET,
    "google-oauth-code-verifier"
  );

  if (!sub || !code_verifier) {
    return new Response("Invalid state", { status: 400 });
  }

  const organization = await Organization.objects.get({
    users: {
      some: {
        id: sub,
      },
    },
  });

  const { client, app } = await getClient(organization);

  const params = client.callbackParams(c.req.url);

  const tokenSet = await client.callback(
    `${PYLON_URL}/oauth/azure/callback`,
    params,
    { code_verifier }
  );

  const { access_token, refresh_token, expires_at } = tokenSet;

  if (!access_token || !refresh_token || !expires_at) {
    return new Response("Invalid token", { status: 400 });
  }

  const claims = tokenSet.claims();

  const email = claims.email;

  if (!email) {
    return new Response("No email found", { status: 400 });
  }

  await prisma.email.upsert({
    where: {
      userId: sub,
    },
    create: {
      email,
      userId: sub,
      oauthConfig: {
        create: {
          provider: "AZURE",
          accessToken: access_token,
          accessTokenExpiresAt: new Date(expires_at * 1000),
          refreshToken: refresh_token,
        },
      },
    },
    update: {
      email,
      oauthConfig: {
        update: {
          provider: "AZURE",
          accessToken: access_token,
          accessTokenExpiresAt: new Date(expires_at * 1000),
          refreshToken: refresh_token,
        },
      },
    },
  });

  return c.redirect(app.redirectUrl);
};
