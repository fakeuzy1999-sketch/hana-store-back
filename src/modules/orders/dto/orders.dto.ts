import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class OrderLineDto {
  @IsString() variantId: string;
  @Type(() => Number) @IsInt() @Min(1) quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderLineDto)
  items: OrderLineDto[];

  @IsString() @MinLength(2) @MaxLength(80) customerName: string;

  @Matches(/^\+?[\d\s-]{7,20}$/, { message: 'Telefono invalido' })
  customerPhone: string;

  @IsString() @MinLength(5) @MaxLength(160) addressLine: string;
  @IsString() @MinLength(2) @MaxLength(80) neighborhood: string;

  @IsOptional() @IsString() @MaxLength(300) courierNotes?: string;
}

export class TrackOrderDto {
  @IsString() code: string;
  @Matches(/^\+?[\d\s-]{7,20}$/) phone: string;
}
