import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare function normalizePhone(raw: string): string;
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            phone: string;
            email: string | null;
            role: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            phone: string;
            email: string | null;
            role: string;
        };
    }>;
    me(id: string): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string | null;
        role: string;
    }>;
    private sign;
    private publicUser;
}
