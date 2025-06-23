import { getFromRedis, setToRedis } from '@/lib/data';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  requestedAt: string;
  approvedAt?: string;
  lastLogin?: string;
  status: 'pending' | 'approved';
  role: 'user' | 'admin';
}

// Redis keys for user storage
export const PENDING_USERS_KEY = 'auth:pendingUsers';
export const APPROVED_USERS_KEY = 'auth:approvedUsers';

// Helper functions for user management
export async function getPendingUsers(): Promise<User[]> {
  return await getFromRedis<User>(PENDING_USERS_KEY);
}

export async function getApprovedUsers(): Promise<User[]> {
  return await getFromRedis<User>(APPROVED_USERS_KEY);
}

export async function addPendingUser(user: User): Promise<void> {
  const pendingUsers = await getPendingUsers();
  pendingUsers.push(user);
  await setToRedis(PENDING_USERS_KEY, pendingUsers);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const [pendingUsers, approvedUsers] = await Promise.all([
    getPendingUsers(),
    getApprovedUsers()
  ]);
  
  return [...pendingUsers, ...approvedUsers].find(user => user.email === email) || null;
} 