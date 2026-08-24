import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: import("./auth.service").PublicUser;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: import("./auth.service").PublicUser;
    }>;
    me(user: AuthUser): Promise<import("./auth.service").PublicUser>;
}
