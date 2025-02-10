import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase-admin';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const decodedToken = await auth.verifyIdToken(token);
    return NextResponse.json({ 
      valid: true, 
      email_verified: decodedToken.email_verified 
    });
  } catch (error) {
    return NextResponse.json({ 
      valid: false, 
      email_verified: false 
    });
  }
} 