import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { readCookie } from '../../common/utils/cookie.util';

const ADMIN_ROOM = 'role:ADMIN';

/** Pushes attendance events to connected admins. Employees never subscribe —
 * with no clock-out, attendance:created is the only event that exists. */
@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: true, credentials: true },
})
export class AttendanceGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AttendanceGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const cookieName = this.config.get<string>('COOKIE_NAME', 'wfh_token');
      const token = readCookie(client.handshake.headers.cookie, cookieName);
      if (!token) throw new Error('missing session cookie');

      const payload = await this.jwtService.verifyAsync<{ role: string }>(token);
      if (payload.role === 'ADMIN') {
        await client.join(ADMIN_ROOM);
      }
    } catch (error) {
      this.logger.debug(`Rejecting socket connection: ${(error as Error).message}`);
      client.disconnect(true);
    }
  }

  emitAttendanceCreated(payload: unknown) {
    this.server.to(ADMIN_ROOM).emit('attendance:created', payload);
  }
}
