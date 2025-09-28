import { fabric } from 'fabric';
import { Template, SerializedObject } from '@/types';

export interface TemplateApplicationProgress {
  stage: 'parsing' | 'loading' | 'applying' | 'complete';
  progress: number;
  message: string;
  error?: string;
}

export interface TemplateApplicationOptions {
  clearCanvas?: boolean;
  preserveCanvasSize?: boolean;
  onProgress?: (progress: TemplateApplicationProgress) => void;
}

export class TemplateService {
  private static instance: TemplateService;

  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  /**
   * 应用模板到画布
   */
  public async applyTemplate(
    canvas: fabric.Canvas,
    template: Template,
    options: TemplateApplicationOptions = {}
  ): Promise<void> {
    const {
      clearCanvas = true,
      preserveCanvasSize = false,
      onProgress
    } = options;

    try {
      // 阶段1: 解析模板数据
      onProgress?.({
        stage: 'parsing',
        progress: 10,
        message: '正在解析模板数据...'
      });

      const templateData = this.parseTemplateData(template);
      
      // 阶段2: 清理画布（如果需要）
      if (clearCanvas) {
        onProgress?.({
          stage: 'loading',
          progress: 20,
          message: '正在清理画布...'
        });
        
        canvas.clear();
      }

      // 阶段3: 设置画布尺寸
      if (!preserveCanvasSize) {
        onProgress?.({
          stage: 'loading',
          progress: 30,
          message: '正在调整画布尺寸...'
        });
        
        canvas.setDimensions({
          width: template.width,
          height: template.height
        });
      }

      // 阶段4: 加载模板对象
      onProgress?.({
        stage: 'applying',
        progress: 40,
        message: '正在加载模板对象...'
      });

      await this.loadTemplateObjects(canvas, templateData, onProgress);

      // 阶段5: 完成
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: '模板应用完成'
      });

