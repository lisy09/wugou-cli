# 任务文档

- [ ] 1. 扩展AuthType枚举添加OpenAI兼容类型
  - 文件：packages/core/src/core/contentGenerator.ts
  - 在AuthType枚举中添加USE_OPENAI_COMPATIBLE值
  - 目的：为OpenAI兼容认证提供类型支持
  - _利用：现有的AuthType枚举模式_
  - _需求：需求1.1_
  - _提示：角色：专门从事TypeScript枚举和类型系统的TypeScript开发者 | 任务：在packages/core/src/core/contentGenerator.ts的AuthType枚举中添加USE_OPENAI_COMPATIBLE值，遵循现有枚举命名约定 | 限制：必须保持与现有认证类型的兼容性，不要修改现有枚举值，遵循项目命名规范 | 成功：新枚举值正确添加，无编译错误，与现有认证类型保持一致性_

- [ ] 2. 更新认证对话框添加OpenAI选项
  - 文件：packages/cli/src/ui/auth/AuthDialog.tsx
  - 在认证选项列表中添加OpenAI Compatible选项
  - 目的：让用户可以选择OpenAI兼容认证类型
  - _利用：现有的RadioButtonSelect组件_
  - _需求：需求1.1，需求2.1_
  - _提示：角色：专门从事React组件和UI开发的React开发者 | 任务：在packages/cli/src/ui/auth/AuthDialog.tsx的items数组中添加OpenAI Compatible选项，遵循现有选项格式 | 限制：必须保持与现有UI的一致性，正确处理选项选择逻辑，确保可访问性 | 成功：新选项正确显示在认证对话框中，用户可以选择，选择后触发正确的认证流程_

- [ ] 3. 创建OpenAI配置验证函数
  - 文件：packages/cli/src/config/auth.ts
  - 添加validateOpenAIConfig函数验证OpenAI配置参数
  - 目的：验证OpenAI认证所需的配置是否完整有效
  - _利用：现有的validateAuthMethod模式_
  - _需求：需求2.1，需求2.2_
  - _提示：角色：专门从事配置验证和错误处理的Node.js开发者 | 任务：在packages/cli/src/config/auth.ts中添加OpenAI配置验证逻辑，检查base_url、api_key和model_name的有效性 | 限制：必须遵循现有验证模式，提供清晰的错误消息，正确处理环境变量 | 成功：验证函数正确检查所有必需参数，返回适当的错误消息，与现有验证系统集成_

- [ ] 4. 添加OpenAI环境变量支持
  - 文件：packages/cli/src/config/auth.ts（继续）
  - 在validateAuthMethod中添加OPENAI_BASE_URL、OPENAI_API_KEY、OPENAI_MODEL_NAME检查
  - 目的：支持通过环境变量配置OpenAI认证参数
  - _利用：现有的环境变量访问模式_
  - _需求：需求2.1_
  - _提示：角色：专门从事环境配置和系统集成Node.js开发者 | 任务：扩展validateAuthMethod函数添加对OpenAI环境变量的支持，遵循现有环境变量处理模式 | 限制：必须保持与现有认证类型的兼容性，正确处理缺失的环境变量，提供有用的错误消息 | 成功：环境变量正确读取和验证，缺失时提供清晰错误，与现有环境变量系统集成_

- [ ] 5. 更新内容生成器配置创建函数
  - 文件：packages/core/src/core/contentGenerator.ts
  - 在createContentGeneratorConfig中添加OpenAI配置分支
  - 目的：为OpenAI认证创建适当的配置对象
  - _利用：现有的ContentGeneratorConfig模式_
  - _需求：需求2.1，需求3.1_
  - _提示：角色：专门从事配置对象创建和工厂模式的TypeScript开发者 | 任务：在packages/core/src/core/contentGenerator.ts的createContentGeneratorConfig函数中添加OpenAI分支，正确设置apiKey和vertexai标志 | 限制：必须遵循现有配置模式，正确处理环境变量，保持与现有认证类型的兼容性 | 成功：OpenAI配置正确创建，包含所有必要参数，与现有配置对象保持一致性_

- [ ] 6. 实现OpenAI内容生成器
  - 文件：packages/core/src/core/openAIContentGenerator.ts（新文件）
  - 创建实现ContentGenerator接口的OpenAI兼容生成器
  - 目的：提供OpenAI兼容的API内容生成功能
  - _利用：现有的ContentGenerator接口，GoogleGenAI客户端_
  - _需求：需求3.1，需求3.2_
  - _提示：角色：专门从事API集成和内容生成的全栈开发者 | 任务：创建新的OpenAIContentGenerator类实现ContentGenerator接口，使用GoogleGenAI配置为OpenAI兼容模式 | 限制：必须完全实现接口所有方法，正确处理OpenAI API格式，保持与现有生成器的一致性 | 成功：生成器正确实现所有接口方法，正确处理OpenAI API调用和响应，与现有内容生成器行为一致_

