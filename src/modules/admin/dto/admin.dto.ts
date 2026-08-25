import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class OrderFilterDto {
  @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @IsOptional() @IsString() zoneId?: string;
  @IsOptional() @IsString() courierId?: string;
  @IsOptional() @IsString() q?: string;
}

export class ChangeStatusDto {
  @IsEnum(OrderStatus) status: OrderStatus;
  @IsOptional() @IsString() @MaxLength(200) reason?: string;
}

export class AssignCourierDto {
  @IsString() courierId: string;
}

export class BulkAssignDto {
  @IsArray() @ArrayMinSize(1) @IsString({ each: true }) orderIds: string[];
  @IsString() courierId: string;
}

export class VariantDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @MinLength(1) size: string;
  @IsOptional() @IsString() color?: string;
  @Type(() => Number) @IsInt() @Min(0) stock: number;
}

export class ProductDto {
  @IsString() @MinLength(2) @MaxLength(120) name: string;
  @IsOptional() @IsString() @MaxLength(40) ref?: string;
  @IsString() categoryId: string;
  @Type(() => Number) @IsInt() @Min(0) price: number;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsBoolean() isHidden?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];
}

export class StockDto {
  @Type(() => Number) @IsInt() @Min(0) stock: number;
}

export class CourierDto {
  @IsString() @MinLength(2) @MaxLength(80) name: string;
  @IsString() @MinLength(7) @MaxLength(20) phone: string;
  @IsOptional() @IsString() zoneId?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

export const RANGES = ['today', 'week', 'month'] as const;
export type Range = (typeof RANGES)[number];

export class ReportQueryDto {
  @IsOptional() @IsIn(RANGES) range?: Range;
}

export class CategoryDto {
  @IsString() @MinLength(2) @MaxLength(60) name: string;
  @IsOptional() @IsInt() @Min(0) position?: number;
}

export class ZoneDto {
  @IsInt() @Min(1) number: number;
  @IsString() @MinLength(2) @MaxLength(60) name: string;
  @IsOptional() @IsArray() @IsString({ each: true }) neighborhoods?: string[];
  @IsInt() @Min(0) deliveryFee: number;
  @IsInt() @Min(0) etaHoursMin: number;
  @IsInt() @Min(0) etaHoursMax: number;
  @IsOptional() @IsBoolean() active?: boolean;
}

/** Los ajustes son texto libre; el importe de envio gratis viaja como cadena. */
export class SettingsDto {
  @IsOptional() @IsString() @MaxLength(40) whatsapp?: string;
  @IsOptional() @IsString() @MaxLength(40) instagram?: string;
  @IsOptional() @IsString() @MaxLength(160) coverage?: string;
  @IsOptional() @IsString() @MaxLength(160) hours?: string;
  @IsOptional() @IsString() @MaxLength(160) tagline?: string;
  @IsOptional() @IsString() @MaxLength(12) freeShippingFrom?: string;
}
