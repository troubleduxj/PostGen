# 设计模板系统设计文档

## 概述

本设计文档描述了为画板设计分类创建完整模板示例系统的技术方案。系统将为每个画布尺寸预设提供丰富的专业设计模板，包括社交媒体、印刷品、演示文稿、数字营销、移动端等多个分类的模板库。

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    模板系统架构                               │
├─────────────────────────────────────────────────────────────┤
│  模板选择器  │  模板预览器  │  模板编辑器  │  模板管理器      │
│ TemplateSelector │ TemplatePreview │ TemplateEditor │ TemplateManager │
├─────────────────────────────────────────────────────────────┤
│                   模板引擎层                                 │
├─────────────────────────────────────────────────────────────┤
│ TemplateEngine │ TemplateRenderer │ TemplateParser │ TemplateValidator │
│   模板引擎     │    模板渲染器     │   模板解析器    │   模板验证器      │
├─────────────────────────────────────────────────────────────┤
│                   数据管理层                                 │
├─────────────────────────────────────────────────────────────┤
│ TemplateStore │ CategoryStore │ RecommendationEngine │ SearchEngine │
│   模板存储     │   分类存储     │     推荐引擎         │   搜索引擎    │
├─────────────────────────────────────────────────────────────┤
│                   数据存储层                                 │
├─────────────────────────────────────────────────────────────┤
│  预设模板库   │  用户模板库   │  模板元数据   │   缓存系统     │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件设计

#### 1. 模板数据结构

```typescript
// 模板基础接口
interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  subcategory?: string;
  
  // 画布信息
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
    backgroundImage?: string;
  };
  
  // 设计元素
  objects: TemplateObject[];
  
  // 元数据
  metadata: {
    tags: string[];
    style: TemplateStyle;
    industry: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    colors: string[]; // 主要颜色
    fonts: string[]; // 使用的字体
    createdAt: string;
    updatedAt: string;
    author: string;
    version: string;
  };
  
  // 预览信息
  preview: {
    thumbnail: string; // 缩略图URL
    fullPreview: string; // 完整预览图URL
    description: string; // 使用场景描述
  };
  
  // 自定义属性
  customizable: {
    colors: boolean; // 是否支持颜色替换
    fonts: boolean; // 是否支持字体替换
    images: boolean; // 是否支持图片替换
    text: boolean; // 是否支持文本编辑
  };
}

// 模板对象接口
interface TemplateObject {
  id: string;
  type: 'text' | 'image' | 'shape' | 'group';
  fabricObject: any; // Fabric.js对象序列化数据
  
  // 可编辑属性
  editable: {
    content: boolean; // 内容是否可编辑
    style: boolean; // 样式是否可编辑
    position: boolean; // 位置是否可编辑
    size: boolean; // 大小是否可编辑
  };
  
  // 占位符信息（用于智能替换）
  placeholder?: {
    type: 'text' | 'image' | 'logo' | 'icon';
    defaultContent: string;
    suggestions: string[]; // 内容建议
  };
}

// 模板分类枚举
enum TemplateCategory {
  SOCIAL_MEDIA = 'social_media',
  PRINT = 'print',
  PRESENTATION = 'presentation',
  DIGITAL_MARKETING = 'digital_marketing',
  MOBILE = 'mobile',
  CUSTOM = 'custom'
}

// 模板风格枚举
enum TemplateStyle {
  MODERN = 'modern',
  VINTAGE = 'vintage',
  MINIMAL = 'minimal',
  CREATIVE = 'creative',
  PROFESSIONAL = 'professional',
  PLAYFUL = 'playful',
  ELEGANT = 'elegant',
  BOLD = 'bold'
}
```

#### 2. 模板引擎设计

