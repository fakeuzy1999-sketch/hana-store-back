import { AccountService } from './account.service';
import { AddressDto } from './dto/account.dto';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
export declare class AccountController {
    private readonly account;
    constructor(account: AccountService);
    addresses(user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<({
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
    add(user: AuthUser, dto: AddressDto): Promise<{
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
    update(user: AuthUser, id: string, dto: AddressDto): Promise<{
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
    remove(user: AuthUser, id: string): Promise<{
        ok: boolean;
    }>;
    favorites(user: AuthUser): Promise<{
        id: string;
        slug: string;
        name: string;
        price: number;
        images: string[];
        category: string;
    }[]>;
    toggleFavorite(user: AuthUser, productId: string): Promise<{
        favorite: boolean;
    }>;
}
