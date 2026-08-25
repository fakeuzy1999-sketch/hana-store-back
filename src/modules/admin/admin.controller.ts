import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PasswordChangeGuard } from '../../common/guards/password-change.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminOrdersService } from './admin-orders.service';
import { AdminProductsService } from './admin-products.service';
import { AdminReportsService } from './admin-reports.service';
import { AdminRoutesService } from './admin-routes.service';
import { AdminStoreService } from './admin-store.service';
import {
  AssignCourierDto,
  BulkAssignDto,
  ChangeStatusDto,
  CategoryDto,
  CourierDto,
  OrderFilterDto,
  ProductDto,
  ReportQueryDto,
  SettingsDto,
  StockDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PasswordChangeGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly orders: AdminOrdersService,
    private readonly products: AdminProductsService,
    private readonly reports: AdminReportsService,
    private readonly routes: AdminRoutesService,
    private readonly store: AdminStoreService,
  ) {}

  // ── Panel ──────────────────────────────────────────────────
  @Get('dashboard')
  dashboard() {
    return this.reports.dashboard();
  }

  // ── Pedidos ────────────────────────────────────────────────
  @Get('orders')
  listOrders(@Query() filter: OrderFilterDto) {
    return this.orders.list(filter);
  }

  @Get('orders/:code')
  orderDetail(@Param('code') code: string) {
    return this.orders.detail(code);
  }

  @Patch('orders/:code/status')
  changeStatus(@Param('code') code: string, @Body() dto: ChangeStatusDto) {
    return this.orders.changeStatus(code, dto);
  }

  @Patch('orders/:code/courier')
  assign(@Param('code') code: string, @Body() dto: AssignCourierDto) {
    return this.orders.assign(code, dto);
  }

  @Post('orders/bulk-assign')
  bulkAssign(@Body() dto: BulkAssignDto) {
    return this.orders.bulkAssign(dto);
  }

  // ── Inventario ─────────────────────────────────────────────
  @Get('products')
  listProducts(@Query('filter') filter?: 'bajo' | 'ocultos') {
    return this.products.list(filter);
  }

  @Post('products')
  createProduct(@Body() dto: ProductDto) {
    return this.products.create(dto);
  }

  @Put('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: ProductDto) {
    return this.products.update(id, dto);
  }

  @Patch('products/:id/hidden')
  toggleHidden(@Param('id') id: string) {
    return this.products.toggleHidden(id);
  }

  @Delete('products/:id')
  removeProduct(@Param('id') id: string) {
    return this.products.remove(id);
  }

  @Patch('variants/:id/stock')
  setStock(@Param('id') id: string, @Body() dto: StockDto) {
    return this.products.setStock(id, dto);
  }

  // ── Reportes de cobro ──────────────────────────────────────
  @Get('reports/cod')
  cod(@Query() query: ReportQueryDto) {
    return this.reports.cod(query.range ?? 'today');
  }

  @Get('reports/cod.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="cobros.csv"')
  codCsv(@Query() query: ReportQueryDto) {
    return this.reports.codCsv(query.range ?? 'today');
  }

  // ── Repartidores y rutas ───────────────────────────────────
  @Get('couriers')
  couriers() {
    return this.routes.couriers();
  }

  @Post('couriers')
  createCourier(@Body() dto: CourierDto) {
    return this.routes.create(dto);
  }

  @Put('couriers/:id')
  updateCourier(@Param('id') id: string, @Body() dto: CourierDto) {
    return this.routes.update(id, dto);
  }

  @Get('routes/today')
  routesToday() {
    return this.routes.today();
  }

  @Post('closures/:id/close')
  closeCash(@Param('id') id: string) {
    return this.routes.closeCash(id);
  }
  // ── Categorias ─────────────────────────────────────────────
  @Get('categories')
  listCategories() {
    return this.store.categories();
  }

  @Post('categories')
  createCategory(@Body() dto: CategoryDto) {
    return this.store.createCategory(dto);
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: CategoryDto) {
    return this.store.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.store.removeCategory(id);
  }

  // ── Ajustes de la tienda ───────────────────────────────────
  @Get('settings')
  settings() {
    return this.store.settings();
  }

  @Put('settings')
  saveSettings(@Body() dto: SettingsDto) {
    return this.store.saveSettings(dto);
  }

}
