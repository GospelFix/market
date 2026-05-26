'use client'

import { useRecoilValue, useSetRecoilState } from 'recoil'
import { useCallback } from 'react'
import { userProfileAtom } from '@/store/atoms/userAtom'
import { createClient } from '@/lib/supabase/client'
import type { UpdateProfilePayload } from '@/types/user.types'

export function useUser() {
  const profile = useRecoilValue(userProfileAtom)
  const setProfile = useSetRecoilState(userProfileAtom)
  const supabase = createClient()

  // profiles 테이블에서 최신 데이터를 가져와 atom 갱신
  const refreshProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) setProfile(data)
  }, [supabase, setProfile])

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('인증되지 않은 사용자입니다')

      const { data, error } = await supabase
        .from('profiles')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      if (data) setProfile(data)
      return data
    },
    [supabase, setProfile]
  )

  return {
    profile,
    refreshProfile,
    updateProfile,
  }
}
