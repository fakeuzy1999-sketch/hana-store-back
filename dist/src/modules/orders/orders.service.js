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
exports.STATUS_LABEL = exports.OrdersService = exports.ORDER_INCLUDE = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_service_1 = require("../auth/auth.service");
const WINDOW_START_HOUR = 14;
const WINDOW_END_HOUR = 17;
exports.ORDER_INCLUDE = {
    items: true,
    events: { orderBy: { at: 'asc' } },
    zone: true,
    courier: true,
};
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const phone = (0, auth_service_1.normalizePhone)(dto.customerPhone);
        return this.prisma.$transaction(async (tx) => {
            const zone = await tx.zone.findUnique({ where: { id: dto.zoneId } });
            if (!zone?.active)
                throw new common_1.BadRequestException('Aun no llegamos a esa zona');
            const variants = await tx.variant.findMany({
                where: { id: { in: dto.items.map((i) => i.variantId) } },
                include: { product: { include: { images: { orderBy: { position: 'asc' }, take: 1 } } } },
            });
            const items = dto.items.map((line) => {
                const variant = variants.find((v) => v.id === line.variantId);
                if (!variant || variant.product.isHidden) {
                    throw new common_1.BadRequestException('Uno de los productos ya no esta disponible');
                }
                if (variant.stock < line.quantity) {
                    throw new common_1.BadRequestException(`Solo quedan ${variant.stock} unidades de ${variant.product.name} talla ${variant.size}`);
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
                include: exports.ORDER_INCLUDE,
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
    async track(code, phone) {
        const order = await this.prisma.order.findUnique({
            where: { code: code.trim().toUpperCase() },
            include: exports.ORDER_INCLUDE,
        });
        if (!order || order.customerPhone !== (0, auth_service_1.normalizePhone)(phone)) {
            throw new common_1.NotFoundException('No encontramos ese pedido');
        }
        return this.toPublic(order);
    }
    async myOrders(userId) {
        const orders = await this.prisma.order.findMany({
            where: { userId },
            include: exports.ORDER_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
        return orders.map((o) => this.toPublic(o));
    }
    async myOrderByCode(userId, code) {
        const order = await this.prisma.order.findUnique({
            where: { code: code.toUpperCase() },
            include: exports.ORDER_INCLUDE,
        });
        if (!order)
            throw new common_1.NotFoundException('No encontramos ese pedido');
        if (order.userId !== userId)
            throw new common_1.ForbiddenException('Ese pedido no es tuyo');
        return this.toPublic(order);
    }
    toPublic(order) {
        return {
            id: order.id,
            code: order.code,
            status: order.status,
            statusLabel: exports.STATUS_LABEL[order.status],
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
            itemCount: order.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
            items: order.items ?? [],
            events: order.events ?? [],
            deliveryWindowStart: order.deliveryWindowStart,
            deliveryWindowEnd: order.deliveryWindowEnd,
            deliveredAt: order.deliveredAt,
            failureReason: order.failureReason,
            createdAt: order.createdAt,
        };
    }
    deliveryWindow(etaHours) {
        const start = new Date();
        start.setHours(start.getHours() + etaHours);
        start.setHours(WINDOW_START_HOUR, 0, 0, 0);
        const end = new Date(start);
        end.setHours(WINDOW_END_HOUR, 0, 0, 0);
        return [start, end];
    }
    async nextCode(tx) {
        const last = await tx.order.findFirst({
            orderBy: { code: 'desc' },
            select: { code: true },
        });
        const n = last ? Number(last.code.split('-')[1]) + 1 : 2482;
        return `HS-${String(n).padStart(4, '0')}`;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
exports.STATUS_LABEL = {
    NUEVO: 'Sin asignar',
    ASIGNADO: 'Asignado',
    EN_RUTA: 'En camino',
    ENTREGADO_COBRADO: 'Entregado',
    NO_RECIBIDO: 'No recibido',
    DEVUELTO: 'Devuelto',
    CANCELADO: 'Cancelado',
};
//# sourceMappingURL=orders.service.js.map