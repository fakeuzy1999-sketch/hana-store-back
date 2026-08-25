import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CourierDto } from './dto/admin.dto';
import { normalizePhone } from '../auth/auth.service';

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

@Injectable()
export class AdminRoutesService {
  constructor(private readonly prisma: PrismaService) {}

  couriers() {
    return this.prisma.courier.findMany({ orderBy: { name: 'asc' } });
  }

  create(dto: CourierDto) {
    return this.prisma.courier.create({
      data: {
        name: dto.name.trim(),
        initials: initialsOf(dto.name),
        phone: normalizePhone(dto.phone),
        active: dto.active ?? true,
      },
    });
  }

  async update(id: string, dto: CourierDto) {
    await this.exists(id);
    return this.prisma.courier.update({
      where: { id },
      data: {
        name: dto.name.trim(),
        initials: initialsOf(dto.name),
        phone: normalizePhone(dto.phone),
        active: dto.active ?? true,
      },
    });
  }

  /**
   * Foto del dia: cuanto lleva cada repartidor de su ruta y cuantos pedidos
   * siguen sin que nadie los lleve.
   */
  async today() {
    const from = new Date();
    from.setHours(0, 0, 0, 0);

    const [couriers, unassigned] = await Promise.all([
      this.prisma.courier.findMany({
        where: { active: true },
        include: {
          orders: { where: { createdAt: { gte: from } }, select: { status: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.order.findMany({
        where: { status: 'NUEVO' },
        select: { code: true, neighborhood: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const routes = couriers.map((c) => {
      const assigned = c.orders.length;
      const done = c.orders.filter((o) => o.status === 'ENTREGADO_COBRADO').length;
      const enRoute = c.orders.some((o) => o.status === 'EN_RUTA');
      return {
        id: c.id,
        name: c.name,
        initials: c.initials,
        phone: c.phone,
        assigned,
        done,
        status: assigned === 0 ? 'SIN RUTA' : done === assigned ? 'TERMINO' : enRoute ? 'EN RUTA' : 'POR SALIR',
      };
    });

    return {
      routes,
      unassigned: unassigned.map((o) => ({ code: o.code, neighborhood: o.neighborhood })),
    };
  }

  /** Cerrar caja: el repartidor entrego el efectivo del dia en tienda. */
  async closeCash(closureId: string) {
    const closure = await this.prisma.cashClosure.findUnique({ where: { id: closureId } });
    if (!closure) throw new NotFoundException('Caja no encontrada');
    if (closure.closed) throw new BadRequestException('Esa caja ya estaba cerrada');
    return this.prisma.cashClosure.update({
      where: { id: closureId },
      data: { closed: true, closedAt: new Date() },
    });
  }

  private async exists(id: string) {
    const courier = await this.prisma.courier.findUnique({ where: { id } });
    if (!courier) throw new NotFoundException('Repartidor no encontrado');
    return courier;
  }
}
