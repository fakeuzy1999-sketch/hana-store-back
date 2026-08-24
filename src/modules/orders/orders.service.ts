import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizePhone } from '../auth/auth.service';
import { CreateOrderDto } from './dto/orders.dto';

/** Ventana de entrega que ve el cliente: franja de 3 horas de la tarde. */
const WINDOW_START_HOUR = 14;
const WINDOW_END_HOUR = 17;

export const ORDER_INCLUDE = {
  items: true,
  events: { orderBy: { at: 'asc' } },
  zone: true,
  courier: true,
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea el pedido contra entrega.
   *
   * Todo ocurre en una transaccion: se releen precios y stock de la base (lo que
   * mande el cliente se ignora), se descuenta el inventario y se abre la linea de
   * tiempo del pedido. Si una variante se quedo sin stock entre el carrito y el
   * checkout, el pedido se rechaza entero en vez de venderse algo que no existe.
   */
  async create(dto: CreateOrderDto, userId?: string) {
    const phone = normalizePhone(dto.customerPhone);

    return this.prisma.$transaction(async (tx) => {
      const zone = await tx.zone.findUnique({ where: { id: dto.zoneId } });
      if (!zone?.active) throw new BadRequestException('Aun no llegamos a esa zona');

      const variants = await tx.variant.findMany({
        where: { id: { in: dto.items.map((i) => i.variantId) } },
        include: { product: { include: { images: { orderBy: { position: 'asc' }, take: 1 } } } },
      });

      const items = dto.items.map((line) => {
        const variant = variants.find((v) => v.id === line.variantId);
        if (!variant || variant.product.isHidden) {
          throw new BadRequestException('Uno de los productos ya no esta disponible');
        }
        if (variant.stock < line.quantity) {
          throw new BadRequestException(
            `Solo quedan ${variant.stock} unidades de ${variant.product.name} talla ${variant.size}`,
          );
        }
        return {
          variantId: variant.id,
          productRef: variant.product.ref,
          productName: variant.product.name,
          size: variant.size,
          color: variant.color,
          imageUrl: variant.product.images[0]?.url ?? null,
          unitPrice: variant.product.price,
          quantity: line.quantity,
          lineTotal: variant.product.price * line.quantity,
        };
      });

      const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
      const deliveryFee = zone.deliveryFee;
      const [windowStart, windowEnd] = this.deliveryWindow(zone.etaHoursMin);

      const order = await tx.order.create({
        data: {
          code: await this.nextCode(tx),
          userId: userId ?? null,
          customerName: dto.customerName.trim(),
          customerPhone: phone,
          addressLine: dto.addressLine.trim(),
          neighborhood: dto.neighborhood.trim(),
          zoneId: zone.id,
          courierNotes: dto.courierNotes?.trim() || null,
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          deliveryWindowStart: windowStart,
          deliveryWindowEnd: windowEnd,
          items: { create: items },
          events: { create: { type: 'CONFIRMED', note: 'Pedido confirmado' } },
        },
        include: ORDER_INCLUDE,
      });

      for (const item of items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return this.toPublic(order);
    });
  }

  /** Seguimiento publico: hace falta el codigo Y el telefono, para que nadie rastree pedidos ajenos. */
  async track(code: string, phone: string) {
    const order = await this.prisma.order.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: ORDER_INCLUDE,
    });
    if (!order || order.customerPhone !== normalizePhone(phone)) {
      throw new NotFoundException('No encontramos ese pedido');
    }
    return this.toPublic(order);
  }

  async myOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.toPublic(o));
  }

  async myOrderByCode(userId: string, code: string) {
    const order = await this.prisma.order.findUnique({
      where: { code: code.toUpperCase() },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException('No encontramos ese pedido');
    if (order.userId !== userId) throw new ForbiddenException('Ese pedido no es tuyo');
    return this.toPublic(order);
  }

  // ── helpers compartidos con el modulo admin ──────────────────

  toPublic(order: any) {
    return {
      id: order.id,
      code: order.code,
      status: order.status,
      statusLabel: STATUS_LABEL[order.status as OrderStatus],
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      addressLine: order.addressLine,
      neighborhood: order.neighborhood,
      courierNotes: order.courierNotes,
      zone: order.zone ? { id: order.zone.id, number: order.zone.number, name: order.zone.name } : null,
      courier: order.courier
        ? { id: order.courier.id, name: order.courier.name, initials: order.courier.initials, phone: order.courier.phone }
        : null,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      itemCount: order.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) ?? 0,
      items: order.items ?? [],
      events: order.events ?? [],
      deliveryWindowStart: order.deliveryWindowStart,
      deliveryWindowEnd: order.deliveryWindowEnd,
      deliveredAt: order.deliveredAt,
      failureReason: order.failureReason,
      createdAt: order.createdAt,
    };
  }

  private deliveryWindow(etaHours: number): [Date, Date] {
    const start = new Date();
    start.setHours(start.getHours() + etaHours);
    start.setHours(WINDOW_START_HOUR, 0, 0, 0);
    const end = new Date(start);
    end.setHours(WINDOW_END_HOUR, 0, 0, 0);
    return [start, end];
  }

  /** Codigos legibles y correlativos tipo HS-2481, como los del diseno. */
  private async nextCode(tx: Prisma.TransactionClient): Promise<string> {
    const last = await tx.order.findFirst({
      orderBy: { code: 'desc' },
      select: { code: true },
    });
    const n = last ? Number(last.code.split('-')[1]) + 1 : 2482;
    return `HS-${String(n).padStart(4, '0')}`;
  }
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  NUEVO: 'Sin asignar',
  ASIGNADO: 'Asignado',
  EN_RUTA: 'En camino',
  ENTREGADO_COBRADO: 'Entregado',
  NO_RECIBIDO: 'No recibido',
  DEVUELTO: 'Devuelto',
  CANCELADO: 'Cancelado',
};
