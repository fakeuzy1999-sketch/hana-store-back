import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, TrackOrderDto } from './dto/orders.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  /** El checkout funciona con o sin sesion: si hay token, el pedido queda enlazado a la cuenta. */
  @Post('orders')
  @UseGuards(OptionalJwtGuard)
  create(@Body() dto: CreateOrderDto, @CurrentUser() user?: AuthUser) {
    return this.orders.create(dto, user?.id);
  }

  @Get('orders/track')
  track(@Query() query: TrackOrderDto) {
    return this.orders.track(query.code, query.phone);
  }

  @Get('me/orders')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: AuthUser) {
    return this.orders.myOrders(user.id);
  }

  @Get('me/orders/:code')
  @UseGuards(JwtAuthGuard)
  mineByCode(@CurrentUser() user: AuthUser, @Param('code') code: string) {
    return this.orders.myOrderByCode(user.id, code);
  }
}
