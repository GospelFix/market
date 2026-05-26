import { atom } from 'recoil'

export const sidebarOpenAtom = atom<boolean>({
  key: 'sidebarOpenAtom',
  default: true,
})

export const toastAtom = atom<{
  message: string
  type: 'success' | 'error' | 'info'
} | null>({
  key: 'toastAtom',
  default: null,
})
