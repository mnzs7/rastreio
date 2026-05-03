import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PackageStatus } from '@prisma/client';

export class UpdatePackageStatusDto {
  @ApiProperty({ enum: PackageStatus })
  @IsEnum(PackageStatus, { message: 'Status inválido' })
  status: PackageStatus;

  @ApiPropertyOptional({ example: 'São Paulo, SP' })
  @IsOptional()
  @IsString()
  localizacao?: string;

  @ApiPropertyOptional({ example: 'Pacote em centro de distribuição' })
  @IsOptional()
  @IsString()
  observacao?: string;
}
