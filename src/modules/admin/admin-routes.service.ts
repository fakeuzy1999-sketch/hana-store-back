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
    return this.prisma.courier.findMany({ include: { zone: true }, orderBy: { name: 'asc' } });
  }

  create(dto: CourierDto) {
    return this.prisma.courier.create({
      data: {
        name: dto.name.trim(),
        initials: initialsOf(dto.name),
        phone: normalizePhone(dto.phone),
        zoneId: dto.zoneId ?? null,
        active: dto.active ?? true,
      },
      include: { zone: true },
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
        zoneId: dto.zoneId ?? null,
        active: dto.active ?? true,
      },
      include: { zone: true },
    });
  }

  /**
   * Foto del dia: cuanto lleva cada repartidor de su ruta y que zonas
   * quedaron con pedidos pendientes y nadie que los lleve.
   */
  async today() {
    const from = new Date();
    from.setHours(0, 0, 0, 0);

    const [couriers, zones, unassignedByZone] = await Promise.all([
      this.prisma.courier.findMany({
        where: { active: true },
        include: {
          zone: true,
          orders: { where: { createdAt: { gte: from } }, select: { status: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.zone.findMany({ where: { active: true }, orderBy: { number: 'asc' } }),
      this.prisma.order.groupBy({
        by: ['zoneId'],
        where: { status: 'NUEVO' },
        _count: { _all: true },
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
        zone: c.zone ? { number: c.zone.number, name: c.zone.name, neighborhoods: c.zone.neighborhoods } : null,
        assigned,
        done,
        status: assigned === 0 ? 'SIN RUTA' : done === assigned ? 'TERMINO' : enRoute ? 'EN RUTA' : 'POR SALIR',
      };
    });

    const covered = new Set(couriers.filter((c) => c.orders.length > 0 && c.zoneId).map((c) => c.zoneId));

    return {
      routes,
      uncovered: zones
        .filter((z) => !covered.has(z.id))
        .map((z) => ({
          id: z.id,
          number: z.number,
          name: z.name,
          pending: unassignedByZone.find((g) => g.zoneId === z.id)?._count._all ?? 0,
        })),
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
