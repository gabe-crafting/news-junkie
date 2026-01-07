type ArchiveLinkRequest = {
  url?: unknown
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function getClosestWaybackUrl(json: unknown): string | null {
  if (!isRecord(json)) return null
  const archived = json.archived_snapshots
  if (!isRecord(archived)) return null
  const closest = archived.closest
  if (!isRecord(closest)) return null
  const url = closest.url
  return typeof url === 'string' && url.length > 0 ? url : null
}

async function saveToWayback(targetUrl: string): Promise<string> {
  const saveRes = await (async () => {
    // Wayback can be rate-limited; retry a couple of times for transient statuses.
    const maxAttempts = 3
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const res = await fetchWithTimeout(
        'https://web.archive.org/save/',
        {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          // Some endpoints behave better with a UA.
          'user-agent': 'news-junkie/1.0 (supabase-edge-function)',
          accept: '*/*',
        },
        body: `url=${encodeURIComponent(targetUrl)}`,
        },
        20_000
      )

      if (res.status !== 429 && res.status !== 503) return res
      if (attempt === maxAttempts) return res
      const backoffMs = 500 * attempt
      await new Promise((r) => setTimeout(r, backoffMs))
    }
    // Unreachable, but TS wants a return.
    throw new Error('Archive request failed')
  })()

  if (!saveRes.ok) {
    const body = await saveRes.text().catch(() => '')
    const snippet = body.trim().slice(0, 300)
    throw new Error(
      `Wayback save failed (HTTP ${saveRes.status}${saveRes.statusText ? ` ${saveRes.statusText}` : ''})${
        snippet ? `: ${snippet}` : ''
      }`
    )
  }

  const contentLocation = saveRes.headers.get('content-location')
  if (contentLocation && contentLocation.startsWith('/web/')) {
    return `https://web.archive.org${contentLocation}`
  }

  const location = saveRes.headers.get('location')
  if (location) {
    if (location.startsWith('/web/')) return `https://web.archive.org${location}`
    if (location.includes('/web/')) return location
  }
  if (saveRes.url.includes('/web/')) return saveRes.url

  // Fallback: query for latest snapshot
  const availableUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(targetUrl)}`
  const availableRes = await fetchWithTimeout(
    availableUrl,
    {
      method: 'GET',
      headers: { accept: 'application/json' },
    },
    15_000
  )
  if (!availableRes.ok) {
    const body = await availableRes.text().catch(() => '')
    const snippet = body.trim().slice(0, 300)
    throw new Error(
      `Wayback lookup failed (HTTP ${availableRes.status}${
        availableRes.statusText ? ` ${availableRes.statusText}` : ''
      })${snippet ? `: ${snippet}` : ''}`
    )
  }
  const json = (await availableRes.json()) as unknown
  const closest = getClosestWaybackUrl(json)
  if (closest) return closest

  throw new Error('Archive did not return a snapshot URL')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const body = (await req.json().catch(() => ({}))) as unknown
    const url = (isRecord(body) ? (body as ArchiveLinkRequest).url : undefined) as unknown
    if (typeof url !== 'string' || url.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Missing url' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid url' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const archiveUrl = await saveToWayback(url)
    return new Response(JSON.stringify({ archiveUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Archiving failed'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})


