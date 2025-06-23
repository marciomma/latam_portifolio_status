import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword, validatePassword } from '@/lib/password-utils';
import { User, addPendingUser, findUserByEmail } from '@/lib/user-utils';

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .refine(password => validatePassword(password).isValid, {
      message: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)"
    }),
});

// Mock authorized users - replace with your actual authorized users
const AUTHORIZED_USERS = [
  'admin@company.com',
  'manager@latam.com',
  // Add your authorized email addresses here
];



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);
    
    const { name, email, password } = validatedData;

    // Check if user already exists (approved or pending)
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists or has a pending request' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = hashPassword(password);

    // Create new pending user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      password: hashedPassword,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      role: 'user' // Default role for new users
    };

    // Store the pending user in Redis
    await addPendingUser(newUser);

    // Send notification to authorized users (mock implementation)
    // In production, replace this with actual email sending
    await sendApprovalNotification(name, email);

    return NextResponse.json({
      message: 'Sign-up request submitted successfully',
      status: 'pending'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Sign-up error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendApprovalNotification(name: string, email: string) {
  // Mock email sending - replace with actual email service
  console.log(`
    📧 APPROVAL REQUEST EMAIL
    To: ${AUTHORIZED_USERS.join(', ')}
    Subject: New Dashboard Access Request
    
    A new user has requested access to the LATAM Portfolio Status Dashboard:
    
    Name: ${name}
    Email: ${email}
    Requested: ${new Date().toLocaleString()}
    
    To approve or deny this request, please use the admin dashboard at /admin/users
  `);
  
  // Here you would integrate with your email service:
  // - SendGrid
  // - AWS SES
  // - Nodemailer
  // - Resend
  // etc.
}

 