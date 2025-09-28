/**
 * Fabric.js 对象创建器
 * 负责创建各种类型的 Fabric.js 对象
 */

import { fabric } from 'fabric';
import { TemplateObject, TemplatePlaceholder } from '@/types/template';

// 对象创建选项接口
export interface ObjectCreationOptions {
  enablePlaceholder?: boolean;
  enableEditing?: boolean;
  customProperties?: Record<string, any>;
  imageLoadTimeout?: number;
  crossOrigin?: string;
}

// 默认创建选项
const DEFAULT_OPTIONS: ObjectCreationOptions = {
  enablePlaceholder: true,
  enableEditing: true,
  customProperties: {},
  imageLoadTimeout: 10000,
  crossOrigin: 'anonymous',
};

/**
 * Fabric.js 对象创建器类
 * 提供创建各种 Fabric.js 对象的方法
 */
export class FabricObjectCreator {
  private options: ObjectCreationOptions;

  constructor(options: Partial<ObjectCreationOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * 创建文本对象
   * @param fabricData Fabric.js 序列化数据
   * @param templateObj 模板对象信息
   */
  createTextObject(
    fabricData: any, 
    templateObj?: TemplateObject
  ): fabric.Text | fabric.IText {
    const text = fabricData.text || '';
    const isEditable = templateObj?.editable?.content ?? this.options.enableEditing;
    
    // 基础属性
    const baseProps = {
      ...fabricData,
      ...this.options.customProperties,
    };

    let textObj: fabric.Text | fabric.IText;

    if (isEditable) {
      // 创建可编辑文本
      textObj = new fabric.IText(text, {
        ...baseProps,
        selectable: true,
        editable: true,
        // 文本编辑相关属性
        editingBorderColor: '#007bff',
        cursorColor: '#007bff',
        cursorWidth: 2,
      });

      // 添加编辑事件监听
      this.setupTextEditingEvents(textObj as fabric.IText);
    } else {
      // 创建静态文本
      textObj = new fabric.Text(text, {
        ...baseProps,
        selectable: templateObj?.editable?.position || templateObj?.editable?.size || false,
        editable: false,
      });
    }

    // 应用占位符样式
    if (this.options.enablePlaceholder && templateObj?.placeholder) {
      this.applyPlaceholderStyle(textObj, templateObj.placeholder);
      this.setupPlaceholderBehavior(textObj, templateObj.placeholder);
    }

    // 设置模板相关属性
    if (templateObj) {
      this.setTemplateProperties(textObj, templateObj);
    }

    return textObj;
  }

  /**
   * 创建图片对象
   * @param fabricData Fabric.js 序列化数据
   * @param templateObj 模板对象信息
   */
  async createImageObject(
    fabricData: any, 
    templateObj?: TemplateObject
  ): Promise<fabric.Image> {
    const imgSrc = fabricData.src || fabricData.url;
    
    if (!imgSrc) {
      // 创建占位符图片
      if (this.options.enablePlaceholder && templateObj?.placeholder) {
        return this.createImagePlaceholder(fabricData, templateObj.placeholder);
      } else {
        throw new Error('Image source not found and placeholder disabled');
      }
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image load timeout: ${imgSrc}`));
      }, this.options.imageLoadTimeout);

      fabric.Image.fromURL(imgSrc, (img) => {
        clearTimeout(timeoutId);
        
        if (!img) {
          reject(new Error(`Failed to load image: ${imgSrc}`));
          return;
        }

        // 应用基础属性
        img.set({
          ...fabricData,
          ...this.options.customProperties,
          selectable: templateObj?.editable?.position || templateObj?.editable?.size || true,
        });

        // 设置图片特定属性
        this.setupImageProperties(img, fabricData);

        // 应用占位符样式
        if (this.options.enablePlaceholder && templateObj?.placeholder) {
          this.applyPlaceholderStyle(img, templateObj.placeholder);
          this.setupPlaceholderBehavior(img, templateObj.placeholder);
        }

        // 设置模板相关属性
        if (templateObj) {
          this.setTemplateProperties(img, templateObj);
        }

        resolve(img);
      }, {
        crossOrigin: this.options.crossOrigin
      });
    });
  }

  /**
   * 创建形状对象
   * @param fabricData Fabric.js 序列化数据
   * @param templateObj 模板对象信息
   */
  createShapeObject(
    fabricData: any, 
    templateObj?: TemplateObject
  ): fabric.Object {
    let shapeObj: fabric.Object;

    // 基础属性
    const baseProps = {
      ...fabricData,
      ...this.options.customProperties,
      selectable: templateObj?.editable?.position || templateObj?.editable?.size || templateObj?.editable?.style || true,
    };

    // 根据形状类型创建对象
    switch (fabricData.type) {
      case 'rect':
        shapeObj = new fabric.Rect(baseProps);
        break;
        
      case 'circle':
        shapeObj = new fabric.Circle(baseProps);
        break;
        
      case 'ellipse':
        shapeObj = new fabric.Ellipse(baseProps);
        break;
        
      case 'triangle':
        shapeObj = new fabric.Triangle(baseProps);
        break;
        
      case 'polygon':
        shapeObj = new fabric.Polygon(fabricData.points || [], baseProps);
        break;
        
      case 'path':
        shapeObj = new fabric.Path(fabricData.path || '', baseProps);
        break;
        
      case 'line':
        shapeObj = new fabric.Line(
          fabricData.coords || [0, 0, 100, 100], 
          baseProps
        );
        break;
        
      case 'polyline':
        shapeObj = new fabric.Polyline(fabricData.points || [], baseProps);
        break;
        
      default:
        console.warn(`Unknown shape type: ${fabricData.type}, creating rectangle`);
        shapeObj = new fabric.Rect(baseProps);
    }

    // 设置形状特定属性
    this.setupShapeProperties(shapeObj, fabricData, templateObj);

    // 应用占位符样式
    if (this.options.enablePlaceholder && templateObj?.placeholder) {
      this.applyPlaceholderStyle(shapeObj, templateObj.placeholder);
      this.setupPlaceholderBehavior(shapeObj, templateObj.placeholder);
    }

    // 设置模板相关属性
    if (templateObj) {
      this.setTemplateProperties(shapeObj, templateObj);
    }

    return shapeObj;
  }

  /**
   * 创建组合对象
   * @param fabricData Fabric.js 序列化数据
   * @param templateObj 模板对象信息
   */
  async createGroupObject(
    fabricData: any, 
    templateObj?: TemplateObject
  ): Promise<fabric.Group> {
    const objects: fabric.Object[] = [];

    // 递归创建组内对象
    if (fabricData.objects && Array.isArray(fabricData.objects)) {
      for (const objData of fabricData.objects) {
        try {
          const obj = await this.createObjectFromData(objData);
          if (obj) {
            objects.push(obj);
          }
        } catch (error) {
          console.warn('Failed to create group object:', error);
          // 继续处理其他对象，不中断整个组的创建
        }
      }
    }

    // 创建组合对象
    const group = new fabric.Group(objects, {
      ...fabricData,
      ...this.options.customProperties,
      selectable: templateObj?.editable?.position || templateObj?.editable?.size || true,
    });

    // 设置组合特定属性
    this.setupGroupProperties(group, fabricData, templateObj);

    // 应用占位符样式
    if (this.options.enablePlaceholder && templateObj?.placeholder) {
      this.applyPlaceholderStyle(group, templateObj.placeholder);
      this.setupPlaceholderBehavior(group, templateObj.placeholder);
    }

    // 设置模板相关属性
    if (templateObj) {
      this.setTemplateProperties(group, templateObj);
    }

    return group;
  }

  /**
   * 从数据创建对象（用于组合对象内部）
   * @param objData 对象数据
   */
  private async createObjectFromData(objData: any): Promise<fabric.Object | null> {
    try {
      switch (objData.type) {
        case 'text':
        case 'i-text':
          return new fabric.IText(objData.text || '', {
            ...objData,
            ...this.options.customProperties,
          });
        
        case 'image':
          return new Promise((resolve, reject) => {
            if (!objData.src) {
              resolve(this.createSimpleImagePlaceholder(objData));
              return;
            }

            fabric.Image.fromURL(objData.src, (img) => {
              if (img) {
                img.set({
                  ...objData,
                  ...this.options.customProperties,
                });
                resolve(img);
              } else {
                resolve(this.createSimpleImagePlaceholder(objData));
              }
            }, {
              crossOrigin: this.options.crossOrigin
            });
          });
        
        case 'rect':
          return new fabric.Rect({
            ...objData,
            ...this.options.customProperties,
          });
        
        case 'circle':
          return new fabric.Circle({
            ...objData,
            ...this.options.customProperties,
          });
        
        case 'ellipse':
          return new fabric.Ellipse({
            ...objData,
            ...this.options.customProperties,
          });
        
        case 'triangle':
          return new fabric.Triangle({
            ...objData,
            ...this.options.customProperties,
          });
        
        case 'polygon':
          return new fabric.Polygon(objData.points || [], {
            ...objData,
            ...this.options.customProperties,
          });
        
        case 'path':
          return new fabric.Path(objData.path || '', {
            ...objData,
            ...this.options.customProperties,
          });
        
        case 'line':
          return new fabric.Line(objData.coords || [0, 0, 100, 100], {
            ...objData,
            ...this.options.customProperties,
          });
        
        case 'polyline':
          return new fabric.Polyline(objData.points || [], {
            ...objData,
            ...this.options.customProperties,
          });
        
        default:
          console.warn(`Unknown object type in group: ${objData.type}`);
          return null;
      }
    } catch (error) {
      console.error(`Error creating object from data:`, error);
      return null;
    }
  }

  /**
   * 创建图片占位符
   * @param fabricData 原始数据
   * @param placeholder 占位符信息
   */
  private createImagePlaceholder(
    fabricData: any, 
    placeholder: TemplatePlaceholder
  ): fabric.Image {
    const width = fabricData.width || 200;
    const height = fabricData.height || 200;
    
    // 创建占位符画布
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d')!;
    
    // 绘制背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制边框
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(1, 1, width - 2, height - 2);
    
    // 绘制图标
    this.drawImageIcon(ctx, width, height);
    
    // 绘制文本
    ctx.fillStyle = '#6c757d';
    ctx.font = `${Math.min(width, height) / 12}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const text = placeholder.defaultContent || '图片占位符';
    ctx.fillText(text, width / 2, height * 0.7);
    
    // 创建 Fabric.js 图片对象
    const img = new fabric.Image(canvas, {
      ...fabricData,
      selectable: true,
      hasControls: true,
      hasBorders: true,
    });

    return img;
  }

  /**
   * 创建简单图片占位符（用于组合对象内部）
   * @param objData 对象数据
   */
  private createSimpleImagePlaceholder(objData: any): fabric.Rect {
    return new fabric.Rect({
      ...objData,
      fill: '#f8f9fa',
      stroke: '#dee2e6',
      strokeWidth: 2,
      strokeDashArray: [8, 4],
    });
  }

  /**
   * 绘制图片图标
   * @param ctx Canvas 2D 上下文
   * @param width 宽度
   * @param height 高度
   */
  private drawImageIcon(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const iconSize = Math.min(width, height) / 4;
    const centerX = width / 2;
    const centerY = height / 2 - iconSize / 4;
    
    ctx.fillStyle = '#adb5bd';
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 2;
    
    // 绘制图片框
    const frameSize = iconSize * 0.8;
    const frameX = centerX - frameSize / 2;
    const frameY = centerY - frameSize / 2;
    
    ctx.strokeRect(frameX, frameY, frameSize, frameSize);
    
    // 绘制山峰
    ctx.beginPath();
    ctx.moveTo(frameX + frameSize * 0.2, frameY + frameSize * 0.8);
    ctx.lineTo(frameX + frameSize * 0.4, frameY + frameSize * 0.5);
    ctx.lineTo(frameX + frameSize * 0.6, frameY + frameSize * 0.6);
    ctx.lineTo(frameX + frameSize * 0.8, frameY + frameSize * 0.4);
    ctx.lineTo(frameX + frameSize * 0.8, frameY + frameSize * 0.8);
    ctx.closePath();
    ctx.fill();
    
    // 绘制太阳
    ctx.beginPath();
    ctx.arc(frameX + frameSize * 0.7, frameY + frameSize * 0.3, frameSize * 0.1, 0, 2 * Math.PI);
    ctx.fill();
  }

  /**
   * 设置文本编辑事件
   * @param textObj 文本对象
   */
  private setupTextEditingEvents(textObj: fabric.IText): void {
    textObj.on('editing:entered', () => {
      // 进入编辑模式时的处理
      (textObj as any).isEditing = true;
    });

    textObj.on('editing:exited', () => {
      // 退出编辑模式时的处理
      (textObj as any).isEditing = false;
      
      // 如果是占位符且内容为空，恢复占位符文本
      if ((textObj as any).isPlaceholder && !textObj.text?.trim()) {
        const placeholder = (textObj as any).placeholderInfo as TemplatePlaceholder;
        if (placeholder) {
          textObj.set('text', placeholder.defaultContent);
          textObj.set('fill', '#999');
        }
      }
    });
  }

  /**
   * 设置图片属性
   * @param img 图片对象
   * @param fabricData 原始数据
   */
  private setupImageProperties(img: fabric.Image, fabricData: any): void {
    // 设置图片滤镜
    if (fabricData.filters && Array.isArray(fabricData.filters)) {
      img.filters = fabricData.filters;
      img.applyFilters();
    }

    // 设置裁剪
    if (fabricData.cropX !== undefined || fabricData.cropY !== undefined) {
      img.set({
        cropX: fabricData.cropX || 0,
        cropY: fabricData.cropY || 0,
      });
    }
  }

  /**
   * 设置形状属性
   * @param shape 形状对象
   * @param fabricData 原始数据
   * @param templateObj 模板对象
   */
  private setupShapeProperties(
    shape: fabric.Object, 
    fabricData: any, 
    templateObj?: TemplateObject
  ): void {
    // 设置渐变
    if (fabricData.gradient) {
      const gradient = new fabric.Gradient(fabricData.gradient);
      shape.set('fill', gradient);
    }

    // 设置阴影
    if (fabricData.shadow) {
      const shadow = new fabric.Shadow(fabricData.shadow);
      shape.set('shadow', shadow);
    }

    // 设置可编辑性
    if (templateObj?.editable) {
      shape.set({
        hasControls: templateObj.editable.size,
        hasBorders: templateObj.editable.position || templateObj.editable.size,
        hasRotatingPoint: templateObj.editable.position,
        lockMovementX: !templateObj.editable.position,
        lockMovementY: !templateObj.editable.position,
        lockScalingX: !templateObj.editable.size,
        lockScalingY: !templateObj.editable.size,
        lockRotation: !templateObj.editable.position,
      });
    }
  }

  /**
   * 设置组合属性
   * @param group 组合对象
   * @param fabricData 原始数据
   * @param templateObj 模板对象
   */
  private setupGroupProperties(
    group: fabric.Group, 
    fabricData: any, 
    templateObj?: TemplateObject
  ): void {
    // 设置组合的可编辑性
    if (templateObj?.editable) {
      group.set({
        hasControls: templateObj.editable.size,
        hasBorders: templateObj.editable.position || templateObj.editable.size,
        hasRotatingPoint: templateObj.editable.position,
        lockMovementX: !templateObj.editable.position,
        lockMovementY: !templateObj.editable.position,
        lockScalingX: !templateObj.editable.size,
        lockScalingY: !templateObj.editable.size,
        lockRotation: !templateObj.editable.position,
        subTargetCheck: true, // 允许选择组内对象
      });
    }
  }

  /**
   * 应用占位符样式
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private applyPlaceholderStyle(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    // 添加占位符标识
    (obj as any).isPlaceholder = true;
    (obj as any).placeholderInfo = placeholder;

    // 设置占位符视觉样式
    obj.set({
      borderColor: '#007bff',
      borderDashArray: [5, 5],
      cornerColor: '#007bff',
      cornerStyle: 'circle',
      transparentCorners: false,
      borderOpacityWhenMoving: 0.8,
    });

    // 为文本占位符设置特殊样式
    if (obj instanceof fabric.IText || obj instanceof fabric.Text) {
      if (obj.text === placeholder.defaultContent) {
        obj.set({
          fill: '#999',
          fontStyle: 'italic',
        });
      }
    }
  }

  /**
   * 设置占位符行为
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private setupPlaceholderBehavior(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    // 双击事件处理
    obj.on('mousedblclick', () => {
      this.handlePlaceholderDoubleClick(obj, placeholder);
    });

    // 选中事件处理
    obj.on('selected', () => {
      this.showPlaceholderTooltip(obj, placeholder);
    });

    // 取消选中事件处理
    obj.on('deselected', () => {
      this.hidePlaceholderTooltip(obj);
    });
  }

  /**
   * 处理占位符双击事件
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private handlePlaceholderDoubleClick(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    switch (placeholder.type) {
      case 'text':
        if (obj instanceof fabric.IText) {
          obj.enterEditing();
          if (obj.text === placeholder.defaultContent) {
            obj.selectAll();
          }
        }
        break;
        
      case 'image':
        // 触发图片选择对话框
        this.triggerImageSelection(obj, placeholder);
        break;
        
      case 'logo':
      case 'icon':
        // 触发图标/Logo选择对话框
        this.triggerIconSelection(obj, placeholder);
        break;
    }
  }

  /**
   * 显示占位符提示
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private showPlaceholderTooltip(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    // 这里可以显示一个提示框，告诉用户如何编辑占位符
    const suggestions = placeholder.suggestions.join(', ');
    const message = `双击编辑${placeholder.type}${suggestions ? `，建议: ${suggestions}` : ''}`;
    
    // 可以通过事件系统通知UI显示提示
    obj.canvas?.fire('placeholder:tooltip', {
      target: obj,
      message,
      placeholder
    });
  }

  /**
   * 隐藏占位符提示
   * @param obj Fabric.js 对象
   */
  private hidePlaceholderTooltip(obj: fabric.Object): void {
    obj.canvas?.fire('placeholder:tooltip:hide', { target: obj });
  }

  /**
   * 触发图片选择
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private triggerImageSelection(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    obj.canvas?.fire('placeholder:image:select', {
      target: obj,
      placeholder,
      suggestions: placeholder.suggestions
    });
  }

  /**
   * 触发图标选择
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private triggerIconSelection(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    obj.canvas?.fire('placeholder:icon:select', {
      target: obj,
      placeholder,
      suggestions: placeholder.suggestions
    });
  }

  /**
   * 设置模板相关属性
   * @param obj Fabric.js 对象
   * @param templateObj 模板对象
   */
  private setTemplateProperties(obj: fabric.Object, templateObj: TemplateObject): void {
    // 设置模板对象标识
    (obj as any).templateId = templateObj.id;
    (obj as any).templateType = templateObj.type;
    (obj as any).templateEditable = templateObj.editable;
    (obj as any).templatePlaceholder = templateObj.placeholder;

    // 设置对象名称（用于图层面板显示）
    obj.set('name', templateObj.id);
  }

  /**
   * 更新创建选项
   * @param options 新的选项
   */
  updateOptions(options: Partial<ObjectCreationOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 获取当前选项
   */
  getOptions(): ObjectCreationOptions {
    return { ...this.options };
  }
}

// 导出默认实例
export const fabricObjectCreator = new FabricObjectCreator();

// 导出便捷函数
export function createTextObject(
  fabricData: any, 
  templateObj?: TemplateObject,
  options?: Partial<ObjectCreationOptions>
): fabric.Text | fabric.IText {
  const creator = options ? new FabricObjectCreator(options) : fabricObjectCreator;
  return creator.createTextObject(fabricData, templateObj);
}

export async function createImageObject(
  fabricData: any, 
  templateObj?: TemplateObject,
  options?: Partial<ObjectCreationOptions>
): Promise<fabric.Image> {
  const creator = options ? new FabricObjectCreator(options) : fabricObjectCreator;
  return creator.createImageObject(fabricData, templateObj);
}

export function createShapeObject(
  fabricData: any, 
  templateObj?: TemplateObject,
  options?: Partial<ObjectCreationOptions>
): fabric.Object {
  const creator = options ? new FabricObjectCreator(options) : fabricObjectCreator;
  return creator.createShapeObject(fabricData, templateObj);
}

export async function createGroupObject(
  fabricData: any, 
  templateObj?: TemplateObject,
  options?: Partial<ObjectCreationOptions>
): Promise<fabric.Group> {
  const creator = options ? new FabricObjectCreator(options) : fabricObjectCreator;
  return creator.createGroupObject(fabricData, templateObj);
}