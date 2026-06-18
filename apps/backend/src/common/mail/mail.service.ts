import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  async sendInvitation(payload: {
    to:        string;
    name:      string;
    token:     string;
    message:   string;
    expiresIn: string;
  }) {
    const registerUrl = `${process.env.CLIENT_URL}/auth/register?token=${payload.token}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:rgba(101,16,127,1);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Servify</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Multi-Tenant Customer Service Platform</p>
        </div>
        <div style="padding:40px 32px;">
          <p style="color:#444;font-size:15px;line-height:1.6;">Hello ${payload.name},</p>
          <p style="color:#444;font-size:15px;line-height:1.6;">${payload.message}</p>
          <div style="background:#f5edf9;border:1px dashed rgba(101,16,127,0.3);border-radius:8px;padding:16px;text-align:center;margin:20px 0;">
            <p style="margin:0 0 8px;color:#888;font-size:13px;">Your Registration Token</p>
            <div style="font-size:22px;font-weight:bold;color:rgba(101,16,127,1);letter-spacing:3px;">${payload.token}</div>
          </div>
          <p style="color:#444;font-size:15px;">Click the button below to complete your registration:</p>
          <a href="${registerUrl}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:rgba(101,16,127,1);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;">Complete Registration</a>
          <p style="font-size:13px;color:#888;">This invitation expires in <strong>${payload.expiresIn}</strong>.</p>
        </div>
        <div style="background:#f9f9f9;padding:20px 32px;text-align:center;">
          <p style="color:#aaa;font-size:12px;margin:0;">© 2026 Servify. All rights reserved.</p>
        </div>
      </div>
    `;
    try {
      await this.mailerService.sendMail({
        to:      payload.to,
        subject: 'You have been invited to Servify',
        html,
      });
      this.logger.log(`Invitation email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${payload.to}`, error);
      throw error;
    }
  }

  async sendRequestReceived(payload: { to: string; name: string }) {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:rgba(101,16,127,1);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Servify</h1>
        </div>
        <div style="padding:40px 32px;">
          <p style="color:#444;font-size:15px;line-height:1.6;">Hello ${payload.name},</p>
          <p style="color:#444;font-size:15px;line-height:1.6;">We have received your request to join Servify. Our team will review your application and get back to you shortly.</p>
          <div style="background:#f5edf9;border-radius:8px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0;color:rgba(101,16,127,1);font-weight:bold;">Status: Pending Review</p>
          </div>
          <p style="color:#444;font-size:15px;">You will receive an email with your registration link once your request has been approved.</p>
          <p style="color:#444;font-size:15px;">Thank you for your interest in Servify!</p>
        </div>
        <div style="background:#f9f9f9;padding:20px 32px;text-align:center;">
          <p style="color:#aaa;font-size:12px;margin:0;">© 2026 Servify. All rights reserved.</p>
        </div>
      </div>
    `;
    try {
      await this.mailerService.sendMail({
        to:      payload.to,
        subject: 'We received your request — Servify',
        html,
      });
      this.logger.log(`Request received email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`Failed to send request email to ${payload.to}`, error);
      throw error;
    }
  }

  async sendWelcomeEmployee(payload: {
    to:       string;
    name:     string;
    password: string;
    role:     string;
  }) {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:rgba(101,16,127,1);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Welcome to Servify</h1>
        </div>
        <div style="padding:40px 32px;">
          <p style="color:#444;font-size:15px;line-height:1.6;">Hello ${payload.name},</p>
          <p style="color:#444;font-size:15px;line-height:1.6;">You have been added as an employee with the role of <strong>${payload.role}</strong>. Here are your login credentials:</p>
          <div style="background:#f5edf9;border:1px dashed rgba(101,16,127,0.3);border-radius:8px;padding:16px;margin:20px 0;">
            <p style="margin:0 0 8px;color:#444;font-size:14px;"><strong>Email:</strong> ${payload.to}</p>
            <p style="margin:0;color:#444;font-size:14px;"><strong>Password:</strong> ${payload.password}</p>
          </div>
          <p style="font-size:13px;color:#888;">Please log in and change your password immediately.</p>
        </div>
        <div style="background:#f9f9f9;padding:20px 32px;text-align:center;">
          <p style="color:#aaa;font-size:12px;margin:0;">© 2026 Servify. All rights reserved.</p>
        </div>
      </div>
    `;
    try {
      await this.mailerService.sendMail({
        to:      payload.to,
        subject: 'Welcome to Servify — Your Login Credentials',
        html,
      });
      this.logger.log(`Welcome email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${payload.to}`, error);
      throw error;
    }
  }
}
