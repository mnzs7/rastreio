import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateEnderecoDto {
  @ApiProperty() @IsString() cep: string;
  @ApiProperty() @IsString() logradouro: string;
  @ApiProperty() @IsString() numero: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() complemento?: string;
  @ApiProperty() @IsString() bairro: string;
  @ApiProperty() @IsString() cidade: string;
  @ApiProperty() @IsString() estado: string;
}
