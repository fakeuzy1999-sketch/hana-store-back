import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryDto, SettingsDto, ZoneDto } from './dto/admin.dto';

/** `Vestidos de fiesta` -> `vestidos-de-fiesta`. El slug es la URL del catalogo. */
function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Categorias, zonas y ajustes de la tienda: lo que antes solo existia porque lo
 * creaba el seed. Sin esto, una base limpia deja el panel inservible (no se
 * puede crear un producto sin categoria ni entregar sin zonas).
 */
@Injectable()
export class AdminStoreService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Categorias ─────────────────────────────────────────────
  categories() {
    return this.prisma.category.findMany({
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
  }

  async createCategory(dto: CategoryDto) {
    const slug = slugify(dto.name);
    if (!slug) throw new BadRequestException('El nombre no puede quedar vacío');
    if (await this.prisma.category.findUnique({ where: { slug } })) {
      throw new BadRequestException('Ya existe una categoría con ese nombre');
    }
    return this.prisma.category.create({
      data: { name: dto.name.trim(), slug, position: dto.position ?? 0 },
    });
  }

  async updateCategory(id: string, dto: CategoryDto) {
    await this.categoryOrThrow(id);
    const slug = slugify(dto.name);
    const clash = await this.prisma.category.findUnique({ where: { slug } });
    if (clash && clash.id !== id) throw new BadRequestException('Ya existe una categoría con ese nombre');
    return this.prisma.category.update({
      where: { id },
      data: { name: dto.name.trim(), slug, position: dto.position ?? 0 },
    });
  }

  async removeCategory(id: string) {
    await this.categoryOrThrow(id);
    // Product.categoryId es obligatorio: borrar la categoria dejaria productos huerfanos.
    const products = await this.prisma.product.count({ where: { categoryId: id } });
    if (products) {
      throw new BadRequestException(
        `No se puede borrar: ${products} producto(s) usan esta categoría. Muévelos antes a otra.`,
      );
    }
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }

  // ── Zonas ──────────────────────────────────────────────────
  zones() {
    return this.prisma.zone.findMany({
      orderBy: { number: 'asc' },
      include: { _count: { select: { orders: true, addresses: true, couriers: true } } },
    });
  }

  async createZone(dto: ZoneDto) {
    if (await this.prisma.zone.findUnique({ where: { number: dto.number } })) {
      throw new BadRequestException(`Ya existe la zona número ${dto.number}`);
    }
    return this.prisma.zone.create({ data: this.zoneData(dto) });
  }

  async updateZone(id: string, dto: ZoneDto) {
    await this.zoneOrThrow(id);
    const clash = await this.prisma.zone.findUnique({ where: { number: dto.number } });
    if (clash && clash.id !== id) throw new BadRequestException(`Ya existe la zona número ${dto.number}`);
    return this.prisma.zone.update({ where: { id }, data: this.zoneData(dto) });
  }

  async removeZone(id: string) {
    await this.zoneOrThrow(id);
    const orders = await this.prisma.order.count({ where: { zoneId: id } });
    if (orders) {
      throw new BadRequestException(
        `No se puede borrar: ${orders} pedido(s) son de esta zona. Desactívala en su lugar.`,
      );
    }
    const addresses = await this.prisma.address.count({ where: { zoneId: id } });
    if (addresses) {
      throw new BadRequestException(
        `No se puede borrar: ${addresses} dirección(es) guardadas apuntan a esta zona. Desactívala en su lugar.`,
      );
    }
    await this.prisma.zone.delete({ where: { id } });
    return { ok: true };
  }

  // ── Ajustes ────────────────────────────────────────────────
  async settings() {
    const rows = await this.prisma.setting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async saveSettings(dto: SettingsDto) {
    const entries = Object.entries(dto).filter(([, v]) => v !== undefined);
    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.setting.upsert({
          where: { key },
          create: { key, value: String(value) },
          update: { value: String(value) },
        }),
      ),
    );
    return this.settings();
  }

  // ── Auxiliares ─────────────────────────────────────────────
  private zoneData(dto: ZoneDto) {
    return {
      number: dto.number,
      name: dto.name.trim(),
      neighborhoods: (dto.neighborhoods ?? []).map((n) => n.trim()).filter(Boolean),
      deliveryFee: dto.deliveryFee,
      etaHoursMin: dto.etaHoursMin,
      etaHoursMax: dto.etaHoursMax,
      active: dto.active ?? true,
    };
  }

  private async categoryOrThrow(id: string) {
    const found = await this.prisma.category.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Categoría no encontrada');
    return found;
  }

  private async zoneOrThrow(id: string) {
    const found = await this.prisma.zone.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Zona no encontrada');
    return found;
  }
}
