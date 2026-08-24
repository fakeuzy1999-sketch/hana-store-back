import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare function normalizePhone(raw: string): string;
export interface PublicUser {
    id: string;
    name: string;
    phone: string | null;
    email: string;
    role: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: PublicUser;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: PublicUser;
    }>;
    me(id: string): Promise<PublicUser>;
    private sign;
    private publicUser;
}
