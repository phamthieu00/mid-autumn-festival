import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { logger } from '../logger'

export interface ApiErrorBody {
  error: { code: string; message: string; requestId?: string; issues?: unknown }
}

export class ApiError extends HTTPException {
  code: string
  constructor(
    status: 400 | 401 | 403 | 404 | 409 | 410 | 422 | 429 | 500 | 503,
    code: string,
    message?: string,
  ) {
    super(status, { message: message ?? code })
    this.code = code
  }
}

export function errorHandler(err: Error, c: Context) {
  const requestId = c.get('requestId') as string | undefined
  if (err instanceof ApiError) {
    return c.json<ApiErrorBody>(
      { error: { code: err.code, message: err.message, requestId } },
      err.status,
    )
  }
  if (err instanceof HTTPException) {
    return c.json<ApiErrorBody>(
      { error: { code: `HTTP_${err.status}`, message: err.message, requestId } },
      err.status,
    )
  }
  if (err instanceof ZodError) {
    return c.json<ApiErrorBody>(
      { error: { code: 'VALIDATION', message: 'Invalid request', requestId, issues: err.issues } },
      400,
    )
  }
  logger.error({ err, requestId, path: c.req.path }, 'unhandled error')
  return c.json<ApiErrorBody>(
    { error: { code: 'INTERNAL', message: 'Something went wrong', requestId } },
    500,
  )
}
