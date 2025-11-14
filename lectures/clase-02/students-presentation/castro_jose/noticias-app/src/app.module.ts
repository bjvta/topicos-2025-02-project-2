import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdaptationModule } from './adaptation/adaptation.module';

@Module({
  imports: [AdaptationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
