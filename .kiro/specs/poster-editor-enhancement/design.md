# 海报编辑器功能增强设计文档

## 概述

本设计文档基于对 poster-design、gzm-design 和 fast-poster 等优秀开源项目的分析，结合我们现有的技术架构，设计了一套完整的海报编辑器功能增强方案。

## 技术架构

### 整体架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    用户界面层 (UI Layer)                      │
├─────────────────────────────────────────────────────────────┤
│  Toolbar  │  LeftPanel  │    Canvas    │  RightPanel       │
│  工具栏    │   左侧面板   │     画布      │   右侧面板         │
├─────────────────────────────────────────────────────────────┤
│                   业务逻辑层 (Business Layer)                 │
├─────────────────────────────────────────────────────────────┤
│ TextEditor │ ImageProcessor │ LayerManager │ TemplateEngine │
│  文本编辑   │   图片处理      │   图层管理    │   模板引擎      │
├─────────────────────────────────────────────────────────────┤
│                   数据管理层 (Data Layer)                     │
├─────────────────────────────────────────────────────────────┤
│ EditorStore │ HistoryStore │ AssetStore │ TemplateStore    │
│  编辑器状态  │   历史记录    │   素材管理   │   模板管理        │
├─────────────────────────────────────────────────────────────┤
│                   渲染引擎层 (Render Layer)                   │
├─────────────────────────────────────────────────────────────┤
│              Fabric.js + Canvas API                        │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件架构

#### 1. 增强的状态管理系统

```typescript
// 扩展现有的 editorStore
interface EditorState {
  // 现有状态
  canvas: fabric.Canvas | null;
  selectedTool: string;
  canvasState: CanvasState;
  
  // 新增状态
  textEditor: TextEditorState;
  imageProcessor: ImageProcessorState;
  layerManager: LayerManagerState;
  templateEngine: TemplateEngineState;
  alignmentTools: AlignmentToolsState;
  assetLibrary: AssetLibraryState;
  exportSettings: ExportSettingsState;
  history: HistoryState;
}
```

#### 2. 插件化工具系统

```typescript
// 工具插件接口
interface EditorTool {
  id: string;
  name: string;
  icon: string;
  activate(): void;
  deactivate(): void;
  onCanvasEvent(event: fabric.IEvent): void;
  getToolbar(): React.ComponentType;
  getPropertyPanel(): React.ComponentType;
}

// 工具注册系统
class ToolRegistry {
  private tools: Map<string, EditorTool> = new Map();
  
  register(tool: EditorTool): void;
  unregister(toolId: string): void;
  getTool(toolId: string): EditorTool | undefined;
  getAllTools(): EditorTool[];
}
```

## 核心功能设计

### 1. 文本编辑系统

#### 架构设计
```typescript
// 文本编辑器状态
interface TextEditorState {
  isEditing: boolean;
  currentTextObject: fabric.IText | null;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textAlign: string;
  lineHeight: number;
  letterSpacing: number;
  textEffects: TextEffects;
}

interface TextEffects {
  stroke: {
    enabled: boolean;
    color: string;
    width: number;
  };
  shadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  gradient: {
    enabled: boolean;
    type: 'linear' | 'radial';
    colors: GradientColor[];
    angle: number;
  };
}
```

#### 实现方案
1. **双击编辑模式**: 扩展 Fabric.js 的 IText 对象，添加双击事件监听
2. **实时预览**: 使用 React 状态同步更新 Fabric.js 对象属性
3. **字体管理**: 集成 Google Fonts API，支持在线字体加载
4. **文字特效**: 使用 Fabric.js 的滤镜系统实现描边、阴影、渐变效果

#### 组件设计
```typescript
// 文本编辑工具栏
const TextToolbar: React.FC = () => {
  return (
    <div className="text-toolbar">
      <FontFamilySelector />
      <FontSizeInput />
      <FontStyleButtons />
      <TextAlignButtons />
      <TextEffectsPanel />
    </div>
  );
};

// 文本属性面板
const TextPropertyPanel: React.FC = () => {
  return (
    <div className="text-properties">
      <TypographySection />
      <EffectsSection />
      <AdvancedSection />
    </div>
  );
};
```

### 2. 图片处理系统

