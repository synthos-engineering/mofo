'use client'

import { MiniKitProvider as BaseMiniKitProvider } from "@worldcoin/minikit-js/minikit-provider"
import { ReactNode } from 'react'

interface MiniKitProviderProps {
  children: ReactNode
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  return (
    <BaseMiniKitProvider>
      {children}
    </BaseMiniKitProvider>
  )
}
