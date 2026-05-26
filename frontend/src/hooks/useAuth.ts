'use client'

import { useRecoilValue, useRecoilState } from 'recoil'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { sessionAtom, authUserAtom, authLoadingAtom } from '@/store/atoms/authAtom'
import { isAuthenticatedSelector, isAdminSelector } from '@/store/selectors/authSelector'
import { createClient } from '@/lib/supabase/client'
import type { OAuthProvider } from '@/types/auth.types'

export function useAuth() {
  const router = useRouter()
  const supabase = createClient()

  const session = useRecoilValue(sessionAtom)
  const user = useRecoilValue(authUserAtom)
  const [isLoading, setIsLoading] = useRecoilState(authLoadingAtom)
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector)
  const isAdmin = useRecoilValue(isAdminSelector)

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setIsLoading(false)
      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    },
    [supabase, router, setIsLoading]
  )

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      setIsLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      setIsLoading(false)
      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    },
    [supabase, router, setIsLoading]
  )

  const signInWithOAuth = useCallback(
    async (provider: OAuthProvider) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/api/auth/callback` },
      })
      if (error) throw error
    },
    [supabase]
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/dashboard')
    router.refresh()
  }, [supabase, router])

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
  }
}
