"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const orders_service_1 = require("../orders/orders.service");
const TRANSITIONS = {
    NUEVO: ['ASIGNADO', 'CANCELADO'],
    ASIGNADO: ['EN_RUTA', 'NUEVO', 'CANCELADO'],
    EN_RUTA: ['ENTREGADO_COBRADO', 'NO_RECIBIDO'],
    NO_RECIBIDO: ['EN_RUTA', 'DEVUELTO'],
    ENTREGADO_COBRADO: [],
    DEVUELTO: [],
    CANCELADO: [],
};
const EVENT_FOR = {
    ASIGNADO: 'PACKED',
    EN_RUTA: 'OUT_FOR_DELIVERY',
    ENTREGADO_COBRADO: 'DELIVERED_PAID',
    NO_RECIBIDO: 'FAILED',
    DEVUELTO: 'RETURNED',
    CANCELADO: 'CANCELLED',
};
const HOLDS_STOCK = ['NUEVO', 'ASIGNADO', 'EN_RUTA', 'NO_RECIBIDO', 'ENTREGADO_COBRADO'];
let AdminOrdersService = class AdminOrdersService {
    prisma;
    orders;
    constructor(prisma, orders) {
        this.prisma = prisma;
        this.orders = orders;
    }
    async list(filter) {
        const where = {};
        if (filter.status)
            where.status = filter.status;
        if (filter.zoneId)
            where.zoneId = filter.zoneId;
        if (filter.courierId)
            where.courierId = filter.courierId;
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
                include: orders_service_1.ORDER_INCLUDE,
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
    async detail(code) {
        const order = await this.prisma.order.findUnique({
            where: { code: code.toUpperCase() },
            include: orders_service_1.ORDER_INCLUDE,
        });
        if (!order)
            throw new common_1.NotFoundException('Pedido no encontrado');
        return this.orders.toPublic(order);
    }
    async changeStatus(code, dto) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { code: code.toUpperCase() },
                include: { items: true, courier: true },
            });
            if (!order)
                throw new common_1.NotFoundException('Pedido no encontrado');
            if (!TRANSITIONS[order.status].includes(dto.status)) {
                throw new common_1.BadRequestException(`No se puede pasar de ${order.status} a ${dto.status}`);
            }
            if (dto.status === 'EN_RUTA' && !order.courierId) {
                throw new common_1.BadRequestException('Asigna un repartidor antes de despachar');
            }
            const data = { status: dto.status };
            if (dto.status === 'ENTREGADO_COBRADO')
                data.deliveredAt = new Date();
            if (dto.status === 'NO_RECIBIDO' || dto.status === 'CANCELADO') {
                data.failureReason = dto.reason ?? null;
            }
            if ((dto.status === 'DEVUELTO' || dto.status === 'CANCELADO') &&
                HOLDS_STOCK.includes(order.status)) {
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
                include: orders_service_1.ORDER_INCLUDE,
            });
            return this.orders.toPublic(updated);
        });
    }
    async assign(code, dto) {
        const order = await this.prisma.order.findUnique({ where: { code: code.toUpperCase() } });
        if (!order)
            throw new common_1.NotFoundException('Pedido no encontrado');
        if (!['NUEVO', 'ASIGNADO'].includes(order.status)) {
            throw new common_1.BadRequestException('Solo se puede reasignar un pedido que aun no sale a ruta');
        }
        const courier = await this.prisma.courier.findUnique({ where: { id: dto.courierId } });
        if (!courier?.active)
            throw new common_1.BadRequestException('Ese repartidor no esta activo');
        const updated = await this.prisma.order.update({
            where: { id: order.id },
            data: {
                courierId: courier.id,
                status: 'ASIGNADO',
                events: order.status === 'NUEVO'
                    ? { create: { type: 'PACKED', note: `Empacado y asignado a ${courier.name}` } }
                    : undefined,
            },
            include: orders_service_1.ORDER_INCLUDE,
        });
        return this.orders.toPublic(updated);
    }
    async bulkAssign(dto) {
        const courier = await this.prisma.courier.findUnique({ where: { id: dto.courierId } });
        if (!courier?.active)
            throw new common_1.BadRequestException('Ese repartidor no esta activo');
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
                    type: 'PACKED',
                    note: `Empacado y asignado a ${courier.name}`,
                })),
            }),
        ]);
        return { assigned: orders.length, courier: courier.name };
    }
    async addToClosure(tx, courierId, amount) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        await tx.cashClosure.upsert({
            where: { courierId_date: { courierId, date } },
            create: { courierId, date, deliveriesCount: 1, collectedAmount: amount },
            update: { deliveriesCount: { increment: 1 }, collectedAmount: { increment: amount } },
        });
    }
    eventNote(status, courierName, reason) {
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
};
exports.AdminOrdersService = AdminOrdersService;
exports.AdminOrdersService = AdminOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService])
], AdminOrdersService);
//# sourceMappingURL=admin-orders.service.js.map