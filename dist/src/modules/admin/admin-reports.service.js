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
exports.AdminReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const admin_products_service_1 = require("./admin-products.service");
const DISPATCHED = ['ASIGNADO', 'EN_RUTA', 'ENTREGADO_COBRADO', 'NO_RECIBIDO'];
const LIST = new Intl.ListFormat('es-CO', { style: 'long', type: 'conjunction' });
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
function startOf(range) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (range === 'week')
        d.setDate(d.getDate() - 6);
    if (range === 'month')
        d.setDate(d.getDate() - 29);
    return d;
}
let AdminReportsService = class AdminReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dashboard() {
        const today = startOf('today');
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const monthAgo = startOf('month');
        const [ordersToday, ordersYesterday, inRoute, last30, unassigned, openClosures, lowVariants] = await Promise.all([
            this.prisma.order.count({ where: { createdAt: { gte: today } } }),
            this.prisma.order.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
            this.prisma.order.aggregate({
                where: { status: { in: ['ASIGNADO', 'EN_RUTA'] } },
                _sum: { total: true },
                _count: { _all: true },
            }),
            this.prisma.order.groupBy({
                by: ['status'],
                where: { createdAt: { gte: monthAgo } },
                _count: { _all: true },
            }),
            this.prisma.order.findMany({
                where: { status: 'NUEVO' },
                include: { zone: true },
            }),
            this.prisma.cashClosure.findMany({
                where: { closed: false, date: { gte: today } },
                include: { courier: true },
            }),
            this.prisma.variant.findMany({
                where: { stock: { lte: admin_products_service_1.LOW_STOCK }, product: { isHidden: false } },
                include: { product: true },
                orderBy: { stock: 'asc' },
            }),
        ]);
        const count = (s) => last30.find((r) => r.status === s)?._count._all ?? 0;
        const delivered = count('ENTREGADO_COBRADO');
        const failed = count('NO_RECIBIDO') + count('DEVUELTO');
        const successRate = delivered + failed > 0 ? Math.round((delivered / (delivered + failed)) * 100) : 100;
        const zones = [...new Set(unassigned.map((o) => o.zone.number))].sort((a, b) => a - b);
        return {
            ordersToday,
            ordersDelta: ordersToday - ordersYesterday,
            pendingCash: inRoute._sum.total ?? 0,
            pendingCashOrders: inRoute._count._all,
            successRate,
            returns: count('NO_RECIBIDO') + count('DEVUELTO'),
            actions: [
                unassigned.length && {
                    key: 'sin_asignar',
                    title: `${plural(unassigned.length, 'pedido', 'pedidos')} sin asignar`,
                    detail: zones.length ? `${zones.length === 1 ? 'Zona' : 'Zonas'} ${LIST.format(zones.map(String))}` : 'Sin zona',
                    link: '/admin/pedidos',
                    tone: 'warn',
                },
                openClosures.length && {
                    key: 'caja_abierta',
                    title: `${plural(openClosures.length, 'repartidor', 'repartidores')} sin cerrar caja`,
                    detail: `$ ${openClosures.reduce((s, c) => s + c.collectedAmount, 0).toLocaleString('es-CO')} pendientes`,
                    link: '/admin/reportes',
                    tone: 'danger',
                },
                lowVariants.length && {
                    key: 'stock_bajo',
                    title: `${plural(new Set(lowVariants.map((v) => v.productId)).size, 'producto', 'productos')} con stock bajo`,
                    detail: `${lowVariants[0].product.name}, talla ${lowVariants[0].size}`,
                    link: '/admin/productos',
                    tone: 'ok',
                },
            ].filter(Boolean),
        };
    }
    async cod(range = 'today') {
        const from = startOf(range);
        const [groups, closures] = await Promise.all([
            this.prisma.order.groupBy({
                by: ['status'],
                where: { createdAt: { gte: from }, status: { in: DISPATCHED } },
                _sum: { total: true },
                _count: { _all: true },
            }),
            this.prisma.cashClosure.findMany({
                where: { date: { gte: from } },
                include: { courier: true },
                orderBy: { collectedAmount: 'desc' },
            }),
        ]);
        const pick = (statuses) => groups
            .filter((g) => statuses.includes(g.status))
            .reduce((acc, g) => ({ count: acc.count + g._count._all, total: acc.total + (g._sum.total ?? 0) }), { count: 0, total: 0 });
        const collected = pick(['ENTREGADO_COBRADO']);
        const inRoute = pick(['ASIGNADO', 'EN_RUTA']);
        const failed = pick(['NO_RECIBIDO']);
        const dispatched = pick(DISPATCHED);
        return {
            range,
            collected: collected.total,
            dispatched: dispatched.total,
            averageTicket: collected.count ? Math.round(collected.total / collected.count) : 0,
            breakdown: [
                { key: 'entregados', label: 'Entregados y cobrados', ...collected },
                { key: 'en_ruta', label: 'En ruta pendientes', ...inRoute },
                { key: 'no_recibidos', label: 'No recibidos', ...failed },
            ],
            couriers: closures.map((c) => ({
                id: c.courier.id,
                closureId: c.id,
                name: c.courier.name,
                initials: c.courier.initials,
                deliveries: c.deliveriesCount,
                amount: c.collectedAmount,
                closed: c.closed,
            })),
        };
    }
    async codCsv(range = 'today') {
        const orders = await this.prisma.order.findMany({
            where: { createdAt: { gte: startOf(range) }, status: { in: DISPATCHED } },
            include: { courier: true, zone: true },
            orderBy: { createdAt: 'asc' },
        });
        const rows = [
            ['codigo', 'fecha', 'cliente', 'telefono', 'zona', 'repartidor', 'estado', 'total'].join(';'),
            ...orders.map((o) => [
                o.code,
                o.createdAt.toISOString(),
                o.customerName,
                o.customerPhone,
                `Zona ${o.zone.number} ${o.zone.name}`,
                o.courier?.name ?? '',
                o.status,
                o.total,
            ].join(';')),
        ];
        return rows.join('\n');
    }
};
exports.AdminReportsService = AdminReportsService;
exports.AdminReportsService = AdminReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminReportsService);
//# sourceMappingURL=admin-reports.service.js.map