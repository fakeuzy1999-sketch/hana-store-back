import { PrismaService } from '../../prisma/prisma.service';
import { CourierDto } from './dto/admin.dto';
export declare class AdminRoutesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    couriers(): import("@prisma/client").Prisma.PrismaPromise<({
        zone: {
            number: number;
            id: string;
            name: string;
            neighborhoods: string[];
            deliveryFee: number;
            etaHoursMin: number;
            etaHoursMax: number;
            active: boolean;
        } | null;
    } & {
        id: string;
        name: string;
        active: boolean;
        phone: string;
        userId: string | null;
        zoneId: string | null;
        initials: string;
    })[]>;
    create(dto: CourierDto): import("@prisma/client").Prisma.Prisma__CourierClient<{
        zone: {
            number: number;
            id: string;
            name: string;
            neighborhoods: string[];
            deliveryFee: number;
            etaHoursMin: number;
            etaHoursMax: number;
            active: boolean;
        } | null;
    } & {
        id: string;
        name: string;
        active: boolean;
        phone: string;
        userId: string | null;
        zoneId: string | null;
        initials: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: CourierDto): Promise<{
        zone: {
            number: number;
            id: string;
            name: string;
            neighborhoods: string[];
            deliveryFee: number;
            etaHoursMin: number;
            etaHoursMax: number;
            active: boolean;
        } | null;
    } & {
        id: string;
        name: string;
        active: boolean;
        phone: string;
        userId: string | null;
        zoneId: string | null;
        initials: string;
    }>;
    today(): Promise<{
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
    closeCash(closureId: string): Promise<{
        id: string;
        courierId: string;
        date: Date;
        deliveriesCount: number;
        collectedAmount: number;
        closed: boolean;
        closedAt: Date | null;
    }>;
    private exists;
}
