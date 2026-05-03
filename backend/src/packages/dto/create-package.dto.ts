import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  MinLength,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePackageDto {
  @ApiProperty({ example: 'Loja Online SA' })
  @IsString()
  @MinLength(2)
  remetente: string;

  @ApiProperty({ example: 'João Silva - Rua das Flores, 123 - Rio de Janeiro, RJ' })
  @IsString()
  @MinLength(2)
  destinatario: string;

  @ApiPropertyOptional({ example: 'Notebook Dell Inspiron 15' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(9999)
  peso?: number;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  data_entrega_prevista?: string;
}
