import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
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
    me(user: AuthUser): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string | null;
        role: string;
    }>;
}
