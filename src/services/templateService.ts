import { fabric } from 'fabric';
import { DesignTemplate, TemplateElement } from '@/data/designTemplates';

// 模板应用服务
export class TemplateService {
  // 应用模板到画布
  static async applyTemplate(canvas: fabric.Canvas, template: DesignTemplate): Promise<void> {
    // 清空画布
    canvas.clear();
    
    // 设置画布尺寸
    canvas.setDimensions({
      width: template.width,
      height: template.height
    });

    // 按顺序添加元素
    for (const element of template.elements) {
      const fabricObject = await this.createElement(element);
      if (fabricObject) {
        canvas.add(fabricObject);
      }
    }

    // 渲染画布
    canvas.renderAll();
  }

  // 创建Fabric.js对象
  private static async createElement(element: TemplateElement): Promise<fabric.Object | null> {
    switch (element.type) {
      case 'background':
        return this.createBackground(element);
      case 'text':
        return this.createText(element);
      case 'shape':
        return this.createShape(element);
      case 'image':
        return this.createImage(element);
      default:
        return null;
    }
  }

  // 创建背景
  private static createBackground(element: TemplateElement): fabric.Object {
    if (element.gradient) {
      // 创建渐变背景
      const gradient = new fabric.Gradient({
        type: element.gradient.type,
        coords: element.gradient.type === 'linear' 
          ? { x1: 0, y1: 0, x2: element.width || 0, y2: element.height || 0 }
          : { x1: (element.width || 0) / 2, y1: (element.height || 0) / 2, r1: 0, r2: (element.width || 0) / 2 },
        colorStops: element.gradient.colors.map((color, index) => ({
          offset: index / (element.gradient!.colors.length - 1),
          color: color
        }))
      });

      return new fabric.Rect({
        left: element.left,
        top: element.top,
        width: element.width || 0,
        height: element.height || 0,
        fill: gradient,
        selectable: false,
        evented: false,
        excludeFromExport: false
      });
    } else {
      // 创建纯色背景
      return new fabric.Rect({
        left: element.left,
        top: element.top,
        width: element.width || 0,
        height: element.height || 0,
        fill: element.backgroundColor || '#ffffff',
        selectable: false,
        evented: false,
        excludeFromExport: false
      });
    }
  }

  // 创建文本
  private static createText(element: TemplateElement): fabric.IText {
    return new fabric.IText(element.text || '', {
      left: element.left,
      top: element.top,
      fontSize: element.fontSize || 16,
      fontFamily: element.fontFamily || 'Arial',
      fontWeight: element.fontWeight || 'normal',
      fill: element.fill || '#000000',
      textAlign: element.textAlign || 'left',
      selectable: true,
      editable: true
    });
  }

  // 创建形状
  private static createShape(element: TemplateElement): fabric.Object {
    const commonProps = {
      left: element.left,
      top: element.top,
      width: element.width || 100,
      height: element.height || 100,
      fill: element.backgroundColor || '#000000',
      stroke: element.borderColor,
      strokeWidth: element.borderWidth || 0,
      selectable: true
    };

    switch (element.shapeType) {
      case 'circle':
        return new fabric.Circle({
          ...commonProps,
          radius: (element.width || 100) / 2
        });
      case 'triangle':
        return new fabric.Triangle(commonProps);
      case 'rect':
      default:
        return new fabric.Rect(commonProps);
    }
  }

  // 创建图片
  private static async createImage(element: TemplateElement): Promise<fabric.Image | null> {
    if (!element.src) return null;

    return new Promise((resolve) => {
      fabric.Image.fromURL(element.src!, (img) => {
        img.set({
          left: element.left,
          top: element.top,
          width: element.width,
          height: element.height,
          selectable: true
        });
        resolve(img);
      });
    });
  }

  // 预览模板（生成缩略图）
  static generateThumbnail(template: DesignTemplate, size: number = 200): Promise<string> {
    return new Promise((resolve) => {
      // 创建临时画布
      const tempCanvas = new fabric.Canvas(document.createElement('canvas'), {
        width: size,
        height: size
      });

      // 计算缩放比例
      const scale = size / Math.max(template.width, template.height);
      
      // 应用模板（简化版）
      this.applyTemplate(tempCanvas, template).then(() => {
        // 缩放画布内容
        tempCanvas.setZoom(scale);
        
        // 生成缩略图
        const thumbnail = tempCanvas.toDataURL({
          format: 'png',
          quality: 0.8
        });
        
        resolve(thumbnail);
      });
    });
  }

  // 获取模板颜色调色板
  static getTemplatePalette(template: DesignTemplate): string[] {
    return template.colors;
  }

  // 获取模板使用的字体
  static getTemplateFonts(template: DesignTemplate): string[] {
    return template.fonts;
  }

  // 自定义模板颜色
  static customizeTemplateColors(template: DesignTemplate, colorMap: Record<string, string>): DesignTemplate {
    const customizedTemplate = JSON.parse(JSON.stringify(template));
    
    // 替换元素中的颜色
    customizedTemplate.elements.forEach((element: TemplateElement) => {
      if (element.fill && colorMap[element.fill]) {
        element.fill = colorMap[element.fill];
      }
      if (element.backgroundColor && colorMap[element.backgroundColor]) {
        element.backgroundColor = colorMap[element.backgroundColor];
      }
      if (element.borderColor && colorMap[element.borderColor]) {
        element.borderColor = colorMap[element.borderColor];
      }
      if (element.gradient) {
        element.gradient.colors = element.gradient.colors.map(color => 
          colorMap[color] || color
        );
      }
    });

    return customizedTemplate;
  }

  // 自定义模板文字
  static customizeTemplateText(template: DesignTemplate, textMap: Record<string, string>): DesignTemplate {
    const customizedTemplate = JSON.parse(JSON.stringify(template));
    
    // 替换文本内容
    customizedTemplate.elements.forEach((element: TemplateElement) => {
      if (element.type === 'text' && element.text && textMap[element.id]) {
        element.text = textMap[element.id];
      }
    });

    return customizedTemplate;
  }
}