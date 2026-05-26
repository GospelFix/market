export type UserRole = 'user' | 'admin' | 'moderator'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface UpdateProfilePayload {
  full_name?: string
  avatar_url?: string
}
