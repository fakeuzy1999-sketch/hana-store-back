import { AdminOrdersService } from './admin-orders.service';
import { AdminProductsService } from './admin-products.service';
import { AdminReportsService } from './admin-reports.service';
import { AdminRoutesService } from './admin-routes.service';
import { AssignCourierDto, BulkAssignDto, ChangeStatusDto, CourierDto, OrderFilterDto, ProductDto, ReportQueryDto, StockDto } from './dto/admin.dto';
export declare class AdminController {
    private readonly orders;
    private readonly products;
    private readonly reports;
    private readonly routes;
    constructor(orders: AdminOrdersService, products: AdminProductsService, reports: AdminReportsService, routes: AdminRoutesService);
    dashboard(): Promise<{
        ordersToday: number;
        ordersDelta: number;
        pendingCash: number;
        pendingCashOrders: number;
        successRate: number;
        returns: number;
        actions: (0 | {
            key: string;
            title: string;
            detail: string;
            link: string;
            tone: string;
        })[];
    }>;
    listOrders(filter: OrderFilterDto): Promise<{
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
    orderDetail(code: string): Promise<{
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
    listProducts(filter?: 'bajo' | 'ocultos'): Promise<{
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
    createProduct(dto: ProductDto): Promise<{
        images: {
            id: string;
            productId: string;
            position: number;
            url: string;
        }[];
        variants: {
            id: string;
            productId: string;
            size: string;
            color: string;
            sku: string;
            stock: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ref: string;
        slug: string;
        description: string;
        categoryId: string;
        price: number;
        isHidden: boolean;
        isFeatured: boolean;
    }>;
    updateProduct(id: string, dto: ProductDto): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            position: number;
        };
        images: {
            id: string;
            productId: string;
            position: number;
            url: string;
        }[];
        variants: {
            id: string;
            productId: string;
            size: string;
            color: string;
            sku: string;
            stock: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ref: string;
        slug: string;
        description: string;
        categoryId: string;
        price: number;
        isHidden: boolean;
        isFeatured: boolean;
    }>;
    toggleHidden(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ref: string;
        slug: string;
        description: string;
        categoryId: string;
        price: number;
        isHidden: boolean;
        isFeatured: boolean;
    }>;
    removeProduct(id: string): Promise<{
        ok: boolean;
    }>;
    setStock(id: string, dto: StockDto): Promise<{
        id: string;
        productId: string;
        size: string;
        color: string;
        sku: string;
        stock: number;
    }>;
    cod(query: ReportQueryDto): Promise<{
        range: "today" | "week" | "month";
        collected: number;
        dispatched: number;
        averageTicket: number;
        breakdown: {
            count: number;
            total: number;
            key: string;
            label: string;
        }[];
        couriers: {
            id: string;
            closureId: string;
            name: string;
            initials: string;
            deliveries: number;
            amount: number;
            closed: boolean;
        }[];
    }>;
    codCsv(query: ReportQueryDto): Promise<string>;
    couriers(): import("@prisma/client").Prisma.PrismaPromise<({
        zone: {
            number: number;
            id: string;
            deliveryFee: number;
            name: string;
            neighborhoods: string[];
            etaHoursMin: number;
            etaHoursMax: number;
            active: boolean;
        } | null;
    } & {
        id: string;
        userId: string | null;
        zoneId: string | null;
        name: string;
        active: boolean;
        initials: string;
        phone: string;
    })[]>;
    createCourier(dto: CourierDto): import("@prisma/client").Prisma.Prisma__CourierClient<{
        zone: {
            number: number;
            id: string;
            deliveryFee: number;
            name: string;
            neighborhoods: string[];
            etaHoursMin: number;
            etaHoursMax: number;
            active: boolean;
        } | null;
    } & {
        id: string;
        userId: string | null;
        zoneId: string | null;
        name: string;
        active: boolean;
        initials: string;
        phone: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateCourier(id: string, dto: CourierDto): Promise<{
        zone: {
            number: number;
            id: string;
            deliveryFee: number;
            name: string;
            neighborhoods: string[];
            etaHoursMin: number;
            etaHoursMax: number;
            active: boolean;
        } | null;
    } & {
        id: string;
        userId: string | null;
        zoneId: string | null;
        name: string;
        active: boolean;
        initials: string;
        phone: string;
    }>;
    routesToday(): Promise<{
        routes: {
            id: string;
            name: string;
            initials: string;
            phone: string;
            zone: {
                number: number;
                name: string;
                neighborhoods: string[];
            } | null;
            assigned: number;
            done: number;
            status: string;
        }[];
        uncovered: {
            id: string;
            number: number;
            name: string;
            pending: number;
        }[];
    }>;
    closeCash(id: string): Promise<{
        id: string;
        courierId: string;
        date: Date;
        deliveriesCount: number;
        collectedAmount: number;
        closed: boolean;
        closedAt: Date | null;
    }>;
}
