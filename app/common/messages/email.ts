const configEnv = require('../../common/config/env.config.js')
const nodemailer = require("nodemailer");
const Email = require('email-templates');

export class MailSender {

    private static instance: MailSender;

    constructor() {
    }

    static getInstance(): MailSender {
        if (!MailSender.instance) {
            MailSender.instance = new MailSender();
        }
        return MailSender.instance;
    }

    async sendForgot(toAddress: String, toName: String, subject: string, pwd: string) {
        if (configEnv.environment === 'dev') {
            let transporter = nodemailer.createTransport({
                host: configEnv.smtp_host,
                port: configEnv.smtp_port,
                secure: false,
                auth: {
                    user: configEnv.smtp_user,
                    pass: configEnv.smtp_pwd,
                },
            });

            const email = new Email({
                transport: transporter,
                send: configEnv.sendMail,
                preview: false,
            });

            email.send({
                template: 'forgot',
                message: {
                    from: configEnv.smtp_sender,
                    to: toAddress,
                },
                locals: {
                    name: toName,
                    password: pwd
                },
            }).then(() => console.log('email has been send!'));

        } else {
            console.log('Coming soon....')
        }
    }
}