
import { proxy, arrayProxy, fnProxy, fnArrayProxy, t } from "snek-query";


type MailOptionsInput = {
    from: t.String;
    to: t.String[];
    replyTo?: t.String;
    subject: t.String;
    text: t.String;
    html?: t.String;
};
type SMTPOptionsInput = {
    host: t.String;
    port: t.NotSupportedYet;
    secure: t.Boolean;
    user: t.String;
    password: t.String;
};
type OAuthOptionsInput = {
    accessToken: t.String;
};

export class Query {
    __typename: t.String;
    version: t.String;
    constructor() { this.__typename = ""; this.version = ""; }
}
export class Mutation {
    __typename: t.String;
    sendMailSMTP: (args: {
        mailOptions: MailOptionsInput;
        smtpOptions: SMTPOptionsInput;
    }) => SentMessageInfo;
    sendMailAzure: (args: {
        mailOptions: MailOptionsInput;
        oauthOptions: OAuthOptionsInput;
    }) => t.NotSupportedYet;
    sendMailGoogle: (args: {
        mailOptions: MailOptionsInput;
        oauthOptions: OAuthOptionsInput;
    }) => t.NotSupportedYet;
    constructor() { this.__typename = ""; this.sendMailSMTP = fnProxy(SentMessageInfo); this.sendMailAzure = () => null; this.sendMailGoogle = () => null; }
}
export class SentMessageInfo {
    __typename: t.String;
    accepted: t.String[];
    rejected: t.String[];
    rejectedErrors: t.Nullable<SMTPError>[];
    response: t.String;
    envelopeTime: t.NotSupportedYet;
    messageTime: t.NotSupportedYet;
    messageSize: t.NotSupportedYet;
    constructor() { this.__typename = ""; this.accepted = []; this.rejected = []; this.rejectedErrors = arrayProxy(SMTPError); this.response = ""; this.envelopeTime = null; this.messageTime = null; this.messageSize = null; }
}
export class SMTPError {
    __typename: t.String;
    code: t.Nullable<t.String>;
    response: t.Nullable<t.String>;
    responseCode: t.Nullable<t.NotSupportedYet>;
    command: t.Nullable<t.String>;
    errno: t.Nullable<t.NotSupportedYet>;
    path: t.Nullable<t.String>;
    syscall: t.Nullable<t.String>;
    name: t.String;
    message: t.String;
    stack: t.Nullable<t.String>;
    constructor() { this.__typename = ""; this.code = null; this.response = null; this.responseCode = null; this.command = null; this.errno = null; this.path = null; this.syscall = null; this.name = ""; this.message = ""; this.stack = null; }
}

