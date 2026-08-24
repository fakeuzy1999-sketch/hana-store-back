import { PrismaService } from '../../prisma/prisma.service';
import { Range } from './dto/admin.dto';
export declare class AdminReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    cod(range?: Range): Promise<{
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
    codCsv(range?: Range): Promise<string>;
}
