import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  type: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: [
      process.env.DASHBOARD_URL || 'http://localhost:3001',
      process.env.CHECKOUT_URL || 'http://localhost:3002',
    ],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  private socketContextMap = new Map<
    string,
    {
      merchantId?: string;
      paymentId?: string;
      type: 'merchant' | 'payment';
      connectedAt: Date;
    }
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const { token, paymentId, type } = client.handshake.query as {
        token?: string;
        sessionToken?: string;
        paymentId?: string;
        type?: string;
      };

      this.logger.debug(
        `WebSocket connection attempt - Token: ${token ? 'yes' : 'no'}, PaymentId: ${paymentId}, Type: ${type}`,
      );

      if (token && type === 'merchant') {
        const merchantId = await this.validateDashboardAuth(token);
        this.socketContextMap.set(client.id, {
          merchantId,
          type: 'merchant',
          connectedAt: new Date(),
        });

        void client.join(`merchant:${merchantId}`);
        this.logger.log(
          `Dashboard client connected - Merchant: ${merchantId}, SocketId: ${client.id}`,
        );

        return;
      }

      if (paymentId && type === 'payment') {
        const payment = await this.validateCheckoutAuth(paymentId);

        this.socketContextMap.set(client.id, {
          paymentId: payment.id,
          type: 'payment',
          connectedAt: new Date(),
        });

        void client.join(`payment:${payment.id}`);
        this.logger.log(
          `Checkout client connected - Payment: ${payment.id}, SocketId: ${client.id}`,
        );

        return;
      }

      this.logger.warn(
        `Connection rejected - Invalid or missing authentication`,
      );
      client.disconnect(true);
    } catch (error) {
      this.logger.error(
        `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const context = this.socketContextMap.get(client.id);

    if (context) {
      const identifier =
        context.type === 'merchant' ? context.merchantId : context.paymentId;

      this.logger.log(
        `Client disconnected - ${context.type}: ${identifier}, SocketId: ${client.id}`,
      );
    }

    this.socketContextMap.delete(client.id);
  }

  @SubscribeMessage('subscribe:merchant')
  handleMerchantSubscribe(
    client: Socket,
    merchantId: string,
  ): { subscribed: boolean; merchant: string } {
    const context = this.socketContextMap.get(client.id);

    if (
      !context ||
      context.type !== 'merchant' ||
      context.merchantId !== merchantId
    ) {
      throw new WsException(
        'Unauthorized - cannot subscribe to other merchant events',
      );
    }

    void client.join(`merchant:${merchantId}`);

    this.logger.log(
      `Merchant ${merchantId} subscribed to merchant events (SocketId: ${client.id})`,
    );

    return {
      subscribed: true,
      merchant: merchantId,
    };
  }

  @SubscribeMessage('subscribe:payment')
  handlePaymentSubscribe(
    client: Socket,
    paymentId: string,
  ): { subscribed: boolean; payment: string } {
    const context = this.socketContextMap.get(client.id);

    if (
      !context ||
      context.type !== 'payment' ||
      context.paymentId !== paymentId
    ) {
      throw new WsException(
        'Unauthorized - cannot subscribe to other payment events',
      );
    }

    void client.join(`payment:${paymentId}`);

    this.logger.log(
      `Client subscribed to payment ${paymentId} updates (SocketId: ${client.id})`,
    );

    return {
      subscribed: true,
      payment: paymentId,
    };
  }

  private async validateDashboardAuth(token: string): Promise<string> {
    try {
      const jwtToken = token.replace('Bearer ', '').replace('bearer ', '');

      const payload = await this.jwtService.verifyAsync<JwtPayload>(jwtToken);

      if (!payload.sub || payload.type !== 'access') {
        throw new Error('Invalid token payload');
      }

      const merchant = await this.prisma.merchant.findUnique({
        where: { id: payload.sub },
      });

      if (!merchant) {
        throw new Error('Merchant not found');
      }

      return merchant.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Dashboard auth validation failed: ${message}`);
      throw new WsException(`Authentication failed: ${message}`);
    }
  }

  private async validateCheckoutAuth(
    paymentId: string,
  ): Promise<{ id: string; merchantId: string }> {
    try {
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }

      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        select: { id: true, merchantId: true },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Checkout auth validation failed: ${message}`);
      throw new WsException(`Authentication failed: ${message}`);
    }
  }
}
