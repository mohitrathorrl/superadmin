// app/api/auth/verify-otp/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';
import { generateToken } from '@/lib/auth/jwt';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP required' },
        { status: 400 }
      );
    }

    const users = await query({
      query: 'SELECT * FROM users WHERE email = ?',
      values: [email],
    });

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    if (user.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    if (new Date() > new Date(user.otp_expiry)) {
      return NextResponse.json(
        { success: false, message: 'OTP expired' },
        { status: 400 }
      );
    }

    await query({
      query: 'UPDATE users SET otp = NULL, otp_expiry = NULL, is_verified = 1 WHERE email = ?',
      values: [email],
    });

    const tokenResult = await generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
    });

    if (!tokenResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to generate token' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    // ✅ Cookie with 1 HOUR expiry
    response.cookies.set('auth_token', tokenResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}