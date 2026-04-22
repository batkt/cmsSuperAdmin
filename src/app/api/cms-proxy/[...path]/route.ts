import { NextRequest } from 'next/server'

const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-length',
  'x-cms-backend-url',
])

async function proxy(request: NextRequest, params: { path: string[] }) {
  const targetBase = request.headers.get('x-cms-backend-url')
  if (!targetBase) {
    return new Response(
      JSON.stringify({ error: 'Missing x-cms-backend-url header' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    )
  }

  const targetPath = '/' + params.path.join('/')
  const incomingUrl = new URL(request.url)
  const targetUrl = new URL(targetPath, targetBase.replace(/\/$/, ''))
  targetUrl.search = incomingUrl.search

  const upstreamHeaders = new Headers()
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      upstreamHeaders.set(key, value)
    }
  })

  const init: RequestInit = {
    method: request.method,
    headers: upstreamHeaders,
    redirect: 'follow',
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer()
  }

  try {
    const upstream = await fetch(targetUrl.toString(), init)
    const responseHeaders = new Headers()
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    })
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upstream error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })
  }
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}
