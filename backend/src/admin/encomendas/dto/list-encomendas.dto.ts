import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PackageStatus } from '@prisma/client';

export class ListEncomendasDto {
  @ApiProperty({ required: false, enum: PackageStatus })
  @IsOptional() @IsEnum(PackageStatus) status?: PackageStatus;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() cidade_origem?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() cidade_destino?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsDateString() data_inicio?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsDateString() data_fim?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() search?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 20;
}
