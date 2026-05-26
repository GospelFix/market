'use client'

import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  email: string
  fullName: string | null
  avatarUrl: string | null
}

export default function DashboardHeader({ email, fullName, avatarUrl }: DashboardHeaderProps) {
  const { signOut, isLoading } = useAuth()

  // 이름 또는 이메일 앞글자를 아바타 폴백으로 사용
  const initials = (fullName ?? email).charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
      <span className="text-lg font-semibold tracking-tight">GospelFix</span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar size="default">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName ?? email} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-sm">
            <p className="font-medium leading-none">{fullName ?? email}</p>
            {fullName && (
              <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
            )}
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={signOut} disabled={isLoading}>
          로그아웃
        </Button>
      </div>
    </header>
  )
}
