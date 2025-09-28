/**
 * 模板引擎核心类
 * 负责模板的应用、渲染和管理
 */

import { fabric } from 'fabric';
import { 
  DesignTemplate, 
  TemplateObject, 
  TemplateApplyOptions,
  TemplateApplyProgress,
  TemplatePlaceholder,
  EditableProperties
} from '@/types/template';
import { useDesignTemplateStore } from '@/stores/templateStore';
import { FabricObjectCreator, ObjectCreationOptions } from './fabricObjectCreator';
import { PlaceholderSystem, createPlaceholderSystem } from './placeholderSystem';

// 模板应用错误类
export class TemplateApplicationError extends Error {
  constructor(message: string, public templateId?: string, public step?: string) {
    super(message);
    this.name = 'TemplateApplicationError';
  }
}

// 模板引擎配置接口
interface TemplateEngineConfig {
  enableProgressCallback: boolean;
  enableErrorRecovery: boolean;
  maxRetries: number;
  retryDelay: number;
}

// 默认配置
const DEFAULT_CONFIG: TemplateEngineConfig = {
  enableProgressCallback: true,
  enableErrorRecovery: true,
  maxRetries: 3,
  retryDelay: 1000,
};

/**
 * 模板引擎核心类
 * 提供模板应用、渲染和管理功能
 */
export class TemplateEngine {
  private canvas: fabric.Canvas;
  private config: TemplateEngineConfig;
  private progressCallback?: (progress: TemplateApplyProgress) => void;
  private placeholderElements: Map<string, fabric.Object> = new Map();
  private originalCanvasState: any = null;
  private objectCreator: FabricObjectCreator;
  private placeholderSystem: PlaceholderSystem;

  constructor(
    canvas: fabric.Canvas, 
    config: Partial<TemplateEngineConfig> = {},
    progressCallback?: (progress: TemplateApplyProgress) => void
  ) {
    this.canvas = canvas;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.progressCallback = progressCallback;
    
    // 初始化对象创建器
    this.objectCreator = new FabricObjectCreator({
      enablePlaceholder: true,
      enableEditing: true,
      crossOrigin: 'anonymous',
    });
    
    // 初始化占位符系统
    this.placeholderSystem = createPlaceholderSystem(canvas);
    this.setupPlaceholderSystemEvents();
  }

  /**
   * 应用模板到画布
   * @param templateId 模板ID
   * @param options 应用选项
   */
  async applyTemplate(
    templateId: string, 
    options: TemplateApplyOptions = {}
  ): Promise<void> {
    this.reportProgress('loading', 0, '正在加载模板...');

    try {
      // 保存当前画布状态用于错误恢复
      this.saveCanvasState();

      // 获取模板数据
      const templateStore = useDesignTemplateStore.getState();
      const template = await templateStore.getTemplate(templateId);
      
      if (!template) {
        throw new TemplateApplicationError(
          `模板 ${templateId} 不存在`,
          templateId,
          'loading'
        );
      }

      this.reportProgress('validating', 10, '验证模板数据...');

      // 验证模板数据
      const validation = templateStore.validateTemplate(template);
      if (!validation.isValid) {
        throw new TemplateApplicationError(
          `模板数据无效: ${validation.errors.join(', ')}`,
          templateId,
          'validation'
        );
      }

      this.reportProgress('preparing', 20, '准备画布...');

      // 准备画布
      await this.prepareCanvas(template, options);

      this.reportProgress('rendering', 30, '渲染模板对象...');

      // 渲染模板
      await this.renderTemplate(template, options);

      this.reportProgress('setup', 80, '设置可编辑元素...');

      // 设置可编辑元素
      this.setupEditableElements(template);

      this.reportProgress('complete', 100, '模板应用完成');

      // 更新模板使用统计
      await templateStore.updateTemplateStats(templateId, 'use');

    } catch (error) {
      this.reportProgress('error', 0, '模板应用失败', error as Error);
      
      if (this.config.enableErrorRecovery) {
        await this.recoverFromError();
      }
      
      throw error;
    }
  }

