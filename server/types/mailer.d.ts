
export declare namespace MailerContext {

  interface emailVerify {
    site_name           : string
    username            : string
    email_verify_url    : string
    timeout             : number
  }

  interface resetPass {
    site_name           : string
    username            : string
    code                : string
    timeout             : number
  }
}