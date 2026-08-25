import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeliveryService } from '../settings/delivery.service';
import { CategoryDto, SettingsDto } from './dto/admin.dto';

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
 * Categorias y ajustes de la tienda: lo que antes solo existia porque lo creaba
 * el seed. Sin esto, una base limpia deja el panel inservible: no se puede crear
 * un producto sin categoria.
 */
@Injectable()
export class AdminStoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly delivery: DeliveryService,
  ) {}

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

  // ── Ajustes ────────────────────────────────────────────────
  async settings() {
    const [rows, terms] = await Promise.all([this.prisma.setting.findMany(), this.delivery.terms()]);
    // La ciudad no se edita aqui: si viajara de vuelta, el PUT la rechazaria por no estar en el DTO.
    const { city, ...delivery } = terms;
    return { ...Object.fromEntries(rows.map((r) => [r.key, r.value])), ...delivery };
  }

  async saveSettings(dto: SettingsDto) {
    const { deliveryFee, etaHoursMin, etaHoursMax, ...texts } = dto;
    await this.delivery.update({ deliveryFee, etaHoursMin, etaHoursMax });
    const entries = Object.entries(texts).filter(([, v]) => v !== undefined);
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
  private async categoryOrThrow(id: string) {
    const found = await this.prisma.category.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Categoría no encontrada');
    return found;
  }
}
