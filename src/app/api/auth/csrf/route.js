// app/api/auth/csrf/route.js - CSRF Token Generation
import { NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/security/csrf';

export async function GET(request) {
  try {
    const token = generateCSRFToken();
    
    const response = NextResponse.json({
      success: true,
      token,
    });
    
    // Set CSRF token in httpOnly cookie
    response.cookies.set('csrf_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600, // 1 hour
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('❌ CSRF token generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
