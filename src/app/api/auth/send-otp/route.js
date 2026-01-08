// app/api/auth/send-otp/route.js - Production (No Console Logs)
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';
import { sendOTPEmail } from '@/lib/email/sendEmail';
import { checkRateLimit, getClientIdentifier, createRateLimitResponse } from '@/lib/security/rateLimiter';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, 'otp');
    
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    const [rootAdmins, superAdmins] = await Promise.all([
      query({
        query: 'SELECT id, email, name, "root" as role FROM sup_root_admin WHERE email = ? AND is_active = 1',
        values: [email],
      }),
      query({
        query: 'SELECT id, email, name, "superadmin" as role FROM sup_admin_users WHERE email = ? AND is_active = 1',
        values: [email],
      })
    ]);

    let user = null;
    let userRole = null;

    if (rootAdmins.length > 0) {
      user = rootAdmins[0];
      userRole = 'root';
    } else if (superAdmins.length > 0) {
      user = superAdmins[0];
      userRole = 'superadmin';
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found or inactive' },
        { status: 404 }
      );
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const [, emailResult] = await Promise.all([
      query({
        query: 'INSERT INTO sup_login_otp (email, otp, role, expires_at, is_used) VALUES (?, ?, ?, ?, 0)',
        values: [email, otp, userRole, expiresAt],
      }),
      sendOTPEmail(email, otp, user.name)
    ]);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to send email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: 600,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
