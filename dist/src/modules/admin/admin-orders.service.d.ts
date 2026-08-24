import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { AssignCourierDto, BulkAssignDto, ChangeStatusDto, OrderFilterDto } from './dto/admin.dto';
export declare class AdminOrdersService {
    private readonly prisma;
    private readonly orders;
    constructor(prisma: PrismaService, orders: OrdersService);
    list(filter: OrderFilterDto): Promise<{
        items: {
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
        }[];
        counts: {
            [k: string]: number;
        };
        active: number;
    }>;
    detail(code: string): Promise<{
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
    changeStatus(code: string, dto: ChangeStatusDto): Promise<{
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
    assign(code: string, dto: AssignCourierDto): Promise<{
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
    bulkAssign(dto: BulkAssignDto): Promise<{
        assigned: number;
        courier: string;
    }>;
    private addToClosure;
    private eventNote;
}
