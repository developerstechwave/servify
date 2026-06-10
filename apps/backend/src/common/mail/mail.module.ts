import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host:   process.env.MAIL_HOST  || 'smtp.gmail.com',
        port:   parseInt(process.env.MAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: `"Servify" <${process.env.MAIL_USER}>`,
      },
    }),
  ],
  providers: [MailService],
  exports:   [MailService],
})
export class MailModule {}
