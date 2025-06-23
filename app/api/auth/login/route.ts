import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApprovedUsers, findUserByEmail, APPROVED_USERS_KEY, User } from '@/lib/user-utils';
import { setToRedis } from '@/lib/data';
import { verifyPassword } from '@/lib/password-utils';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    
    const { email, password } = validatedData;

    // Find user in approved users
    const user = await findUserByEmail(email);
    
    if (!user || user.status !== 'approved') {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Update last login time
    const approvedUsers = await getApprovedUsers();
    const updatedUsers = approvedUsers.map(u => 
      u.email === email 
        ? { ...u, lastLogin: new Date().toISOString() }
        : u
    );
    await setToRedis(APPROVED_USERS_KEY, updatedUsers);

    // Create session data
    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      approvedAt: user.approvedAt,
      lastLogin: new Date().toISOString(),
      role: user.role
    };

    return NextResponse.json({
      message: 'Login successful',
      user: sessionData
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 