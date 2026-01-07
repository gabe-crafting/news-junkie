import { supabase } from '@/lib/supabase'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

export async function createArchiveLink(targetUrl: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('archive-link', {
    body: { url: targetUrl },
  })
  if (error) {
    let extra = ''
    const errUnknown: unknown = error
    if (isRecord(errUnknown)) {
      const ctx = errUnknown['context']
      if (isRecord(ctx)) {
        const status = ctx['status']
        const body = ctx['body']
        const parts: string[] = []
        if (typeof status === 'number') parts.push(`status=${status}`)
        if (typeof body === 'string' && body.trim()) parts.push(`body=${body.trim().slice(0, 300)}`)
        if (parts.length) extra = ` (${parts.join(', ')})`
      }
    }
    const maybeJwtHint =
      error.message.includes('Invalid JWT') || extra.includes('Invalid JWT')
        ? ' (auth token looks invalid—try logging out/in or clearing site data)'
        : ''
    throw new Error(`Archiving failed: ${error.message}${extra}${maybeJwtHint}`)
  }

  const archiveUrl = (data as { archiveUrl?: unknown } | null)?.archiveUrl
  if (typeof archiveUrl !== 'string' || archiveUrl.length === 0) {
    throw new Error('Archive did not return a snapshot URL')
  }
  return archiveUrl
}


