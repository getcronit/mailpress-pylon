export interface MailOptions {
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
}

export interface OAuthOptions {
  accessToken: string;
}