- [ ] 7. 更新内容生成器工厂函数
  - 文件：packages/core/src/core/contentGenerator.ts（继续）
  - 在createContentGenerator函数中添加OpenAI分支
  - 目的：根据认证类型创建适当的OpenAI内容生成器
  - _利用：现有的工厂模式，新创建的OpenAIContentGenerator_
  - _需求：需求3.1_
  - _提示：角色：专门从事工厂模式和对象创建的TypeScript开发者 | 任务：在packages/core/src/core/contentGenerator.ts的createContentGenerator函数中添加OpenAI认证类型分支，实例化OpenAIContentGenerator | 限制：必须遵循现有工厂模式，正确处理配置参数，保持错误处理一致性 | 成功：工厂函数正确识别OpenAI认证类型并创建适当的生成器，错误处理适当，与现有工厂逻辑集成_

- [ ] 8. 添加OpenAI设置到设置模式
  - 文件：packages/cli/src/config/settingsSchema.ts
  - 在security.auth下添加OpenAI相关设置属性
  - 目的：支持通过设置系统存储OpenAI配置参数
  - _利用：现有的设置模式结构_
  - _需求：需求2.1，需求2.2_
  - _提示：角色：专门从事配置模式和架构定义的TypeScript开发者 | 任务：在packages/cli/src/config/settingsSchema.ts的security.auth对象下添加openaiBaseUrl、openaiApiKey、openaiModelName属性定义 | 限制：必须遵循现有设置模式约定，正确设置类型和默认值，保持与现有认证设置的兼容性 | 成功：新设置属性正确添加到模式，类型定义正确，与现有设置系统集成_

- [ ] 9. 创建OpenAI内容生成器单元测试
  - 文件：packages/core/src/core/openAIContentGenerator.test.ts（新文件）
  - 为OpenAIContentGenerator的方法编写单元测试
  - 目的：确保OpenAI内容生成器功能正确
  - _利用：现有的测试工具和模式_
  - _需求：需求3.1，需求3.2_
  - _提示：角色：专门从事单元测试和TDD的QA工程师 | 任务：创建全面的单元测试覆盖OpenAIContentGenerator的所有方法，包括成功和错误场景 | 限制：必须模拟所有外部依赖，测试隔离运行，覆盖边界条件 | 成功：所有方法都经过良好测试，错误场景得到覆盖，测试独立且一致运行_

- [ ] 10. 更新认证验证测试
  - 文件：packages/cli/src/config/auth.test.ts（修改）
  - 添加OpenAI认证验证的测试用例
  - 目的：确保OpenAI配置验证逻辑正确
  - _利用：现有的测试模式和工具_
  - _需求：需求2.1，需求2.2_
  - _提示：角色：专门从事配置测试和验证逻辑的QA工程师 | 任务：在现有测试文件中添加OpenAI认证验证测试用例，覆盖有效和无效配置 | 限制：必须遵循现有测试模式，正确模拟环境变量，覆盖所有验证分支 | 成功：OpenAI验证逻辑经过全面测试，所有分支和错误条件都得到覆盖_

- [ ] 11. 更新认证对话框测试
  - 文件：packages/cli/src/ui/auth/AuthDialog.test.tsx（修改）
  - 添加OpenAI选项的测试用例
  - 目的：确保OpenAI选项在UI中正确显示和工作
  - _利用：现有的React测试工具和模式_
  - _需求：需求1.1_
  - _提示：角色：专门从事React组件测试的QA工程师 | 任务：在现有测试文件中添加OpenAI选项的测试，验证选项显示和选择行为 | 限制：必须遵循现有测试模式，正确模拟用户交互，覆盖可访问性场景 | 成功：OpenAI选项正确测试，用户交互得到验证，组件行为符合预期_

- [ ] 12. 创建集成测试
  - 文件：integration-tests/openai-auth.test.ts（新文件）
  - 创建完整的OpenAI认证流程集成测试
  - 目的：验证OpenAI认证与整个系统的集成
  - _利用：现有的集成测试模式和工具_
  - _需求：需求3.1，需求3.2，需求4.1_
  - _提示：角色：专门从事系统集成测试的QA工程师 | 任务：创建涵盖完整OpenAI认证流程的集成测试，从认证选择到内容生成 | 限制：必须测试真实集成点，遵循现有集成测试模式，覆盖关键用户场景 | 成功：集成测试验证OpenAI认证与所有系统组件的正确集成，测试可靠且全面_

- [ ] 13. 更新文档和命令行帮助
  - 文件：docs/authentication.md（修改或创建）
  - 添加OpenAI兼容认证类型的文档
  - 目的：为用户提供OpenAI认证配置指南
  - _利用：现有的文档模式和风格_
  - _需求：需求4.1_
  - _提示：角色：专门从事技术文档编写的技术写作者 | 任务：创建或更新认证文档，详细说明OpenAI兼容认证的配置和使用方法 | 限制：必须遵循现有文档风格，提供清晰的配置示例，涵盖常见用例和故障排除 | 成功：文档清晰全面，包含配置示例，用户能够按照文档成功配置OpenAI认证_