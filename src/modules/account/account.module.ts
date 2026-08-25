import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [SettingsModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
