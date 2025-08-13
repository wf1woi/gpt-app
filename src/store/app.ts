import { defineStore } from 'pinia'

export type AIStyle = 'balanced' | 'professional' | 'friendly' | 'creative'

export const useAppStore = defineStore('app', {
  state: () => ({
    language: 'zh-CN',
    // timezone: 'America/Los_Angeles',
    timezone: 'Asia/Shanghai',
    saveHistory: true,
    enableVoice: false,
    aiStyle: 'balanced' as AIStyle,
    userCode: '' // 用户工号
  }),
  actions: {
    load() {
      const s = localStorage.getItem('app.store')
      if (s) Object.assign(this, JSON.parse(s))
    },
    persist() {
      localStorage.setItem('app.store', JSON.stringify(this.$state))
    },
    /**
     * 设置用户工号
     * @param code - 用户工号
     */
    setUserCode(code: string) {
      this.userCode = code
      this.persist()
    },
    /**
     * 清除用户工号
     */
    clearUserCode() {
      this.userCode = ''
      this.persist()
    }
  }
})
