/**
 * 模板渲染器服务
 * 提供快速预览渲染和高质量完整渲染功能
 * 支持渲染进度回调和错误处理
 */

import { fabric } from 'fabric';
import { 
  DesignTemplate, 
  TemplateObject,
  TemplateApplyProgress 
} from '@/types/template';
import { FabricObjectCreator } from './fabricObjectCreator';
import { templateRenderCache } from './templateRenderCache';

// 渲染模式枚举
export enum RenderMode {
  FAST_PREVIEW = 'fast_preview',      // 快速预览模式
  HIGH_QUALITY = 'high_quality',      // 高质量完整渲染模式
  THUMBNAIL = 'thumbnail'             // 缩略图模式
}

// 渲染选项接口
export interface RenderOptions {
  mode: RenderMode;
  width?: number;                     // 渲染宽度
  height?: number;                    // 渲染高度
  quality?: number;                   // 渲染质量 (0.1-1.0)
  format?: 'png' | 'jpeg' | 'webp';   // 输出格式
  backgroundColor?: string;           // 背景颜色
  enableAntialiasing?: boolean;       // 抗锯齿
  enableShadows?: boolean;            // 阴影效果
  enableFilters?: boolean;            // 滤镜效果
  maxObjects?: number;                // 最大对象数量限制
  timeout?: number;                   // 渲染超时时间(ms)
}

// 渲染结果接口
export interface RenderResult {
  dataUrl: string;                    // 渲染结果的数据URL
  width: number;                      // 实际渲染宽度
  height: number;                     // 实际渲染高度
  renderTime: number;                 // 渲染耗时(ms)
  objectCount: number;                // 渲染的对象数量
  mode: RenderMode;                   // 使用的渲染模式
  quality: number;                    // 实际渲染质量
}

// 渲染进度回调类型
export type RenderProgressCallback = (progress: TemplateApplyProgress) => void;

// 渲染错误类
export class TemplateRenderError extends Error {
  constructor(
    message: string, 
    public templateId?: string, 
    public renderMode?: RenderMode,
    public step?: string
  ) {
    super(message);
    this.name = 'TemplateRenderError';
  }
}

// 默认渲染选项
const DEFAULT_RENDER_OPTIONS: Partial<RenderOptions> = {
  quality: 1.0,
  format: 'png',
  enableAntialiasing: true,
  enableShadows: true,
  enableFilters: true,
  timeout: 30000, // 30秒超时
};

// 快速预览模式选项
const FAST_PREVIEW_OPTIONS: Partial<RenderOptions> = {
  quality: 0.6,
  format: 'jpeg',
  enableAntialiasing: false,
  enableShadows: false,
  enableFilters: false,
  maxObjects: 50,
  timeout: 5000, // 5秒超时
};

// 缩略图模式选项
const THUMBNAIL_OPTIONS: Partial<RenderOptions> = {
  width: 300,
  height: 300,
  quality: 0.8,
  format: 'jpeg',
  enableAntialiasing: true,
  enableShadows: false,
  enableFilters: false,
  maxObjects: 30,
  timeout: 3000, // 3秒超时
};

/**
 * 模板渲染器类
 * 提供多种渲染模式和性能优化
 */
export class TemplateRenderer {
  private objectCreator: FabricObjectCreator;
  private activeRenders: Map<string, Promise<RenderResult>> = new Map();

  constructor() {
    this.objectCreator = new FabricObjectCreator({
      enablePlaceholder: false,
      enableEditing: false,
      crossOrigin: 'anonymous',
    });
  }

  /**
   * 渲染模板
   * @param template 模板数据
   * @param options 渲染选项
   * @param progressCallback 进度回调
   */
  async renderTemplate(
    template: DesignTemplate,
    options: Partial<RenderOptions> = {},
    progressCallback?: RenderProgressCallback
  ): Promise<RenderResult> {
    const startTime = Date.now();
    const renderOptions = this.mergeRenderOptions(options);
    const cacheKey = this.generateCacheKey(template.id, renderOptions);

    // 检查缓存
    const cachedResult = templateRenderCache.getRenderResult(cacheKey);
    if (cachedResult) {
      this.reportProgress(progressCallback, 'complete', 100, '使用缓存结果');
      return cachedResult;
    }

    // 检查是否已有相同的渲染任务在进行
    if (this.activeRenders.has(cacheKey)) {
      this.reportProgress(progressCallback, 'waiting', 0, '等待现有渲染任务完成');
      return await this.activeRenders.get(cacheKey)!;
    }

    // 创建渲染任务
    const renderPromise = this.performRender(template, renderOptions, progressCallback, startTime);
    this.activeRenders.set(cacheKey, renderPromise);

    try {
      const result = await renderPromise;
      
      // 缓存结果
      templateRenderCache.setRenderResult(cacheKey, result);
      
      return result;
    } finally {
      // 清理活跃渲染任务
      this.activeRenders.delete(cacheKey);
    }
  }

