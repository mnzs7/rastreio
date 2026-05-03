import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('POST /api/v1/auth/login - deve retornar 401 com credenciais inválidas', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'naoexiste@test.com', senha: 'senhaerrada' })
        .expect(401);
    });

    it('POST /api/v1/auth/login - deve retornar 400 com body inválido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nao-e-email', senha: '123' })
        .expect(400);
    });
  });

  describe('Tracking', () => {
    it('GET /api/v1/tracking/:codigo - deve retornar 404 para código inexistente', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tracking/CODIGOINEXISTENTE')
        .expect(404);
    });
  });

  describe('Packages', () => {
    it('GET /api/v1/packages - deve retornar 401 sem autenticação', () => {
      return request(app.getHttpServer())
        .get('/api/v1/packages')
        .expect(401);
    });
  });
});
