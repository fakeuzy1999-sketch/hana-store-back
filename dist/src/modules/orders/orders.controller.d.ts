import { OrdersService } from './orders.service';
import { CreateOrderDto, TrackOrderDto } from './dto/orders.dto';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
export declare class OrdersController {
    private readonly orders;
    constructor(orders: OrdersService);
    create(dto: CreateOrderDto, user?: AuthUser): Promise<{
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
    track(query: TrackOrderDto): Promise<{
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
    mine(user: AuthUser): Promise<{
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
    mineByCode(user: AuthUser, code: string): Promise<{
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
}