```typescript
// 模板引擎核心类
class TemplateEngine {
  private templateStore: TemplateStore;
  private canvas: fabric.Canvas;
  
  // 应用模板到画布
  async applyTemplate(templateId: string): Promise<void> {
    const template = await this.templateStore.getTemplate(templateId);
    await this.clearCanvas();
    await this.renderTemplate(template);
    this.setupEditableElements(template);
  }
  
  // 渲染模板
  private async renderTemplate(template: DesignTemplate): Promise<void> {
    // 设置画布背景
    this.setupCanvasBackground(template.canvas);
    
    // 渲染所有对象
    for (const obj of template.objects) {
      const fabricObject = await this.createFabricObject(obj);
      this.canvas.add(fabricObject);
    }
    
    this.canvas.renderAll();
  }
  
  // 创建Fabric.js对象
  private async createFabricObject(templateObj: TemplateObject): Promise<fabric.Object> {
    switch (templateObj.type) {
      case 'text':
        return this.createTextObject(templateObj);
      case 'image':
        return await this.createImageObject(templateObj);
      case 'shape':
        return this.createShapeObject(templateObj);
      case 'group':
        return await this.createGroupObject(templateObj);
      default:
        throw new Error(`Unknown object type: ${templateObj.type}`);
    }
  }
  
  // 设置可编辑元素
  private setupEditableElements(template: DesignTemplate): void {
    template.objects.forEach(obj => {
      if (obj.editable.content || obj.placeholder) {
        this.setupPlaceholder(obj);
      }
    });
  }
}
```

#### 3. 模板存储系统

```typescript
// 模板存储接口
interface TemplateStore {
  // 获取模板
  getTemplate(id: string): Promise<DesignTemplate>;
  getTemplatesByCategory(category: TemplateCategory): Promise<DesignTemplate[]>;
  getTemplatesBySize(width: number, height: number): Promise<DesignTemplate[]>;
  
  // 搜索模板
  searchTemplates(query: TemplateSearchQuery): Promise<TemplateSearchResult>;
  
  // 用户模板管理
  saveUserTemplate(template: DesignTemplate): Promise<string>;
  getUserTemplates(userId: string): Promise<DesignTemplate[]>;
  deleteUserTemplate(templateId: string): Promise<void>;
  
  // 模板推荐
  getRecommendedTemplates(criteria: RecommendationCriteria): Promise<DesignTemplate[]>;
  getTrendingTemplates(): Promise<DesignTemplate[]>;
}

// 搜索查询接口
interface TemplateSearchQuery {
  keyword?: string;
  category?: TemplateCategory;
  style?: TemplateStyle;
  colors?: string[];
  industry?: string[];
  size?: { width: number; height: number };
  tags?: string[];
  difficulty?: string;
}

// 推荐标准接口
interface RecommendationCriteria {
  canvasSize: { width: number; height: number };
  userHistory: string[]; // 用户使用过的模板ID
  preferredStyles: TemplateStyle[];
  industry?: string;
  keywords?: string[];
  brandColors?: string[];
}
```

## 组件和接口设计

### 1. 模板选择器组件

```typescript
// 主模板选择器
const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  canvasSize,
  onTemplateSelect,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<TemplateFilters>({});
  
  return (
    <div className="template-selector">
      <TemplateSelectorHeader 
        onSearch={setSearchQuery}
        onClose={onClose}
      />
      
      <div className="template-selector-body">
        <TemplateCategoryNav 
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        
        <TemplateFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />
        
        <TemplateGrid 
          category={selectedCategory}
          searchQuery={searchQuery}
          filters={filters}
          canvasSize={canvasSize}
          onTemplateSelect={onTemplateSelect}
        />
      </div>
    </div>
  );
};

// 模板网格组件
const TemplateGrid: React.FC<TemplateGridProps> = ({
  category,
  searchQuery,
  filters,
  canvasSize,
  onTemplateSelect
}) => {
  const { templates, loading, error } = useTemplates({
    category,
    searchQuery,
    filters,
    canvasSize
  });
  
  if (loading) return <TemplateGridSkeleton />;
  if (error) return <TemplateGridError error={error} />;
  
  return (
    <div className="template-grid">
      {templates.map(template => (
        <TemplateCard 
          key={template.id}
          template={template}
          onSelect={() => onTemplateSelect(template)}
        />
      ))}
    </div>
  );
};
```

### 2. 模板卡片组件

