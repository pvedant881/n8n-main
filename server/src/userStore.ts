import { User } from './types';

// In-memory user store (in production, use a database)
const users: User[] = [];

export const userStore = {
  findByEmail: (email: string): User | undefined => {
    return users.find((u) => u.email === email);
  },

  create: (user: User): User => {
    users.push(user);
    return user;
  },

  getAll: (): User[] => {
    return users;
  },
};
