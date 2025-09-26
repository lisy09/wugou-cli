# 技术栈 - wugou-cli

## 项目类型
**CLI 工具** - 基于终端的 AI 助手应用程序，提供交互式命令行界面和智能化开发辅助功能。

## 核心技术

### 主要语言
- **语言**：TypeScript 5.3+ (ES2022/ES2023)
- **运行时**：Node.js 20.0.0+
- **模块系统**：ES Modules (ESM) with NodeNext 模块解析
- **编译器**：tsc (TypeScript 编译器) + esbuild (打包优化)

### 关键依赖/库

#### 核心框架和库
- **@google/genai (1.16.0)**：Google Gemini API 客户端，提供 AI 模型交互能力
- **react (19.1.0)**：用于构建终端用户界面的 React 组件系统
- **ink (6.2.3)**：React 驱动的终端 UI 框架，提供丰富的命令行界面
- **yargs (17.7.2)**：命令行参数解析和处理
- **@modelcontextprotocol/sdk (1.15.1)**：MCP (Model Context Protocol) 协议支持，用于扩展工具集成

#### 文件系统和操作
- **glob (10.4.5)**：文件模式匹配和搜索
- **simple-git (3.28.0)**：Git 操作和版本控制集成
- **diff (7.0.0)**：文本差异比较和显示
- **ignore (7.0.0)**：.gitignore 文件解析和处理
- **fdir (6.4.6)**：高性能文件系统遍历

#### 网络和数据处理
- **undici (7.10.0)**：现代 HTTP 客户端，用于网络请求
- **marked (15.0.12)**：Markdown 解析和渲染
- **highlight.js (11.11.1)**：代码语法高亮显示
- **html-to-text (9.0.5)**：HTML 到纯文本转换
- **zod (3.23.8)**：模式验证和运行时类型检查

#### 终端和交互
- **ink-gradient (3.0.0)**：终端文本渐变效果
- **ink-spinner (5.0.0)**：终端加载动画
- **lowlight (3.3.0)**：代码高亮引擎
- **fzf (0.5.2)**：模糊查找选择器
- **wrap-ansi (9.0.2)**：ANSI 文本换行处理

#### 系统和平台
- **node-pty (可选)**：终端伪终端支持，用于 shell 命令执行
- **@xterm/headless (5.5.0)**：无头终端仿真器
- **ws (8.18.0)**：WebSocket 支持，用于 IDE 集成

### 应用程序架构
**模块化插件架构** - 采用前后端分离设计：
- **CLI Package (packages/cli)**：用户界面和交互层
- **Core Package (packages/core)**：核心业务逻辑和 API 集成
- **Tools System**：可插拔的工具系统，支持动态扩展
- **Extension Framework**：基于 MCP 协议的扩展机制

### 数据存储
- **主存储**：文件系统（本地配置文件、历史记录、扩展插件）
- **缓存**：内存缓存（会话状态、临时数据）
- **数据格式**：JSON（配置）、Markdown（文档）、纯文本（日志）
- **配置位置**：`~/.gemini/` 目录存储用户配置和扩展

### 外部集成
- **API**：Google Gemini API、Google Search API、GitHub API
- **协议**：HTTP/REST、gRPC、WebSocket、MCP (Model Context Protocol)
- **认证**：OAuth 2.0、API Keys、Google Cloud Authentication
- **IDE 集成**：VS Code、Zed Editor 通过专用插件

### 监控与仪表板技术
- **仪表板框架**：React + Ink（终端内嵌仪表板）
- **实时通信**：WebSocket（localhost:49256）
- **可视化库**：终端原生图表、ASCII 艺术、彩色输出
- **状态管理**：React Hooks + Context API + 文件系统状态持久化

## 开发环境

### 构建与开发工具
- **构建系统**：npm scripts + 自定义 Node.js 构建脚本
- **包管理**：npm workspaces（monorepo 管理）
- **开发工作流**：热重载（文件监视）、调试模式、REPL 环境
- **构建优化**：esbuild（快速打包）、代码分割、Tree shaking

### 代码质量工具
- **静态分析**：ESLint 9.x（代码质量和正确性）
- **格式化**：Prettier（代码风格统一）
- **测试框架**：Vitest（单元测试、集成测试）、@testing-library/react（UI 测试）
- **类型检查**：TypeScript 编译器（严格模式）
- **代码覆盖率**：@vitest/coverage-v8

