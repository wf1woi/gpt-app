# 变更日志

## [未发布]

### 新增
- 创建独立的用户信息管理模块 `userManager.ts`

### 变更
- 将用户标识获取和会话ID管理功能从 `dify.ts` 分离到 `userManager.ts`
- 使用企业微信API获取工号作为用户标识，若无法获取则生成UUID
- 将会话ID存储到本地localStorage中

### 修复
- 修复Dify API请求缺少必填参数`inputs`的问题
- 修复了 api/dify.ts 中 streamSSE 函数未导出的问题，解决了 utils/dify.ts 导入报错的问题
- 修复了 API 请求缺少 Authorization 头的问题，在 streamSSE 函数中添加了 headers 参数支持

## 2025-08-12
- 删除assistantConfig.ts中的无用调试日志，保留重要日志
- 服务器代理功能增强
  - 实现动态助手配置代理，根据请求头中的x-assistant-id选择不同助手的API密钥和基础URL
  - 移除硬编码的DIFY_API_KEY和BASE_URL配置
  - 新增/api/assistants端点，用于获取所有配置的助手信息
  - 优化错误处理，添加助手不存在和缺少助手ID的检查
- 类型定义优化
  - 修复env.d.ts中BASE_URL修饰符不一致的问题
  - 解决ImportMetaEnv重复声明的错误
  - 重构环境变量类型定义，分离通用环境变量和助手环境变量
- 代码错误修复
  - 修复ChatView.vue中的类型错误：找不到名称"props"和类型不匹配问题
  - 使用currentAssistant.value?.id代替props.type
  - 使用name.value获取计算属性值，解决ComputedRef<string>不能赋值给string的问题
- 多助手架构重构
  - 实现从.env文件自动加载多个助手配置
  - 新增`/src/utils/assistantConfig.ts`管理助手配置
  - 重构`/src/utils/dify.ts`为通用Dify客户端类
  - 支持根据助手ID动态创建Dify客户端实例
- 会话管理系统升级
  - 重构`/src/store/chat.ts`支持多助手会话隔离
  - 实现会话自动命名功能
  - 添加会话所属助手标识
- 路由系统优化
  - 实现动态路由`/chat/:id`支持多助手切换
  - 移除固定助手路由配置
- UI界面更新
  - 侧边栏支持动态渲染多个助手
  - 会话卡片显示助手名称和标识
  - 设置按钮移至侧边栏顶部
- 文件结构优化
  - 删除`/src/views/MeetingChat.vue`，使用通用`ChatView.vue`
  - 更新项目文档：README.md、STRUCTURE.md
- 添加企业微信用户认证功能
  - 实现通过URL中的code参数获取用户工号
  - 新增`/src/api/wecom.ts`文件处理用户信息请求
  - 在路由守卫中添加参数解析和用户信息获取逻辑
  - 在Pinia store中添加用户工号存储和管理
- 智能会议助手相关名称和文件变更
  - 将`/src/views/GeneralChat.vue`重命名为`/src/views/MeetingChat.vue`
  - 更新路由配置，只保留智能会议助手的路由
  - 修改`/src/views/ChatView.vue`文件，更新type类型定义和map对象
  - 更新`/src/store/chat.ts`文件，只保留'meeting'类型
  - 修改`/src/components/Sidebar.vue`文件，只保留智能会议助手的菜单项
  - 删除其他未使用的助手文件：CodeChat.vue、CreativeChat.vue、ImageAssist.vue
- 更新README.md文件
  - 添加关于如何新增助手应用的详细说明


