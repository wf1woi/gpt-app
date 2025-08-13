/// <reference types="vite/client" />

// 助手环境变量接口
interface AssistantEnv {
  [key: `VITE_ASSISTANT_${string}`]: string | undefined;
}

// 通用环境变量接口
interface CommonEnv {
  // 通用环境变量定义
  readonly NODE_ENV: 'development' | 'production' | 'test';
  readonly BASE_URL: string;
  // 可以添加其他全局环境变量
}

// 扩展ImportMetaEnv接口
interface ImportMetaEnv extends CommonEnv, AssistantEnv {}

// 扩展ImportMeta接口
interface ImportMeta {
  readonly env: ImportMetaEnv;
}