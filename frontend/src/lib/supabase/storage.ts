import { createClient } from '@supabase/supabase-js'

// Service Role Key로 RLS를 우회해 비공개 버킷에서 서명된 URL 생성
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function createSignedDownloadUrl(
  filePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  const supabase = createServiceClient()

  const { data, error } = await supabase.storage
    .from('templates')
    .createSignedUrl(filePath, expiresInSeconds)

  if (error || !data?.signedUrl) {
    throw new Error('다운로드 URL 생성에 실패했습니다.')
  }

  return data.signedUrl
}