### 版本控制与协作
- **VCS**：Git（GitHub 托管）
- **分支策略**：GitHub Flow（主分支开发 + PR 合并）
- **代码审查**：GitHub Pull Request + Code Review
- **CI/CD**：GitHub Actions（自动化测试、构建、发布）

## 部署与分发

### 目标平台
- **开发环境**：macOS、Linux、Windows（Node.js 20+）
- **分发渠道**：npm 包管理器、GitHub Releases、Homebrew
- **系统要求**：Node.js 20.0.0+、现代终端（支持 ANSI）

### 分发方法
- **npm**：`npm install -g @google/gemini-cli`
- **npx**：`npx https://github.com/google-gemini/gemini-cli`
- **Homebrew**：`brew install gemini-cli`
- **Docker**：容器化部署支持

### 安装要求
- **运行时**：Node.js 20.0.0 或更高版本
- **可选依赖**：node-pty（增强终端功能）、Docker（沙箱环境）
- **网络**：访问 Google Gemini API 的网络连接

### 更新机制
- **自动更新**：update-notifier（更新提醒）
- **发布节奏**：每周预览版、每两周稳定版、每日夜间构建
- **版本管理**：语义化版本控制（SemVer）

## 技术需求与约束

### 性能要求
- **响应时间**：API 调用 < 2秒、本地工具 < 500ms、UI 渲染 < 100ms
- **内存使用**：基础内存 < 200MB、大型文件处理 < 1GB
- **启动时间**：冷启动 < 3秒、热启动 < 1秒
- **并发能力**：支持多会话并发、WebSocket 连接池管理

### 兼容性要求
- **平台支持**：macOS 10.15+、Linux (x64/ARM64)、Windows 10+
- **终端兼容**：支持主流终端（iTerm2、Windows Terminal、GNOME Terminal）
- **Node.js 版本**：20.0.0+（推荐使用最新 LTS 版本）
- **浏览器支持**：现代浏览器（用于 IDE 集成和 Web 仪表板）

### 安全与合规
- **安全要求**：沙箱执行环境、权限控制、敏感数据加密
- **数据保护**：本地数据加密、API 密钥安全存储、隐私模式
- **合规标准**：Apache 2.0 许可证、GDPR 兼容、企业安全标准
- **威胁模型**：代码注入防护、路径遍历防护、命令注入防护

### 可扩展性与可靠性
- **预期负载**：单用户多会话、企业级多用户部署
- **可用性要求**：99.9%+ 正常运行时间、优雅降级、错误恢复
- **扩展能力**：水平扩展（多实例）、垂直扩展（资源优化）
- **故障容错**：网络中断容错、API 降级处理、本地缓存机制

## 技术决策与理由

### 架构决策
1. **前后端分离**：CLI 与 Core 分离，支持多种前端（CLI、Web、IDE 插件）
2. **插件化工具系统**：基于 MCP 协议，支持动态加载和第三方扩展
3. **React + Ink 终端 UI**：提供现代化的终端交互体验
4. **TypeScript 严格模式**：确保代码质量和类型安全

### 库选择理由
1. **@google/genai**：官方 Gemini API 客户端，最佳兼容性和性能
2. **ink**：React 生态系统的终端 UI 解决方案，组件化开发
3. **vitest**：快速的测试运行器，支持 ESM 和现代 TypeScript
4. **zod**：运行时模式验证，提供类型安全和数据验证

### 性能优化
1. **esbuild**：快速的打包工具，减少构建时间
2. **代码分割**：按需加载，减少初始加载时间
3. **缓存策略**：多级缓存（内存、文件系统、网络）
4. **异步处理**：非阻塞 I/O，提高响应性能

## 已知限制

### 当前限制
- **中文支持**：基础 Gemini API 的中文理解能力有限，需要额外优化
- **网络依赖**：依赖 Google 服务的网络连接，国内访问可能需要优化
- **资源消耗**：内存使用较高，需要优化大型文件处理
- **平台差异**：不同操作系统的终端行为存在差异

### 技术债务
- **Monorepo 复杂性**：多包管理增加了开发和维护复杂度
- **类型定义**：部分第三方库的类型定义不够完善
- **测试覆盖率**：某些复杂交互场景的测试覆盖不足
- **文档同步**：技术文档需要与代码变更保持同步

### 未来改进方向
- **本地化优化**：增强中文处理能力，优化国内网络访问
- **性能优化**：减少内存占用，提高大型文件处理效率
- **跨平台一致性**：统一不同平台的行为和体验
- **企业级功能**：增强安全性、审计功能和合规性支持