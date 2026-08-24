import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminProductsService } from './admin-products.service';
import { AdminReportsService } from './admin-reports.service';
import { AdminRoutesService } from './admin-routes.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [AdminController],
  providers: [AdminOrdersService, AdminProductsService, AdminReportsService, AdminRoutesService],
})
export class AdminModule {}
