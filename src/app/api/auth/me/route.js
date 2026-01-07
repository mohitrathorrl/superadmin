// app/api/auth/me/route.js - UPDATED for existing database
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query } from '@/lib/db/mysql';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const verified = await verifyToken(token);

    if (!verified.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user based on role from token
    let user = null;
    if (verified.payload.role === 'root') {
      const rootAdmins = await query({
        query: 'SELECT id, email, name, "root" as role FROM sup_root_admin WHERE id = ? AND is_active = 1',
        values: [verified.payload.userId],
      });
      user = rootAdmins[0];
    } else if (verified.payload.role === 'superadmin') {
      const superAdmins = await query({
        query: 'SELECT id, email, name, "superadmin" as role FROM sup_admin_users WHERE id = ? AND is_active = 1',
        values: [verified.payload.userId],
      });
      user = superAdmins[0];
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
