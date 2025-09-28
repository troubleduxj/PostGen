# 🎨 海报制作工具 (Poster Maker)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF.svg)

一个基于 React + TypeScript + Fabric.js 的现代化海报制作工具

[在线演示](https://your-demo-link.com) · [功能介绍](#功能特性) · [快速开始](#快速开始) · [贡献指南](CONTRIBUTING.md)

</div>

## ✨ 功能特性

### 🎨 核心编辑功能
- **🖊️ 多种绘图工具**: 文本、图片、矩形、圆形、三角形、直线、画笔等
- **📝 文本特效系统**: 10大分类特效文本，支持渐变、阴影、描边等
- **🖼️ 图片处理**: 上传、裁剪、滤镜、调色等功能
- **🎯 精确控制**: 像素级定位、旋转、缩放、透明度调节
- **📐 智能对齐**: 自动吸附、网格系统、参考线

### 🛠️ 高级功能
- **📚 图层管理**: 完整的图层系统，支持显示/隐藏、锁定、排序
- **⏱️ 历史记录**: 无限撤销/重做，操作历史可视化
- **🎨 画布管理**: 多种预设尺寸、自定义背景、网格显示
- **⚡ 实时预览**: 所见即所得的编辑体验
- **💾 项目管理**: 本地保存、加载、导出多种格式

### 🚀 用户体验
- **⌨️ 键盘快捷键**: 提高操作效率的完整快捷键系统
- **📱 响应式设计**: 适配桌面端和移动端
- **🎯 智能面板**: 根据选中对象动态显示属性面板
- **🔍 缩放控制**: 10%-500%自由缩放，适应不同工作需求
- **🎨 主题系统**: 支持亮色/暗色主题切换

## 🛠️ 技术栈

<div align="center">

| 分类 | 技术选型 | 版本 | 说明 |
|------|---------|------|------|
| **前端框架** | React | 18+ | 现代化的用户界面库 |
| **开发语言** | TypeScript | 5+ | 类型安全的JavaScript |
| **状态管理** | Zustand | 4+ | 轻量级状态管理方案 |
| **画布引擎** | Fabric.js | 5+ | 强大的2D画布库 |
| **样式方案** | Tailwind CSS | 3+ | 原子化CSS框架 |
| **构建工具** | Vite | 5+ | 快速的前端构建工具 |
| **图标库** | Lucide React | 最新 | 美观的SVG图标集 |
| **代码规范** | ESLint + Prettier | 最新 | 代码质量保证 |

</div>

## 🚀 快速开始

### 📋 环境要求
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 或 **yarn** >= 1.22.0
- **现代浏览器** (Chrome 90+, Firefox 88+, Safari 14+)

### 📦 安装依赖
```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 🏃‍♂️ 启动开发服务器
```bash
# 启动开发服务器 (默认端口: 5173)
npm run dev

# 指定端口启动
npm run dev -- --port 3000
```

### 🏗️ 构建生产版本
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 🔍 代码质量检查
```bash
# ESLint 检查
npm run lint

# 类型检查
npm run type-check

# 格式化代码
npm run format
```

## 📁 项目结构

```
src/
├── components/              # 🧩 React 组件
│   ├── Editor/             # 📝 编辑器相关组件
│   │   ├── Canvas.tsx      # 🎨 画布组件
│   │   ├── Toolbar.tsx     # 🛠️ 工具栏
│   │   ├── LeftPanel.tsx   # ⬅️ 左侧面板 (图层、素材等)
│   │   ├── RightPanel.tsx  # ➡️ 右侧面板 (属性编辑)
│   │   ├── PropertyPanel/  # 🎛️ 属性面板组件
│   │   └── index.tsx       # 📋 编辑器主组件
│   └── ErrorBoundary.tsx   # 🛡️ 错误边界组件
├── stores/                 # 🗄️ Zustand 状态管理
│   ├── editorStore.ts      # 📝 编辑器主状态
│   ├── historyStore.ts     # ⏱️ 历史记录状态
│   ├── layerManagerStore.ts # 📚 图层管理状态
│   └── index.ts            # 📦 状态导出
├── hooks/                  # 🎣 自定义 React Hooks
│   ├── useKeyboardShortcuts.ts # ⌨️ 键盘快捷键
│   └── useHistoryManager.ts    # ⏱️ 历史记录管理
├── services/               # 🔧 服务层
│   ├── exportService.ts    # 📤 导出服务
│   └── fontCache.ts        # 🔤 字体缓存
├── utils/                  # 🛠️ 工具函数
│   ├── toolManager.ts      # 🎯 工具管理器
│   └── storage.ts          # 💾 本地存储
├── types/                  # 📝 TypeScript 类型定义
│   ├── index.ts            # 🌐 全局类型
│   └── tools.ts            # 🛠️ 工具类型
├── data/                   # 📊 静态数据
│   ├── assets.ts           # 🎨 素材数据
│   ├── templates.ts        # 📋 模板数据
│   └── textEffects.ts      # ✨ 文本特效数据
├── config/                 # ⚙️ 配置文件
│   └── canvasPresets.ts    # 🎨 画布预设
├── tools/                  # 🎯 编辑器工具
│   ├── SelectTool.ts       # 👆 选择工具
│   ├── TextTool.ts         # 📝 文本工具
│   └── index.ts            # 📦 工具导出
├── App.tsx                 # 🏠 应用主组件
├── main.tsx                # 🚀 应用入口
└── index.css               # 🎨 全局样式
```

## 📖 使用指南

### 🎯 基本操作

| 操作 | 说明 | 快捷键 |
|------|------|--------|
| **选择工具** | 点击工具栏中的工具图标 | `V` |
| **添加文本** | 选择文本工具，在画布上点击 | `T` |
| **添加形状** | 选择形状工具，在画布上拖拽 | `R`(矩形) `O`(圆形) |
| **编辑对象** | 选中对象后，在右侧属性面板编辑 | - |
| **图层管理** | 在左侧图层面板中管理对象层级 | - |

### ⌨️ 快捷键大全

#### 🎯 基本操作
- `Ctrl/Cmd + Z` - 撤销
- `Ctrl/Cmd + Shift + Z` - 重做
- `Ctrl/Cmd + S` - 保存项目
- `Ctrl/Cmd + O` - 打开项目
- `Ctrl/Cmd + E` - 导出画布

#### 🎨 编辑操作
- `Delete/Backspace` - 删除选中对象
- `Ctrl/Cmd + A` - 全选对象
- `Ctrl/Cmd + D` - 复制对象
- `Ctrl/Cmd + C` - 复制
- `Ctrl/Cmd + V` - 粘贴

#### 🛠️ 工具切换
- `V` - 选择工具
- `T` - 文本工具
- `R` - 矩形工具
- `O` - 圆形工具
- `L` - 直线工具
- `P` - 画笔工具

#### 🔍 视图控制
- `Ctrl/Cmd + +` - 放大
- `Ctrl/Cmd + -` - 缩小
- `Ctrl/Cmd + 0` - 适应画布
- `Space + 拖拽` - 平移画布

#### 📐 精确控制
- `Shift + 拖拽` - 等比例缩放
- `Alt + 拖拽` - 从中心缩放
- `方向键` - 微调位置 (1px)
- `Shift + 方向键` - 快速移动 (10px)

## 开发指南

### 添加新工具
1. 在 `types/index.ts` 中添加工具类型
2. 在 `Toolbar.tsx` 中添加工具按钮
3. 在 `editorStore.ts` 中实现工具逻辑
4. 在 `Canvas.tsx` 中处理工具交互

### 添加新面板
1. 在 `LeftPanel.tsx` 或 `RightPanel.tsx` 中添加面板组件
2. 在 `types/index.ts` 中添加面板类型
3. 在状态管理中添加相应状态

### 自定义样式
- 使用 Tailwind CSS 类名
- 在 `index.css` 中添加自定义样式
- 遵循现有的设计系统

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📈 更新日志

### v1.0.0 (2024-01-01)
- 🎉 **初始版本发布**
- ✨ **核心编辑功能** - 文本、图片、形状等基础工具
- 📚 **图层管理系统** - 完整的图层操作和管理
- 🎛️ **属性面板** - 动态属性编辑界面
- ⏱️ **历史记录功能** - 撤销/重做操作
- 📤 **导出功能** - 支持PNG、JPG格式导出
- ✨ **文本特效系统** - 10大分类特效文本
- 🎨 **画布属性面板** - 画布尺寸、背景、网格设置
- ⌨️ **键盘快捷键** - 完整的快捷键支持
- 📱 **响应式设计** - 适配不同屏幕尺寸

### 🔮 即将推出 (v1.1.0)
- 📋 **模板库** - 丰富的预设模板
- 🎨 **素材库** - 海量图片、图标、形状素材
- 🎭 **高级样式** - 更多渐变、阴影、滤镜效果
- 🔄 **自动保存** - 防止意外丢失工作
- 🌙 **暗色主题** - 护眼的暗色界面
- 📱 **移动端优化** - 更好的触屏体验

## 🤝 贡献

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详细信息。

### 🌟 贡献者

感谢所有为这个项目做出贡献的开发者！

<!-- 这里可以添加贡献者头像 -->

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🔗 相关链接

- [📖 完整文档](docs/)
- [🚀 部署指南](docs/DEPLOYMENT.md)
- [📋 更新日志](CHANGELOG.md)
- [🐛 问题反馈](https://github.com/poster-maker/poster-maker/issues)
- [💡 功能请求](https://github.com/poster-maker/poster-maker/issues/new?template=feature_request.md)

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 📧 邮箱: team@postermaker.com
- 💬 GitHub Issues: [提交问题](https://github.com/poster-maker/poster-maker/issues)
- 🌟 GitHub Discussions: [参与讨论](https://github.com/poster-maker/poster-maker/discussions)

## 🙏 致谢

感谢以下开源项目的支持：

- [React](https://reactjs.org/) - 用户界面库
- [Fabric.js](http://fabricjs.com/) - 强大的画布库
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Lucide](https://lucide.dev/) - 图标库

---

<div align="center">

**让创意无限，让设计更简单！** 🎨

[![Star History Chart](https://api.star-history.com/svg?repos=poster-maker/poster-maker&type=Date)](https://star-history.com/#poster-maker/poster-maker&Date)

Made with ❤️ by the Poster Maker Team

</div>