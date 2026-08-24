import { OrderStatus } from '@prisma/client';
export declare class OrderFilterDto {
    status?: OrderStatus;
    zoneId?: string;
    courierId?: string;
    q?: string;
}
export declare class ChangeStatusDto {
    status: OrderStatus;
    reason?: string;
}
export declare class AssignCourierDto {
    courierId: string;
}
export declare class BulkAssignDto {
    orderIds: string[];
    courierId: string;
}
export declare class VariantDto {
    id?: string;
    size: string;
    color?: string;
    stock: number;
}
export declare class ProductDto {
    name: string;
    ref?: string;
    categoryId: string;
    price: number;
    description?: string;
    isHidden?: boolean;
    isFeatured?: boolean;
    images?: string[];
    variants: VariantDto[];
}
export declare class StockDto {
    stock: number;
}
export declare class CourierDto {
    name: string;
    phone: string;
    zoneId?: string;
    active?: boolean;
}
export declare const RANGES: readonly ["today", "week", "month"];
export type Range = (typeof RANGES)[number];
export declare class ReportQueryDto {
    range?: Range;
}
