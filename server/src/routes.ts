import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { randomUUID } from 'crypto';
import { AuthRequest, authMiddleware } from './middleware';
import { userStore } from './userStore';
import { LoginRequest, RegisterRequest, AuthResponse } from './types';

const router = Router();

const generateToken = (id: string, email: string): string => {
  const secret = process.env.JWT_SECRET || 'secret';
  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };
  return jwt.sign({ id, email }, secret, options as jwt.SignOptions);
};

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return bcryptjs.compare(plainPassword, hashedPassword);
};

// Register endpoint
router.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body as RegisterRequest;

    // Validation
    if (!email || !password || !confirmPassword) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if user already exists
    if (userStore.findByEmail(email)) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = randomUUID();
    const user = userStore.create({
      id: userId,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user.id, user.email);

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = userStore.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Compare password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Me endpoint (get current user)
router.get('/api/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({
    user: {
      id: req.user?.id,
      email: req.user?.email,
    },
  });
});

// Logout endpoint
router.post('/api/auth/logout', authMiddleware, (req: AuthRequest, res: Response) => {
  // In a real app, you might invalidate tokens in a blacklist
  // For now, client-side logout is sufficient
  res.json({ message: 'Logged out successfully' });
});

export default router;
