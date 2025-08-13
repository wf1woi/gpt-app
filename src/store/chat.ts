import { defineStore } from 'pinia'
import { uuidv4 } from '@/utils/uuid'

export type Role = 'user' | 'assistant'
export interface ChatMessage { id: string; role: Role; content: string; time: string }

export interface ChatSession {
  id: string
  title: string
  assistantId: string
  conversationId?: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  streaming?: boolean
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    currentAssistantId: '',
    sessions: [] as ChatSession[],
    newChatDialogOpen: false
  }),
  getters: {
    sessionsByAssistantId: (state) => (assistantId: string) => state.sessions.filter(x => x.assistantId === assistantId).sort((a,b)=>b.updatedAt-a.updatedAt),
    currentSessions(): ChatSession[] { 
      return this.sessionsByAssistantId(this.currentAssistantId) 
    },
    currentSession(): ChatSession | undefined { 
      return this.sessionsByAssistantId(this.currentAssistantId)[0] 
    }
  },
  actions: {
    load() {
      const raw = localStorage.getItem('chat.store')
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          // 迁移旧数据
          if (Array.isArray(parsed)) {
            // 旧版本数据格式（仅包含sessions数组）
            this.sessions = parsed.map((session: any) => {
              if (session.type && !session.assistantId) {
                return {
                  ...session,
                  assistantId: session.type,
                  type: undefined
                };
              }
              return session;
            });
          } else {
            // 新版本数据格式
            this.sessions = parsed.sessions.map((session: any) => {
              if (session.type && !session.assistantId) {
                return {
                  ...session,
                  assistantId: session.type,
                  type: undefined
                };
              }
              return session;
            });
            this.currentAssistantId = parsed.currentAssistantId || '';
          }
        } catch {}
      }
    },
    persist() {
      localStorage.setItem('chat.store', JSON.stringify({
        sessions: this.sessions,
        currentAssistantId: this.currentAssistantId
      }))
    },
    openNewChatDialog() { this.newChatDialogOpen = true },
    closeNewChatDialog() { this.newChatDialogOpen = false },
    newSession(assistantId: string, title = '新会话') {
      const s: ChatSession = {
        id: uuidv4(),
        assistantId,
        title,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        streaming: false
      }

      // 从环境变量加载初始提示词
      const initialPrompt = import.meta.env.VITE_CHAT_INITIAL_PROMPT;
      if (initialPrompt) {
        s.messages.push({
          id: uuidv4(),
          role: 'assistant' as Role,
          content: initialPrompt,
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
      }

      this.sessions.unshift(s)
      this.persist()
      return s
    },
    renameSession(id: string, title: string) {
      const s = this.sessions.find(x => x.id === id)
      if (!s) return
      s.title = title
      s.updatedAt = Date.now()
      this.persist()
    },
    selectAssistant(assistantId: string) { this.currentAssistantId = assistantId },
    removeSession(id: string) {
      this.sessions = this.sessions.filter(s => s.id !== id)
      this.persist()
    },
    addMessage(sessionId: string, role: Role, content: string) {
      const s = this.sessions.find(x => x.id === sessionId)
      if (!s) return
      s.messages.push({ id: uuidv4(), role, content, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) })
      s.updatedAt = Date.now()
      this.persist()
    },
    setConversationId(sessionId: string, cid: string) {
      const s = this.sessions.find(x => x.id === sessionId)
      if (!s) return
      s.conversationId = cid
      this.persist()
    },
    resetSession(sessionId: string) {
      const s = this.sessions.find(x => x.id === sessionId)
      if (!s) return
      s.messages = []
      delete s.conversationId
      s.updatedAt = Date.now()
      this.persist()
    },
    setStreaming(sessionId: string, v: boolean) {
      const s = this.sessions.find(x => x.id === sessionId)
      if (!s) return
      s.streaming = v
      this.persist()
    }
  }
})