  /**
   * 渲染模板到画布
   * @param template 模板数据
   * @param options 应用选项
   */
  private async renderTemplate(
    template: DesignTemplate, 
    options: TemplateApplyOptions
  ): Promise<void> {
    const totalObjects = template.objects.length;
    let processedObjects = 0;

    // 清空占位符元素映射
    this.placeholderElements.clear();

    // 按顺序渲染所有对象
    for (const templateObj of template.objects) {
      try {
        this.reportProgress(
          'rendering', 
          30 + (processedObjects / totalObjects) * 50,
          `渲染对象: ${templateObj.id}`
        );

        const fabricObject = await this.createFabricObject(templateObj, options);
        
        if (fabricObject) {
          this.canvas.add(fabricObject);
          
          // 如果是占位符对象，记录引用
          if (templateObj.placeholder) {
            this.placeholderElements.set(templateObj.id, fabricObject);
          }
        }

        processedObjects++;
      } catch (error) {
        console.warn(`Failed to render object ${templateObj.id}:`, error);
        
        if (!this.config.enableErrorRecovery) {
          throw new TemplateApplicationError(
            `渲染对象 ${templateObj.id} 失败: ${error}`,
            template.id,
            'rendering'
          );
        }
      }
    }

    // 渲染完成后刷新画布
    this.canvas.renderAll();
  }

  /**
   * 创建 Fabric.js 对象
   * @param templateObj 模板对象数据
   * @param options 应用选项
   */
  private async createFabricObject(
    templateObj: TemplateObject,
    options: TemplateApplyOptions
  ): Promise<fabric.Object | null> {
    const { fabricObject } = templateObj;
    
    // 应用自定义替换
    const customizedData = this.applyCustomizations(fabricObject, templateObj, options);

    try {
      switch (templateObj.type) {
        case 'text':
          return this.objectCreator.createTextObject(customizedData, templateObj);
        
        case 'image':
          return await this.objectCreator.createImageObject(customizedData, templateObj);
        
        case 'shape':
          return this.objectCreator.createShapeObject(customizedData, templateObj);
        
        case 'group':
          return await this.objectCreator.createGroupObject(customizedData, templateObj);
        
        default:
          console.warn(`Unknown object type: ${templateObj.type}`);
          return null;
      }
    } catch (error) {
      console.error(`Failed to create ${templateObj.type} object:`, error);
      throw new TemplateApplicationError(
        `创建${templateObj.type}对象失败: ${error}`,
        undefined,
        'object_creation'
      );
    }
  }



  /**
   * 设置可编辑元素
   * @param template 模板数据
   */
  private setupEditableElements(template: DesignTemplate): void {
    template.objects.forEach(templateObj => {
      const fabricObject = this.canvas.getObjects().find(obj => 
        (obj as any).templateId === templateObj.id
      );

      if (fabricObject && templateObj.editable) {
        this.setupObjectEditability(fabricObject, templateObj.editable);
        
        // 设置模板对象ID用于后续识别
        (fabricObject as any).templateId = templateObj.id;
        (fabricObject as any).templateEditable = templateObj.editable;
        (fabricObject as any).templatePlaceholder = templateObj.placeholder;
        
        // 注册占位符
        if (templateObj.placeholder) {
          this.placeholderSystem.registerPlaceholder(fabricObject, templateObj.placeholder);
          this.placeholderElements.set(templateObj.id, fabricObject);
        }
      }
    });
  }

  /**
   * 设置对象的可编辑性
   * @param obj Fabric.js 对象
   * @param editable 可编辑属性
   */
  private setupObjectEditability(obj: fabric.Object, editable: EditableProperties): void {
    // 设置选择和移动
    obj.set({
      selectable: editable.position || editable.size || editable.style,
      moveCursor: editable.position ? 'move' : 'default',
    });

    // 设置大小调整
    if (!editable.size) {
      obj.set({
        hasControls: false,
        hasBorders: editable.position,
      });
    }

    // 设置旋转
    if (!editable.position) {
      obj.set({
        hasRotatingPoint: false,
      });
    }

    // 对于文本对象，设置内容编辑
    if (obj instanceof fabric.IText && !editable.content) {
      obj.set({
        editable: false,
      });
    }
  }