  /**
   * 执行实际渲染
   * @param template 模板数据
   * @param options 渲染选项
   * @param progressCallback 进度回调
   * @param startTime 开始时间
   */
  private async performRender(
    template: DesignTemplate,
    options: RenderOptions,
    progressCallback?: RenderProgressCallback,
    startTime: number = Date.now()
  ): Promise<RenderResult> {
    let offscreenCanvas: fabric.Canvas | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      this.reportProgress(progressCallback, 'initializing', 0, '初始化渲染环境');

      // 设置超时
      if (options.timeout) {
        timeoutId = setTimeout(() => {
          throw new TemplateRenderError(
            `渲染超时 (${options.timeout}ms)`,
            template.id,
            options.mode,
            'timeout'
          );
        }, options.timeout);
      }

      // 创建离屏Canvas
      offscreenCanvas = await this.createOffscreenCanvas(template, options);

      this.reportProgress(progressCallback, 'preparing', 10, '准备渲染数据');

      // 根据渲染模式优化对象列表
      const objectsToRender = this.optimizeObjectsForRender(template.objects, options);

      this.reportProgress(progressCallback, 'rendering', 20, '开始渲染对象');

      // 渲染对象
      await this.renderObjects(offscreenCanvas, objectsToRender, options, progressCallback);

      this.reportProgress(progressCallback, 'finalizing', 90, '完成渲染');

      // 生成最终结果
      const result = await this.generateRenderResult(
        offscreenCanvas, 
        template, 
        options, 
        startTime,
        objectsToRender.length
      );

      this.reportProgress(progressCallback, 'complete', 100, '渲染完成');

      return result;

    } catch (error) {
      const renderError = error instanceof TemplateRenderError 
        ? error 
        : new TemplateRenderError(
            `渲染失败: ${error}`,
            template.id,
            options.mode,
            'render'
          );

      this.reportProgress(progressCallback, 'error', 0, '渲染失败', renderError);
      throw renderError;

    } finally {
      // 清理资源
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (offscreenCanvas) {
        offscreenCanvas.dispose();
      }
    }
  }

  /**
   * 创建离屏Canvas
   * @param template 模板数据
   * @param options 渲染选项
   */
  private async createOffscreenCanvas(
    template: DesignTemplate,
    options: RenderOptions
  ): Promise<fabric.Canvas> {
    // 计算渲染尺寸
    const renderWidth = options.width || template.canvas.width;
    const renderHeight = options.height || template.canvas.height;

    // 创建离屏Canvas元素
    const canvasElement = document.createElement('canvas');
    canvasElement.width = renderWidth;
    canvasElement.height = renderHeight;

    // 创建Fabric Canvas
    const canvas = new fabric.Canvas(canvasElement, {
      width: renderWidth,
      height: renderHeight,
      renderOnAddRemove: false,
      skipTargetFind: true,
      selection: false,
      interactive: false,
    });

    // 设置渲染质量
    this.configureCanvasQuality(canvas, options);

    // 设置背景
    await this.setupCanvasBackground(canvas, template, options);

    return canvas;
  }

  /**
   * 配置Canvas渲染质量
   * @param canvas Fabric Canvas
   * @param options 渲染选项
   */
  private configureCanvasQuality(canvas: fabric.Canvas, options: RenderOptions): void {
    const ctx = canvas.getContext();
    
    // 设置抗锯齿
    if (options.enableAntialiasing) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = options.mode === RenderMode.HIGH_QUALITY ? 'high' : 'medium';
    } else {
      ctx.imageSmoothingEnabled = false;
    }

    // 设置文本渲染质量
    ctx.textBaseline = 'alphabetic';
    
    // 高质量模式的额外设置
    if (options.mode === RenderMode.HIGH_QUALITY) {
      canvas.enableRetinaScaling = true;
    }
  }

  /**
   * 设置Canvas背景
   * @param canvas Fabric Canvas
   * @param template 模板数据
   * @param options 渲染选项
   */
  private async setupCanvasBackground(
    canvas: fabric.Canvas,
    template: DesignTemplate,
    options: RenderOptions
  ): Promise<void> {
    // 设置背景颜色
    const backgroundColor = options.backgroundColor || template.canvas.backgroundColor;
    if (backgroundColor) {
      canvas.setBackgroundColor(backgroundColor, () => {});
    }

    // 设置背景图片
    if (template.canvas.backgroundImage && options.mode !== RenderMode.FAST_PREVIEW) {
      await this.setCanvasBackgroundImage(canvas, template.canvas.backgroundImage);
    }
  }

  /**
   * 设置Canvas背景图片
   * @param canvas Fabric Canvas
   * @param imageUrl 图片URL
   */
  private async setCanvasBackgroundImage(canvas: fabric.Canvas, imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(imageUrl, (img) => {
        if (!img) {
          reject(new Error('Failed to load background image'));
          return;
        }

        // 调整图片大小
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        
        img.scaleToWidth(canvasWidth);
        if (img.getScaledHeight() < canvasHeight) {
          img.scaleToHeight(canvasHeight);
        }

        canvas.setBackgroundImage(img, () => resolve());
      }, { crossOrigin: 'anonymous' });
    });
  }

  /**
   * 优化对象列表用于渲染
   * @param objects 原始对象列表
   * @param options 渲染选项
   */
  private optimizeObjectsForRender(
    objects: TemplateObject[],
    options: RenderOptions
  ): TemplateObject[] {
    let optimizedObjects = [...objects];

    // 根据渲染模式进行优化
    switch (options.mode) {
      case RenderMode.FAST_PREVIEW:
        // 快速预览模式：限制对象数量，跳过复杂对象
        optimizedObjects = optimizedObjects
          .filter(obj => this.isSimpleObject(obj))
          .slice(0, options.maxObjects || 50);
        break;

      case RenderMode.THUMBNAIL:
        // 缩略图模式：只保留主要对象
        optimizedObjects = optimizedObjects
          .filter(obj => this.isMainObject(obj))
          .slice(0, options.maxObjects || 30);
        break;

      case RenderMode.HIGH_QUALITY:
        // 高质量模式：保留所有对象
        break;
    }

    // 按z-index排序
    return optimizedObjects.sort((a, b) => {
      const aZIndex = (a.fabricObject as any).zIndex || 0;
      const bZIndex = (b.fabricObject as any).zIndex || 0;
      return aZIndex - bZIndex;
    });
  }

  /**
   * 判断是否为简单对象（用于快速预览）
   * @param obj 模板对象
   */
  private isSimpleObject(obj: TemplateObject): boolean {
    // 跳过复杂的组合对象和带滤镜的对象
    if (obj.type === 'group') return false;
    if (obj.fabricObject.filters && obj.fabricObject.filters.length > 0) return false;
    if (obj.fabricObject.shadow) return false;
    return true;
  }

  /**
   * 判断是否为主要对象（用于缩略图）
   * @param obj 模板对象
   */
  private isMainObject(obj: TemplateObject): boolean {
    // 保留文本和主要图片对象
    if (obj.type === 'text') return true;
    if (obj.type === 'image' && obj.fabricObject.width > 100) return true;
    if (obj.type === 'shape' && obj.fabricObject.width > 50) return true;
    return false;
  }

  /**
   * 渲染对象到Canvas
   * @param canvas Fabric Canvas
   * @param objects 对象列表
   * @param options 渲染选项
   * @param progressCallback 进度回调
   */
  private async renderObjects(
    canvas: fabric.Canvas,
    objects: TemplateObject[],
    options: RenderOptions,
    progressCallback?: RenderProgressCallback
  ): Promise<void> {
    const totalObjects = objects.length;
    let processedObjects = 0;

    for (const templateObj of objects) {
      try {
        // 报告进度
        const progress = 20 + (processedObjects / totalObjects) * 70;
        this.reportProgress(
          progressCallback,
          'rendering',
          progress,
          `渲染对象 ${processedObjects + 1}/${totalObjects}`
        );

        // 创建Fabric对象
        const fabricObject = await this.createRenderObject(templateObj, options);
        
        if (fabricObject) {
          canvas.add(fabricObject);
        }

        processedObjects++;

      } catch (error) {
        console.warn(`Failed to render object ${templateObj.id}:`, error);
        
        // 在快速预览模式下跳过错误对象
        if (options.mode === RenderMode.FAST_PREVIEW) {
          processedObjects++;
          continue;
        }
        
        throw new TemplateRenderError(
          `渲染对象失败: ${error}`,
          undefined,
          options.mode,
          'object_render'
        );
      }
    }

    // 最终渲染
    canvas.renderAll();
  }

  /**
   * 创建用于渲染的Fabric对象
   * @param templateObj 模板对象
   * @param options 渲染选项
   */
  private async createRenderObject(
    templateObj: TemplateObject,
    options: RenderOptions
  ): Promise<fabric.Object | null> {
    const fabricData = { ...templateObj.fabricObject };

    // 根据渲染模式优化对象属性
    this.optimizeObjectForRender(fabricData, options);

    try {
      switch (templateObj.type) {
        case 'text':
          return this.objectCreator.createTextObject(fabricData, templateObj);
        
        case 'image':
          return await this.objectCreator.createImageObject(fabricData, templateObj);
        
        case 'shape':
          return this.objectCreator.createShapeObject(fabricData, templateObj);
        
        case 'group':
          return await this.objectCreator.createGroupObject(fabricData, templateObj);
        
        default:
          console.warn(`Unknown object type: ${templateObj.type}`);
          return null;
      }
    } catch (error) {
      console.error(`Failed to create render object:`, error);
      return null;
    }
  }

  /**
   * 优化对象属性用于渲染
   * @param fabricData Fabric对象数据
   * @param options 渲染选项
   */
  private optimizeObjectForRender(fabricData: any, options: RenderOptions): void {
    // 禁用交互功能
    fabricData.selectable = false;
    fabricData.evented = false;
    fabricData.hasControls = false;
    fabricData.hasBorders = false;

    // 根据渲染模式优化
    switch (options.mode) {
      case RenderMode.FAST_PREVIEW:
        // 快速预览：移除阴影和滤镜
        if (!options.enableShadows) {
          delete fabricData.shadow;
        }
        if (!options.enableFilters) {
          delete fabricData.filters;
        }
        break;

      case RenderMode.THUMBNAIL:
        // 缩略图：简化复杂属性
        delete fabricData.shadow;
        if (fabricData.filters && fabricData.filters.length > 2) {
          fabricData.filters = fabricData.filters.slice(0, 2);
        }
        break;

      case RenderMode.HIGH_QUALITY:
        // 高质量：保留所有属性
        break;
    }
  }

  /**
   * 生成渲染结果
   * @param canvas Fabric Canvas
   * @param template 模板数据
   * @param options 渲染选项
   * @param startTime 开始时间
   * @param objectCount 对象数量
   */
  private async generateRenderResult(
    canvas: fabric.Canvas,
    template: DesignTemplate,
    options: RenderOptions,
    startTime: number,
    objectCount: number
  ): Promise<RenderResult> {
    // 生成数据URL
    const dataUrl = canvas.toDataURL({
      format: options.format,
      quality: options.quality,
      multiplier: options.mode === RenderMode.HIGH_QUALITY ? 2 : 1,
    });

    return {
      dataUrl,
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      renderTime: Date.now() - startTime,
      objectCount,
      mode: options.mode,
      quality: options.quality || 1.0,
    };
  }

  /**
   * 合并渲染选项
   * @param options 用户选项
   */
  private mergeRenderOptions(options: Partial<RenderOptions>): RenderOptions {
    let modeOptions: Partial<RenderOptions> = {};

    // 根据模式选择默认选项
    switch (options.mode) {
      case RenderMode.FAST_PREVIEW:
        modeOptions = FAST_PREVIEW_OPTIONS;
        break;
      case RenderMode.THUMBNAIL:
        modeOptions = THUMBNAIL_OPTIONS;
        break;
      case RenderMode.HIGH_QUALITY:
      default:
        modeOptions = {};
        break;
    }

    return {
      ...DEFAULT_RENDER_OPTIONS,
      ...modeOptions,
      ...options,
      mode: options.mode || RenderMode.HIGH_QUALITY,
    } as RenderOptions;
  }

  /**
   * 生成缓存键
   * @param templateId 模板ID
   * @param options 渲染选项
   */
  private generateCacheKey(templateId: string, options: RenderOptions): string {
    return templateRenderCache.generateRenderKey(templateId, {
      mode: options.mode,
      width: options.width,
      height: options.height,
      quality: options.quality,
      format: options.format,
    });
  }

  /**
   * 报告渲染进度
   * @param callback 进度回调
   * @param step 当前步骤
   * @param progress 进度百分比
   * @param message 进度消息
   * @param error 错误信息
   */
  private reportProgress(
    callback: RenderProgressCallback | undefined,
    step: string,
    progress: number,
    message: string,
    error?: Error
  ): void {
    if (callback) {
      callback({
        step,
        progress,
        message,
        isComplete: progress >= 100,
        error: error?.message,
      });
    }
  }

  /**
   * 快速预览渲染
   * @param template 模板数据
   * @param progressCallback 进度回调
   */
  async renderFastPreview(
    template: DesignTemplate,
    progressCallback?: RenderProgressCallback
  ): Promise<RenderResult> {
    return this.renderTemplate(
      template,
      { mode: RenderMode.FAST_PREVIEW },
      progressCallback
    );
  }

  /**
   * 高质量完整渲染
   * @param template 模板数据
   * @param progressCallback 进度回调
   */
  async renderHighQuality(
    template: DesignTemplate,
    progressCallback?: RenderProgressCallback
  ): Promise<RenderResult> {
    return this.renderTemplate(
      template,
      { mode: RenderMode.HIGH_QUALITY },
      progressCallback
    );
  }

  /**
   * 渲染缩略图
   * @param template 模板数据
   * @param size 缩略图尺寸
   * @param progressCallback 进度回调
   */
  async renderThumbnail(
    template: DesignTemplate,
    size: { width: number; height: number } = { width: 300, height: 300 },
    progressCallback?: RenderProgressCallback
  ): Promise<RenderResult> {
    return this.renderTemplate(
      template,
      { 
        mode: RenderMode.THUMBNAIL,
        width: size.width,
        height: size.height,
      },
      progressCallback
    );
  }

  /**
   * 清理缓存
   * @param templateId 可选的模板ID，如果提供则只清理该模板的缓存
   */
  clearCache(templateId?: string): void {
    if (templateId) {
      templateRenderCache.invalidateTemplate(templateId);
    } else {
      templateRenderCache.clearAll();
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return templateRenderCache.getStats();
  }

  /**
   * 取消活跃的渲染任务
   * @param templateId 模板ID
   */
  cancelRender(templateId: string): void {
    const keysToCancel: string[] = [];
    for (const key of this.activeRenders.keys()) {
      try {
        const keyData = JSON.parse(atob(key));
        if (keyData.templateId === templateId) {
          keysToCancel.push(key);
        }
      } catch (error) {
        // 忽略解析错误的键
      }
    }
    keysToCancel.forEach(key => this.activeRenders.delete(key));
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.activeRenders.clear();
  }
}

// 导出默认实例
export const templateRenderer = new TemplateRenderer();

// 导出便捷函数
export async function renderTemplatePreview(
  template: DesignTemplate,
  progressCallback?: RenderProgressCallback
): Promise<RenderResult> {
  return templateRenderer.renderFastPreview(template, progressCallback);
}

export async function renderTemplateHighQuality(
  template: DesignTemplate,
  progressCallback?: RenderProgressCallback
): Promise<RenderResult> {
  return templateRenderer.renderHighQuality(template, progressCallback);
}

export async function renderTemplateThumbnail(
  template: DesignTemplate,
  size?: { width: number; height: number },
  progressCallback?: RenderProgressCallback
): Promise<RenderResult> {
  return templateRenderer.renderThumbnail(template, size, progressCallback);
}