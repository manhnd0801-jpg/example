// AI-GENERATED
// Webhook service — gửi HTTP callback đến URL được cấu hình trong pbc-contract.json
// Dùng khi cần tích hợp hệ thống ngoài theo mẫu webhook

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  tenantId: string;
  occurredAt: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly webhookUrl: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.webhookUrl = this.config.get<string>('WEBHOOK_URL');
  }

  async send(payload: WebhookPayload): Promise<void> {
    if (!this.webhookUrl) return; // Webhook không được cấu hình — bỏ qua

    try {
      const res = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        this.logger.warn(`Webhook returned ${res.status} for event ${payload.event}`);
      }
    } catch (err) {
      this.logger.error(`Webhook failed for event ${payload.event}: ${(err as Error).message}`);
      // Không throw — webhook failure không block luồng chính
    }
  }
}
