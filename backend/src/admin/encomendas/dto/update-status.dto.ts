import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsNumber } from 'class-validator';
import { PackageStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ enum: PackageStatus })
  @IsEnum(PackageStatus) status: PackageStatus;

  @ApiProperty() @IsString() localizacao_atual: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observacao?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() latitude?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() longitude?: number;
}
