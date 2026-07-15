import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ContactNotificationInput = {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
};

type ResendErrorBody = {
  message?: string;
  name?: string;
  statusCode?: number;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendContactNotification(input: ContactNotificationInput) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY')?.trim();
    const to = this.getContactToEmail();
    const from = this.getContactFromEmail();

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'RESEND_API_KEY is not configured. Add a Resend API key before testing contact email delivery.',
      );
    }

    this.assertSenderCanReachRecipient(from, to);

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: input.email,
          subject: `New website contact: ${input.subject}`,
          html: this.renderContactHtml(input),
          text: this.renderContactText(input),
        }),
      });

      const body = await this.parseResendBody(response);

      if (!response.ok) {
        const message = this.getResendErrorMessage(response.status, body);
        this.logger.error(message);
        throw new ServiceUnavailableException(message);
      }

      return { sent: true, response: body };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;

      const message = `Contact email notification could not be sent: ${this.describeError(error)}`;
      this.logger.error(message);
      throw new ServiceUnavailableException(message);
    }
  }

  private getContactToEmail() {
    return (
      this.configService.get<string>('CONTACT_TO_EMAIL') ??
      'bbgb.asacs@gmail.com'
    ).trim();
  }

  private getContactFromEmail() {
    return (
      this.configService.get<string>('CONTACT_FROM_EMAIL') ??
      'BGB Website <onboarding@resend.dev>'
    ).trim();
  }

  private assertSenderCanReachRecipient(from: string, to: string) {
    if (
      from.toLowerCase().includes('@resend.dev') &&
      to.toLowerCase() !== 'delivered@resend.dev'
    ) {
      throw new ServiceUnavailableException(
        'Resend rejected this sender setup. CONTACT_FROM_EMAIL is using onboarding@resend.dev, which cannot deliver production contact mail to bbgb.asacs@gmail.com. Add and verify a domain in Resend, then set CONTACT_FROM_EMAIL="BGB Website <contact@your-verified-domain.com>".',
      );
    }
  }

  private async parseResendBody(response: Response) {
    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text) as ResendErrorBody | Record<string, unknown>;
    } catch {
      return { message: text } satisfies ResendErrorBody;
    }
  }

  private getResendErrorMessage(status: number, body: unknown) {
    const bodyMessage = this.extractResendMessage(body);
    const hint =
      status === 403
        ? ' Check that CONTACT_FROM_EMAIL uses a sender address on a verified Resend domain and that the API key has sending permission.'
        : '';

    return `Resend email delivery failed with status ${status}${bodyMessage ? `: ${bodyMessage}` : '.'}${hint}`;
  }

  private extractResendMessage(body: unknown) {
    if (!body || typeof body !== 'object') return '';
    const maybeBody = body as ResendErrorBody;
    return maybeBody.message ?? maybeBody.name ?? '';
  }

  private renderContactHtml(input: ContactNotificationInput) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin: 0 0 16px; color: #173B61;">New Website Contact Message</h2>
        <p><strong>Name:</strong> ${this.escapeHtml(input.name)}</p>
        <p><strong>Email:</strong> ${this.escapeHtml(input.email)}</p>
        <p><strong>Phone:</strong> ${this.escapeHtml(input.phone ?? 'Not provided')}</p>
        <p><strong>Subject:</strong> ${this.escapeHtml(input.subject)}</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="white-space: pre-wrap;">${this.escapeHtml(input.message)}</p>
      </div>
    `;
  }

  private renderContactText(input: ContactNotificationInput) {
    return [
      'New Website Contact Message',
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone ?? 'Not provided'}`,
      `Subject: ${input.subject}`,
      '',
      input.message,
    ].join('\n');
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private describeError(error: unknown) {
    if (error instanceof Error) return error.message;
    return String(error);
  }
}
