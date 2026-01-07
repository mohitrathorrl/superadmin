// app/api/auth/send-otp/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';
import { sendOTPEmail } from '@/lib/email/sendEmail';
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

    const users = await query({
      query: 'SELECT id, name, email FROM users WHERE email = ?',
      values: [email],
    });

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await query({
      query: 'UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?',
      values: [otp, otpExpiry, email],
    });

    const emailResult = await sendOTPEmail(email, otp, user.name);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}