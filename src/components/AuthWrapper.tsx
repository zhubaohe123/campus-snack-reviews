'use client'

import { AuthProvider } from '@/lib/AuthContext'
import { ReactNode } from 'react'

export function AuthWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
