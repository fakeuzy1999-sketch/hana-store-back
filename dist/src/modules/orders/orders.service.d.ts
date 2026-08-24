import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/orders.dto';
export declare const ORDER_INCLUDE: {
    items: true;
    events: {
        orderBy: {
            at: "asc";
        };
    };
    zone: true;
    courier: true;
};
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateOrderDto, userId?: string): Promise<{
        id: any;
        code: any;
        status: any;
        statusLabel: string;
        customerName: any;
        customerPhone: any;
        addressLine: any;
        neighborhood: any;
        courierNotes: any;
        zone: {
            id: any;
            number: any;
            name: any;
        } | null;
        courier: {
            id: any;
            name: any;
            initials: any;
            phone: any;
        } | null;
        subtotal: any;
        deliveryFee: any;
        total: any;
        itemCount: any;
        items: any;
        events: any;
        deliveryWindowStart: any;
        deliveryWindowEnd: any;
        deliveredAt: any;
        failureReason: any;
        createdAt: any;
    }>;
    track(code: string, phone: string): Promise<{
        id: any;
        code: any;
        status: any;
        statusLabel: string;
        customerName: any;
        customerPhone: any;
        addressLine: any;
        neighborhood: any;
        courierNotes: any;
        zone: {
            id: any;
            number: any;
            name: any;
        } | null;
        courier: {
            id: any;
            name: any;
            initials: any;
            phone: any;
        } | null;
        subtotal: any;
        deliveryFee: any;
        total: any;
        itemCount: any;
        items: any;
        events: any;
        deliveryWindowStart: any;
        deliveryWindowEnd: any;
        deliveredAt: any;
        failureReason: any;
        createdAt: any;
    }>;
    myOrders(userId: string): Promise<{
        id: any;
        code: any;
        status: any;
        statusLabel: string;
        customerName: any;
        customerPhone: any;
        addressLine: any;
        neighborhood: any;
        courierNotes: any;
        zone: {
            id: any;
            number: any;
            name: any;
        } | null;
        courier: {
            id: any;
            name: any;
            initials: any;
            phone: any;
        } | null;
        subtotal: any;
        deliveryFee: any;
        total: any;
        itemCount: any;
        items: any;
        events: any;
        deliveryWindowStart: any;
        deliveryWindowEnd: any;
        deliveredAt: any;
        failureReason: any;
        createdAt: any;
    }[]>;
    myOrderByCode(userId: string, code: string): Promise<{
        id: any;
        code: any;
        status: any;
        statusLabel: string;
        customerName: any;
        customerPhone: any;
        addressLine: any;
        neighborhood: any;
        courierNotes: any;
        zone: {
            id: any;
            number: any;
            name: any;
        } | null;
        courier: {
            id: any;
            name: any;
            initials: any;
            phone: any;
        } | null;
        subtotal: any;
        deliveryFee: any;
        total: any;
        itemCount: any;
        items: any;
        events: any;
        deliveryWindowStart: any;
        deliveryWindowEnd: any;
        deliveredAt: any;
        failureReason: any;
        createdAt: any;
    }>;
    toPublic(order: any): {
        id: any;
        code: any;
        status: any;
        statusLabel: string;
        customerName: any;
        customerPhone: any;
        addressLine: any;
        neighborhood: any;
        courierNotes: any;
        zone: {
            id: any;
            number: any;
            name: any;
        } | null;
        courier: {
            id: any;
            name: any;
            initials: any;
            phone: any;
        } | null;
        subtotal: any;
        deliveryFee: any;
        total: any;
        itemCount: any;
        items: any;
        events: any;
        deliveryWindowStart: any;
        deliveryWindowEnd: any;
        deliveredAt: any;
        failureReason: any;
        createdAt: any;
    };
    private deliveryWindow;
    private nextCode;
}
export declare const STATUS_LABEL: Record<OrderStatus, string>;
