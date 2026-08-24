import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderEventType, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ORDER_INCLUDE, OrdersService } from '../orders/orders.service';
import { AssignCourierDto, BulkAssignDto, ChangeStatusDto, OrderFilterDto } from './dto/admin.dto';

/**
 * Transiciones permitidas. Fuera de este mapa no hay forma de mover un pedido:
 * evita que un pedido cobrado vuelva a ruta o que se entregue algo sin asignar.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NUEVO: ['ASIGNADO', 'CANCELADO'],
  ASIGNADO: ['EN_RUTA', 'NUEVO', 'CANCELADO'],
  EN_RUTA: ['ENTREGADO_COBRADO', 'NO_RECIBIDO'],
  NO_RECIBIDO: ['EN_RUTA', 'DEVUELTO'],
  ENTREGADO_COBRADO: [],
  DEVUELTO: [],
  CANCELADO: [],
};

const EVENT_FOR: Partial<Record<OrderStatus, OrderEventType>> = {
  ASIGNADO: 'PACKED',
  EN_RUTA: 'OUT_FOR_DELIVERY',
  ENTREGADO_COBRADO: 'DELIVERED_PAID',
  NO_RECIBIDO: 'FAILED',
  DEVUELTO: 'RETURNED',
  CANCELADO: 'CANCELLED',
};

/** Estados en los que el inventario sigue comprometido con el pedido. */
const HOLDS_STOCK: OrderStatus[] = ['NUEVO', 'ASIGNADO', 'EN_RUTA', 'NO_RECIBIDO', 'ENTREGADO_COBRADO'];

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
  ) {}

  async list(filter: OrderFilterDto) {
    const where: Prisma.OrderWhereInput = {};
    if (filter.status) where.status = filter.status;
    if (filter.zoneId) where.zoneId = filter.zoneId;
    if (filter.courierId) where.courierId = filter.courierId;
    if (filter.q) {
      where.OR = [
        { code: { contains: filter.q, mode: 'insensitive' } },
        { customerName: { contains: filter.q, mode: 'insensitive' } },
        { customerPhone: { contains: filter.q } },
      ];
    }

    const [orders, counts] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    return {
      items: orders.map((o) => this.orders.toPublic(o)),
      counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
      active: counts
        .filter((c) => ['NUEVO', 'ASIGNADO', 'EN_RUTA', 'NO_RECIBIDO'].includes(c.status))
        .reduce((sum, c) => sum + c._count._all, 0),
    };
  }

  async detail(code: string) {
    const order = await this.prisma.order.findUnique({
      where: { code: code.toUpperCase() },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return this.orders.toPublic(order);
  }

  /**
   * Mueve el pedido de estado y arrastra las consecuencias:
   * cobrar suma a la caja del repartidor, cancelar o devolver repone el inventario.
   */
  async changeStatus(code: string, dto: ChangeStatusDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { code: code.toUpperCase() },
        include: { items: true, courier: true },
      });
      if (!order) throw new NotFoundException('Pedido no encontrado');

      if (!TRANSITIONS[order.status].includes(dto.status)) {
        throw new BadRequestException(`No se puede pasar de ${order.status} a ${dto.status}`);
      }
      if (dto.status === 'EN_RUTA' && !order.courierId) {
        throw new BadRequestException('Asigna un repartidor antes de despachar');
      }

      const data: Prisma.OrderUpdateInput = { status: dto.status };
      if (dto.status === 'ENTREGADO_COBRADO') data.deliveredAt = new Date();
      if (dto.status === 'NO_RECIBIDO' || dto.status === 'CANCELADO') {
        data.failureReason = dto.reason ?? null;
      }

      // Devolver o cancelar libera el inventario que el pedido tenia reservado.
      if (
        (dto.status === 'DEVUELTO' || dto.status === 'CANCELADO') &&
        HOLDS_STOCK.includes(order.status)
      ) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.variant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      if (dto.status === 'ENTREGADO_COBRADO' && order.courierId) {
        await this.addToClosure(tx, order.courierId, order.total);
      }

      const eventType = EVENT_FOR[dto.status];
      if (eventType) {
        await tx.orderEvent.create({
          data: {
            orderId: order.id,
            type: eventType,
            note: this.eventNote(dto.status, order.courier?.name, dto.reason),
          },
        });
      }

      const updated = await tx.order.update({
        where: { id: order.id },
        data,
        include: ORDER_INCLUDE,
      });
      return this.orders.toPublic(updated);
    });
  }

  async assign(code: string, dto: AssignCourierDto) {
    const order = await this.prisma.order.findUnique({ where: { code: code.toUpperCase() } });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (!['NUEVO', 'ASIGNADO'].includes(order.status)) {
      throw new BadRequestException('Solo se puede reasignar un pedido que aun no sale a ruta');
    }
    const courier = await this.prisma.courier.findUnique({ where: { id: dto.courierId } });
    if (!courier?.active) throw new BadRequestException('Ese repartidor no esta activo');

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        courierId: courier.id,
        status: 'ASIGNADO',
        events:
          order.status === 'NUEVO'
            ? { create: { type: 'PACKED', note: `Empacado y asignado a ${courier.name}` } }
            : undefined,
      },
      include: ORDER_INCLUDE,
    });
    return this.orders.toPublic(updated);
  }

  /** Asignacion masiva: es el boton "Asignar 6 pedidos" de la lista. */
  async bulkAssign(dto: BulkAssignDto) {
    const courier = await this.prisma.courier.findUnique({ where: { id: dto.courierId } });
    if (!courier?.active) throw new BadRequestException('Ese repartidor no esta activo');

    const orders = await this.prisma.order.findMany({
      where: { id: { in: dto.orderIds }, status: 'NUEVO' },
    });

    await this.prisma.$transaction([
      this.prisma.order.updateMany({
        where: { id: { in: orders.map((o) => o.id) } },
        data: { courierId: courier.id, status: 'ASIGNADO' },
      }),
      this.prisma.orderEvent.createMany({
        data: orders.map((o) => ({
          orderId: o.id,
          type: 'PACKED' as OrderEventType,
          note: `Empacado y asignado a ${courier.name}`,
        })),
      }),
    ]);

    return { assigned: orders.length, courier: courier.name };
  }

  /** Suma el efectivo a la caja abierta del repartidor para el dia de hoy. */
  private async addToClosure(tx: Prisma.TransactionClient, courierId: string, amount: number) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    await tx.cashClosure.upsert({
      where: { courierId_date: { courierId, date } },
      create: { courierId, date, deliveriesCount: 1, collectedAmount: amount },
      update: { deliveriesCount: { increment: 1 }, collectedAmount: { increment: amount } },
    });
  }

  private eventNote(status: OrderStatus, courierName?: string, reason?: string): string {
    switch (status) {
      case 'ASIGNADO':
        return 'Empacado en tienda';
      case 'EN_RUTA':
        return courierName ? `En ruta con ${courierName}` : 'En ruta';
      case 'ENTREGADO_COBRADO':
        return 'Entregado y pagado en efectivo';
      case 'NO_RECIBIDO':
        return reason ?? 'No recibido';
      case 'DEVUELTO':
        return reason ?? 'Devuelto a tienda';
      default:
        return reason ?? 'Pedido cancelado';
    }
  }
}
