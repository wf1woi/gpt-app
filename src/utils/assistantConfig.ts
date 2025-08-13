import { ref, computed } from 'vue';

// 仅在服务器环境中导入dotenv
let dotenv: typeof import('dotenv');
if (typeof window === 'undefined') {
  // 使用动态导入加载dotenv
  import('dotenv').then(module => {
    dotenv = module;
  }).catch(error => {
    console.error('[assistantConfig] Error importing dotenv:', error);
  });
}

/**
 * 助手对象接口定义
 */
export interface Assistant {
  id: string;
  key: string;
  baseUrl: string;
  name: string;
  description?: string;
}

/**
 * 助手配置管理类
 * 负责从环境变量中读取助手配置并提供访问方法
 */
export class AssistantConfig {
  private static instance: AssistantConfig;
  private assistants: Map<string, Assistant> = new Map();
  private currentAssistantId = ref<string>('');
  private initialized = false;
  private initPromise: Promise<void>;

  private constructor() {
    // 异步初始化
    this.initPromise = this.initialize().catch(error => {
      console.error('[assistantConfig] Initialization error:', error);
    });
  }

  /**
   * 异步初始化方法
   */
  private async initialize() {
    // 在服务器环境下，确保加载.env文件
    if (typeof window === 'undefined') {
      try {
        const module = await import('dotenv');
        const result = module.config();
        if (result.error) {
          console.error('[assistantConfig] Error loading .env file:', result.error);
        } else {
          // 确保环境变量加载完成后再加载助手配置
          this.loadAssistants();
          this.initialized = true;
          return;
        }
      } catch (error) {
        console.error('[assistantConfig] Error importing dotenv:', error);
      }
    }

    // 非服务器环境或加载.env失败时，直接加载助手配置
    this.loadAssistants();
    this.initialized = true;
  }

  /**
   * 等待初始化完成
   */
  public async waitForInit() {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): AssistantConfig {
    if (!AssistantConfig.instance) {
      AssistantConfig.instance = new AssistantConfig();
    }
    return AssistantConfig.instance;
  }

  /**
   * 从环境变量加载助手配置
   */
  private loadAssistants(): void {
    // 检测当前环境
    const isBrowser = typeof window !== 'undefined'
    let env: Record<string, string | undefined> = {}

    if (isBrowser) {
      env = import.meta.env
    } else {
      // 服务器环境下，直接使用process.env
      env = process.env
    }
    
    // 遍历所有环境变量，查找助手配置
    // 分别处理带VITE_前缀和不带VITE_前缀的环境变量
    const prefixes = ['ASSISTANT_', 'VITE_ASSISTANT_'];

    prefixes.forEach(prefix => {
      Object.keys(env).forEach(key => {
        if (key.startsWith(prefix) && key.endsWith('_KEY')) {
          // 根据前缀提取助手ID
          const id = key.replace(prefix, '').replace('_KEY', '').toLowerCase();
          const assistantKey = env[key] as string;
          // 根据前缀生成对应的键
          const baseUrlKey = `${prefix}${id.toUpperCase()}_BASE_URL`;
          const nameKey = `${prefix}${id.toUpperCase()}_NAME`;
          const descriptionKey = `${prefix}${id.toUpperCase()}_DESCRIPTION`;

          const baseUrl = env[baseUrlKey] as string;
          const name = env[nameKey] as string;
          const description = env[descriptionKey] as string | undefined;

          if (assistantKey && baseUrl && name) {
            this.assistants.set(id, {
              id,
              key: assistantKey,
              baseUrl,
              name,
              description
            });
            console.log(`[assistantConfig] Added assistant: ${id} - ${name}`)
          } else {
            console.log(`[assistantConfig] Missing required fields for assistant ${id}: key=${!!assistantKey}, baseUrl=${!!baseUrl}, name=${!!name}`)
          }
        }
      });
    });

    // 设置默认助手（如果有）
    if (this.assistants.size > 0) {
      this.currentAssistantId.value = Array.from(this.assistants.keys())[0];
    }
  }

  /**
   * 获取所有助手
   */
  public getAllAssistants(): Assistant[] {
    return Array.from(this.assistants.values());
  }

  /**
   * 获取当前选中的助手
   */
  public getCurrentAssistant(): Assistant | undefined {
    return this.assistants.get(this.currentAssistantId.value);
  }

  /**
   * 设置当前助手
   * @param id 助手ID
   */
  public setCurrentAssistant(id: string): void {
    if (this.assistants.has(id)) {
      this.currentAssistantId.value = id;
    }
  }

  /**
   * 响应式获取当前助手
   */
  public useCurrentAssistant() {
    return computed(() => this.getCurrentAssistant());
  }
}

// 创建并导出单例实例
export const assistantConfig = AssistantConfig.getInstance();