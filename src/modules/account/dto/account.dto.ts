import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AddressDto {
  @IsString() @MinLength(5) @MaxLength(160) line: string;
  @IsString() @MinLength(2) @MaxLength(80) neighborhood: string;
  @IsOptional() @IsString() @MaxLength(300) notes?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
