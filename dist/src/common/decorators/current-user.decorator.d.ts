import { Role } from '@prisma/client';
export interface AuthUser {
    id: string;
    role: Role;
    name: string;
    phone: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
