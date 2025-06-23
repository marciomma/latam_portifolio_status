import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApprovedUsers, APPROVED_USERS_KEY, User } from '@/lib/user-utils';
import { setToRedis } from '@/lib/data';
import { hashPassword, validatePassword } from '@/lib/password-utils';

const setupAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .refine(password => validatePassword(password).isValid, {
      message: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)"
    }),
  adminKey: z.string().min(1, "Admin setup key is required"),
});

// Secret key for admin setup - change this in production
const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'your-secret-admin-setup-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = setupAdminSchema.parse(body);
    
    const { name, email, password, adminKey } = validatedData;

    // Verify admin setup key
    if (adminKey !== ADMIN_SETUP_KEY) {
      return NextResponse.json(
        { message: 'Invalid admin setup key' },
        { status: 401 }
      );
    }

    // Check if any admin already exists
    const approvedUsers = await getApprovedUsers();
    const existingAdmin = approvedUsers.find(user => user.role === 'admin');
    
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'An admin user already exists. Use the normal signup process.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = approvedUsers.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = hashPassword(password);

    // Create admin user
    const adminUser: User = {
      id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      password: hashedPassword,
      requestedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      status: 'approved',
      role: 'admin'
    };

    // Add to approved users
    const updatedApprovedUsers = [...approvedUsers, adminUser];
    await setToRedis(APPROVED_USERS_KEY, updatedApprovedUsers);

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Setup admin error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 