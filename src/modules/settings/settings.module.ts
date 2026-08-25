import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { DeliveryService } from './delivery.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, DeliveryService],
  exports: [SettingsService, DeliveryService],
})
export class SettingsModule {}
