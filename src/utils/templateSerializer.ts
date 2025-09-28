/**
 * 模板序列化工具
 * 提供 Fabric.js 对象与模板对象之间的转换功能，以及序列化数据的压缩和优化
 */

import { fabric } from 'fabric';
import {
  DesignTemplate,
  TemplateObject,
  TemplateSerializationOptions,
  TemplateExportData,
  TemplateCanvas,
  TemplateObjectType
} from '../types/template';

export class TemplateSerializer {
  /**
   * 将 Fabric.js 画布转换为模板对象
   */
  static async serializeCanvasToTemplate(
    canvas: fabric.Canvas,
    templateInfo: Partial<DesignTemplate>,
    options: TemplateSerializationOptions = {}
  ): Promise<DesignTemplate> {
    try {
      // 序列化画布配置
      const templateCanvas = this.serializeCanvas(canvas);
      
      // 序列化所有对象
      const objects = await this.serializeCanvasObjects(canvas, options);
      
      // 生成预览图
      const preview = options.includePreview 
        ? await this.generatePreview(canvas)
        : templateInfo.preview || {
            thumbnail: '',
            fullPreview: '',
            description: ''
          };

      // 构建完整的模板对象
      const template: DesignTemplate = {
        id: templateInfo.id || this.generateTemplateId(),
        name: templateInfo.name || '未命名模板',
        description: templateInfo.description || '',
        category: templateInfo.category!,
        subcategory: templateInfo.subcategory,
        canvas: templateCanvas,
        objects,
        metadata: {
          tags: templateInfo.metadata?.tags || [],
          style: templateInfo.metadata?.style!,
          industry: templateInfo.metadata?.industry || [],
          difficulty: templateInfo.metadata?.difficulty || 'beginner',
          colors: this.extractColors(objects),
          fonts: this.extractFonts(objects),
          createdAt: templateInfo.metadata?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: templateInfo.metadata?.author || 'Unknown',
          version: templateInfo.metadata?.version || '2.1'
        },
        preview,
        customizable: templateInfo.customizable || {
          colors: true,
          fonts: true,
          images: true,
          text: true
        }
      };

      return template;
    } catch (error) {
      throw new Error(`模板序列化失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 将模板对象应用到 Fabric.js 画布
   */
  static async deserializeTemplateToCanvas(
    template: DesignTemplate,
    canvas: fabric.Canvas,
    options: { preserveCanvasSize?: boolean } = {}
  ): Promise<void> {
    try {
      // 清空画布
      canvas.clear();
      
      // 设置画布配置
      if (!options.preserveCanvasSize) {
        this.applyCanvasConfig(canvas, template.canvas);
      }
      
      // 反序列化所有对象
      const fabricObjects = await this.deserializeObjects(template.objects);
      
      // 添加对象到画布
      for (const obj of fabricObjects) {
        canvas.add(obj);
      }
      
      // 渲染画布
      canvas.renderAll();
      
    } catch (error) {
      throw new Error(`模板反序列化失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 序列化画布配置
   */
  private static serializeCanvas(canvas: fabric.Canvas): TemplateCanvas {
    return {
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      backgroundColor: canvas.backgroundColor as string || '#ffffff',
      backgroundImage: canvas.backgroundImage ? 
        (canvas.backgroundImage as any).src : undefined
    };
  }

  /**
   * 序列化画布对象
   */
  private static async serializeCanvasObjects(
    canvas: fabric.Canvas,
    options: TemplateSerializationOptions
  ): Promise<TemplateObject[]> {
    const objects: TemplateObject[] = [];
    const canvasObjects = canvas.getObjects();

    for (let i = 0; i < canvasObjects.length; i++) {
      const fabricObj = canvasObjects[i];
      const templateObj = await this.serializeFabricObject(fabricObj, i, options);
      objects.push(templateObj);
    }

    return objects;
  }

  /**
   * 序列化单个 Fabric.js 对象
   */
  private static async serializeFabricObject(
    fabricObj: fabric.Object,
    index: number,
    options: TemplateSerializationOptions
  ): Promise<TemplateObject> {
    // 获取对象类型
    const type = this.getFabricObjectType(fabricObj);
    
    // 序列化 Fabric.js 对象数据
    let fabricData = fabricObj.toObject();
    
    // 优化图片数据
    if (options.optimizeImages && type === 'image') {
      fabricData = await this.optimizeImageData(fabricData);
    }
    
    // 压缩数据
    if (options.compress) {
      fabricData = this.compressObjectData(fabricData);
    }

    return {
      id: `object-${index}-${Date.now()}`,
      type,
      fabricObject: fabricData,
      editable: this.determineEditableProperties(fabricObj, type),
      placeholder: this.generatePlaceholder(fabricObj, type)
    };
  }

  /**
   * 反序列化对象数组
   */
  private static async deserializeObjects(templateObjects: TemplateObject[]): Promise<fabric.Object[]> {
    const fabricObjects: fabric.Object[] = [];

    for (const templateObj of templateObjects) {
      try {
        const fabricObj = await this.deserializeFabricObject(templateObj);
        fabricObjects.push(fabricObj);
      } catch (error) {
        console.warn(`跳过无效对象 ${templateObj.id}:`, error);
      }
    }

    return fabricObjects;
  }

  /**
   * 反序列化单个模板对象
   */
  private static async deserializeFabricObject(templateObj: TemplateObject): Promise<fabric.Object> {
    return new Promise((resolve, reject) => {
      try {
        const fabricData = templateObj.fabricObject;
        
        // 根据对象类型创建 Fabric.js 对象
        switch (templateObj.type) {
          case 'text':
            const textObj = new fabric.Text(fabricData.text, fabricData);
            resolve(textObj);
            break;
            
          case 'image':
            if (fabricData.src) {
              fabric.Image.fromURL(fabricData.src, (img) => {
                img.set(fabricData);
                resolve(img);
              }, { crossOrigin: 'anonymous' });
            } else {
              reject(new Error('图片对象缺少 src 属性'));
            }
            break;
            
          case 'shape':
            const shapeObj = this.createShapeObject(fabricData);
            resolve(shapeObj);
            break;
            
          case 'group':
            // 递归处理组对象
            this.deserializeGroupObject(fabricData).then(resolve).catch(reject);
            break;
            
          default:
            // 尝试通用反序列化
            fabric.util.enlivenObjects([fabricData], (objects: fabric.Object[]) => {
              if (objects.length > 0) {
                resolve(objects[0]);
              } else {
                reject(new Error(`无法反序列化对象类型: ${templateObj.type}`));
              }
            });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 创建形状对象
   */
  private static createShapeObject(fabricData: any): fabric.Object {
    switch (fabricData.type) {
      case 'rect':
        return new fabric.Rect(fabricData);
      case 'circle':
        return new fabric.Circle(fabricData);
      case 'ellipse':
        return new fabric.Ellipse(fabricData);
      case 'triangle':
        return new fabric.Triangle(fabricData);
      case 'polygon':
        return new fabric.Polygon(fabricData.points, fabricData);
      case 'path':
        return new fabric.Path(fabricData.path, fabricData);
      case 'line':
        return new fabric.Line(fabricData.points, fabricData);
      default:
        throw new Error(`不支持的形状类型: ${fabricData.type}`);
    }
  }

  /**
   * 反序列化组对象
   */
  private static async deserializeGroupObject(fabricData: any): Promise<fabric.Group> {
    return new Promise((resolve, reject) => {
      if (!fabricData.objects || !Array.isArray(fabricData.objects)) {
        reject(new Error('组对象缺少子对象数据'));
        return;
      }

      fabric.util.enlivenObjects(fabricData.objects, (objects: fabric.Object[]) => {
        const group = new fabric.Group(objects, fabricData);
        resolve(group);
      });
    });
  }

  /**
   * 应用画布配置
   */
  private static applyCanvasConfig(canvas: fabric.Canvas, config: TemplateCanvas): void {
    canvas.setDimensions({
      width: config.width,
      height: config.height
    });
    
    canvas.setBackgroundColor(config.backgroundColor, canvas.renderAll.bind(canvas));
    
    if (config.backgroundImage) {
      fabric.Image.fromURL(config.backgroundImage, (img) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: config.width / (img.width || 1),
          scaleY: config.height / (img.height || 1)
        });
      });
    }
  }

  /**
   * 获取 Fabric.js 对象类型
   */
  private static getFabricObjectType(fabricObj: fabric.Object): TemplateObjectType {
    if (fabricObj instanceof fabric.Text || fabricObj instanceof fabric.IText || fabricObj instanceof fabric.Textbox) {
      return 'text';
    } else if (fabricObj instanceof fabric.Image) {
      return 'image';
    } else if (fabricObj instanceof fabric.Group) {
      return 'group';
    } else {
      return 'shape';
    }
  }

  /**
   * 确定可编辑属性
   */
  private static determineEditableProperties(fabricObj: fabric.Object, type: TemplateObjectType) {
    const baseEditable = {
      content: false,
      style: true,
      position: true,
      size: true
    };

    switch (type) {
      case 'text':
        return { ...baseEditable, content: true };
      case 'image':
        return { ...baseEditable, content: true }; // 可以替换图片
      case 'shape':
        return baseEditable;
      case 'group':
        return { ...baseEditable, content: false };
      default:
        return baseEditable;
    }
  }

  /**
   * 生成占位符信息
   */
  private static generatePlaceholder(fabricObj: fabric.Object, type: TemplateObjectType) {
    if (type === 'text' && fabricObj instanceof fabric.Text) {
      return {
        type: 'text' as const,
        defaultContent: fabricObj.text || '文本占位符',
        suggestions: ['标题文字', '描述文本', '联系信息']
      };
    } else if (type === 'image') {
      return {
        type: 'image' as const,
        defaultContent: '图片占位符',
        suggestions: ['产品图片', '背景图片', '装饰图片']
      };
    }
    
    return undefined;
  }

  /**
   * 提取颜色信息
   */
  private static extractColors(objects: TemplateObject[]): string[] {
    const colors = new Set<string>();
    
    objects.forEach(obj => {
      const fabricData = obj.fabricObject;
      
      if (fabricData.fill && typeof fabricData.fill === 'string') {
        colors.add(fabricData.fill);
      }
      
      if (fabricData.stroke && typeof fabricData.stroke === 'string') {
        colors.add(fabricData.stroke);
      }
      
      if (fabricData.backgroundColor && typeof fabricData.backgroundColor === 'string') {
        colors.add(fabricData.backgroundColor);
      }
    });
    
    return Array.from(colors);
  }

  /**
   * 提取字体信息
   */
  private static extractFonts(objects: TemplateObject[]): string[] {
    const fonts = new Set<string>();
    
    objects.forEach(obj => {
      if (obj.type === 'text' && obj.fabricObject.fontFamily) {
        fonts.add(obj.fabricObject.fontFamily);
      }
    });
    
    return Array.from(fonts);
  }

  /**
   * 生成预览图
   */
  private static async generatePreview(canvas: fabric.Canvas) {
    const dataURL = canvas.toDataURL({
      format: 'jpeg',
      quality: 0.8,
      multiplier: 0.5 // 缩略图使用较小尺寸
    });
    
    const fullPreview = canvas.toDataURL({
      format: 'png',
      quality: 1.0
    });

    return {
      thumbnail: dataURL,
      fullPreview: fullPreview,
      description: '自动生成的预览图'
    };
  }

  /**
   * 优化图片数据
   */
  private static async optimizeImageData(fabricData: any): Promise<any> {
    // 这里可以实现图片压缩、格式转换等优化
    // 目前返回原始数据
    return fabricData;
  }

  /**
   * 压缩对象数据
   */
  private static compressObjectData(fabricData: any): any {
    // 移除不必要的属性
    const compressed = { ...fabricData };
    
    // 删除默认值属性以减少数据大小
    const defaultValues = {
      opacity: 1,
      visible: true,
      selectable: true,
      evented: true,
      angle: 0,
      skewX: 0,
      skewY: 0,
      flipX: false,
      flipY: false
    };
    
    Object.keys(defaultValues).forEach(key => {
      if (compressed[key] === (defaultValues as any)[key]) {
        delete compressed[key];
      }
    });
    
    return compressed;
  }

  /**
   * 生成模板ID
   */
  private static generateTemplateId(): string {
    return `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 导出模板数据
   */
  static async exportTemplate(
    template: DesignTemplate,
    options: TemplateSerializationOptions = {}
  ): Promise<TemplateExportData> {
    try {
      let exportedTemplate = { ...template };
      
      // 压缩数据
      if (options.compress) {
        exportedTemplate = this.compressTemplateData(exportedTemplate);
      }
      
      // 收集资源文件
      const assets = await this.collectTemplateAssets(template);
      
      return {
        template: exportedTemplate,
        assets: assets,
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'TemplateSerializer',
          version: '2.1'
        }
      };
    } catch (error) {
      throw new Error(`模板导出失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 导入模板数据
   */
  static async importTemplate(exportData: TemplateExportData): Promise<DesignTemplate> {
    try {
      let template = exportData.template;
      
      // 恢复资源文件
      if (exportData.assets) {
        template = await this.restoreTemplateAssets(template, exportData.assets);
      }
      
      return template;
    } catch (error) {
      throw new Error(`模板导入失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 压缩模板数据
   */
  private static compressTemplateData(template: DesignTemplate): DesignTemplate {
    return {
      ...template,
      objects: template.objects.map(obj => ({
        ...obj,
        fabricObject: this.compressObjectData(obj.fabricObject)
      }))
    };
  }

  /**
   * 收集模板资源
   */
  private static async collectTemplateAssets(template: DesignTemplate): Promise<Record<string, string>> {
    const assets: Record<string, string> = {};
    
    // 收集图片资源
    for (const obj of template.objects) {
      if (obj.type === 'image' && obj.fabricObject.src) {
        try {
          const response = await fetch(obj.fabricObject.src);
          const blob = await response.blob();
          const base64 = await this.blobToBase64(blob);
          assets[obj.fabricObject.src] = base64;
        } catch (error) {
          console.warn(`无法收集资源 ${obj.fabricObject.src}:`, error);
        }
      }
    }
    
    return assets;
  }

  /**
   * 恢复模板资源
   */
  private static async restoreTemplateAssets(
    template: DesignTemplate,
    assets: Record<string, string>
  ): Promise<DesignTemplate> {
    const restoredTemplate = { ...template };
    
    restoredTemplate.objects = template.objects.map(obj => {
      if (obj.type === 'image' && obj.fabricObject.src && assets[obj.fabricObject.src]) {
        return {
          ...obj,
          fabricObject: {
            ...obj.fabricObject,
            src: assets[obj.fabricObject.src]
          }
        };
      }
      return obj;
    });
    
    return restoredTemplate;
  }

  /**
   * Blob 转 Base64
   */
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}