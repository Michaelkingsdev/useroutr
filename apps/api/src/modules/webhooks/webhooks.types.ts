import { WebhookEventType } from './webhooks.constants';
import { Prisma } from '@prisma/client';

export interface WebhookJobData {
  eventId: string;
  merchantId: string;
  eventType: WebhookEventType;
  payload: Prisma.InputJsonValue;
  webhookUrl: string;
  webhookSecret: string;
  attempt: number;
}

export interface WebhookConfig {
  webhookUrl: string;
  subscribedEvents: WebhookEventType[];
}

export interface WebhookLogFilters {
  status?: 'PENDING' | 'DELIVERED' | 'FAILED' | 'EXHAUSTED';
  eventType?: WebhookEventType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
