export interface ChatRequest {
  inputs?: Record<string, any>
  query: string
  conversation_id?: string
  response_mode?: 'streaming' | 'blocking'
  user?: string
}

export interface GetConversationsRequest {
  user: string
  last_id?: string
  limit?: number
  sort_by?: 'created_at' | '-created_at' | 'updated_at' | '-updated_at'
}

export interface CompletionRequest {
  inputs?: Record<string, any>
  response_mode?: 'streaming' | 'blocking'
  user?: string
}

export type SSEHandler = {
  onConversationId?: (id: string) => void
  onChunk?: (text: string) => void
  onError?: (err: any) => void
  onDone?: () => void
}

export type StreamController = {
  abort: () => void
}

/**
 * 处理SSE流式响应
 * @param url 请求URL
 * @param payload 请求体
 * @param handler 响应处理器
 * @param signal 中止信号
 * @param headers 请求头
 * @returns 流控制器
 */
async function streamSSE(url: string, payload: any, handler: SSEHandler, signal?: AbortSignal, headers?: Record<string, string>): Promise<StreamController> {
  const controller = new AbortController()
  const composite = signal
    ? new AbortController()
    : controller

  if (signal) {
    signal.addEventListener('abort', () => composite.abort(), { once: true })
  }

  // 合并默认头和自定义头
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify({ ...payload, response_mode: 'streaming' }),
    signal: composite.signal
  }).catch((e) => {
    handler.onError?.(e)
    return null as any
  })
  if (!res) return { abort: () => composite.abort() }

  if (!res.ok || !res.body) {
    const text = await res.text()
    handler.onError?.(new Error(text || `HTTP ${res.status}`))
    return { abort: () => composite.abort() }
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  ;(async () => {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''
        for (const part of parts) {
          const lines = part.split('\n').filter(Boolean)
          let dataStr = ''
          for (const l of lines) {
            if (l.startsWith('data:')) dataStr += l.slice(5).trim()
          }
          if (!dataStr) continue
          if (dataStr === '[DONE]') { handler.onDone?.(); return }
          try {
            const data = JSON.parse(dataStr)
            if (data.conversation_id) handler.onConversationId?.(data.conversation_id)
            if (typeof data.answer === 'string') handler.onChunk?.(data.answer)
            else if (data.data && typeof data.data.answer === 'string') handler.onChunk?.(data.data.answer)
          } catch {
            handler.onChunk?.(dataStr)
          }
        }
      }
      handler.onDone?.()
    } catch (err:any) {
      if (err?.name === 'AbortError') return
      handler.onError?.(err)
    }
  })()

  return { abort: () => composite.abort() }
}

export async function streamChat(req: ChatRequest, handler: SSEHandler, signal?: AbortSignal) {
  return streamSSE('/api/chat-messages', req, handler, signal)
}
export async function streamCompletion(req: CompletionRequest, handler: SSEHandler, signal?: AbortSignal) {
  return streamSSE('/api/completion-messages', req, handler, signal)
}

export interface ConversationsListResponse {
  limit: number
  has_more: boolean
  data: Array<{
    id: string
    name: string
    inputs: Record<string, any>
    status: string
    introduction: string | null
    created_at: number
    updated_at: number
  }>
}

/**
 * 获取会话列表
 * @param req 请求参数
 * @param headers 请求头
 * @returns 会话列表响应
 */
async function getConversations(req: GetConversationsRequest, headers?: Record<string, string>): Promise<ConversationsListResponse> {
  // 构建查询参数
  const params = new URLSearchParams()
  params.append('user', req.user)
  if (req.last_id) params.append('last_id', req.last_id)
  if (req.limit) params.append('limit', req.limit.toString())
  if (req.sort_by) params.append('sort_by', req.sort_by)

  // 合并默认头和自定义头
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  const res = await fetch(`/api/conversations?${params.toString()}`, {
    method: 'GET',
    headers: requestHeaders
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }

  return res.json()
}

export { streamSSE, getConversations }
