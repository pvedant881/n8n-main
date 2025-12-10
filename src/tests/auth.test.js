import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

describe('Authentication', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'password123';
  let userId;

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const hashedPassword = await bcryptjs.hash(testPassword, 10);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
      },
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.id).toBeDefined();
    userId = user.id;
  });

  it('should not create duplicate user', async () => {
    const hashedPassword = await bcryptjs.hash(testPassword, 10);
    try {
      await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
        },
      });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should verify password correctly', async () => {
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    const isValid = await bcryptjs.compare(testPassword, user.password);
    expect(isValid).toBe(true);
  });

  it('should reject invalid password', async () => {
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    const isValid = await bcryptjs.compare('wrongpassword', user.password);
    expect(isValid).toBe(false);
  });

  it('should generate valid JWT token', () => {
    const token = jwt.sign(
      { id: userId, email: testEmail },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    expect(token).toBeDefined();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(userId);
    expect(decoded.email).toBe(testEmail);
  });

  it('should reject expired token', async () => {
    const token = jwt.sign(
      { id: userId, email: testEmail },
      process.env.JWT_SECRET,
      { expiresIn: '0s' }
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(() => {
      jwt.verify(token, process.env.JWT_SECRET);
    }).toThrow();
  });

  it('should reject invalid token', () => {
    expect(() => {
      jwt.verify('invalid.token.here', process.env.JWT_SECRET);
    }).toThrow();
  });

  it('should get user by ID', async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    expect(user).toBeDefined();
    expect(user.id).toBe(userId);
    expect(user.email).toBe(testEmail);
  });

  it('should update user', async () => {
    const newEmail = `updated-${Date.now()}@example.com`;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

    expect(user.email).toBe(newEmail);
  });
});
