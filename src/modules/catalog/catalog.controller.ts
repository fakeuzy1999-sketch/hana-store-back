import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ProductQueryDto, ValidateCartDto } from './dto/catalog.dto';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  categories() {
    return this.catalog.categories();
  }

  @Get('products')
  list(@Query() query: ProductQueryDto) {
    return this.catalog.list(query);
  }

  @Get('products/featured')
  featured() {
    return this.catalog.featured();
  }

  @Get('products/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.catalog.bySlug(slug);
  }

  @Post('cart/validate')
  validateCart(@Body() dto: ValidateCartDto) {
    return this.catalog.validateCart(dto);
  }
}
