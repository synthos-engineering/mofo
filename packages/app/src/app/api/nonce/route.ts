import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Generate secure nonce (at least 8 alphanumeric characters as per World docs)
    const nonce = crypto.randomUUID().replace(/-/g, "");

    // Store nonce in secure cookie (not tamperable by client)
    cookies().set("siwe", nonce, { 
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    console.log('🔑 Generated nonce for wallet auth:', nonce.substring(0, 8) + '...');

    return NextResponse.json({ 
      nonce,
      timestamp: Date.now()
    });

  } catch (error: any) {
    console.error('💥 Nonce generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate nonce',
      message: error.message
    }, { status: 500 });
  }
}
