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
exports.AccountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AccountService = class AccountService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    addresses(userId) {
        return this.prisma.address.findMany({
            where: { userId },
            include: { zone: true },
            orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
        });
    }
    async addAddress(userId, dto) {
        const count = await this.prisma.address.count({ where: { userId } });
        const isDefault = dto.isDefault || count === 0;
        if (isDefault) {
            await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
        }
        return this.prisma.address.create({
            data: { ...dto, notes: dto.notes ?? null, isDefault, userId },
            include: { zone: true },
        });
    }
    async updateAddress(userId, id, dto) {
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
    async removeAddress(userId, id) {
        await this.ownAddress(userId, id);
        await this.prisma.address.delete({ where: { id } });
        return { ok: true };
    }
    async favorites(userId) {
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
    async toggleFavorite(userId, productId) {
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
    async ownAddress(userId, id) {
        const address = await this.prisma.address.findFirst({ where: { id, userId } });
        if (!address)
            throw new common_1.NotFoundException('Direccion no encontrada');
        return address;
    }
};
exports.AccountService = AccountService;
exports.AccountService = AccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountService);
//# sourceMappingURL=account.service.js.map