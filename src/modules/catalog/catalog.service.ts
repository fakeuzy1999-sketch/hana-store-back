import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductQueryDto, Sort, ValidateCartDto } from './dto/catalog.dto';

const INCLUDE = {
  category: true,
  images: { orderBy: { position: 'asc' } },
  variants: { orderBy: [{ size: 'asc' }, { color: 'asc' }] },
} satisfies Prisma.ProductInclude;

const ORDER_BY: Record<Sort, Prisma.ProductOrderByWithRelationInput> = {
  nuevo: { createdAt: 'desc' },
  precio_asc: { price: 'asc' },
  precio_desc: { price: 'desc' },
  nombre: { name: 'asc' },
};

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  categories() {
    return this.prisma.category.findMany({ orderBy: { position: 'asc' } });
  }

  zones() {
    return this.prisma.zone.findMany({ where: { active: true }, orderBy: { number: 'asc' } });
  }

  async list(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 24, 60);
    const where = this.buildWhere(query);

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: INCLUDE,
        orderBy: ORDER_BY[query.sort ?? 'nuevo'],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: products.map((p) => this.toPublic(p)),
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize)),
      facets: await this.facets(),
    };
  }

  async featured() {
    const products = await this.prisma.product.findMany({
      where: { isHidden: false, isFeatured: true },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    return products.map((p) => this.toPublic(p));
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isHidden: false },
      include: INCLUDE,
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.toPublic(product);
  }

  /**
   * Recalcula el carrito contra la base: el cliente nunca decide precios ni disponibilidad.
   * Devuelve cada linea con su precio vigente y lo que realmente hay en stock.
   */
  async validateCart(dto: ValidateCartDto) {
    const variants = await this.prisma.variant.findMany({
      where: { id: { in: dto.items.map((i) => i.variantId) } },
      include: { product: { include: INCLUDE } },
    });

    const lines = dto.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant || variant.product.isHidden) {
        return {
          variantId: item.variantId,
          name: 'Producto no disponible',
          quantity: 0,
          requested: item.quantity,
          unitPrice: 0,
          lineTotal: 0,
          stock: 0,
          available: false,
          reason: 'no_disponible',
        };
      }
      const quantity = Math.min(item.quantity, variant.stock);
      return {
        variantId: variant.id,
        productId: variant.productId,
        slug: variant.product.slug,
        ref: variant.product.ref,
        name: variant.product.name,
        size: variant.size,
        color: variant.color,
        imageUrl: variant.product.images[0]?.url ?? null,
        unitPrice: variant.product.price,
        stock: variant.stock,
        requested: item.quantity,
        quantity,
        lineTotal: quantity * variant.product.price,
        available: quantity > 0,
        reason: quantity === 0 ? 'agotado' : quantity < item.quantity ? 'stock_parcial' : null,
      };
    });

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const zone = dto.zoneId ? await this.prisma.zone.findUnique({ where: { id: dto.zoneId } }) : null;
    const deliveryFee = zone?.deliveryFee ?? 0;

    return {
      lines,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      hasChanges: lines.some((l) => l.reason != null),
    };
  }

  private buildWhere(query: ProductQueryDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = { isHidden: false };

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { ref: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.category) where.category = { slug: query.category };
    if (query.min !== undefined || query.max !== undefined) {
      where.price = { gte: query.min ?? undefined, lte: query.max ?? undefined };
    }
    // Talla y color filtran por variante CON stock: no tiene sentido ofrecer lo agotado.
    if (query.size || query.color) {
      where.variants = {
        some: {
          stock: { gt: 0 },
          ...(query.size ? { size: query.size } : {}),
          ...(query.color ? { color: query.color } : {}),
        },
      };
    }
    return where;
  }

  private async facets() {
    const variants = await this.prisma.variant.findMany({
      where: { product: { isHidden: false } },
      select: { size: true, color: true },
    });
    const range = await this.prisma.product.aggregate({
      where: { isHidden: false },
      _min: { price: true },
      _max: { price: true },
    });
    return {
      sizes: [...new Set(variants.map((v) => v.size))].sort(),
      colors: [...new Set(variants.map((v) => v.color).filter(Boolean))].sort(),
      priceMin: range._min.price ?? 0,
      priceMax: range._max.price ?? 0,
    };
  }

  private toPublic(p: any) {
    const stock = p.variants.reduce((sum: number, v: any) => sum + v.stock, 0);
    return {
      id: p.id,
      ref: p.ref,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      isFeatured: p.isFeatured,
      category: { id: p.category.id, name: p.category.name, slug: p.category.slug },
      images: p.images.map((i: any) => i.url),
      variants: p.variants.map((v: any) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        stock: v.stock,
        sku: v.sku,
      })),
      sizes: [...new Set(p.variants.map((v: any) => v.size))],
      colors: [...new Set(p.variants.map((v: any) => v.color).filter(Boolean))],
      stock,
      inStock: stock > 0,
    };
  }
}
