import { NextRequest, NextResponse } from 'next/server'
import { verifyCloudProof, ISuccessResult, IVerifyResponse } from '@worldcoin/minikit-js'

interface RequestPayload {
  payload: ISuccessResult
  action: string
  signal: string | undefined
}

export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = (await req.json()) as RequestPayload

    // Get app ID from environment
    const appId = process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`
    if (!appId) {
      throw new Error('WLD_APP_ID not configured')
    }

    // Verify the proof with World ID
    const verifyRes = await verifyCloudProof(
      payload,
      appId,
      action,
      signal
    ) as IVerifyResponse

    if (verifyRes.success) {
      // Here you would typically:
      // 1. Mark user as verified in database
      // 2. Grant special privileges
      // 3. Update user verification status
      
      return NextResponse.json({
        verifyRes,
        status: 200,
        message: 'Verification successful'
      })
    } else {
      return NextResponse.json({
        verifyRes,
        status: 400,
        message: 'Verification failed'
      })
    }
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      {
        verifyRes: { success: false },
        status: 500,
        message: error instanceof Error ? error.message : 'Verification error'
      },
      { status: 500 }
    )
  }
}
