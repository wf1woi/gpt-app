import express from 'express';
import dotenv from 'dotenv';

// 加载.env文件
const result = dotenv.config();
if (result.error) {
  console.error('Error loading .env file:', result.error);
}
import cors from 'cors'

// 导入助手配置管理类
import { AssistantConfig } from '../src/utils/assistantConfig'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8787

// 初始化助手配置
const assistantConfig = AssistantConfig.getInstance()

// 等待助手配置初始化完成
assistantConfig.waitForInit().then(() => {
  const allAssistants = assistantConfig.getAllAssistants()
  console.log(`[server] Found ${allAssistants.length} assistants:`, allAssistants.map(a => a.id))
  const assistants = new Map(allAssistants.map(a => [a.id, a]))

  // 如果没有配置助手，输出警告
  if (assistants.size === 0) {
    console.warn('[WARN] No assistants configured. Please set ASSISTANT_* or VITE_ASSISTANT_* environment variables.')
  }

  /**
   * 根据ID获取助手配置
   * @param id 助手ID
   * @returns 助手配置或undefined
   */
  function getAssistant(id: string): any {
    return assistants.get(id)
  }

  /**
   * 动态代理请求到指定助手的API
   * @param assistantId - 助手ID
   * @param path - API路径
   * @param body - 请求体
   * @param res - 响应对象
   */
  async function proxyPost(assistantId: string, path: string, body: any, res: any) {
    try {
      // 获取助手配置
      const assistant = getAssistant(assistantId)
      
      if (!assistant) {
        res.status(404).json({ error: `Assistant with id '${assistantId}' not found` })
        return
      }
      
      const upstream = await fetch(`${assistant.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${assistant.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const contentType = upstream.headers.get('content-type') || ''
      res.status(upstream.status)
      
      if (contentType.includes('text/event-stream')) {
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.flushHeaders && res.flushHeaders()
        
        if (upstream.body) {
          // 处理流式响应
          const reader = upstream.body.getReader()
          const decoder = new TextDecoder('utf-8')
          
          // 发送数据块
          const processStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                
                const chunk = decoder.decode(value, { stream: true })
                res.write(chunk)
              }
              res.end()
            } catch (err) {
              console.error('Stream error:', err)
              res.end()
            }
          }
          
          processStream().catch(err => {
            console.error('Stream processing error:', err)
            res.end()
          })
        } else {
          res.end()
        }
      } else {
        const data = await upstream.text()
        res.setHeader('Content-Type', contentType)
        res.send(data)
      }
    } catch (e: any) {
      console.error(e)
      if (!res.headersSent) {
        res.status(500).json({ error: e?.message || 'proxy error' })
      }
    }
  }

  app.post('/api/chat-messages', async (req, res) => {
    const body = req.body || {} 
    const assistantId = req.headers['x-assistant-id'] as string || ''
    
    if (!assistantId) {
      res.status(400).json({ error: 'Assistant ID is required' })
      return
    }
    
    if (!body.response_mode) body.response_mode = 'streaming'
    await proxyPost(assistantId, '/chat-messages', body, res)
  })

  app.post('/api/completion-messages', async (req, res) => {
    const body = req.body || {} 
    const assistantId = req.headers['x-assistant-id'] as string || ''
    
    if (!assistantId) {
      res.status(400).json({ error: 'Assistant ID is required' })
      return
    }
    
    if (!body.response_mode) body.response_mode = 'streaming'
    await proxyPost(assistantId, '/completion-messages', body, res)
  })

  // 获取所有助手信息
  app.get('/api/assistants', (_, res) => {
    res.json(Array.from(assistants.values()))
  })
})

// 初始路由处理 - 在助手配置加载完成前返回临时响应
app.get('/api/assistants', (_, res) => {
  res.status(202).json({ message: 'Assistants are still loading. Please try again later.' })
})

app.post('/api/chat-messages', (req, res) => {
  const assistantId = req.headers['x-assistant-id'] as string || ''
  res.status(202).json({ message: `Assistant ${assistantId} is still loading. Please try again later.` })
})

app.post('/api/completion-messages', (req, res) => {
  const assistantId = req.headers['x-assistant-id'] as string || ''
  res.status(202).json({ message: `Assistant ${assistantId} is still loading. Please try again later.` })
})

app.get('/', (_, res) => {
  res.send('Dify proxy is running. POST /api/chat-messages or /api/completion-messages')
})

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
