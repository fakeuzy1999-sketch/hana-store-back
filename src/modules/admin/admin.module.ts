import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { AdminController } from './admin.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminProductsService } from './admin-products.service';
import { AdminReportsService } from './admin-reports.service';
import { AdminRoutesService } from './admin-routes.service';
import { AdminStoreService } from './admin-store.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [SettingsModule, OrdersModule],
  controllers: [AdminController],
  providers: [
    AdminOrdersService,
    AdminProductsService,
    AdminReportsService,
    AdminRoutesService,
    AdminStoreService,
  ],
})
export class AdminModule {}
