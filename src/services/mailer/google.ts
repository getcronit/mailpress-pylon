import { MailOptions, OAuthOptions } from "./types";

export async function sendMail(
  mailOptions: MailOptions,
  oauthOptions: OAuthOptions
): Promise<object> {
  const apiUrl = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

  const headers = {
    Authorization: `Bearer ${oauthOptions.accessToken}`,
    "Content-Type": "application/json",
  };

  const message =
    `From: ${mailOptions.from}\n` +
    `To: ${mailOptions.to.join(",")}\n` +
    `Subject: ${mailOptions.subject}\n\n` +
    `${mailOptions.html || mailOptions.text}`;

  const requestBody = JSON.stringify({
    raw: Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_"),
  });

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: headers,
    body: requestBody,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send email: ${error.error.message}`);
  }

  return response;
}
