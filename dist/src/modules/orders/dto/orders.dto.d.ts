export declare class OrderLineDto {
    variantId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    items: OrderLineDto[];
    customerName: string;
    customerPhone: string;
    addressLine: string;
    neighborhood: string;
    zoneId: string;
    courierNotes?: string;
}
export declare class TrackOrderDto {
    code: string;
    phone: string;
}
