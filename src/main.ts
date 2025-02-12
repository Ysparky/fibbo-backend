import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WebSocketAdapter } from './infrastructure/websocket/websocket.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.useWebSocketAdapter(new WebSocketAdapter(app, configService));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
