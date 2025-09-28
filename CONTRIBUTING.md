# 贡献指南

感谢您对海报编辑器项目的关注！我们欢迎任何形式的贡献。

## 开发环境设置

### 前置要求
- Node.js >= 18.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

## 项目结构

```
src/
├── components/          # React 组件
│   ├── Editor/         # 编辑器相关组件
│   └── ...
├── stores/             # Zustand 状态管理
├── hooks/              # 自定义 React Hooks
├── services/           # 服务层（API调用等）
├── utils/              # 工具函数
├── types/              # TypeScript 类型定义
├── data/               # 静态数据
├── config/             # 配置文件
└── tools/              # 编辑器工具
```

## 代码规范

### TypeScript
- 使用 TypeScript 进行开发
- 为所有函数和组件提供类型定义
- 避免使用 `any` 类型

### React 组件
- 使用函数组件和 Hooks
- 组件名使用 PascalCase
- 文件名与组件名保持一致

### 样式
- 使用 Tailwind CSS 进行样式开发
- 避免内联样式，除非必要
- 保持响应式设计

### 命名规范
- 变量和函数使用 camelCase
- 常量使用 UPPER_SNAKE_CASE
- 组件使用 PascalCase
- 文件夹使用 kebab-case

## 提交规范

使用 Conventional Commits 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 类型说明
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例
```
feat(editor): 添加文本特效功能

- 新增10种文本特效分类
- 支持渐变、阴影、描边等效果
- 优化文本渲染性能

Closes #123
```

## 分支管理

- `main`: 主分支，保持稳定
- `develop`: 开发分支
- `feature/*`: 功能分支
- `fix/*`: 修复分支
- `hotfix/*`: 紧急修复分支

## Pull Request 流程

1. Fork 项目到你的 GitHub 账户
2. 创建功能分支：`git checkout -b feature/your-feature-name`
3. 提交你的更改：`git commit -m 'feat: add some feature'`
4. 推送到分支：`git push origin feature/your-feature-name`
5. 创建 Pull Request

### PR 要求
- 提供清晰的描述
- 包含相关的测试
- 确保所有检查通过
- 更新相关文档

## 测试

```bash
# 运行测试
npm run test

# 运行测试覆盖率
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e
```

## 构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 问题报告

使用 GitHub Issues 报告问题时，请包含：

- 问题的详细描述
- 重现步骤
- 期望的行为
- 实际的行为
- 环境信息（浏览器、操作系统等）
- 相关的截图或错误信息

## 功能请求

提交功能请求时，请说明：

- 功能的详细描述
- 使用场景
- 期望的实现方式
- 是否愿意参与开发

## 代码审查

所有代码更改都需要经过代码审查：

- 确保代码质量
- 检查是否符合项目规范
- 验证功能是否正常工作
- 确保没有引入新的问题

## 许可证

通过贡献代码，您同意您的贡献将在与项目相同的许可证下授权。

## 联系方式

如有任何问题，请通过以下方式联系：

- GitHub Issues
- 项目讨论区

感谢您的贡献！