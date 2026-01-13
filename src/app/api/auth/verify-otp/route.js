// app/api/auth/verify-otp/route.js - Production (No Console Logs)
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';
import { generateToken } from '@/lib/auth/jwt';
import { checkRateLimit, getClientIdentifier, createRateLimitResponse } from '@/lib/security/rateLimiter';
import { generateCSRFToken } from '@/lib/security/csrf';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, 'login');
    
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    const otpRecords = await query({
      query: 'SELECT * FROM sup_login_otp WHERE email = ? AND otp = ? AND is_used = 0 ORDER BY created_at DESC LIMIT 1',
      values: [email, otp],
    });

    if (otpRecords.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    const otpRecord = otpRecords[0];

    if (new Date() > new Date(otpRecord.expires_at)) {
      return NextResponse.json(
        { success: false, message: 'OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    let user = null;
    if (otpRecord.role === 'root') {
      const rootAdmins = await query({
        query: 'SELECT id, email, name, "root" as role FROM sup_root_admin WHERE email = ? AND is_active = 1',
        values: [email],
      });
      user = rootAdmins[0];
    } else if (otpRecord.role === 'superadmin') {
      const superAdmins = await query({
        query: 'SELECT id, email, name, "superadmin" as role FROM sup_admin_users WHERE email = ? AND is_active = 1',
        values: [email],
      });
      user = superAdmins[0];
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    await query({
      query: 'UPDATE sup_login_otp SET is_used = 1 WHERE id = ?',
      values: [otpRecord.id],
    });

    const tokenResult = await generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: otpRecord.role,
    });

    if (!tokenResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to generate token' },
        { status: 500 }
      );
    }

    const csrfToken = generateCSRFToken();

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: otpRecord.role,
      },
      expiresIn: 3600,
    });

    response.cookies.set('auth_token', tokenResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });

    response.cookies.set('csrf_token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
