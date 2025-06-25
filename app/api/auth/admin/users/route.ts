import { NextRequest, NextResponse } from 'next/server';
import { getPendingUsers, getApprovedUsers, findUserByEmail, PENDING_USERS_KEY, APPROVED_USERS_KEY, User } from '@/lib/user-utils';
import { setToRedis } from '@/lib/data';

// Helper function to check if user is admin
async function checkAdminAuth(request: NextRequest): Promise<{ isAdmin: boolean; user: User | null; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { isAdmin: false, user: null, error: 'No authorization header' };
    }

    // Extract email from authorization header (format: "Bearer email")
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

    // Find user in approved users
    const user = await findUserByEmail(email);
    if (!user || user.status !== 'approved') {
      return { isAdmin: false, user: null, error: 'User not found or not approved' };
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return { isAdmin: false, user, error: 'User is not an admin' };
    }

    return { isAdmin: true, user };
  } catch {
    return { isAdmin: false, user: null, error: 'Authentication error' };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
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

    return NextResponse.json({
      pendingUsers,
      approvedUsers
    });
    
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { message: authCheck.error || 'Unauthorized access' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, action, role } = body; // action: 'approve' or 'deny', role: optional for setting user role

    if (!email || !action) {
      return NextResponse.json(
        { message: 'Email and action are required' },
        { status: 400 }
      );
    }

    const [pendingUsers, approvedUsers] = await Promise.all([
      getPendingUsers(),
      getApprovedUsers()
    ]);
    
    const pendingUserIndex = pendingUsers.findIndex(user => user.email === email);
    
    if (pendingUserIndex === -1) {
      return NextResponse.json(
        { message: 'User not found in pending requests' },
        { status: 404 }
      );
    }

    const pendingUser = pendingUsers[pendingUserIndex];

    if (action === 'approve') {
      // Create approved user with specified role (default to 'user')
      const approvedUser: User = {
        ...pendingUser,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        role: role || 'user' // Allow admin to set role, default to 'user'
      };
      
      // Add to approved list
      const updatedApprovedUsers = [...approvedUsers, approvedUser];
      
      // Remove from pending list
      const updatedPendingUsers = pendingUsers.filter((_, index) => index !== pendingUserIndex);
      
      // Update both lists in Redis
      await Promise.all([
        setToRedis(APPROVED_USERS_KEY, updatedApprovedUsers),
        setToRedis(PENDING_USERS_KEY, updatedPendingUsers)
      ]);
      
      // Send approval email to user (mock)
      await sendApprovalEmail(pendingUser.name, email, true);
      
      return NextResponse.json({
        message: 'User approved successfully'
      });
      
    } else if (action === 'deny') {
      // Remove from pending list
      const updatedPendingUsers = pendingUsers.filter((_, index) => index !== pendingUserIndex);
      await setToRedis(PENDING_USERS_KEY, updatedPendingUsers);
      
      // Send denial email to user (mock)
      await sendApprovalEmail(pendingUser.name, email, false);
      
      return NextResponse.json({
        message: 'User request denied'
      });
    } else {
      return NextResponse.json(
        { message: 'Invalid action. Use "approve" or "deny"' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Admin user action error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendApprovalEmail(name: string, email: string, approved: boolean) {
  // Mock email sending - replace with actual email service
  const status = approved ? 'APPROVED' : 'DENIED';
  const message = approved 
    ? 'Your access request has been approved! You can now log in to the dashboard at /login'
    : 'Your access request has been denied. Please contact an administrator for more information.';
    
  console.log(`
    📧 ${status} EMAIL
    To: ${email}
    Subject: LATAM Portfolio Status - Access Request ${status}
    
    Hello ${name},
    
    ${message}
    
    Best regards,
    LATAM Portfolio Status Team
  `);
} 