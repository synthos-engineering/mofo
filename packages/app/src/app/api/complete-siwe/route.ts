import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export async function POST(req: NextRequest) {
  try {
    const { payload, nonce } = (await req.json()) as IRequestPayload;

    // Validate request
    if (!payload || !nonce) {
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Missing payload or nonce"
      }, { status: 400 });
    }

    // Check nonce matches the one stored in cookie
    const storedNonce = cookies().get("siwe")?.value;
    if (nonce !== storedNonce) {
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid nonce"
      }, { status: 400 });
    }

    console.log('🔍 Verifying SIWE message for address:', payload.address);

    // Verify the SIWE message using World's verification function
    const validMessage = await verifySiweMessage(payload, nonce);
    
    if (!validMessage.isValid) {
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid SIWE signature"
      }, { status: 400 });
    }

    console.log('✅ SIWE verification successful for:', payload.address);

    // Clear the used nonce
    cookies().delete("siwe");

    // TODO: Create user session in your database
    // TODO: Generate session token if needed
    // TODO: Store wallet address and user data

    // Return success with user data
    return NextResponse.json({
      status: "success",
      isValid: true,
      user: {
        walletAddress: payload.address,
        message: payload.message,
        signature: payload.signature,
        version: payload.version,
        verifiedAt: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('💥 SIWE verification error:', error);
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: "SIWE signature verification failed",
      details: error.message
    }, { status: 500 });
  }
}
