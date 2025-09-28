/**
 * 设计模板系统类型定义
 * 定义了完整的模板数据结构和相关类型
 */

// 模板分类枚举
export enum TemplateCategory {
  SOCIAL_MEDIA = 'social_media',
  PRINT = 'print',
  PRESENTATION = 'presentation',
  DIGITAL_MARKETING = 'digital_marketing',
  MOBILE = 'mobile',
  CUSTOM = 'custom'
}

// 模板风格枚举
export enum TemplateStyle {
  MODERN = 'modern',
  VINTAGE = 'vintage',
  MINIMAL = 'minimal',
  CREATIVE = 'creative',
  PROFESSIONAL = 'professional',
  PLAYFUL = 'playful',
  ELEGANT = 'elegant',
  BOLD = 'bold'
}

// 模板难度级别
export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';

// 占位符类型
export type PlaceholderType = 'text' | 'image' | 'logo' | 'icon';

// 模板对象类型
export type TemplateObjectType = 'text' | 'image' | 'shape' | 'group';

// 占位符信息接口
export interface TemplatePlaceholder {
  type: PlaceholderType;
  defaultContent: string;
  suggestions: string[];
}

// 可编辑属性接口
export interface EditableProperties {
  content: boolean;  // 内容是否可编辑
  style: boolean;    // 样式是否可编辑
  position: boolean; // 位置是否可编辑
  size: boolean;     // 大小是否可编辑
}

// 模板对象接口
export interface TemplateObject {
  id: string;
  type: TemplateObjectType;
  fabricObject: any; // Fabric.js对象序列化数据
  
  // 可编辑属性
  editable: EditableProperties;
  
  // 占位符信息（用于智能替换）
  placeholder?: TemplatePlaceholder;
}

// 画布配置接口
export interface TemplateCanvas {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
}

// 模板元数据接口
export interface TemplateMetadata {
  tags: string[];
  style: TemplateStyle;
  industry: string[];
  difficulty: TemplateDifficulty;
  colors: string[];     // 主要颜色
  fonts: string[];      // 使用的字体
  createdAt: string;
  updatedAt: string;
  author: string;
  version: string;
}

// 模板预览信息接口
export interface TemplatePreview {
  thumbnail: string;     // 缩略图URL
  fullPreview: string;   // 完整预览图URL
  description: string;   // 使用场景描述
}

// 模板自定义属性接口
export interface TemplateCustomizable {
  colors: boolean;  // 是否支持颜色替换
  fonts: boolean;   // 是否支持字体替换
  images: boolean;  // 是否支持图片替换
  text: boolean;    // 是否支持文本编辑
}

// 设计模板主接口
export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  subcategory?: string;
  
  // 画布信息
  canvas: TemplateCanvas;
  
  // 设计元素
  objects: TemplateObject[];
  
  // 元数据
  metadata: TemplateMetadata;
  
  // 预览信息
  preview: TemplatePreview;
  
  // 自定义属性
  customizable: TemplateCustomizable;
}

// 模板搜索查询接口
export interface TemplateSearchQuery {
  keyword?: string;
  category?: TemplateCategory;
  style?: TemplateStyle;
  colors?: string[];
  industry?: string[];
  size?: { width: number; height: number };
  tags?: string[];
  difficulty?: TemplateDifficulty;
}

// 模板搜索结果接口
export interface TemplateSearchResult {
  templates: DesignTemplate[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 推荐标准接口
export interface RecommendationCriteria {
  canvasSize: { width: number; height: number };
  userHistory: string[];        // 用户使用过的模板ID
  preferredStyles: TemplateStyle[];
  industry?: string;
  keywords?: string[];
  brandColors?: string[];
}

// 模板筛选器接口
export interface TemplateFilters {
  category?: TemplateCategory;
  style?: TemplateStyle[];
  colors?: string[];
  industry?: string[];
  difficulty?: TemplateDifficulty[];
  tags?: string[];
  customizable?: {
    colors?: boolean;
    fonts?: boolean;
    images?: boolean;
    text?: boolean;
  };
}

// 模板分类配置接口
export interface TemplateCategoryConfig {
  name: string;
  icon: string;
  subcategories: Record<string, {
    name: string;
    size: { width: number; height: number };
  }>;
}

// 模板验证结果接口
export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// 模板版本迁移接口
export interface TemplateMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (template: any) => DesignTemplate;
}

// 模板序列化选项接口
export interface TemplateSerializationOptions {
  compress?: boolean;
  includePreview?: boolean;
  optimizeImages?: boolean;
  minifyJson?: boolean;
}

// 模板导入导出接口
export interface TemplateExportData {
  template: DesignTemplate;
  assets?: Record<string, string>; // 资源文件的base64数据
  metadata: {
    exportedAt: string;
    exportedBy: string;
    version: string;
  };
}

// 模板应用选项接口
export interface TemplateApplyOptions {
  preserveCanvasSize?: boolean;
  replaceContent?: boolean;
  mergeWithExisting?: boolean;
  customizations?: {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    texts?: Record<string, string>;
    images?: Record<string, string>;
  };
}

// 模板应用进度接口
export interface TemplateApplyProgress {
  step: string;
  progress: number; // 0-100
  message: string;
  isComplete: boolean;
  error?: string;
}

// 模板统计信息接口
export interface TemplateStats {
  id: string;
  usageCount: number;
  favoriteCount: number;
  rating: number;
  lastUsed?: string;
  createdAt: string;
}