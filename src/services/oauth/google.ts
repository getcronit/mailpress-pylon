import { Issuer, generators } from "openid-client";
import { Handler } from "hono";
import { setSignedCookie, getSignedCookie } from "hono/cookie";
import { auth } from "@cronitio/pylon";
import { client as prisma } from "../../repository/client";
import { PYLON_SECRET, PYLON_URL } from "../../config";
import { Organization } from "../../repository/models/Organization";

const issuer = await Issuer.discover("https://accounts.google.com");

export const getClient = async (organization: Organization) => {
  const app = await organization.oAuthApp({ type: "GOOGLE" });

  const client = new issuer.Client({
    client_id: app.clientId,
    client_secret: app.$clientSecret,
    redirect_uris: [`${PYLON_URL}/oauth/google/callback`],
    response_types: ["code"],
  });

  return client;
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

  const client = await getClient(organization);

  const url = client.authorizationUrl({
    scope: "openid email profile https://www.googleapis.com/auth/gmail.send",
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

  const client = await getClient(organization);

  const params = client.callbackParams(c.req.url);

  const tokenSet = await client.callback(
    `${PYLON_URL}/oauth/google/callback`,
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
          provider: "GOOGLE",
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
          provider: "GOOGLE",
          accessToken: access_token,
          accessTokenExpiresAt: new Date(expires_at * 1000),
          refreshToken: refresh_token,
        },
      },
    },
  });

  return new Response("OK from Google callback", { status: 200 });
};
