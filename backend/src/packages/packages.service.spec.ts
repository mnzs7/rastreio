import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PrismaService } from '../prisma/prisma.service';
import { PackageStatus } from '@prisma/client';

const mockPrismaService = {
  package: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
};

const mockPackage = {
  id: 'uuid-1',
  codigo_rastreio: 'BR123456789BR',
  remetente: 'Loja SA',
  destinatario: 'João Silva',
  status_atual: PackageStatus.AGUARDANDO_COLETA,
  descricao: null,
  peso: null,
  data_envio: new Date(),
  data_entrega_prevista: null,
  created_at: new Date(),
  updated_at: new Date(),
  criado_por_id: 'admin-id',
  historico: [],
  criado_por: { id: 'admin-id', nome: 'Admin', email: 'admin@test.com' },
};

describe('PackagesService', () => {
  let service: PackagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findOne', () => {
    it('deve retornar a encomenda quando encontrada', async () => {
      mockPrismaService.package.findUnique.mockResolvedValue(mockPackage);

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(mockPackage);
      expect(mockPrismaService.package.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        include: expect.any(Object),
      });
    });

    it('deve lançar NotFoundException se não encontrada', async () => {
      mockPrismaService.package.findUnique.mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada', async () => {
      mockPrismaService.package.count.mockResolvedValue(1);
      mockPrismaService.package.findMany.mockResolvedValue([mockPackage]);

      const result = await service.findAll({ pagina: 1, por_pagina: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.total_paginas).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar o status da encomenda', async () => {
      mockPrismaService.package.findUnique.mockResolvedValue(mockPackage);
      const updatedPackage = {
        ...mockPackage,
        status_atual: PackageStatus.COLETADO,
      };
      mockPrismaService.package.update.mockResolvedValue(updatedPackage);

      const result = await service.updateStatus(
        'uuid-1',
        PackageStatus.COLETADO,
        'São Paulo, SP',
        'Coletado pelo entregador',
      );

      expect(result.status_atual).toBe(PackageStatus.COLETADO);
    });
  });
});
