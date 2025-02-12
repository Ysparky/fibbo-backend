import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

@Injectable()
export class WebSocketAdapter extends IoAdapter {
  constructor(
    private app: any,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const cors = {
      origin: this.configService.get('CORS_ORIGIN', '*'),
      credentials: true,
    };

    const optionsWithCORS = {
      ...options,
      cors,
    };

    return super.createIOServer(port, optionsWithCORS);
  }
}