      // 渲染画布
      canvas.renderAll();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      onProgress?.({
        stage: 'complete',
        progress: 0,
        message: '模板应用失败',
        error: errorMessage
      });
      throw error;
    }
  }

  /**
   * 解析模板数据
   */
  private parseTemplateData(template: Template): SerializedObject {
    try {
      // 如果 objects 已经是对象，直接返回
      if (typeof template.objects === 'object') {
        return template.objects as SerializedObject;
      }

      // 如果是字符串，尝试解析
      if (typeof template.objects === 'string') {
        return JSON.parse(template.objects);
      }

      throw new Error('无效的模板数据格式');
    } catch (error) {
      throw new Error(`模板数据解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 加载模板对象到画布
   */
  private async loadTemplateObjects(
    canvas: fabric.Canvas,
    templateData: SerializedObject,
    onProgress?: (progress: TemplateApplicationProgress) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 使用 Fabric.js 的 loadFromJSON 方法
        canvas.loadFromJSON(templateData, () => {
          // 加载完成后的处理
          this.postProcessObjects(canvas);
          
          onProgress?.({
            stage: 'applying',
            progress: 90,
            message: '正在完成最后处理...'
          });
          
          resolve();
        }, (o: any, object: fabric.Object) => {
          // 对象加载回调，可以在这里进行自定义处理
          this.processLoadedObject(object);
        });
      } catch (error) {
        reject(new Error(`对象加载失败: ${error instanceof Error ? error.message : '未知错误'}`));
      }
    });
  }

  /**
   * 处理加载后的对象
   */
  private processLoadedObject(object: fabric.Object): void {
    // 确保对象可选择和可编辑
    object.set({
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true
    });

    // 为对象添加唯一ID（如果没有）
    if (!object.id) {
      object.id = this.generateObjectId();
    }

    // 处理特定类型的对象
    if (object.type === 'text' || object.type === 'i-text') {
      this.processTextObject(object as fabric.IText);
    } else if (object.type === 'image') {
      this.processImageObject(object as fabric.Image);
    }
  }

  /**
   * 处理文本对象
   */
  private processTextObject(textObject: fabric.IText): void {
    // 确保文本对象可编辑
    textObject.set({
      editable: true,
      selectable: true
    });

    // 添加双击编辑事件
    textObject.on('mousedblclick', () => {
      textObject.enterEditing();
      textObject.selectAll();
    });
  }

  /**
   * 处理图片对象
   */
  private processImageObject(imageObject: fabric.Image): void {
    // 确保图片对象的交互性
    imageObject.set({
      selectable: true,
      evented: true
    });

    // 处理图片加载错误
    if (imageObject.getElement()) {
      const imgElement = imageObject.getElement() as HTMLImageElement;
      imgElement.onerror = () => {
        console.warn('Template image failed to load:', imageObject.getSrc());
        // 可以设置一个默认的占位图片
        this.setPlaceholderImage(imageObject);
      };
    }
  }

  /**
   * 设置占位图片
   */
  private setPlaceholderImage(imageObject: fabric.Image): void {
    // 创建一个简单的占位符
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 200;
    
    // 绘制占位符
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#999';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('图片加载失败', 100, 100);

    // 设置为图片源
    imageObject.setSrc(canvas.toDataURL(), () => {
      imageObject.canvas?.renderAll();
    });
  }

  /**
   * 后处理所有对象
   */
  private postProcessObjects(canvas: fabric.Canvas): void {
    const objects = canvas.getObjects();
    
    objects.forEach((object, index) => {
      // 确保对象有正确的层级
      object.moveTo(index);
      
      // 添加对象变更监听
      object.on('modified', () => {
        // 触发画布更新事件
        canvas.fire('object:modified', { target: object });
      });
    });

    // 清除选择
    canvas.discardActiveObject();
  }

  /**
   * 生成对象ID
   */
  private generateObjectId(): string {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 验证模板数据
   */
  public validateTemplate(template: Template): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 检查必需字段
    if (!template.id) errors.push('模板ID不能为空');
    if (!template.name) errors.push('模板名称不能为空');
    if (!template.objects) errors.push('模板对象数据不能为空');
    if (!template.width || template.width <= 0) errors.push('模板宽度必须大于0');
    if (!template.height || template.height <= 0) errors.push('模板高度必须大于0');

    // 检查对象数据格式
    try {
      const templateData = this.parseTemplateData(template);
      if (!templateData.objects || !Array.isArray(templateData.objects)) {
        errors.push('模板对象数据格式无效');
      }
    } catch (error) {
      errors.push(`模板数据解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 预览模板（生成缩略图）
   */
  public async generateThumbnail(
    template: Template,
    options: {
      width?: number;
      height?: number;
      quality?: number;
    } = {}
  ): Promise<string> {
    const { width = 200, height = 300, quality = 0.8 } = options;

    // 创建临时画布
    const tempCanvas = new fabric.Canvas(document.createElement('canvas'), {
      width: template.width,
      height: template.height
    });

    try {
      // 应用模板到临时画布
      await this.applyTemplate(tempCanvas, template, {
        clearCanvas: true,
        preserveCanvasSize: false
      });

      // 生成缩略图
      const thumbnail = tempCanvas.toDataURL({
        format: 'png',
        quality,
        multiplier: Math.min(width / template.width, height / template.height)
      });

      return thumbnail;
    } finally {
      // 清理临时画布
      tempCanvas.dispose();
    }
  }

  /**
   * 从当前画布创建模板
   */
  public createTemplateFromCanvas(
    canvas: fabric.Canvas,
    templateInfo: {
      name: string;
      description: string;
      category: string;
      tags: string[];
    }
  ): Template {
    const canvasData = canvas.toJSON();
    const canvasSize = canvas.getCenter();

    const template: Template = {
      id: `custom_${Date.now()}`,
      name: templateInfo.name,
      description: templateInfo.description,
      category: templateInfo.category,
      thumbnail: canvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 0.3
      }),
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      objects: canvasData,
      tags: templateInfo.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      author: '用户'
    };

    return template;
  }
}

// 导出单例实例
export const templateService = TemplateService.getInstance();