#### 架构设计
```typescript
interface ImageProcessorState {
  currentImage: fabric.Image | null;
  cropMode: boolean;
  cropRect: CropRect;
  filters: ImageFilters;
  adjustments: ImageAdjustments;
}

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sepia: boolean;
  grayscale: boolean;
  vintage: boolean;
}

interface ImageAdjustments {
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number;
}
```

#### 实现方案
1. **图片裁剪**: 创建自定义裁剪控件，使用 Fabric.js 的 clipPath 功能
2. **滤镜系统**: 利用 Fabric.js 内置滤镜和自定义 WebGL 滤镜
3. **实时预览**: 使用 requestAnimationFrame 优化滤镜预览性能
4. **批量处理**: 支持多张图片同时应用相同效果

#### 组件设计
```typescript
// 图片编辑工具栏
const ImageToolbar: React.FC = () => {
  return (
    <div className="image-toolbar">
      <CropTool />
      <RotateTools />
      <FlipTools />
      <FilterPresets />
    </div>
  );
};

// 图片属性面板
const ImagePropertyPanel: React.FC = () => {
  return (
    <div className="image-properties">
      <AdjustmentSliders />
      <FilterControls />
      <CropSettings />
    </div>
  );
};
```

### 3. 图层管理系统

#### 架构设计
```typescript
interface LayerManagerState {
  layers: Layer[];
  selectedLayers: string[];
  draggedLayer: string | null;
}

interface Layer {
  id: string;
  name: string;
  type: 'text' | 'image' | 'shape' | 'group';
  visible: boolean;
  locked: boolean;
  opacity: number;
  zIndex: number;
  fabricObject: fabric.Object;
}
```

#### 实现方案
1. **图层同步**: 监听 Fabric.js 对象变化，自动更新图层列表
2. **拖拽排序**: 使用 react-beautiful-dnd 实现图层拖拽重排
3. **批量操作**: 支持多选图层进行批量显示/隐藏、锁定/解锁
4. **智能命名**: 根据对象类型自动生成图层名称

#### 组件设计
```typescript
// 图层面板
const LayerPanel: React.FC = () => {
  return (
    <div className="layer-panel">
      <LayerToolbar />
      <LayerList />
    </div>
  );
};

// 图层项组件
const LayerItem: React.FC<{ layer: Layer }> = ({ layer }) => {
  return (
    <div className="layer-item">
      <LayerIcon type={layer.type} />
      <LayerName layer={layer} />
      <LayerControls layer={layer} />
    </div>
  );
};
```

### 4. 模板系统

#### 架构设计
```typescript
interface TemplateEngineState {
  templates: Template[];
  categories: TemplateCategory[];
  currentCategory: string;
  searchQuery: string;
  loading: boolean;
}

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  width: number;
  height: number;
  objects: SerializedObject[];
  tags: string[];
  isCustom: boolean;
}
```

#### 实现方案
1. **模板存储**: 使用 JSON 格式存储模板数据，支持本地和云端存储
2. **模板应用**: 解析模板 JSON，重建 Fabric.js 对象到画布
3. **模板预览**: 使用缩略图和 Canvas 预览渲染
4. **分类管理**: 支持多级分类和标签系统

#### 组件设计
```typescript
// 模板面板
const TemplatePanel: React.FC = () => {
  return (
    <div className="template-panel">
      <TemplateSearch />
      <TemplateCategories />
      <TemplateGrid />
    </div>
  );
};

// 模板卡片
const TemplateCard: React.FC<{ template: Template }> = ({ template }) => {
  return (
    <div className="template-card">
      <TemplatePreview template={template} />
      <TemplateInfo template={template} />
      <TemplateActions template={template} />
    </div>
  );
};
```

### 5. 智能对齐系统

#### 架构设计
```typescript
interface AlignmentToolsState {
  selectedObjects: fabric.Object[];
  alignmentGuides: AlignmentGuide[];
  snapToGrid: boolean;
  snapToObjects: boolean;
  gridSize: number;
}

interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  objects: fabric.Object[];
}
```

#### 实现方案
1. **智能参考线**: 实时计算对象边界，显示对齐参考线
2. **自动吸附**: 在拖拽时自动吸附到参考线和网格
3. **批量对齐**: 支持多对象的各种对齐和分布操作
4. **网格系统**: 可配置的网格显示和吸附功能

