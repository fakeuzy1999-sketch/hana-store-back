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
exports.AdminRoutesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_service_1 = require("../auth/auth.service");
function initialsOf(name) {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}
let AdminRoutesService = class AdminRoutesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    couriers() {
        return this.prisma.courier.findMany({ include: { zone: true }, orderBy: { name: 'asc' } });
    }
    create(dto) {
        return this.prisma.courier.create({
            data: {
                name: dto.name.trim(),
                initials: initialsOf(dto.name),
                phone: (0, auth_service_1.normalizePhone)(dto.phone),
                zoneId: dto.zoneId ?? null,
                active: dto.active ?? true,
            },
            include: { zone: true },
        });
    }
    async update(id, dto) {
        await this.exists(id);
        return this.prisma.courier.update({
            where: { id },
            data: {
                name: dto.name.trim(),
                initials: initialsOf(dto.name),
                phone: (0, auth_service_1.normalizePhone)(dto.phone),
                zoneId: dto.zoneId ?? null,
                active: dto.active ?? true,
            },
            include: { zone: true },
        });
    }
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
    async closeCash(closureId) {
        const closure = await this.prisma.cashClosure.findUnique({ where: { id: closureId } });
        if (!closure)
            throw new common_1.NotFoundException('Caja no encontrada');
        if (closure.closed)
            throw new common_1.BadRequestException('Esa caja ya estaba cerrada');
        return this.prisma.cashClosure.update({
            where: { id: closureId },
            data: { closed: true, closedAt: new Date() },
        });
    }
    async exists(id) {
        const courier = await this.prisma.courier.findUnique({ where: { id } });
        if (!courier)
            throw new common_1.NotFoundException('Repartidor no encontrado');
        return courier;
    }
};
exports.AdminRoutesService = AdminRoutesService;
exports.AdminRoutesService = AdminRoutesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminRoutesService);
//# sourceMappingURL=admin-routes.service.js.map