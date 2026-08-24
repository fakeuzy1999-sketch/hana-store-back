export declare const SORTS: readonly ["nuevo", "precio_asc", "precio_desc", "nombre"];
export type Sort = (typeof SORTS)[number];
export declare class ProductQueryDto {
    q?: string;
    category?: string;
    size?: string;
    color?: string;
    min?: number;
    max?: number;
    sort?: Sort;
    page?: number;
    pageSize?: number;
}
export declare class CartLineDto {
    variantId: string;
    quantity: number;
}
export declare class ValidateCartDto {
    items: CartLineDto[];
    zoneId?: string;
}