  /**
   * 准备画布
   * @param template 模板数据
   * @param options 应用选项
   */
  private async prepareCanvas(
    template: DesignTemplate, 
    options: TemplateApplyOptions
  ): Promise<void> {
    // 设置画布尺寸
    if (!options.preserveCanvasSize) {
      this.canvas.setDimensions({
        width: template.canvas.width,
        height: template.canvas.height
      });
    }

    // 清空画布内容
    if (options.replaceContent !== false) {
      this.canvas.clear();
    }

    // 设置背景
    if (template.canvas.backgroundColor) {
      this.canvas.setBackgroundColor(
        template.canvas.backgroundColor, 
        this.canvas.renderAll.bind(this.canvas)
      );
    }

    // 设置背景图片
    if (template.canvas.backgroundImage) {
      await this.setCanvasBackgroundImage(template.canvas.backgroundImage);
    }
  }

  /**
   * 设置画布背景图片
   * @param imageUrl 图片URL
   */
  private async setCanvasBackgroundImage(imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(imageUrl, (img) => {
        if (!img) {
          reject(new Error('Failed to load background image'));
          return;
        }

        // 调整图片大小以适应画布
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        
        img.scaleToWidth(canvasWidth);
        if (img.getScaledHeight() < canvasHeight) {
          img.scaleToHeight(canvasHeight);
        }

        this.canvas.setBackgroundImage(img, () => {
          this.canvas.renderAll();
          resolve();
        });
      });
    });
  }

  /**
   * 应用自定义替换
   * @param fabricData 原始数据
   * @param templateObj 模板对象
   * @param options 应用选项
   */
  private applyCustomizations(
    fabricData: any,
    templateObj: TemplateObject,
    options: TemplateApplyOptions
  ): any {
    let customizedData = { ...fabricData };

    if (!options.customizations) {
      return customizedData;
    }

    const { customizations } = options;

    // 应用颜色替换
    if (customizations.colors && templateObj.editable.style) {
      Object.entries(customizations.colors).forEach(([oldColor, newColor]) => {
        if (customizedData.fill === oldColor) {
          customizedData.fill = newColor;
        }
        if (customizedData.stroke === oldColor) {
          customizedData.stroke = newColor;
        }
      });
    }

    // 应用字体替换
    if (customizations.fonts && templateObj.type === 'text') {
      Object.entries(customizations.fonts).forEach(([oldFont, newFont]) => {
        if (customizedData.fontFamily === oldFont) {
          customizedData.fontFamily = newFont;
        }
      });
    }

    // 应用文本替换
    if (customizations.texts && templateObj.type === 'text') {
      Object.entries(customizations.texts).forEach(([placeholder, newText]) => {
        if (customizedData.text === placeholder || 
            (templateObj.placeholder && templateObj.placeholder.defaultContent === placeholder)) {
          customizedData.text = newText;
        }
      });
    }

    // 应用图片替换
    if (customizations.images && templateObj.type === 'image') {
      Object.entries(customizations.images).forEach(([placeholder, newImageUrl]) => {
        if (customizedData.src === placeholder ||
            (templateObj.placeholder && templateObj.placeholder.defaultContent === placeholder)) {
          customizedData.src = newImageUrl;
        }
      });
    }

    return customizedData;
  }



  /**
   * 保存画布状态用于错误恢复
   */
  private saveCanvasState(): void {
    this.originalCanvasState = {
      objects: this.canvas.toJSON(),
      width: this.canvas.getWidth(),
      height: this.canvas.getHeight(),
      backgroundColor: this.canvas.backgroundColor,
    };
  }

  /**
   * 从错误中恢复
   */
  private async recoverFromError(): Promise<void> {
    if (this.originalCanvasState) {
      try {
        this.canvas.clear();
        this.canvas.setDimensions({
          width: this.originalCanvasState.width,
          height: this.originalCanvasState.height
        });
        
        if (this.originalCanvasState.backgroundColor) {
          this.canvas.setBackgroundColor(
            this.originalCanvasState.backgroundColor,
            this.canvas.renderAll.bind(this.canvas)
          );
        }

        await new Promise<void>((resolve) => {
          this.canvas.loadFromJSON(this.originalCanvasState.objects, () => {
            this.canvas.renderAll();
            resolve();
          });
        });
      } catch (error) {
        console.error('Failed to recover canvas state:', error);
      }
    }
  }

  /**
   * 报告进度
   * @param step 当前步骤
   * @param progress 进度百分比
   * @param message 进度消息
   * @param error 错误信息
   */
  private reportProgress(
    step: string, 
    progress: number, 
    message: string, 
    error?: Error
  ): void {
    if (this.config.enableProgressCallback && this.progressCallback) {
      this.progressCallback({
        step,
        progress,
        message,
        isComplete: progress >= 100,
        error: error?.message,
      });
    }
  }

  /**
   * 获取占位符元素
   * @param templateObjectId 模板对象ID
   */
  getPlaceholderElement(templateObjectId: string): fabric.Object | undefined {
    return this.placeholderElements.get(templateObjectId);
  }

  /**
   * 获取所有占位符元素
   */
  getAllPlaceholderElements(): Map<string, fabric.Object> {
    return new Map(this.placeholderElements);
  }

  /**
   * 设置占位符系统事件
   */
  private setupPlaceholderSystemEvents(): void {
    // 监听占位符建议请求
    this.placeholderSystem.addEventListener('placeholder:suggestions:requested', (data) => {
      // 可以在这里触发UI显示建议面板
      console.log('Placeholder suggestions requested:', data);
    });

    // 监听占位符内容变化
    this.placeholderSystem.addEventListener('placeholder:content:changed', (data) => {
      // 可以在这里更新模板统计或触发自动保存
      console.log('Placeholder content changed:', data);
    });

    // 监听占位符替换完成
    this.placeholderSystem.addEventListener('placeholder:replaced', (data) => {
      // 更新占位符元素映射
      if (data.target && data.placeholder) {
        const templateId = (data.target as any).templateId;
        if (templateId) {
          this.placeholderElements.set(templateId, data.target);
        }
      }
      console.log('Placeholder replaced:', data);
    });
  }

  /**
   * 获取占位符系统实例
   */
  getPlaceholderSystem(): PlaceholderSystem {
    return this.placeholderSystem;
  }

  /**
   * 替换占位符内容
   * @param templateObjectId 模板对象ID
   * @param content 新内容
   * @param options 替换选项
   */
  async replacePlaceholderContent(
    templateObjectId: string,
    content: string,
    options: { preserveStyle?: boolean; animateTransition?: boolean } = {}
  ): Promise<void> {
    const fabricObject = this.placeholderElements.get(templateObjectId);
    if (!fabricObject) {
      throw new Error(`Placeholder object not found: ${templateObjectId}`);
    }

    await this.placeholderSystem.replacePlaceholderContent(fabricObject, {
      content,
      preserveStyle: options.preserveStyle,
      animateTransition: options.animateTransition,
      validateContent: true,
    });
  }

  /**
   * 获取占位符建议
   * @param templateObjectId 模板对象ID
   */
  async getPlaceholderSuggestions(templateObjectId: string): Promise<any[]> {
    const fabricObject = this.placeholderElements.get(templateObjectId);
    if (!fabricObject) {
      return [];
    }

    return await this.placeholderSystem.getSuggestions(fabricObject);
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.placeholderElements.clear();
    this.originalCanvasState = null;
    this.progressCallback = undefined;
    
    // 清理占位符系统
    if (this.placeholderSystem) {
      this.placeholderSystem.cleanup();
    }
  }
}

// 导出默认实例创建函数
export function createTemplateEngine(
  canvas: fabric.Canvas,
  config?: Partial<TemplateEngineConfig>,
  progressCallback?: (progress: TemplateApplyProgress) => void
): TemplateEngine {
  return new TemplateEngine(canvas, config, progressCallback);
}