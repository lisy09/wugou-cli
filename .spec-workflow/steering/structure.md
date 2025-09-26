# 项目结构

## 目录组织

```
gemini-cli/
├── packages/                    # 单体仓库包结构
│   ├── cli/                     # 主要CLI应用程序
│   ├── core/                    # 核心功能库
│   ├── a2a-server/             # Agent-to-Agent服务器
│   ├── test-utils/             # 共享测试工具
│   └── vscode-ide-companion/   # VS Code扩展
├── scripts/                     # 构建和开发脚本
├── integration-tests/          # 端到端集成测试
├── docs/                       # 项目文档
├── third_party/                # 第三方依赖
├── .github/                    # GitHub工作流和配置
├── .spec-workflow/             # 规范工作流配置
└── bundle/                     # 构建输出目录
```

## 包结构模式

### CLI包 (`packages/cli/`)
- **主要入口**: `dist/index.js` (构建后)
- **源代码**: `src/` 目录
- **类型**: 使用React Ink的交互式CLI应用程序
- **依赖**: 依赖core包，包含UI和业务逻辑

### Core包 (`packages/core/`)
- **主要入口**: `dist/index.js` (构建后)
- **源代码**: `src/` 目录
- **类型**: 核心功能库
- **依赖**: 包含共享工具、API客户端、文件系统操作

### A2A服务器 (`packages/a2a-server/`)
- **主要入口**: 独立服务器应用程序
- **源代码**: `src/` 目录
- **类型**: Agent-to-Agent通信服务器
- **依赖**: 依赖core包，提供MCP协议支持

### VS Code伴侣 (`packages/vscode-ide-companion/`)
- **主要入口**: VS Code扩展入口点
- **源代码**: `src/` 目录
- **类型**: VS Code扩展
- **依赖**: 依赖core包，提供IDE集成功能

## 命名约定

### 文件
- **组件/模块**: `PascalCase` (例如: `FileManager.ts`, `GitClient.ts`)
- **工具/助手**: `camelCase` (例如: `fileUtils.ts`, `gitHelpers.ts`)
- **测试文件**: `[filename].test.ts` (例如: `fileManager.test.ts`)
- **配置文件**: `kebab-case` (例如: `esbuild.config.js`, `eslint.config.js`)

### 代码
- **类/类型**: `PascalCase` (例如: `FileManager`, `GitClient`)
- **函数/方法**: `camelCase` (例如: `getFileContent`, `processGitDiff`)
- **常量**: `UPPER_SNAKE_CASE` (例如: `MAX_FILE_SIZE`, `DEFAULT_TIMEOUT`)
- **变量**: `camelCase` (例如: `filePath`, `gitStatus`)
- **接口**: `PascalCase` 前缀 `I` (例如: `IFileManager`, `IGitClient`)
- **类型**: `PascalCase` (例如: `FileType`, `GitStatus`)

## 导入模式

### 导入顺序
1. 外部依赖 (react, ink, 等)
2. 内部包依赖 (@google/gemini-cli-core)
3. 相对导入 (./types, ../utils/logger)
4. 类型导入 (type 关键字)

### 模块组织
```typescript
// 外部依赖
import React from 'react';
import { render } from 'ink';

// 内部包
import { FileManager } from '@google/gemini-cli-core';

// 相对导入
import { logger } from '../utils/logger.js';
import type { FileOptions } from './types.js';
```

### ES模块约定
- 所有导入必须使用 `.js` 扩展名
- 使用 `node:` 协议导入Node.js内置模块
- 支持动态导入用于代码分割

## 代码结构模式

### 文件组织
```typescript
// 1. 导入语句
import { something } from 'module';

// 2. 类型定义
interface MyInterface {
  // ...
}
type MyType = string | number;

// 3. 常量定义
const MAX_RETRIES = 3;

// 4. 主要实现
export class MyClass {
  // 构造函数
  constructor() {}
  
  // 公共方法
  public method() {}
  
  // 私有方法
  private helper() {}
}

// 5. 导出语句
export { MyClass };
export type { MyInterface };
```

