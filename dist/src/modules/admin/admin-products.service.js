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
exports.AdminProductsService = exports.LOW_STOCK = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
exports.LOW_STOCK = 2;
let AdminProductsService = class AdminProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filter) {
        const products = await this.prisma.product.findMany({
            include: { variants: { orderBy: { size: 'asc' } }, images: { orderBy: { position: 'asc' } }, category: true },
            orderBy: { name: 'asc' },
        });
        const mapped = products.map((p) => {
            const stock = p.variants.reduce((s, v) => s + v.stock, 0);
            return {
                id: p.id,
                ref: p.ref,
                name: p.name,
                slug: p.slug,
                price: p.price,
                description: p.description,
                isHidden: p.isHidden,
                isFeatured: p.isFeatured,
                category: { id: p.category.id, name: p.category.name },
                images: p.images.map((i) => i.url),
                variants: p.variants.map((v) => ({
                    id: v.id,
                    size: v.size,
                    color: v.color,
                    stock: v.stock,
                    low: v.stock <= exports.LOW_STOCK,
                })),
                stock,
                low: p.variants.some((v) => v.stock <= exports.LOW_STOCK),
                inventoryValue: stock * p.price,
            };
        });
        const items = filter === 'bajo'
            ? mapped.filter((p) => p.low && !p.isHidden)
            : filter === 'ocultos'
                ? mapped.filter((p) => p.isHidden)
                : mapped;
        return {
            items,
            counts: {
                total: mapped.length,
                low: mapped.filter((p) => p.low && !p.isHidden).length,
                hidden: mapped.filter((p) => p.isHidden).length,
            },
            inventoryValue: mapped.reduce((sum, p) => sum + p.inventoryValue, 0),
        };
    }
    async create(dto) {
        const ref = dto.ref?.trim() || (await this.nextRef());
        const slug = await this.uniqueSlug(dto.name);
        return this.prisma.product.create({
            data: {
                ref,
                slug,
                name: dto.name.trim(),
                description: dto.description?.trim() ?? '',
                price: dto.price,
                categoryId: dto.categoryId,
                isHidden: dto.isHidden ?? false,
                isFeatured: dto.isFeatured ?? false,
                images: { create: (dto.images ?? []).map((url, position) => ({ url, position })) },
                variants: {
                    create: dto.variants.map((v) => ({
                        size: v.size.trim(),
                        color: v.color?.trim() ?? '',
                        stock: v.stock,
                        sku: `${ref}-${v.size}${v.color ? '-' + v.color : ''}`.toUpperCase(),
                    })),
                },
            },
            include: { variants: true, images: true },
        });
    }
    async update(id, dto) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { variants: { include: { items: { take: 1 } } } },
        });
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        const keep = new Set(dto.variants.filter((v) => v.id).map((v) => v.id));
        const removable = product.variants.filter((v) => !keep.has(v.id) && v.items.length === 0);
        const soldButRemoved = product.variants.filter((v) => !keep.has(v.id) && v.items.length > 0);
        await this.prisma.$transaction(async (tx) => {
            await tx.product.update({
                where: { id },
                data: {
                    name: dto.name.trim(),
                    description: dto.description?.trim() ?? '',
                    price: dto.price,
                    categoryId: dto.categoryId,
                    isHidden: dto.isHidden ?? product.isHidden,
                    isFeatured: dto.isFeatured ?? product.isFeatured,
                },
            });
            if (dto.images) {
                await tx.productImage.deleteMany({ where: { productId: id } });
                await tx.productImage.createMany({
                    data: dto.images.map((url, position) => ({ productId: id, url, position })),
                });
            }
            for (const v of dto.variants) {
                if (v.id) {
                    await tx.variant.update({
                        where: { id: v.id },
                        data: { size: v.size.trim(), color: v.color?.trim() ?? '', stock: v.stock },
                    });
                }
                else {
                    await tx.variant.create({
                        data: {
                            productId: id,
                            size: v.size.trim(),
                            color: v.color?.trim() ?? '',
                            stock: v.stock,
                            sku: `${product.ref}-${v.size}${v.color ? '-' + v.color : ''}`.toUpperCase(),
                        },
                    });
                }
            }
            if (removable.length) {
                await tx.variant.deleteMany({ where: { id: { in: removable.map((v) => v.id) } } });
            }
            if (soldButRemoved.length) {
                await tx.variant.updateMany({
                    where: { id: { in: soldButRemoved.map((v) => v.id) } },
                    data: { stock: 0 },
                });
            }
        });
        return this.byId(id);
    }
    async setStock(variantId, dto) {
        const variant = await this.prisma.variant.findUnique({ where: { id: variantId } });
        if (!variant)
            throw new common_1.NotFoundException('Variante no encontrada');
        return this.prisma.variant.update({ where: { id: variantId }, data: { stock: dto.stock } });
    }
    async toggleHidden(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        return this.prisma.product.update({
            where: { id },
            data: { isHidden: !product.isHidden },
        });
    }
    async remove(id) {
        const sold = await this.prisma.orderItem.count({ where: { variant: { productId: id } } });
        if (sold > 0) {
            throw new common_1.BadRequestException('Este producto tiene ventas: ocultalo en vez de borrarlo');
        }
        await this.prisma.product.delete({ where: { id } });
        return { ok: true };
    }
    byId(id) {
        return this.prisma.product.findUniqueOrThrow({
            where: { id },
            include: { variants: true, images: { orderBy: { position: 'asc' } }, category: true },
        });
    }
    async nextRef() {
        const last = await this.prisma.product.findFirst({
            where: { ref: { startsWith: 'HS-' } },
            orderBy: { ref: 'desc' },
            select: { ref: true },
        });
        const n = last ? Number(last.ref.split('-')[1]) + 1 : 1;
        return `HS-${String(n).padStart(4, '0')}`;
    }
    async uniqueSlug(name) {
        const base = name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        let slug = base;
        let i = 2;
        while (await this.prisma.product.findUnique({ where: { slug } })) {
            slug = `${base}-${i++}`;
        }
        return slug;
    }
};
exports.AdminProductsService = AdminProductsService;
exports.AdminProductsService = AdminProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminProductsService);
//# sourceMappingURL=admin-products.service.js.map