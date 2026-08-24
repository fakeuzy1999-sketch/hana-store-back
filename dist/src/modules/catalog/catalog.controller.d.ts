import { CatalogService } from './catalog.service';
import { ProductQueryDto, ValidateCartDto } from './dto/catalog.dto';
export declare class CatalogController {
    private readonly catalog;
    constructor(catalog: CatalogService);
    categories(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        slug: string;
        position: number;
    }[]>;
    zones(): import("@prisma/client").Prisma.PrismaPromise<{
        number: number;
        id: string;
        name: string;
        neighborhoods: string[];
        deliveryFee: number;
        etaHoursMin: number;
        etaHoursMax: number;
        active: boolean;
    }[]>;
    list(query: ProductQueryDto): Promise<{
        items: {
            id: any;
            ref: any;
            name: any;
            slug: any;
            description: any;
            price: any;
            isFeatured: any;
            category: {
                id: any;
                name: any;
                slug: any;
            };
            images: any;
            variants: any;
            sizes: unknown[];
            colors: unknown[];
            stock: any;
            inStock: boolean;
        }[];
        total: number;
        page: number;
        pageSize: number;
        pages: number;
        facets: {
            sizes: string[];
            colors: string[];
            priceMin: number;
            priceMax: number;
        };
    }>;
    featured(): Promise<{
        id: any;
        ref: any;
        name: any;
        slug: any;
        description: any;
        price: any;
        isFeatured: any;
        category: {
            id: any;
            name: any;
            slug: any;
        };
        images: any;
        variants: any;
        sizes: unknown[];
        colors: unknown[];
        stock: any;
        inStock: boolean;
    }[]>;
    bySlug(slug: string): Promise<{
        id: any;
        ref: any;
        name: any;
        slug: any;
        description: any;
        price: any;
        isFeatured: any;
        category: {
            id: any;
            name: any;
            slug: any;
        };
        images: any;
        variants: any;
        sizes: unknown[];
        colors: unknown[];
        stock: any;
        inStock: boolean;
    }>;
    validateCart(dto: ValidateCartDto): Promise<{
        lines: ({
            variantId: string;
            name: string;
            quantity: number;
            requested: number;
            unitPrice: number;
            lineTotal: number;
            stock: number;
            available: boolean;
            reason: string;
            productId?: undefined;
            slug?: undefined;
            ref?: undefined;
            size?: undefined;
            color?: undefined;
            imageUrl?: undefined;
        } | {
            variantId: string;
            productId: string;
            slug: string;
            ref: string;
            name: string;
            size: string;
            color: string;
            imageUrl: string;
            unitPrice: number;
            stock: number;
            requested: number;
            quantity: number;
            lineTotal: number;
            available: boolean;
            reason: string | null;
        })[];
        subtotal: number;
        deliveryFee: number;
        total: number;
        hasChanges: boolean;
    }>;
}
