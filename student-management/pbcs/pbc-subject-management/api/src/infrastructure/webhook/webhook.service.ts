// AI-GENERATED
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly webhookUrl: string;

  constructor(private readonly config: ConfigService) {
    this.webhookUrl = this.config.get('WEBHOOK_URL', '');
  }

  async send(event: string, data: Record<string, unknown>, tenantId: string): Promise<void> {
    if (!this.webhookUrl) return;
    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, tenantId, occurredAt: new Date().toISOString(), data }),
      });
    } catch (err) {
      this.logger.warn(`Webhook delivery failed: ${(err as Error).message}`);
    }
  }
}
