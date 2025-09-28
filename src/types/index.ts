import { fabric } from 'fabric';

// 基础类型定义
export type ObjectType = 'text' | 'image' | 'shape' | 'background' | 'group';

export interface BaseObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

// 文本对象
export interface TextObject extends BaseObject {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: 'normal' | 'italic';
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  textDecoration: 'none' | 'underline' | 'line-through';
  textShadow?: TextShadow;
  stroke?: string;
  strokeWidth?: number;
}

// 图片对象
export interface ImageObject extends BaseObject {
  type: 'image';
  src: string;
  originalSrc: string;
  filters: ImageFilter[];
  cropData?: CropData;
  flipX: boolean;
  flipY: boolean;
}

// 形状对象
export interface ShapeObject extends BaseObject {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'polygon' | 'star';
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
  sides?: number; // 用于多边形和星形
}

// 背景对象
export interface BackgroundObject extends BaseObject {
  type: 'background';
  backgroundType: 'color' | 'gradient' | 'image' | 'pattern';
  color?: string;
  gradient?: Gradient;
  image?: string;
  pattern?: Pattern;
}

// 组合对象
export interface GroupObject extends BaseObject {
  type: 'group';
  objects: CanvasObject[];
}

// 联合类型
export type CanvasObject = TextObject | ImageObject | ShapeObject | BackgroundObject | GroupObject;

// 辅助类型
export interface TextShadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface ImageFilter {
  type: 'brightness' | 'contrast' | 'saturation' | 'blur' | 'sepia' | 'grayscale' | 'invert';
  value: number;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Gradient {
  type: 'linear' | 'radial';
  colors: GradientStop[];
  angle?: number; // 线性渐变角度
  centerX?: number; // 径向渐变中心X
  centerY?: number; // 径向渐变中心Y
  radius?: number; // 径向渐变半径
}

export interface GradientStop {
  color: string;
  offset: number; // 0-1
}

export interface Pattern {
  type: 'dots' | 'stripes' | 'grid' | 'waves';
  color: string;
  backgroundColor: string;
  size: number;
  spacing: number;
}

// 画布相关类型
export interface CanvasState {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  zoom: number;
  gridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

// 历史记录类型
export interface HistoryItem {
  id: string;
  timestamp: number;
  action: string;
  data: any;
  canvasState: string; // JSON序列化的画布状态
}

// 模板类型
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  width: number;
  height: number;
  objects: SerializedObject[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  author?: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

// 序列化对象类型
export interface SerializedObject {
  type: string;
  version: string;
  objects: any[];
}

// 素材类型
export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'icon' | 'shape' | 'template';
  url: string;
  thumbnail: string;
  category: string;
  tags: string[];
  size?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: string;
}

// 导出选项
export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'svg';
  quality: number; // 0-1
  scale: number; // 导出缩放比例
  backgroundColor?: string;
  transparent?: boolean; // PNG格式是否透明背景
}

export interface PDFOptions extends ExportOptions {
  format: 'pdf';
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'A3' | 'A5' | 'custom';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// 颜色相关类型
export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  type: 'basic' | 'gradient' | 'theme';
}

export interface FontFamily {
  name: string;
  displayName: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'cursive' | 'fantasy';
  variants: FontVariant[];
  webFont?: boolean;
  url?: string;
}

export interface FontVariant {
  weight: number;
  style: 'normal' | 'italic';
  name: string;
}

// 工具类型
export type Tool = 
  | 'select'
  | 'text'
  | 'image'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'line'
  | 'pen'
  | 'eraser'
  | 'eyedropper'
  | 'zoom'
  | 'hand';

// 面板类型
export type PanelType = 'layers' | 'text' | 'draw' | 'images' | 'properties' | 'assets' | 'templates' | 'history';

// 编辑器状态
export interface EditorState {
  canvas: fabric.Canvas | null;
  canvasState: CanvasState;
  activeObject: fabric.Object | null;
  selectedObjects: fabric.Object[];
  activeTool: Tool;
  activePanel: PanelType | null;
  history: HistoryItem[];
  historyIndex: number;
  isLoading: boolean;
  error: string | null;
}

// 事件类型
export interface EditorEvent {
  type: string;
  data?: any;
  timestamp: number;
}

// 快捷键配置
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: string;
  description: string;
}

// 用户偏好设置
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  autoSave: boolean;
  autoSaveInterval: number; // 分钟
  gridSize: number;
  snapToGrid: boolean;
  showRulers: boolean;
  showGuides: boolean;
  recentColors: string[];
  recentFonts: string[];
  shortcuts: KeyboardShortcut[];
}