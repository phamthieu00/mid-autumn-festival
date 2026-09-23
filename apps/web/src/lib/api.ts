import type { ApiErrorBody } from '@maf/shared/api'

export const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api'

export class ApiError extends Error {
  status: number
  code: string
  requestId?: string
  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message)
    this.status = status
    this.code = code
    this.requestId = requestId
  }
  get isNetwork() {
    return this.status === 0
  }
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  timeoutMs?: number
}

// Once the origin answers with HTML (SPA fallback, no API deployed) stop asking for a while so
// pages fall back to local data instantly instead of retrying on every render.
let notConfiguredUntil = 0
const NOT_CONFIGURED_TTL = 5 * 60_000

/** JSON fetch against the same-origin API with credentials, timeout and typed errors. */
export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  if (Date.now() < notConfiguredUntil)
    throw new ApiError(0, 'NOT_CONFIGURED', 'API not available at this origin')
  const { body, timeoutMs = 8000, headers, ...init } = opts
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(headers ?? {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (res.status === 204) return undefined as T
    const text = await res.text()
    if ((res.headers.get('content-type') ?? '').includes('text/html')) {
      // the SPA fallback answered: no API is deployed behind this origin yet
      notConfiguredUntil = Date.now() + NOT_CONFIGURED_TTL
      throw new ApiError(0, 'NOT_CONFIGURED', 'API not available at this origin')
    }
    const data = text ? (JSON.parse(text) as unknown) : null
    if (!res.ok) {
      const err = (data as ApiErrorBody | null)?.error
      throw new ApiError(
        res.status,
        err?.code ?? `HTTP_${res.status}`,
        err?.message ?? res.statusText,
        err?.requestId,
      )
    }
    return data as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError(0, 'NETWORK', (err as Error).message)
  } finally {
    window.clearTimeout(timer)
  }
}
