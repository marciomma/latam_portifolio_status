import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, User } from '@/lib/user-utils';

// Simple test endpoint to verify admin authentication
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No authorization header',
          details: 'Authorization header is missing'
        },
        { status: 401 }
      );
    }

    const email = authHeader.replace('Bearer ', '');
    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid authorization header',
          details: 'Email not found in authorization header'
        },
        { status: 401 }
      );
    }

    // Handle development bypass user
    if (process.env.NODE_ENV === 'development' && email === 'dev@localhost') {
      return NextResponse.json({
        success: true,
        message: 'Development bypass authentication successful',
        user: {
          id: 'dev_bypass_admin',
          name: 'Dev Admin',
          email: 'dev@localhost',
          role: 'admin',
          status: 'approved',
          isDevelopmentBypass: true
        },
        environment: process.env.NODE_ENV
      });
    }

    // Try to find regular user
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found',
          details: `No user found with email: ${email}`,
          email: email
        },
        { status: 404 }
      );
    }

    if (user.status !== 'approved') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not approved',
          details: `User status is: ${user.status}`,
          user: { email: user.email, status: user.status }
        },
        { status: 403 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User is not an admin',
          details: `User role is: ${user.role}`,
          user: { email: user.email, role: user.role }
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isDevelopmentBypass: false
      },
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 