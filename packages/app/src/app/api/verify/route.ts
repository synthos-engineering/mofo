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
    
    console.log('🔍 Received verification request:', { action, signal, payloadKeys: Object.keys(payload) })

    // Get app ID from environment (try both possible env var names)
    const appId = (process.env.APP_ID || process.env.NEXT_PUBLIC_WLD_APP_ID) as `app_${string}`
    if (!appId) {
      console.error('❌ APP_ID environment variable not configured')
      console.error('💡 Please set either APP_ID or NEXT_PUBLIC_WLD_APP_ID in your .env.local file')
      console.error('📝 Format: APP_ID=app_your_app_id_here')
      
      return NextResponse.json({
        verifyRes: { success: false },
        status: 500,
        message: 'APP_ID not configured - required for WorldCoin verification',
        error: 'Server configuration error'
      }, { status: 500 })
    }
    
    console.log('🔍 Verifying action:', action, 'for app:', appId)

    // Verify the proof with World ID
    console.log('📤 Sending verification request to WorldCoin...')
    const verifyRes = await verifyCloudProof(
      payload,
      appId,
      action,
      signal
    ) as IVerifyResponse

    console.log('📥 WorldCoin verification response:', verifyRes)

    if (verifyRes.success) {
      // Here you would typically:
      // 1. Mark user as verified in database
      // 2. Grant special privileges for EEG data generation
      // 3. Update user verification status
      
      console.log('✅ WorldCoin verification successful for action:', action)
      
      return NextResponse.json({
        verifyRes,
        status: 200,
        message: 'Verification successful - EEG data generation authorized'
      })
    } else {
      console.warn('⚠️ WorldCoin verification failed:', verifyRes)
      
      return NextResponse.json({
        verifyRes,
        status: 400,
        message: `Verification failed: ${JSON.stringify(verifyRes)}`,
        error: 'Verification failed'
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
