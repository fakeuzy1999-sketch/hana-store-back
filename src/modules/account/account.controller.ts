import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { AddressDto } from './dto/account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PasswordChangeGuard } from '../../common/guards/password-change.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@Controller('me')
@UseGuards(JwtAuthGuard, PasswordChangeGuard)
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Get('addresses')
  addresses(@CurrentUser() user: AuthUser) {
    return this.account.addresses(user.id);
  }

  @Post('addresses')
  add(@CurrentUser() user: AuthUser, @Body() dto: AddressDto) {
    return this.account.addAddress(user.id, dto);
  }

  @Put('addresses/:id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AddressDto) {
    return this.account.updateAddress(user.id, id, dto);
  }

  @Delete('addresses/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.account.removeAddress(user.id, id);
  }

  @Get('favorites')
  favorites(@CurrentUser() user: AuthUser) {
    return this.account.favorites(user.id);
  }

  @Post('favorites/:productId')
  toggleFavorite(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.account.toggleFavorite(user.id, productId);
  }
}
