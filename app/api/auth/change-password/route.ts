import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPendingUsers, getApprovedUsers, findUserByEmail, PENDING_USERS_KEY, APPROVED_USERS_KEY, User } from '@/lib/user-utils';
import { setToRedis } from '@/lib/data';
import { hashPassword, verifyPassword, validatePassword } from '@/lib/password-utils';

// Validation schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters")
    .refine(password => validatePassword(password).isValid, {
      message: "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)"
    }),
});

// Helper function to check if user is authenticated
async function checkUserAuth(request: NextRequest): Promise<{ isAuthenticated: boolean; user: User | null; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { isAuthenticated: false, user: null, error: 'No authorization header' };
    }

    const email = authHeader.replace('Bearer ', '');
    if (!email) {
      return { isAuthenticated: false, user: null, error: 'Invalid authorization header' };
    }

    // Handle development bypass user (no password change allowed)
    if (process.env.NODE_ENV === 'development' && email === 'dev@localhost') {
      return { isAuthenticated: false, user: null, error: 'Cannot change password for development bypass user' };
    }

    const user = await findUserByEmail(email);
    if (!user || user.status !== 'approved') {
      return { isAuthenticated: false, user: null, error: 'User not found or not approved' };
    }

    return { isAuthenticated: true, user };
  } catch (error) {
    return { isAuthenticated: false, user: null, error: 'Authentication error' };
  }
}

// POST - Change user password
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkUserAuth(request);
    if (!authCheck.isAuthenticated || !authCheck.user) {
      return NextResponse.json(
        { message: authCheck.error || 'Unauthorized access' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);
    
    const { currentPassword, newPassword } = validatedData;
    const user = authCheck.user;

    // Verify current password
    if (!verifyPassword(currentPassword, user.password)) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Check if new password is different from current
    if (verifyPassword(newPassword, user.password)) {
      return NextResponse.json(
        { message: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = hashPassword(newPassword);

    // Update user password in the appropriate list
    const [pendingUsers, approvedUsers] = await Promise.all([
      getPendingUsers(),
      getApprovedUsers()
    ]);

    let userUpdated = false;

    // Check approved users (most likely location)
    const approvedIndex = approvedUsers.findIndex(u => u.id === user.id);
    if (approvedIndex !== -1) {
      approvedUsers[approvedIndex] = { ...approvedUsers[approvedIndex], password: hashedNewPassword };
      await setToRedis(APPROVED_USERS_KEY, approvedUsers);
      userUpdated = true;
    } else {
      // Check pending users (less likely but possible)
      const pendingIndex = pendingUsers.findIndex(u => u.id === user.id);
      if (pendingIndex !== -1) {
        pendingUsers[pendingIndex] = { ...pendingUsers[pendingIndex], password: hashedNewPassword };
        await setToRedis(PENDING_USERS_KEY, pendingUsers);
        userUpdated = true;
      }
    }

    if (!userUpdated) {
      return NextResponse.json(
        { message: 'User not found in database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Change password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 