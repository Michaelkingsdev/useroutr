import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { EventsGateway } from './events.gateway';
import { PrismaService } from '../../prisma/prisma.service';

type MockSocket = Pick<Socket, 'id' | 'handshake' | 'join' | 'disconnect'>;

function createMockSocket(
  overrides: Partial<{
    id: string;
    query: Record<string, string>;
  }> = {},
): MockSocket {
  return {
    id: overrides.id ?? 'socket-123',
    handshake: { query: overrides.query ?? {} } as Socket['handshake'],
    join: jest.fn() as unknown as Socket['join'],
    disconnect: jest.fn() as unknown as Socket['disconnect'],
  };
}

describe('EventsGateway', () => {
  let gateway: EventsGateway;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockPrismaService = {
    merchant: {
      findUnique: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection - Dashboard Auth', () => {
    it('should connect dashboard client with valid JWT', async () => {
      const client = createMockSocket({
        query: { token: 'Bearer eyJhbGc...', type: 'merchant' },
      });

      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'merchant-123',
        email: 'test@example.com',
        type: 'access',
      });

      mockPrismaService.merchant.findUnique.mockResolvedValue({
        id: 'merchant-123',
        email: 'test@example.com',
      });

      await gateway.handleConnection(client as Socket);

      expect(client.join).toHaveBeenCalledWith('merchant:merchant-123');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should reject dashboard client with invalid JWT', async () => {
      const client = createMockSocket({
        query: { token: 'invalid-token', type: 'merchant' },
      });

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await gateway.handleConnection(client as Socket);

      expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it('should reject if merchant not found', async () => {
      const client = createMockSocket({
        query: { token: 'Bearer eyJhbGc...', type: 'merchant' },
      });

      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'merchant-123',
        type: 'access',
      });

      mockPrismaService.merchant.findUnique.mockResolvedValue(null);

      await gateway.handleConnection(client as Socket);

      expect(client.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('handleConnection - Checkout Auth', () => {
    it('should connect checkout client with valid paymentId', async () => {
      const client = createMockSocket({
        query: { paymentId: 'pay-123', type: 'payment' },
      });

      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'pay-123',
        merchantId: 'merchant-123',
      });

      await gateway.handleConnection(client as Socket);

      expect(client.join).toHaveBeenCalledWith('payment:pay-123');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should reject checkout client with invalid paymentId', async () => {
      const client = createMockSocket({
        query: { paymentId: 'invalid', type: 'payment' },
      });

      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await gateway.handleConnection(client as Socket);

      expect(client.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('handleDisconnect', () => {
    it('should cleanup socket context on disconnect', () => {
      const client = createMockSocket();

      gateway['socketContextMap'].set('socket-123', {
        merchantId: 'merchant-123',
        type: 'merchant',
        connectedAt: new Date(),
      });

      gateway.handleDisconnect(client as Socket);

      expect(gateway['socketContextMap'].has('socket-123')).toBe(false);
    });
  });

  describe('handleMerchantSubscribe', () => {
    it('should allow merchant to subscribe to own merchant events', () => {
      const client = createMockSocket();

      gateway['socketContextMap'].set('socket-123', {
        merchantId: 'merchant-123',
        type: 'merchant',
        connectedAt: new Date(),
      });

      const result = gateway.handleMerchantSubscribe(
        client as Socket,
        'merchant-123',
      );

      expect(result).toEqual({
        subscribed: true,
        merchant: 'merchant-123',
      });
      expect(client.join).toHaveBeenCalledWith('merchant:merchant-123');
    });

    it('should reject merchant subscribing to other merchant', () => {
      const client = createMockSocket();

      gateway['socketContextMap'].set('socket-123', {
        merchantId: 'merchant-123',
        type: 'merchant',
        connectedAt: new Date(),
      });

      expect(() => {
        gateway.handleMerchantSubscribe(client as Socket, 'other-merchant');
      }).toThrow();
    });
  });

  describe('handlePaymentSubscribe', () => {
    it('should allow payment subscriber to subscribe', () => {
      const client = createMockSocket();

      gateway['socketContextMap'].set('socket-123', {
        paymentId: 'pay-123',
        type: 'payment',
        connectedAt: new Date(),
      });

      const result = gateway.handlePaymentSubscribe(
        client as Socket,
        'pay-123',
      );

      expect(result).toEqual({
        subscribed: true,
        payment: 'pay-123',
      });
      expect(client.join).toHaveBeenCalledWith('payment:pay-123');
    });

    it('should reject if subscribing to wrong payment', () => {
      const client = createMockSocket();

      gateway['socketContextMap'].set('socket-123', {
        paymentId: 'pay-123',
        type: 'payment',
        connectedAt: new Date(),
      });

      expect(() => {
        gateway.handlePaymentSubscribe(client as Socket, 'other-payment');
      }).toThrow();
    });
  });
});
