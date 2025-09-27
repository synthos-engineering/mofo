import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js'

interface RequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export async function POST(req: NextRequest) {
  try {
    const { payload, nonce } = (await req.json()) as RequestPayload

    // Verify nonce matches the one stored in cookies
    const storedNonce = cookies().get('siwe-nonce')?.value
    if (!storedNonce || nonce !== storedNonce) {
      return NextResponse.json(
        { status: 'error', isValid: false, message: 'Invalid or expired nonce' },
        { status: 400 }
      )
    }

    // Verify the SIWE message and signature
    const validMessage = await verifySiweMessage(payload, nonce)
    
    if (validMessage.isValid) {
      // Clear the used nonce
      cookies().delete('siwe-nonce')
      
      // Here you would typically:
      // 1. Create or update user in database
      // 2. Create session/JWT token
      // 3. Store user preferences
      
      return NextResponse.json({
        status: 'success',
        isValid: true,
        walletAddress: (payload as any).walletAddress || 'unknown',
      })
    } else {
      return NextResponse.json(
        { status: 'error', isValid: false, message: 'Invalid signature' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('SIWE verification error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        isValid: false, 
        message: error instanceof Error ? error.message : 'Verification failed' 
      },
      { status: 500 }
    )
  }
}
