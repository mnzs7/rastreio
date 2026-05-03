import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnderecoDto } from './dto/create-endereco.dto';
import * as https from 'https';

@Injectable()
export class EnderecosService {
  constructor(private prisma: PrismaService) {}

  async lookupCep(cep: string): Promise<Partial<CreateEnderecoDto>> {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) throw new BadRequestException('CEP inválido');

    return new Promise((resolve, reject) => {
      https.get(`https://viacep.com.br/ws/${cleaned}/json/`, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.erro) return reject(new NotFoundException('CEP não encontrado'));
            resolve({
              cep: parsed.cep,
              logradouro: parsed.logradouro,
              bairro: parsed.bairro,
              cidade: parsed.localidade,
              estado: parsed.uf,
            });
          } catch {
            reject(new BadRequestException('Erro ao processar resposta do ViaCEP'));
          }
        });
      }).on('error', () => reject(new BadRequestException('Erro ao consultar ViaCEP')));
    });
  }

  async create(dto: CreateEnderecoDto) {
    return this.prisma.endereco.create({ data: { ...dto } });
  }

  async findAll() {
    return this.prisma.endereco.findMany({ orderBy: { created_at: 'desc' } });
  }

  async findOne(id: string) {
    const end = await this.prisma.endereco.findUnique({ where: { id } });
    if (!end) throw new NotFoundException('Endereço não encontrado');
    return end;
  }
}
