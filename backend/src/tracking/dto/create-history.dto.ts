import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PackageStatus } from '@prisma/client';

export class CreateHistoryDto {
  @ApiProperty({ enum: PackageStatus })
  @IsEnum(PackageStatus)
  status: PackageStatus;

  @ApiPropertyOptional({ example: 'São Paulo, SP' })
  @IsOptional()
  @IsString()
  localizacao?: string;

  @ApiPropertyOptional({ example: 'Pacote saiu para entrega' })
  @IsOptional()
  @IsString()
  observacao?: string;
}