#### 组件设计
```typescript
// 对齐工具栏
const AlignmentToolbar: React.FC = () => {
  return (
    <div className="alignment-toolbar">
      <AlignButtons />
      <DistributeButtons />
      <GridControls />
    </div>
  );
};
```

### 6. 素材库系统

#### 架构设计
```typescript
interface AssetLibraryState {
  assets: Asset[];
  categories: AssetCategory[];
  currentCategory: string;
  searchQuery: string;
  uploadProgress: number;
}

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'icon' | 'shape' | 'pattern';
  category: string;
  url: string;
  thumbnail: string;
  tags: string[];
  isCustom: boolean;
}
```

#### 实现方案
1. **在线资源**: 集成 Unsplash、Iconify 等 API 获取在线素材
2. **本地上传**: 支持用户上传自定义素材到本地存储
3. **智能搜索**: 基于标签和名称的模糊搜索功能
4. **懒加载**: 虚拟化列表和图片懒加载优化性能

#### 组件设计
```typescript
// 素材面板
const AssetPanel: React.FC = () => {
  return (
    <div className="asset-panel">
      <AssetSearch />
      <AssetCategories />
      <AssetGrid />
      <AssetUpload />
    </div>
  );
};
```

### 7. 导出系统

#### 架构设计
```typescript
interface ExportSettingsState {
  format: 'png' | 'jpg' | 'pdf' | 'svg';
  quality: number;
  width: number;
  height: number;
  dpi: number;
  backgroundColor: string;
  transparent: boolean;
}
```

#### 实现方案
1. **多格式支持**: 使用不同的导出策略处理各种格式
2. **高质量渲染**: 支持高 DPI 导出，确保打印质量
3. **批量导出**: 支持多尺寸、多格式批量导出
4. **进度显示**: 大文件导出时显示进度条

### 8. 历史记录系统

#### 架构设计
```typescript
interface HistoryState {
  past: HistoryEntry[];
  present: HistoryEntry;
  future: HistoryEntry[];
  maxHistorySize: number;
}

interface HistoryEntry {
  id: string;
  timestamp: number;
  action: string;
  canvasState: string; // JSON serialized canvas state
  thumbnail?: string;
}
```

#### 实现方案
1. **状态快照**: 在关键操作后保存画布状态快照
2. **增量存储**: 优化存储，只保存变化的部分
3. **可视化历史**: 显示操作历史的缩略图预览
4. **内存管理**: 限制历史记录数量，自动清理旧记录

## 数据流设计

### 状态管理流程
```
用户操作 → Action → Reducer → State Update → UI Re-render
    ↓
Canvas Update → Fabric.js → Visual Feedback
    ↓
History Record → History Stack → Undo/Redo Support
```

### 组件通信模式
```typescript
// 使用 Context + Hooks 模式
const EditorContext = createContext<EditorContextValue>();

// 自定义 Hooks
const useTextEditor = () => useContext(EditorContext).textEditor;
const useImageProcessor = () => useContext(EditorContext).imageProcessor;
const useLayerManager = () => useContext(EditorContext).layerManager;
```

## 性能优化策略

### 1. 渲染优化
- 使用 `React.memo` 优化组件重渲染
- 虚拟化长列表（模板、素材、图层）
- Canvas 离屏渲染优化大图片处理

### 2. 内存管理
- 图片资源的懒加载和释放
- 历史记录的智能清理
- Fabric.js 对象的及时销毁

### 3. 网络优化
- 素材资源的 CDN 加速
- 图片压缩和格式优化
- API 请求的缓存策略

## 错误处理策略

### 1. 用户友好的错误提示
- 操作失败时的明确提示
- 网络错误的重试机制
- 数据丢失的恢复方案

### 2. 降级方案
- 在线资源不可用时的本地替代
- 高级功能失效时的基础功能保障
- 浏览器兼容性问题的处理

## 测试策略

### 1. 单元测试
- 核心业务逻辑的单元测试
- 工具函数的测试覆盖
- 状态管理的测试

### 2. 集成测试
- 组件间交互的测试
- Canvas 操作的端到端测试
- 导出功能的完整性测试

### 3. 性能测试
- 大文件处理的性能测试
- 内存泄漏检测
- 渲染性能基准测试

这个设计方案基于现有架构，采用渐进式增强的方式，确保每个功能模块都能独立开发和测试，同时保持整体架构的一致性和可维护性。