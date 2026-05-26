import { selector } from 'recoil'
import { authUserAtom, authLoadingAtom } from '@/store/atoms/authAtom'
import { userProfileAtom } from '@/store/atoms/userAtom'

// 인증 여부 파생 상태 (로딩 완료 후 user가 있으면 true)
export const isAuthenticatedSelector = selector<boolean>({
  key: 'isAuthenticatedSelector',
  get: ({ get }) => {
    const user = get(authUserAtom)
    const loading = get(authLoadingAtom)
    return !loading && user !== null
  },
})

// 관리자 여부 파생 상태
export const isAdminSelector = selector<boolean>({
  key: 'isAdminSelector',
  get: ({ get }) => {
    const profile = get(userProfileAtom)
    return profile?.role === 'admin'
  },
})
