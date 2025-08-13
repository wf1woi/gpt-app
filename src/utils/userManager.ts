import { getUserByCode } from '../api/wecom';
import { uuidv4 } from './uuid';

/**
 * 用户信息管理类
 * 负责用户ID获取、会话ID管理及本地存储
 */
export class UserManager {
  private static USER_ID_KEY = 'user_id';
  private static CONVERSATION_IDS_KEY = 'conversation_ids';
  private static CODE_KEY = 'wecom_code';

  /**
   * 获取用户ID
   * 优先从企业微信获取工号，若无法获取则生成UUID
   * @returns 用户唯一标识
   */
  public static async getUserId(): Promise<string> {
    // 先从本地存储获取
    let userId = localStorage.getItem(this.USER_ID_KEY);
    if (userId) {
      return userId;
    }

    // 尝试从企业微信获取
    const code = localStorage.getItem(this.CODE_KEY);
    if (code) {
      const result = await getUserByCode(code);
      if (result.success && result.data) {
        userId = result.data;
        localStorage.setItem(this.USER_ID_KEY, userId);
        return userId;
      }
    }

    // 生成UUID作为备用
    userId = uuidv4();
    localStorage.setItem(this.USER_ID_KEY, userId);
    return userId;
  }

  /**
   * 设置企业微信授权码
   * @param code 企业微信授权code
   */
  public static setWecomCode(code: string): void {
    localStorage.setItem(this.CODE_KEY, code);
  }

  /**
   * 获取所有会话ID
   * @returns 会话ID数组
   */
  public static getConversationIds(): string[] {
    const idsStr = localStorage.getItem(this.CONVERSATION_IDS_KEY);
    return idsStr ? JSON.parse(idsStr) : [];
  }

  /**
   * 添加会话ID
   * @param conversationId 会话ID
   */
  public static addConversationId(conversationId: string): void {
    const ids = this.getConversationIds();
    if (!ids.includes(conversationId)) {
      ids.push(conversationId);
      localStorage.setItem(this.CONVERSATION_IDS_KEY, JSON.stringify(ids));
    }
  }

  /**
   * 删除会话ID
   * @param conversationId 会话ID
   */
  public static removeConversationId(conversationId: string): void {
    let ids = this.getConversationIds();
    ids = ids.filter(id => id !== conversationId);
    localStorage.setItem(this.CONVERSATION_IDS_KEY, JSON.stringify(ids));
  }

  /**
   * 清除所有用户数据
   */
  public static clearAll(): void {
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.CONVERSATION_IDS_KEY);
    localStorage.removeItem(this.CODE_KEY);
  }
}