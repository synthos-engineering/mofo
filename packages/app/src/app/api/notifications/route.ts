import { NextRequest, NextResponse } from 'next/server'

interface NotificationPayload {
  walletAddresses: string[]
  title: string
  message: string
  path?: string
  language?: string
}

export async function POST(req: NextRequest) {
  try {
    const { walletAddresses, title, message, path = '/', language = 'en' } = 
      (await req.json()) as NotificationPayload

    const apiKey = process.env.WLD_API_KEY
    const appId = process.env.NEXT_PUBLIC_WLD_APP_ID

    if (!apiKey || !appId) {
      throw new Error('Missing World ID configuration')
    }

    const response = await fetch(
      'https://developer.worldcoin.org/api/v2/minikit/send-notification',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: appId,
          wallet_addresses: walletAddresses,
          localisations: [
            {
              language,
              title,
              message,
            }
          ],
          mini_app_path: `worldapp://mini-app?app_id=${appId}&path=${path}`,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Notification API error: ${response.statusText}`)
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send notification'
      },
      { status: 500 }
    )
  }
}
