import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPendingUsers, getApprovedUsers, findUserByEmail, PENDING_USERS_KEY, APPROVED_USERS_KEY, User } from '@/lib/user-utils';
import { setToRedis } from '@/lib/data';
import { hashPassword, generateRandomPassword } from '@/lib/password-utils';

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(['user', 'admin']),
  status: z.enum(['pending', 'approved']),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['pending', 'approved']).optional(),
});

const deleteUserSchema = z.object({
  id: z.string(),
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

// GET - Fetch all users (pending and approved)
export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { message: authCheck.error || 'Unauthorized access' },
        { status: 403 }
      );
    }

    const [pendingUsers, approvedUsers] = await Promise.all([
      getPendingUsers(),
      getApprovedUsers()
    ]);

    const allUsers = [
      ...pendingUsers.map(user => ({ ...user, userType: 'pending' })),
      ...approvedUsers.map(user => ({ ...user, userType: 'approved' }))
    ];

    return NextResponse.json({
      success: true,
      users: allUsers,
      totalUsers: allUsers.length,
      pendingCount: pendingUsers.length,
      approvedCount: approvedUsers.length
    });
    
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new user
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
    const validatedData = createUserSchema.parse(body);
    
    const { name, email, role, status, password } = validatedData;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate or use provided password
    const userPassword = password || generateRandomPassword();
    const hashedPassword = hashPassword(userPassword);

    // Create new user
    const newUser: User = {
      id: `${role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      password: hashedPassword,
      requestedAt: new Date().toISOString(),
      status,
      role,
      ...(status === 'approved' && { approvedAt: new Date().toISOString() })
    };

    // Add to appropriate list
    if (status === 'pending') {
      const pendingUsers = await getPendingUsers();
      pendingUsers.push(newUser);
      await setToRedis(PENDING_USERS_KEY, pendingUsers);
    } else {
      const approvedUsers = await getApprovedUsers();
      approvedUsers.push(newUser);
      await setToRedis(APPROVED_USERS_KEY, approvedUsers);
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Create user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing user
export async function PUT(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { message: authCheck.error || 'Unauthorized access' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);
    
    const { id, name, email, role, status } = validatedData;

    // Find user in both lists
    const [pendingUsers, approvedUsers] = await Promise.all([
      getPendingUsers(),
      getApprovedUsers()
    ]);

    let userFound = false;
    let updatedPendingUsers = [...pendingUsers];
    let updatedApprovedUsers = [...approvedUsers];

    // Check pending users
    const pendingIndex = pendingUsers.findIndex(user => user.id === id);
    if (pendingIndex !== -1) {
      userFound = true;
      const currentUser = pendingUsers[pendingIndex];
      
      // If email is being changed, check if new email exists
      if (email && email !== currentUser.email) {
        const emailExists = await findUserByEmail(email);
        if (emailExists && emailExists.id !== id) {
          return NextResponse.json(
            { message: 'Email already exists' },
            { status: 400 }
          );
        }
      }

      const updatedUser = {
        ...currentUser,
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status }),
        ...(status === 'approved' && !currentUser.approvedAt && { approvedAt: new Date().toISOString() })
      };

      // If status changed to approved, move to approved list
      if (status === 'approved') {
        updatedPendingUsers = pendingUsers.filter((_, index) => index !== pendingIndex);
        updatedApprovedUsers.push(updatedUser);
      } else {
        updatedPendingUsers[pendingIndex] = updatedUser;
      }
    }

    // Check approved users
    const approvedIndex = approvedUsers.findIndex(user => user.id === id);
    if (approvedIndex !== -1) {
      userFound = true;
      const currentUser = approvedUsers[approvedIndex];
      
      // If email is being changed, check if new email exists
      if (email && email !== currentUser.email) {
        const emailExists = await findUserByEmail(email);
        if (emailExists && emailExists.id !== id) {
          return NextResponse.json(
            { message: 'Email already exists' },
            { status: 400 }
          );
        }
      }

      const updatedUser = {
        ...currentUser,
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status })
      };

      // If status changed to pending, move to pending list
      if (status === 'pending') {
        updatedApprovedUsers = approvedUsers.filter((_, index) => index !== approvedIndex);
        // Remove approvedAt when moving to pending
        const { approvedAt: _, ...userWithoutApprovedAt } = updatedUser;
        updatedPendingUsers.push(userWithoutApprovedAt);
      } else {
        updatedApprovedUsers[approvedIndex] = updatedUser;
      }
    }

    if (!userFound) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Update both lists in Redis
    await Promise.all([
      setToRedis(PENDING_USERS_KEY, updatedPendingUsers),
      setToRedis(APPROVED_USERS_KEY, updatedApprovedUsers)
    ]);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Update user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { message: authCheck.error || 'Unauthorized access' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = deleteUserSchema.parse(body);
    
    const { id } = validatedData;

    // Prevent admin from deleting themselves
    if (authCheck.user?.id === id) {
      return NextResponse.json(
        { message: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Find and remove user from both lists
    const [pendingUsers, approvedUsers] = await Promise.all([
      getPendingUsers(),
      getApprovedUsers()
    ]);

    let userFound = false;
    const updatedPendingUsers = pendingUsers.filter(user => {
      if (user.id === id) {
        userFound = true;
        return false;
      }
      return true;
    });

    const updatedApprovedUsers = approvedUsers.filter(user => {
      if (user.id === id) {
        userFound = true;
        return false;
      }
      return true;
    });

    if (!userFound) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Update both lists in Redis
    await Promise.all([
      setToRedis(PENDING_USERS_KEY, updatedPendingUsers),
      setToRedis(APPROVED_USERS_KEY, updatedApprovedUsers)
    ]);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Delete user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 