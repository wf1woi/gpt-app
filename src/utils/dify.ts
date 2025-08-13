import { assistantConfig } from './assistantConfig';
import { UserManager } from './userManager';
import { streamSSE, getConversations, stopMessage as apiStopMessage, GetConversationsRequest, ConversationsListResponse } from '../api/dify';

/**
 * Dify Chatflow API 调用工具
 */
export class DifyClient {

  /**
   * 获取会话列表
   * @param params 请求参数
   * @returns Promise<ConversationsListResponse>
   */
  public static async getConversationsList(params?: Partial<GetConversationsRequest>): Promise<ConversationsListResponse> {
    const assistant = assistantConfig.getCurrentAssistant();
    if (!assistant) {
      throw new Error('No assistant selected');
    }

    // 获取用户标识
    const user = await UserManager.getUserId();

    // 构建请求参数
    const requestParams: GetConversationsRequest = {
      user: user,
      ...params
    };

    const headers = {
      'Authorization': `Bearer ${assistant.key}`
    };

    try {
      return await getConversations(requestParams, headers);
    } catch (error) {
      console.error('Error getting conversations list:', error);
      throw error;
    }
  }

  /**
   * 发送消息到Dify Chatflow API
   * @param message 要发送的消息
   * @param chatId 对话ID，用于继续之前的对话
   * @param streamCallback 流式响应回调函数
   * @returns Promise<void>
   */
  public static async sendMessage(
    message: string,
    chatId?: string,
    streamCallback?: (chunk: string, isFinal: boolean) => void,
    taskCallback?: (taskId: string) => void
  ): Promise<void> {
    const assistant = assistantConfig.getCurrentAssistant();
    if (!assistant) {
      throw new Error('No assistant selected');
    }

    const url = `${assistant.baseUrl}/chat-messages`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${assistant.key}`
    };

    // 获取用户标识
    const user = await UserManager.getUserId();

    const body = {
      query: message,
      response_mode: 'streaming',
      conversation_id: chatId,
      user: user,
      inputs: {}
    };

    try {
      // 使用streamSSE函数处理流式响应
      const controller = await streamSSE(url, body, {
        onConversationId: (id: string) => {
          if (!chatId) {
            chatId = id;
            // 存储会话ID
            UserManager.addConversationId(id);
          }
        },
        onTaskId: (id: string) => {
          if (taskCallback) taskCallback(id)
        },
        onChunk: (text: string) => {
          if (streamCallback) {
            streamCallback(text, false);
          }
        },
        onDone: () => {
          if (streamCallback) {
            streamCallback('', true);
          }
        },
        onError: (error: unknown) => {
          console.error('Error sending message to Dify:', error);
          throw error;
        }
      }, undefined, headers);

      // 存储控制器以便需要时中止请求
      if (streamCallback) {
        // 可以在这里添加中止逻辑
      }
    } catch (error) {
      console.error('Error sending message to Dify:', error);
      throw error;
    }
  }

  /**
   * 获取对话历史
   * @param chatId 对话ID
   * @returns Promise<any[]>
   */
  public static async getChatHistory(chatId: string): Promise<any[]> {
    const assistant = assistantConfig.getCurrentAssistant();
    if (!assistant) {
      throw new Error('No assistant selected');
    }

    const url = `${assistant.baseUrl}/conversations/${chatId}/messages`;
    const headers = {
      'Authorization': `Bearer ${assistant.key}`
    };

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  /**
   * 停止当前回答生成
   * @param taskId 任务 ID
   */
  public static async stop(taskId: string): Promise<void> {
    const assistant = assistantConfig.getCurrentAssistant()
    if (!assistant) {
      throw new Error('No assistant selected')
    }

    const user = await UserManager.getUserId()

    try {
      await apiStopMessage(taskId, user, assistant.id)
    } catch (error) {
      console.error('Error stopping message:', error)
      throw error
    }
  }

  /**
   * 重命名对话
   * @param chatId 对话ID
   * @param newName 新名称
   * @returns Promise<void>
   */
  public static async renameChat(chatId: string, newName: string): Promise<void> {
    const assistant = assistantConfig.getCurrentAssistant();
    if (!assistant) {
      throw new Error('No assistant selected');
    }

    const url = `${assistant.baseUrl}/conversations/${chatId}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${assistant.key}`
    };

    const body = {
      name: newName
    };

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
      throw error;
    }
  }
}