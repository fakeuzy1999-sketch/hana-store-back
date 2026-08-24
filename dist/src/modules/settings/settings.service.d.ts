import { PrismaService } from '../../prisma/prisma.service';
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    all(): Promise<Record<string, string>>;
    set(key: string, value: string): Promise<{
        key: string;
        value: string;
    }>;
}
