import { NextRequest } from 'next/server'

const TARGET_ORIGIN = process.env.API_PROXY_TARGET || 'http://202.179.6.77:4000'

const hopByHopHeaders = new Set([
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
])

async function proxy(request: NextRequest, params: { path: string[] }) {
  try {
    const targetPath = params.path.join('/')
    const incomingUrl = new URL(request.url)
    const targetUrl = new URL(`/${targetPath}`, TARGET_ORIGIN)
    targetUrl.search = incomingUrl.search

    const upstreamHeaders = new Headers()
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      if (!hopByHopHeaders.has(lower)) {
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

    const upstreamResponse = await fetch(targetUrl.toString(), init)
    const responseHeaders = new Headers()

    upstreamResponse.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      if (!hopByHopHeaders.has(lower)) {
        responseHeaders.set(key, value)
      }
    })

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    })
  } catch (error: any) {
    console.error('[Proxy Error]', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Upstream server unreachable',
      message: error.message
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context.params)
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context.params)
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context.params)
}

export async function PATCH(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context.params)
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context.params)
}

