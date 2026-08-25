import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export const SORTS = ['nuevo', 'precio_asc', 'precio_desc', 'nombre'] as const;
export type Sort = (typeof SORTS)[number];

export class ProductQueryDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() color?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) min?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) max?: number;

  @IsOptional() @IsIn(SORTS) sort?: Sort;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;
}

export class CartLineDto {
  @IsString() variantId: string;
  @Type(() => Number) @IsInt() @Min(1) quantity: number;
}

export class ValidateCartDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CartLineDto)
  items: CartLineDto[];
}
