import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events/events.service';
import { QuotesService } from '../quotes/quotes.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { StellarService } from '../stellar/stellar.service';

interface MockPayment {
  id: string;
  merchantId: string;
  status: string;
  sourceAmount: string;
  sourceAsset: string;
  metadata: Record<string, unknown>;
  completedAt: Date | null;
  merchant: { id: string; name: string; webhookUrl: string };
  quote: { expiresAt: Date };
}

describe('PaymentsService', () => {
  let service: PaymentsService;

  const paymentRecord: MockPayment = {
    id: 'pay_123',
    merchantId: 'merchant_123',
    status: 'PENDING',
    sourceAmount: '50',
    sourceAsset: 'USD',
    metadata: {},
    completedAt: null,
    merchant: {
      id: 'merchant_123',
      name: 'Acme Store',
      webhookUrl: 'https://merchant.test/webhook',
    },
    quote: {
      expiresAt: new Date('2026-03-28T12:00:00Z'),
    },
  };

  const prisma = {
    payment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    webhookEvent: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const eventsService = {
    emitPaymentStatus: jest.fn(),
  };

  const quotesService = {
    validateAndConsume: jest.fn(),
  };

  const webhooksService = {
    dispatch: jest.fn(),
  };

  const stellarService = {
    lockHTLC: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'STRIPE_WEBHOOK_SECRET') return 'whsec_test';
      return undefined;
    }),
  };

  let stripeMock: {
    paymentIntents: { create: jest.Mock };
    webhooks: { constructEvent: jest.Mock };
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.payment.findUnique.mockResolvedValue(paymentRecord);
    prisma.payment.update.mockResolvedValue(paymentRecord);
    prisma.webhookEvent.create.mockResolvedValue({});
    prisma.$transaction.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventsService, useValue: eventsService },
        { provide: QuotesService, useValue: quotesService },
        { provide: WebhooksService, useValue: webhooksService },
        { provide: StellarService, useValue: stellarService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);

    stripeMock = {
      paymentIntents: {
        create: jest.fn().mockResolvedValue({
          id: 'pi_123',
          client_secret: 'pi_123_secret_456',
        }),
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    };
    Object.defineProperty(service, 'stripe', {
      value: stripeMock,
      writable: true,
    });
  });

  it('creates a Stripe card session and stores intent metadata', async () => {
    const result = await service.createCardSession('pay_123');

    expect(result).toEqual({ clientSecret: 'pi_123_secret_456' });
    expect(stripeMock.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 5000,
        currency: 'usd',
        metadata: {
          paymentId: 'pay_123',
          merchantId: 'merchant_123',
        },
      }),
    );
    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'pay_123' },
      }),
    );
  });

  it('marks payments completed when Stripe success webhooks arrive', async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      id: 'evt_success',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          status: 'succeeded',
          metadata: { paymentId: 'pay_123' },
        },
      },
    });

    await service.handleStripeWebhook(
      'stripe-signature',
      Buffer.from('payload'),
    );

    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({ status: 'COMPLETED' }),
      }),
    );
    expect(prisma.webhookEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({ eventType: 'payment.completed' }),
      }),
    );
  });
});