### 函数组织
```typescript
export async function processFile(
  filePath: string,
  options: FileOptions,
): Promise<Result> {
  // 1. 输入验证
  if (!filePath) {
    throw new Error('File path is required');
  }
  
  // 2. 核心逻辑
  const content = await readFile(filePath);
  const processed = await transformContent(content, options);
  
  // 3. 错误处理
  if (!processed) {
    throw new ProcessingError('Failed to process file');
  }
  
  // 4. 返回结果
  return { success: true, data: processed };
}
```

## 代码组织原则

1. **单一职责**: 每个文件应该有一个明确的目的，类和方法应该专注单一功能
2. **模块化**: 代码应该组织成可重用的模块，便于测试和维护
3. **类型安全**: 使用TypeScript严格模式，确保类型安全
4. **错误处理**: 所有异步操作都应该有适当的错误处理
5. **可测试性**: 结构化代码以便于单元测试和集成测试

## 模块边界

### 包间依赖
- **cli → core**: CLI包依赖core包获取核心功能
- **a2a-server → core**: A2A服务器依赖core包获取共享工具
- **vscode-ide-companion → core**: VS Code扩展依赖core包获取IDE功能
- **无循环依赖**: 包之间不允许循环依赖

### 公共API vs 内部实现
- **公共API**: 每个包的主要入口文件暴露公共API
- **内部实现**: 具体实现细节保持在包内部
- **类型导出**: 重要类型定义应该导出供其他包使用

### 平台特定代码
- **Node.js特定**: 文件系统操作、进程管理等
- **跨平台支持**: 路径处理、行结束符等考虑跨平台兼容性
- **可选依赖**: platform-specific依赖使用optionalDependencies

## 代码大小指南

### 文件大小
- **最大500行**: 单个文件不应该超过500行代码
- **逻辑分组**: 相关功能应该分组到同一文件
- **过早优化**: 避免过早拆分文件

### 函数大小
- **最大50行**: 单个函数不应该超过50行代码
- **单一职责**: 函数应该只做一件事并做好
- **早期返回**: 使用早期返回减少嵌套

### 类复杂度
- **最多10个方法**: 类不应该有超过10个公共方法
- **高内聚**: 类的方法应该紧密相关
- **继承慎用**: 优先使用组合而非继承

## 仪表板/监控结构

### 监控集成
```
packages/
└── core/
    └── src/
        └── telemetry/        # 遥测和监控
            ├── exporters/    # 数据导出器
            ├── instrumentation/ # 仪器化
            └── utils/         # 监控工具
```

### 关注点分离
- **业务逻辑**: 核心业务逻辑与监控代码分离
- **可观测性**: 使用OpenTelemetry进行分布式追踪
- **日志记录**: 结构化日志记录，支持多个级别
- **性能监控**: 关键操作性能指标收集

## 测试结构

### 测试组织
```
packages/
├── [package-name]/
│   ├── src/                 # 源代码
│   │   └── [module].test.ts # 同文件测试
│   └── tests/               # 集成测试
└── integration-tests/       # 端到端测试
```

### 测试类型
- **单元测试**: 使用Vitest，与源代码同目录
- **集成测试**: 在integration-tests目录
- **端到端测试**: 完整的用户场景测试
- **覆盖率**: 要求较高的代码覆盖率

## 文档标准

### 代码文档
- **公共API**: 所有公共函数和类必须有JSDoc注释
- **复杂逻辑**: 复杂算法和业务逻辑需要详细注释
- **类型定义**: 重要的类型定义需要文档说明
- **示例代码**: 关键功能提供使用示例

### 项目文档
- **README**: 每个包应该有README说明用途和使用方法
- **架构文档**: 重要架构决策需要文档记录
- **API文档**: 公共API生成自动化文档
- **贡献指南**: 代码贡献和开发流程说明