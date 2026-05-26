import { atom } from 'recoil'

import type { UserProfile } from '@/types/user.types'

export type { UserProfile }

export const userProfileAtom = atom<UserProfile | null>({
  key: 'userProfileAtom',
  default: null,
})
