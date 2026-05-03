import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString, IsEmail, IsOptional, IsNumber, IsPositive,
  ValidateNested, IsDateString, MinLength,
} from 'class-validator';

export class EnderecoInputDto {
  @ApiProperty() @IsString() cep: string;
  @ApiProperty() @IsString() logradouro: string;
  @ApiProperty() @IsString() numero: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() complemento?: string;
  @ApiProperty() @IsString() bairro: string;
  @ApiProperty() @IsString() cidade: string;
  @ApiProperty() @IsString() estado: string;
}

export class CreateEncomendaDto {
  @ApiProperty() @IsString() @MinLength(3) remetente_nome: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() remetente_email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() remetente_telefone?: string;

  @ApiProperty({ type: EnderecoInputDto })
  @ValidateNested() @Type(() => EnderecoInputDto)
  endereco_origem: EnderecoInputDto;

  @ApiProperty() @IsString() @MinLength(3) destinatario_nome: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() destinatario_email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() destinatario_telefone?: string;

  @ApiProperty({ type: EnderecoInputDto })
  @ValidateNested() @Type(() => EnderecoInputDto)
  endereco_destino: EnderecoInputDto;

  @ApiProperty({ required: false }) @IsOptional() @IsString() descricao?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @IsPositive() peso?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() data_envio?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() data_entrega_prevista?: string;
}
