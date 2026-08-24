import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/** Telefono colombiano en cualquier formato razonable; se normaliza en el servicio. */
const PHONE = /^\+?[\d\s-]{7,20}$/;

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsEmail({}, { message: 'Correo invalido' })
  @MaxLength(160)
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(72)
  password: string;

  /** Opcional al registrarse: se pide de todas formas en el checkout. */
  @IsOptional()
  @Matches(PHONE, { message: 'Telefono invalido' })
  phone?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Correo invalido' })
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
