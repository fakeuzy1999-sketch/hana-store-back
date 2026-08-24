import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddressDto } from './dto/account.dto';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  addresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      include: { zone: true },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    });
  }

  async addAddress(userId: string, dto: AddressDto) {
    const count = await this.prisma.address.count({ where: { userId } });
    // La primera direccion siempre queda como predeterminada.
    const isDefault = dto.isDefault || count === 0;
    if (isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.address.create({
      data: { ...dto, notes: dto.notes ?? null, isDefault, userId },
      include: { zone: true },
    });
  }

  async updateAddress(userId: string, id: string, dto: AddressDto) {
    await this.ownAddress(userId, id);
    if (dto.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.address.update({
      where: { id },
      data: { ...dto, notes: dto.notes ?? null },
      include: { zone: true },
    });
  }

  async removeAddress(userId: string, id: string) {
    await this.ownAddress(userId, id);
    await this.prisma.address.delete({ where: { id } });
    return { ok: true };
  }

  async favorites(userId: string) {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        product: { include: { images: { orderBy: { position: 'asc' } }, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.product.id,
      slug: r.product.slug,
      name: r.product.name,
      price: r.product.price,
      images: r.product.images.map((i) => i.url),
      category: r.product.category.name,
    }));
  }

  /** Un solo endpoint para marcar y desmarcar: el corazon de la ficha es un interruptor. */
  async toggleFavorite(userId: string, productId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      await this.prisma.favorite.delete({ where: { userId_productId: { userId, productId } } });
      return { favorite: false };
    }
    await this.prisma.favorite.create({ data: { userId, productId } });
    return { favorite: true };
  }

  private async ownAddress(userId: string, id: string) {
    const address = await this.prisma.address.findFirst({ where: { id, userId } });
    if (!address) throw new NotFoundException('Direccion no encontrada');
    return address;
  }
}
