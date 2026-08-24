import { PrismaService } from '../../prisma/prisma.service';
import { AddressDto } from './dto/account.dto';
export declare class AccountService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    addresses(userId: string): import("@prisma/client").Prisma.PrismaPromise<({
        zone: {
            number: number;
            id: string;
            name: string;
            neighborhoods: string[];
            deliveryFee: number;
            etaHoursMin: number;
            etaHoursMax: number;
            active: boolean;
        };
    } & {
        id: string;
        userId: string;
        line: string;
        neighborhood: string;
        notes: string | null;
        isDefault: boolean;
        zoneId: string;
    })[]>;
    addAddress(userId: string, dto: AddressDto): Promise<{
        zone: {
            number: number;
            id: string;
            name: string;
            neighborhoods: string[];
            deliveryFee: number;
            etaHoursMin: number;
            etaHoursMax: number;
            active: boolean;
        };
    } & {
        id: string;
        userId: string;
        line: string;
        neighborhood: string;
        notes: string | null;
        isDefault: boolean;
        zoneId: string;
    }>;
    updateAddress(userId: string, id: string, dto: AddressDto): Promise<{
        zone: {
            number: number;
            id: string;
            name: string;
            neighborhoods: string[];
            deliveryFee: number;
            etaHoursMin: number;
            etaHoursMax: number;
            active: boolean;
        };
    } & {
        id: string;
        userId: string;
        line: string;
        neighborhood: string;
        notes: string | null;
        isDefault: boolean;
        zoneId: string;
    }>;
    removeAddress(userId: string, id: string): Promise<{
        ok: boolean;
    }>;
    favorites(userId: string): Promise<{
        id: string;
        slug: string;
        name: string;
        price: number;
        images: string[];
        category: string;
    }[]>;
    toggleFavorite(userId: string, productId: string): Promise<{
        favorite: boolean;
    }>;
    private ownAddress;
}
