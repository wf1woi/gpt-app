# gpt app

使用 **pnpm + Vue 3 + Vite 5 + TypeScript + Pinia + Element Plus** 实现的前端项目，
基于 Dify API 文档实现的 **多助手聊天界面**，支持多种智能助手的集成与切换，
界面包含侧边栏（助手列表与会话管理）、聊天区域和设置页。

## 运行

1. 复制环境变量：

```bash
cp .env.example .env
# 编辑 .env，填入助手配置信息
```

2. 安装依赖并启动：

```bash
pnpm i
pnpm dev
# Vite: http://localhost:5173
# Server(proxy): http://localhost:8787
```

> 出于安全，API Key 配置在 `.env` 文件中，前端通过环境变量获取。

## 主要功能

- **多助手支持** —— 支持同时集成多个智能助手，通过侧边栏切换不同助手
- **对话功能** —— 调用 Dify Chatflow API 实现聊天功能，支持流式响应
- **会话管理** —— 最近会话、清空对话、新建会话，Pinia + localStorage 持久化
- **会话自动命名** —— 新会话根据首条消息自动命名，并标注所属助手
- **设置页** —— 语言、时区、是否保存历史、风格等配置
- **企业微信用户认证** —— 通过 URL 中的 code 参数获取用户工号，并保存在本地

## 代码要点

- **助手配置**：`src/utils/assistantConfig.ts` 管理所有助手配置，从环境变量加载
- **Dify 客户端**：`src/utils/dify.ts` 封装了 Dify API 调用，支持发送消息、获取历史、重命名会话等功能
- **状态管理**：`src/store/chat.ts` 使用 Pinia 管理会话状态，支持多助手会话隔离
- **路由设计**：`src/router/index.ts` 实现动态路由，支持根据助手 ID 切换聊天界面
- **代理设置**：`server/index.ts` 将请求转发到 Dify API，保留流式响应

## 如何配置新助手

要添加新的助手应用，只需在 `.env` 文件中添加以下配置：

```env
# 助手1配置
ASSISTANT_1_ID=your_assistant_id
ASSISTANT_1_KEY=your_api_key
ASSISTANT_1_URL=https://api.dify.ai/v1
ASSISTANT_1_NAME=助手名称
ASSISTANT_1_DESC=助手描述

# 助手2配置
ASSISTANT_2_ID=another_assistant_id
ASSISTANT_2_KEY=another_api_key
ASSISTANT_2_URL=https://api.dify.ai/v1
ASSISTANT_2_NAME=另一个助手
ASSISTANT_2_DESC=另一个助手的描述
```

系统会自动识别 `.env` 文件中的助手配置，并在侧边栏中显示。无需修改代码即可添加新助手。

## 项目结构

主要文件和目录结构：

```
src/
├── App.vue           # 根组件
├── main.ts           # 入口文件
├── router/           # 路由配置
├── store/            # 状态管理
│   └── chat.ts       # 聊天状态管理
├── components/       # 组件
│   ├── Sidebar.vue   # 侧边栏（助手列表与会话管理）
│   ├── ChatComposer.vue  # 聊天输入框
│   └── MessageList.vue   # 消息列表
├── views/            # 视图
│   ├── ChatView.vue  # 聊天界面
│   └── Settings.vue  # 设置页面
└── utils/            # 工具函数
    ├── assistantConfig.ts  # 助手配置
    ├── dify.ts       # Dify API 客户端
    └── uuid.ts       # UUID 工具
```
