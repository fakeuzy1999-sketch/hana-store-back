import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductDto, StockDto } from './dto/admin.dto';
export declare const LOW_STOCK = 2;
export declare class AdminProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filter?: 'bajo' | 'ocultos'): Promise<{
        items: {
            id: string;
            ref: string;
            name: string;
            slug: string;
            price: number;
            description: string;
            isHidden: boolean;
            isFeatured: boolean;
            category: {
                id: string;
                name: string;
            };
            images: string[];
            variants: {
                id: string;
                size: string;
                color: string;
                stock: number;
                low: boolean;
            }[];
            stock: number;
            low: boolean;
            inventoryValue: number;
        }[];
        counts: {
            total: number;
            low: number;
            hidden: number;
        };
        inventoryValue: number;
    }>;
    create(dto: ProductDto): Promise<{
        images: {
            url: string;
            id: string;
            position: number;
            productId: string;
        }[];
        variants: {
            id: string;
            sku: string;
            productId: string;
            size: string;
            color: string;
            stock: number;
        }[];
    } & {
        isFeatured: boolean;
        id: string;
        name: string;
        slug: string;
        ref: string;
        description: string;
        categoryId: string;
        price: number;
        isHidden: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: ProductDto): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            position: number;
        };
        images: {
            url: string;
            id: string;
            position: number;
            productId: string;
        }[];
        variants: {
            id: string;
            sku: string;
            productId: string;
            size: string;
            color: string;
            stock: number;
        }[];
    } & {
        isFeatured: boolean;
        id: string;
        name: string;
        slug: string;
        ref: string;
        description: string;
        categoryId: string;
        price: number;
        isHidden: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setStock(variantId: string, dto: StockDto): Promise<{
        id: string;
        sku: string;
        productId: string;
        size: string;
        color: string;
        stock: number;
    }>;
    toggleHidden(id: string): Promise<{
        isFeatured: boolean;
        id: string;
        name: string;
        slug: string;
        ref: string;
        description: string;
        categoryId: string;
        price: number;
        isHidden: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        ok: boolean;
    }>;
    byId(id: string): Prisma.Prisma__ProductClient<{
        category: {
            id: string;
            name: string;
            slug: string;
            position: number;
        };
        images: {
            url: string;
            id: string;
            position: number;
            productId: string;
        }[];
        variants: {
            id: string;
            sku: string;
            productId: string;
            size: string;
            color: string;
            stock: number;
        }[];
    } & {
        isFeatured: boolean;
        id: string;
        name: string;
        slug: string;
        ref: string;
        description: string;
        categoryId: string;
        price: number;
        isHidden: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    private nextRef;
    private uniqueSlug;
}
