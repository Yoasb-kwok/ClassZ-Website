import { NextRequest, NextResponse } from 'next/server'
import { getBackendOrigin } from '@/lib/backend-origin'

export const runtime = 'nodejs'

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
])

function buildTargetUrl(request: NextRequest, segments: string[]): string {
  const origin = getBackendOrigin()
  const suffix = segments.map(encodeURIComponent).join('/')
  const { search } = new URL(request.url)
  return `${origin}/api/${suffix}${search}`
}

function forwardRequestHeaders(request: NextRequest): Headers {
  const out = new Headers()
  const contentType = request.headers.get('content-type')
  if (contentType) out.set('content-type', contentType)
  const accept = request.headers.get('accept')
  if (accept) out.set('accept', accept)
  const auth = request.headers.get('authorization')
  if (auth) out.set('authorization', auth)
  const centerId = request.headers.get('x-center-id')
  if (centerId) out.set('x-center-id', centerId)
  const authToken = request.headers.get('auth-token')
  if (authToken) out.set('auth-token', authToken)
  return out
}

function forwardResponseHeaders(upstream: Headers): Headers {
  const out = new Headers()
  upstream.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return
    out.append(key, value)
  })
  return out
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path: segments } = await context.params
  if (!segments?.length) {
    return NextResponse.json({ success: false, message: 'Missing API path' }, { status: 404 })
  }

  const target = buildTargetUrl(request, segments)
  const method = request.method
  const hasBody = !['GET', 'HEAD'].includes(method)

  const init: RequestInit = {
    method,
    headers: forwardRequestHeaders(request),
  }

  if (hasBody) {
    const bodyBuffer = await request.arrayBuffer()
    if (bodyBuffer.byteLength > 0) {
      init.body = bodyBuffer
    }
  }

  let upstream: Response
  try {
    upstream = await fetch(target, init)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const origin = getBackendOrigin()
    return NextResponse.json(
      {
        success: false,
        message: `Upstream request failed (${msg}). Check BACKEND_URL / NEXT_PUBLIC_API_BASE_URL (${origin}).`,
      },
      { status: 503 }
    )
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: forwardResponseHeaders(upstream.headers),
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const HEAD = proxy
