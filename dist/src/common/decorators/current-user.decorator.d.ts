import { Role } from '@prisma/client';
export interface AuthUser {
    id: string;
    role: Role;
    name: string;
    email: string;
    phone: string | null;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
