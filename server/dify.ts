export interface AssistantInfo {
  baseUrl: string
  key: string
}

/**
 * 调用 Dify 停止接口，停止生成对话消息
 * @param assistant 助手配置，包含 baseUrl 和 API key
 * @param taskId 任务 ID，可在流式返回中获取
 * @param body 请求体，需包含 user 标识
 * @returns 上游返回的 JSON 结果
 */
export async function stopMessage(assistant: AssistantInfo, taskId: string, body: any) {
  const response = await fetch(`${assistant.baseUrl}/chat-messages/${taskId}/stop`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${assistant.key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `HTTP ${response.status}`)
  }

  return response.json()
}
