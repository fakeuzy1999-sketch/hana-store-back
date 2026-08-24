import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

/** Deja el telefono en digitos con indicativo, para que `+57 310 555 4821` y `3105554821` sean el mismo. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const local = digits.startsWith('57') && digits.length > 10 ? digits.slice(2) : digits;
  return `+57${local}`;
}

/** El correo es la identidad de la cuenta: se guarda siempre en minusculas. */
function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export interface PublicUser {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = normalizeEmail(dto.email);
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    const phone = dto.phone ? normalizePhone(dto.phone) : null;
    if (phone && (await this.prisma.user.findUnique({ where: { phone } }))) {
      throw new ConflictException('Ese teléfono ya está en otra cuenta');
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        phone,
        passwordHash: await bcrypt.hash(dto.password, 10),
      },
    });
    return this.sign(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(dto.email) },
    });
    if (!user?.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    return this.sign(user);
  }

  async me(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    return this.publicUser(user);
  }

  private sign(user: PublicUser) {
    return { token: this.jwt.sign({ sub: user.id }), user: this.publicUser(user) };
  }

  private publicUser(user: PublicUser): PublicUser {
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    };
  }
}
