import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  async sendInvitation(payload: {
    to:          string;
    name:        string;
    token:       string;
    message:     string;
    expiresIn:   string;
  }) {
    const registerUrl = `${process.env.CLIENT_URL}/auth/register?token=${payload.token}`;

    try {
      await this.mailerService.sendMail({
        to:       payload.to,
        subject:  'You have been invited to Servify',
        template: 'invitation',
        context: {
          name:        payload.name,
          message:     payload.message,
          token:       payload.token,
          registerUrl,
          expiresIn:   payload.expiresIn,
        },
      });
      this.logger.log(`Invitation email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${payload.to}`, error);
      throw error;
    }
  }

  async sendRequestReceived(payload: {
    to:   string;
    name: string;
  }) {
    try {
      await this.mailerService.sendMail({
        to:       payload.to,
        subject:  'We received your request — Servify',
        template: 'request-received',
        context: {
          name: payload.name,
        },
      });
      this.logger.log(`Request received email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`Failed to send request email to ${payload.to}`, error);
      throw error;
    }
  }
}
