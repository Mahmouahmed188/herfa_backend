import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Bookings (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Customer Booking Flow', () => {
    it('should return 401 when creating booking without auth', () => {
      return request(app.getHttpServer())
        .post('/bookings')
        .send({
          serviceId: 'test-uuid',
          providerId: 'test-uuid',
          addressLine: '123 Main St',
          city: 'Cairo',
          scheduledDate: '2026-06-15',
          scheduledTime: '10:00',
        })
        .expect(401);
    });

    it('should return 401 when getting my bookings without auth', () => {
      return request(app.getHttpServer())
        .get('/bookings/my-bookings')
        .expect(401);
    });

    it('should return 401 when cancelling without auth', () => {
      return request(app.getHttpServer())
        .patch('/bookings/test-uuid/cancel')
        .send({ reason: 'test' })
        .expect(401);
    });
  });

  describe('Provider Booking Flow', () => {
    it('should return 401 when accessing provider bookings without auth', () => {
      return request(app.getHttpServer()).get('/provider/bookings').expect(401);
    });

    it('should return 401 when accepting without auth', () => {
      return request(app.getHttpServer())
        .patch('/bookings/test-uuid/accept')
        .expect(401);
    });

    it('should return 401 when rejecting without auth', () => {
      return request(app.getHttpServer())
        .patch('/bookings/test-uuid/reject')
        .expect(401);
    });
  });

  describe('Admin Booking Flow', () => {
    it('should return 401 when accessing admin bookings without auth', () => {
      return request(app.getHttpServer()).get('/admin/bookings').expect(401);
    });

    it('should return 401 when admin cancelling without auth', () => {
      return request(app.getHttpServer())
        .patch('/admin/bookings/test-uuid/cancel')
        .send({ reason: 'Admin action' })
        .expect(401);
    });
  });
});