```typescript
// 模板卡片
const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  onSelect,
  onPreview,
  onFavorite 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  return (
    <div 
      className="template-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="template-card-preview">
        <img 
          src={template.preview.thumbnail}
          alt={template.name}
          loading="lazy"
        />
        
        {isHovered && (
          <div className="template-card-overlay">
            <button onClick={() => onPreview(template)}>
              预览
            </button>
            <button onClick={() => onSelect(template)}>
              使用模板
            </button>
          </div>
        )}
        
        <button 
          className={`template-card-favorite ${isFavorited ? 'active' : ''}`}
          onClick={() => onFavorite(template)}
        >
          ❤️
        </button>
      </div>
      
      <div className="template-card-info">
        <h3>{template.name}</h3>
        <p>{template.preview.description}</p>
        
        <div className="template-card-tags">
          {template.metadata.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        
        <div className="template-card-meta">
          <span className="style">{template.metadata.style}</span>
          <span className="difficulty">{template.metadata.difficulty}</span>
        </div>
      </div>
    </div>
  );
};
```

### 3. 模板预览器组件

```typescript
// 模板预览器
const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onApply,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewCanvas, setPreviewCanvas] = useState<fabric.Canvas | null>(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current);
      setPreviewCanvas(canvas);
      
      // 渲染模板预览
      renderTemplatePreview(canvas, template);
    }
    
    return () => {
      previewCanvas?.dispose();
    };
  }, [template]);
  
  return (
    <div className="template-preview-modal">
      <div className="template-preview-header">
        <h2>{template.name}</h2>
        <button onClick={onClose}>×</button>
      </div>
      
      <div className="template-preview-body">
        <div className="template-preview-canvas">
          <canvas ref={canvasRef} />
        </div>
        
        <div className="template-preview-info">
          <TemplateInfo template={template} />
          <TemplateCustomizationOptions template={template} />
          
          <div className="template-preview-actions">
            <button 
              className="btn-primary"
              onClick={() => onApply(template)}
            >
              使用此模板
            </button>
            <button className="btn-secondary">
              收藏模板
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 4. 模板管理器组件

```typescript
// 用户模板管理器
const TemplateManager: React.FC = () => {
  const [userTemplates, setUserTemplates] = useState<DesignTemplate[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  
  return (
    <div className="template-manager">
      <div className="template-manager-header">
        <h2>我的模板</h2>
        <div className="template-manager-actions">
          <button onClick={handleImportTemplate}>
            导入模板
          </button>
          <button onClick={handleExportSelected}>
            导出选中
          </button>
          <button onClick={handleDeleteSelected}>
            删除选中
          </button>
        </div>
      </div>
      
      <div className="template-manager-body">
        <TemplateManagerGrid 
          templates={userTemplates}
          selectedTemplates={selectedTemplates}
          onSelectionChange={setSelectedTemplates}
        />
      </div>
    </div>
  );
};
```

## 数据模型设计

### 1. 预设模板数据结构

```typescript
// 社交媒体模板示例
const socialMediaTemplates: DesignTemplate[] = [
  {
    id: 'instagram-post-modern-1',
    name: '现代简约Instagram帖子',
    description: '适合品牌推广的现代简约风格Instagram帖子模板',
    category: TemplateCategory.SOCIAL_MEDIA,
    subcategory: 'instagram-post',
    
    canvas: {
      width: 1080,
      height: 1080,
      backgroundColor: '#ffffff'
    },
    
    objects: [
      {
        id: 'background-shape',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 1080,
          height: 540,
          fill: '#667eea',
          top: 0,
          left: 0
        },
        editable: {
          content: false,
          style: true,
          position: false,
          size: false
        }
      },
      {
        id: 'main-title',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '您的标题文字',
          fontSize: 48,
          fontFamily: 'Arial',
          fill: '#ffffff',
          top: 200,
          left: 540,
          originX: 'center',
          originY: 'center'
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '您的标题文字',
          suggestions: ['新品发布', '限时优惠', '品牌故事']
        }
      }
      // ... 更多对象
    ],
    
    metadata: {
      tags: ['现代', '简约', '品牌', 'Instagram'],
      style: TemplateStyle.MODERN,
      industry: ['科技', '时尚', '生活方式'],
      difficulty: 'beginner',
      colors: ['#667eea', '#764ba2', '#ffffff'],
      fonts: ['Arial', 'Helvetica'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'Design Team',
      version: '1.0'
    },
    
    preview: {
      thumbnail: '/templates/thumbnails/instagram-post-modern-1.jpg',
      fullPreview: '/templates/previews/instagram-post-modern-1.jpg',
      description: '现代简约风格，适合科技和时尚品牌使用'
    },
    
    customizable: {
      colors: true,
      fonts: true,
      images: true,
      text: true
    }
  }
  // ... 更多模板
];
```

### 2. 模板分类配置

```typescript
// 模板分类配置
const templateCategories = {
  [TemplateCategory.SOCIAL_MEDIA]: {
    name: '社交媒体',
    icon: '📱',
    subcategories: {
      'instagram-post': { name: 'Instagram帖子', size: { width: 1080, height: 1080 } },
      'instagram-story': { name: 'Instagram故事', size: { width: 1080, height: 1920 } },
      'facebook-post': { name: 'Facebook帖子', size: { width: 1200, height: 630 } },
      'twitter-header': { name: 'Twitter头图', size: { width: 1500, height: 500 } },
      'linkedin-post': { name: 'LinkedIn帖子', size: { width: 1200, height: 627 } },
      'youtube-thumbnail': { name: 'YouTube缩略图', size: { width: 1280, height: 720 } }
    }
  },
  
  [TemplateCategory.PRINT]: {
    name: '印刷品',
    icon: '🖨️',
    subcategories: {
      'flyer-a4': { name: 'A4传单', size: { width: 2480, height: 3508 } },
      'business-card': { name: '名片', size: { width: 1050, height: 600 } },
      'poster-a3': { name: 'A3海报', size: { width: 3508, height: 4961 } },
      'brochure': { name: '宣传册', size: { width: 2480, height: 3508 } },
      'invitation': { name: '邀请函', size: { width: 1500, height: 2100 } },
      'certificate': { name: '证书', size: { width: 3508, height: 2480 } }
    }
  },
  
  [TemplateCategory.PRESENTATION]: {
    name: '演示文稿',
    icon: '📊',
    subcategories: {
      'ppt-standard': { name: 'PPT标准', size: { width: 1024, height: 768 } },
      'ppt-widescreen': { name: 'PPT宽屏', size: { width: 1920, height: 1080 } },
      'keynote': { name: 'Keynote', size: { width: 1920, height: 1080 } },
      'google-slides': { name: 'Google Slides', size: { width: 1920, height: 1080 } }
    }
  }
  // ... 其他分类
};
```

## 错误处理策略

### 1. 模板加载错误处理

```typescript
class TemplateErrorHandler {
  // 处理模板加载失败
  static handleTemplateLoadError(error: Error, templateId: string): void {
    console.error(`Failed to load template ${templateId}:`, error);
    
    // 显示用户友好的错误信息
    NotificationService.showError('模板加载失败，请稍后重试');
    
    // 记录错误日志
    ErrorLogger.log('template_load_error', {
      templateId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    // 提供降级方案
    this.showFallbackTemplate();
  }
  
  // 处理模板应用错误
  static handleTemplateApplyError(error: Error, template: DesignTemplate): void {
    console.error('Failed to apply template:', error);
    
    // 尝试恢复画布状态
    CanvasStateManager.restorePreviousState();
    
    // 显示错误提示
    NotificationService.showError('模板应用失败，已恢复到之前状态');
  }
}
```

### 2. 数据验证和兼容性处理

```typescript
class TemplateValidator {
  // 验证模板数据完整性
  static validateTemplate(template: DesignTemplate): ValidationResult {
    const errors: string[] = [];
    
    // 验证必需字段
    if (!template.id) errors.push('模板ID不能为空');
    if (!template.name) errors.push('模板名称不能为空');
    if (!template.canvas) errors.push('画布配置不能为空');
    
    // 验证对象数据
    template.objects.forEach((obj, index) => {
      if (!obj.fabricObject) {
        errors.push(`对象 ${index} 缺少Fabric.js数据`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // 处理版本兼容性
  static migrateTemplate(template: any, fromVersion: string): DesignTemplate {
    // 根据版本进行数据迁移
    switch (fromVersion) {
      case '1.0':
        return this.migrateFromV1(template);
      case '2.0':
        return this.migrateFromV2(template);
      default:
        return template;
    }
  }
}
```

## 性能优化策略

### 1. 模板加载优化

```typescript
class TemplateLoadingOptimizer {
  private static templateCache = new Map<string, DesignTemplate>();
  private static preloadQueue: string[] = [];
  
  // 预加载热门模板
  static async preloadPopularTemplates(): Promise<void> {
    const popularTemplateIds = await TemplateAnalytics.getPopularTemplateIds();
    
    for (const templateId of popularTemplateIds) {
      if (!this.templateCache.has(templateId)) {
        this.preloadQueue.push(templateId);
      }
    }
    
    // 批量预加载
    await this.batchPreload();
  }
  
  // 懒加载模板缩略图
  static setupLazyLoading(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          observer.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }
}
```

### 2. 渲染性能优化

```typescript
class TemplateRenderOptimizer {
  // 虚拟化模板网格
  static createVirtualizedGrid(templates: DesignTemplate[]): React.ComponentType {
    return () => {
      const { height, width } = useWindowSize();
      const itemHeight = 300;
      const itemWidth = 250;
      
      return (
        <FixedSizeGrid
          height={height - 200}
          width={width}
          columnCount={Math.floor(width / itemWidth)}
          columnWidth={itemWidth}
          rowCount={Math.ceil(templates.length / Math.floor(width / itemWidth))}
          rowHeight={itemHeight}
          itemData={templates}
        >
          {TemplateGridItem}
        </FixedSizeGrid>
      );
    };
  }
  
  // 优化Canvas渲染
  static optimizeCanvasRendering(canvas: fabric.Canvas): void {
    // 禁用不必要的渲染
    canvas.renderOnAddRemove = false;
    canvas.skipTargetFind = true;
    
    // 批量渲染
    canvas.requestRenderAll = debounce(canvas.requestRenderAll.bind(canvas), 16);
  }
}
```

## 测试策略

### 1. 单元测试

```typescript
// 模板引擎测试
describe('TemplateEngine', () => {
  let templateEngine: TemplateEngine;
  let mockCanvas: fabric.Canvas;
  
  beforeEach(() => {
    mockCanvas = new fabric.Canvas(document.createElement('canvas'));
    templateEngine = new TemplateEngine(mockCanvas);
  });
  
  test('should apply template correctly', async () => {
    const template = createMockTemplate();
    await templateEngine.applyTemplate(template.id);
    
    expect(mockCanvas.getObjects()).toHaveLength(template.objects.length);
  });
  
  test('should handle template loading errors', async () => {
    const invalidTemplateId = 'invalid-template';
    
    await expect(templateEngine.applyTemplate(invalidTemplateId))
      .rejects.toThrow('Template not found');
  });
});
```

### 2. 集成测试

```typescript
// 模板选择器集成测试
describe('TemplateSelector Integration', () => {
  test('should load and display templates by category', async () => {
    render(<TemplateSelector canvasSize={{ width: 1080, height: 1080 }} />);
    
    // 选择社交媒体分类
    fireEvent.click(screen.getByText('社交媒体'));
    
    // 等待模板加载
    await waitFor(() => {
      expect(screen.getByText('Instagram帖子')).toBeInTheDocument();
    });
    
    // 验证模板卡片显示
    const templateCards = screen.getAllByTestId('template-card');
    expect(templateCards.length).toBeGreaterThan(0);
  });
});
```

这个设计方案提供了完整的模板系统架构，包括数据结构、组件设计、性能优化和错误处理策略，确保系统的可扩展性和用户体验。