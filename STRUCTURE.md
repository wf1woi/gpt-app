# 项目结构

```
.
├── .env                  # 环境变量配置文件
├── .env.example          # 环境变量示例配置文件
├── .gitignore            # Git 忽略文件配置
├── CHANGELOG.md          # 变更日志
├── README.md             # 项目介绍
├── index.html            # 入口 HTML 文件
├── package.json          # 项目配置和依赖声明
├── pnpm-lock.yaml        # pnpm 锁文件
├── server/               # 后端代理服务目录
│   └── index.ts          # 后端代理服务入口文件
├── src/                  # 前端源码目录
│   ├── App.vue           # 根组件
│   ├── api/              # API 接口目录
│   │   ├── dify.ts       # Dify API 接口实现
│   │   └── wecom.ts      # 企业微信 API 接口实现
│   ├── components/       # 公共组件目录
│   │   ├── ChatComposer.vue  # 聊天输入组件
│   │   ├── MessageItem.vue    # 消息项组件
│   │   ├── MessageList.vue    # 消息列表组件
│   │   ├── NewChatDialog.vue  # 新建聊天对话框组件
│   │   ├── Sidebar.vue        # 侧边栏组件
│   │   └── Topbar.vue         # 顶部栏组件
│   ├── main.ts           # 前端入口文件
│   ├── router/           # 路由配置目录
│   │   └── index.ts      # 路由配置文件
│   ├── shims-vue.d.ts    # Vue 类型声明文件
│   ├── store/            # 状态管理目录
│   │   ├── app.ts        # 应用状态管理
│   │   └── chat.ts       # 聊天状态管理
│   ├── utils/            # 工具函数目录
│   │   ├── assistantConfig.ts  # 助手配置工具
│   │   ├── dify.ts       # Dify API 客户端
│   │   ├── userManager.ts  # 用户管理工具
│   │   └── uuid.ts       # UUID 工具函数
│   └── views/            # 页面视图目录
│       ├── ChatView.vue     # 聊天视图
│       └── Settings.vue     # 设置视图
├── tsconfig.json         # TypeScript 配置文件
└── vite.config.ts        # Vite 配置文件
```