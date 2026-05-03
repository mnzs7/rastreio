import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve retornar token quando credenciais são válidas', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        senha: hashedPassword,
        nome: 'Test User',
        role: 'CLIENTE',
      });

      const result = await service.login({
        email: 'test@test.com',
        senha: 'senha123',
      });

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('mock-token');
    });

    it('deve lançar UnauthorizedException se usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'naoexiste@test.com', senha: 'senha123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se senha está errada', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        senha: hashedPassword,
        nome: 'Test User',
        role: 'CLIENTE',
      });

      await expect(
        service.login({ email: 'test@test.com', senha: 'senhaerrada' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('deve criar usuário com sucesso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        nome: 'Novo Usuário',
        email: 'novo@test.com',
        role: 'CLIENTE',
        created_at: new Date(),
      });

      const result = await service.register({
        nome: 'Novo Usuário',
        email: 'novo@test.com',
        senha: 'senha123',
      });

      expect(result).toHaveProperty('id');
      expect(result.email).toBe('novo@test.com');
    });

    it('deve lançar ConflictException se email já existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'existente@test.com',
      });

      await expect(
        service.register({
          nome: 'Usuário',
          email: 'existente@test.com',
          senha: 'senha123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
