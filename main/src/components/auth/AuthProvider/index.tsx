'use client'

import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { createClient } from '@/lib/supabase/client'
import { sessionAtom, authUserAtom, authLoadingAtom } from '@/store/atoms/authAtom'
import { userProfileAtom, type UserProfile } from '@/store/atoms/userAtom'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const setSession = useSetRecoilState(sessionAtom)
  const setAuthUser = useSetRecoilState(authUserAtom)
  const setAuthLoading = useSetRecoilState(authLoadingAtom)
  const setUserProfile = useSetRecoilState(userProfileAtom)

  useEffect(() => {
    const supabase = createClient()

    async function fetchUserProfile(userId: string) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setUserProfile(data as UserProfile)
      }
    }

    // 초기 세션 로드
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthUser(session?.user ?? null)
      setAuthLoading(false)

      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
    })

    // 인증 상태 변경 구독 (로그인/로그아웃 시 자동 동기화)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setAuthUser(session?.user ?? null)
      setAuthLoading(false)

      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
