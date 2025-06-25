import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPendingUsers, getApprovedUsers, findUserByEmail, PENDING_USERS_KEY, APPROVED_USERS_KEY, User } from '@/lib/user-utils';
import { setToRedis } from '@/lib/data';
import { hashPassword, generateRandomPassword } from '@/lib/password-utils';

// Validation schema
const resetPasswordSchema = z.object({
  userId: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
});

// Helper function to check if user is admin
async function checkAdminAuth(request: NextRequest): Promise<{ isAdmin: boolean; user: User | null; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { isAdmin: false, user: null, error: 'No authorization header' };
    }

    const email = authHeader.replace('Bearer ', '');
    if (!email) {
      return { isAdmin: false, user: null, error: 'Invalid authorization header' };
    }

    // Handle development bypass user
    if (process.env.NODE_ENV === 'development' && email === 'dev@localhost') {
      const devUser: User = {
        id: 'dev_bypass_admin',
        name: 'Dev Admin',
        email: 'dev@localhost',
        password: 'dev_bypass_no_password',
        role: 'admin',
        status: 'approved',
        approvedAt: new Date().toISOString(),
        requestedAt: new Date().toISOString()
      };
      return { isAdmin: true, user: devUser };
    }

    const user = await findUserByEmail(email);
    if (!user || user.status !== 'approved') {
      return { isAdmin: false, user: null, error: 'User not found or not approved' };
    }

    if (user.role !== 'admin') {
      return { isAdmin: false, user, error: 'User is not an admin' };
    }

    return { isAdmin: true, user };
  } catch {
    return { isAdmin: false, user: null, error: 'Authentication error' };
  }
}

// POST - Reset user password
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { message: authCheck.error || 'Unauthorized access' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);
    
    const { userId, newPassword } = validatedData;

    // Generate password if not provided
    const password = newPassword || generateRandomPassword();
    const hashedPassword = hashPassword(password);

    // Find user in both lists
    const [pendingUsers, approvedUsers] = await Promise.all([
      getPendingUsers(),
      getApprovedUsers()
    ]);

    let userFound = false;
    let updatedUser: User | null = null;

    // Check pending users
    const pendingIndex = pendingUsers.findIndex(user => user.id === userId);
    if (pendingIndex !== -1) {
      userFound = true;
      updatedUser = { ...pendingUsers[pendingIndex], password: hashedPassword };
      pendingUsers[pendingIndex] = updatedUser;
      await setToRedis(PENDING_USERS_KEY, pendingUsers);
    }

    // Check approved users
    const approvedIndex = approvedUsers.findIndex(user => user.id === userId);
    if (approvedIndex !== -1) {
      userFound = true;
      updatedUser = { ...approvedUsers[approvedIndex], password: hashedPassword };
      approvedUsers[approvedIndex] = updatedUser;
      await setToRedis(APPROVED_USERS_KEY, approvedUsers);
    }

    if (!userFound) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return the new password only if it was generated
    interface ResetPasswordResponse {
      success: boolean;
      message: string;
      newPassword?: string;
    }

    const response: ResetPasswordResponse = {
      success: true,
      message: 'Password reset successfully',
    };

    if (!newPassword) {
      response.newPassword = password;
    }

    return NextResponse.json(response);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 