import { MailOptions, OAuthOptions } from "./types";

export async function sendMail(
  mailOptions: MailOptions,
  oauthOptions: OAuthOptions
): Promise<object> {
  const apiUrl = "https://graph.microsoft.com/v1.0/me/sendMail";

  const headers = {
    Authorization: `Bearer ${oauthOptions.accessToken}`,
    "Content-Type": "application/json",
  };

  const requestBody = JSON.stringify({
    message: {
      subject: mailOptions.subject,
      from: { emailAddress: { address: mailOptions.from } },
      body: {
        contentType: mailOptions.html ? "html" : "text",
        content: mailOptions.html || mailOptions.text,
      },
      toRecipients: mailOptions.to.map((to) => ({
        emailAddress: { address: to },
      })),
      ...(mailOptions.replyTo && {
        replyTo: [{ emailAddress: { address: mailOptions.replyTo } }],
      }),
    },
    saveToSentItems: true,
  });

  console.log(requestBody);

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
