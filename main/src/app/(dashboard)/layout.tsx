import { createClient } from '@/lib/supabase/server'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()
    : { data: null }

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader
        email={user?.email ?? ''}
        fullName={profile?.full_name ?? null}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  )
}
