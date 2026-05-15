export { ApiError, NetworkError } from './errors'
export type { ApiEnvelope, RequestConfig } from './types'
export { ApiClient } from './client'
export { api } from './instance'

// Backward-compat shim — keeps existing `apiFetch(...)` callers working
import { api } from './instance'
import type { RequestConfig } from './types'

export function apiFetch(
  endpoint: string,
  options: Omit<RequestInit, 'body'> & { body?: unknown; silent?: boolean } = {},
) {
  const { method = 'GET', body, silent, ...rest } = options
  const parsedBody =
    typeof body === 'string'
      ? (() => { try { return JSON.parse(body) } catch { return body } })()
      : body

  return api.request(endpoint, { method, body: parsedBody, silent, ...rest } as RequestConfig)
}
