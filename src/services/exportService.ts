import { fabric } from 'fabric';
import jsPDF from 'jspdf';
import { AdvancedExportOptions } from '@/stores/exportStore';

export class ExportService {
  private canvas: fabric.Canvas;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  /**
   * 导出画布为指定格式
   */
  async exportCanvas(options: AdvancedExportOptions, onProgress?: (progress: number) => void): Promise<Blob> {
    const { format } = options;

    try {
      switch (format) {
        case 'png':
          return await this.exportAsPNG(options, onProgress);
        case 'jpg':
          return await this.exportAsJPG(options, onProgress);
        case 'pdf':
          return await this.exportAsPDF(options, onProgress);
        case 'svg':
          return await this.exportAsSVG(options, onProgress);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error(`Export failed for format ${format}:`, error);
      throw error;
    }
  }

  /**
   * 导出为PNG格式
   */
  private async exportAsPNG(options: AdvancedExportOptions, onProgress?: (progress: number) => void): Promise<Blob> {
    const { scale = 1, quality = 1, transparent = false, backgroundColor, width, height, dpi = 72 } = options;

    // 计算实际导出尺寸
    const actualWidth = width || this.canvas.getWidth();
    const actualHeight = height || this.canvas.getHeight();
    const scaleFactor = this.calculateScaleFactor(scale, dpi);

    try {
      onProgress?.(10);

      // 检查并处理跨域图片
      await this.handleCrossOriginImages();

      onProgress?.(30);

      // 设置导出选项
      const exportOptions: fabric.IDataURLOptions = {
        format: 'png',
        quality,
        multiplier: scaleFactor,
        width: actualWidth,
        height: actualHeight,
        enableRetinaScaling: true,
      };

      onProgress?.(50);

      // 处理背景
      if (!transparent && backgroundColor) {
        const originalBg = this.canvas.backgroundColor;
        this.canvas.setBackgroundColor(backgroundColor, () => {});
        
        onProgress?.(80);
        const dataURL = await this.safeToDataURL(exportOptions);
        
        // 恢复原始背景
        this.canvas.setBackgroundColor(originalBg, () => {});
        
        onProgress?.(100);
        return this.dataURLToBlob(dataURL);
      } else if (transparent) {
        // 临时移除背景色以实现透明效果
        const originalBg = this.canvas.backgroundColor;
        this.canvas.setBackgroundColor('', () => {});
        
        onProgress?.(80);
        const dataURL = await this.safeToDataURL(exportOptions);
        
        // 恢复原始背景
        this.canvas.setBackgroundColor(originalBg, () => {});
        
        onProgress?.(100);
        return this.dataURLToBlob(dataURL);
      }

      onProgress?.(80);
      const dataURL = await this.safeToDataURL(exportOptions);
      onProgress?.(100);
      return this.dataURLToBlob(dataURL);
    } catch (error) {
      console.error('PNG export failed:', error);
      throw new Error(`PNG导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 导出为JPG格式
   */
  private async exportAsJPG(options: AdvancedExportOptions, onProgress?: (progress: number) => void): Promise<Blob> {
    const { scale = 1, quality = 1, backgroundColor = '#ffffff', width, height, dpi = 72 } = options;

    // 计算实际导出尺寸
    const actualWidth = width || this.canvas.getWidth();
    const actualHeight = height || this.canvas.getHeight();
    const scaleFactor = this.calculateScaleFactor(scale, dpi);

    try {
      onProgress?.(20);

      // JPG不支持透明，必须有背景色
      const originalBg = this.canvas.backgroundColor;
      this.canvas.setBackgroundColor(backgroundColor, () => {});

      onProgress?.(40);

      const exportOptions: fabric.IDataURLOptions = {
        format: 'jpeg',
        quality,
        multiplier: scaleFactor,
        width: actualWidth,
        height: actualHeight,
        enableRetinaScaling: true,
      };

      onProgress?.(50);

      // 检查并处理跨域图片
      await this.handleCrossOriginImages();

      onProgress?.(70);
      const dataURL = await this.safeToDataURL(exportOptions);

      // 恢复原始背景
      this.canvas.setBackgroundColor(originalBg, () => {});

      onProgress?.(100);
      return this.dataURLToBlob(dataURL);
    } catch (error) {
      console.error('JPG export failed:', error);
      throw new Error(`JPG导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 导出为PDF格式
   */
  private async exportAsPDF(options: AdvancedExportOptions, onProgress?: (progress: number) => void): Promise<Blob> {
    const { scale = 1, quality = 1, backgroundColor = '#ffffff', width, height, dpi = 150, pdfOptions } = options;

    if (!pdfOptions) {
      throw new Error('PDF options are required for PDF export');
    }

    try {
      // 报告进度：开始处理
      onProgress?.(10);

      // 计算PDF页面尺寸
      const { pageSize, orientation, margins, compression } = pdfOptions;
      const pageDimensions = this.getPDFPageDimensions(pageSize, orientation);

      // 报告进度：页面设置完成
      onProgress?.(20);

      // 创建PDF文档
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize === 'custom' ? [pageDimensions.width, pageDimensions.height] : pageSize,
        compress: compression,
      });

      // 报告进度：PDF文档创建完成
      onProgress?.(30);

      // 计算内容区域尺寸（减去边距）
      const contentWidth = pageDimensions.width - margins.left - margins.right;
      const contentHeight = pageDimensions.height - margins.top - margins.bottom;

      // 计算画布尺寸和缩放比例
      const canvasWidth = width || this.canvas.getWidth();
      const canvasHeight = height || this.canvas.getHeight();
      const canvasAspectRatio = canvasWidth / canvasHeight;
      const contentAspectRatio = contentWidth / contentHeight;

      let finalWidth, finalHeight;
      if (canvasAspectRatio > contentAspectRatio) {
        // 画布更宽，以宽度为准
        finalWidth = contentWidth;
        finalHeight = contentWidth / canvasAspectRatio;
      } else {
        // 画布更高，以高度为准
        finalHeight = contentHeight;
        finalWidth = contentHeight * canvasAspectRatio;
      }

      // 居中位置
      const x = margins.left + (contentWidth - finalWidth) / 2;
      const y = margins.top + (contentHeight - finalHeight) / 2;

      // 报告进度：布局计算完成
      onProgress?.(50);

      // 导出画布为高质量图片
      const scaleFactor = this.calculateScaleFactor(scale, dpi);
      const originalBg = this.canvas.backgroundColor;
      
      // 设置背景色
      this.canvas.setBackgroundColor(backgroundColor, () => {});

      // 报告进度：开始渲染画布
      onProgress?.(60);

      // 使用更高质量的导出设置
      const exportOptions: fabric.IDataURLOptions = {
        format: 'jpeg',
        quality: Math.max(quality, 0.9), // PDF使用更高质量
        multiplier: scaleFactor,
        enableRetinaScaling: true,
      };

      const dataURL = this.canvas.toDataURL(exportOptions);

      // 恢复原始背景
      this.canvas.setBackgroundColor(originalBg, () => {});

      // 报告进度：画布渲染完成
      onProgress?.(80);

      // 处理多页面支持（如果需要）
      if (pdfOptions.multiPage && this.shouldSplitIntoPages(canvasWidth, canvasHeight, finalWidth, finalHeight)) {
        await this.addMultiplePages(pdf, dataURL, finalWidth, finalHeight, x, y, margins, pageDimensions);
      } else {
        // 添加单页图片到PDF
        pdf.addImage(dataURL, 'JPEG', x, y, finalWidth, finalHeight);
      }

      // 报告进度：PDF生成完成
      onProgress?.(90);

      // 添加元数据
      pdf.setProperties({
        title: 'Poster Export',
        subject: 'Generated by Poster Maker',
        author: 'Poster Maker',
        creator: 'Poster Maker',
        producer: 'Poster Maker PDF Export',
        creationDate: new Date(),
      });

      // 报告进度：完成
      onProgress?.(100);

      // 返回PDF Blob
      const pdfArrayBuffer = pdf.output('arraybuffer');
      return new Blob([pdfArrayBuffer], { type: 'application/pdf' });

    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error(`PDF导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 判断是否需要分页
   */
  private shouldSplitIntoPages(canvasWidth: number, canvasHeight: number, finalWidth: number, finalHeight: number): boolean {
    // 如果内容超出页面尺寸的1.5倍，则考虑分页
    const threshold = 1.5;
    return (finalWidth > canvasWidth * threshold) || (finalHeight > canvasHeight * threshold);
  }

  /**
   * 添加多页面到PDF
   */
  private async addMultiplePages(
    pdf: jsPDF, 
    dataURL: string, 
    finalWidth: number, 
    finalHeight: number, 
    x: number, 
    y: number,
    margins: { top: number; right: number; bottom: number; left: number },
    pageDimensions: { width: number; height: number }
  ): Promise<void> {
    // 简化实现：目前只添加单页，未来可以扩展为真正的多页分割
    pdf.addImage(dataURL, 'JPEG', x, y, finalWidth, finalHeight);
    
    // TODO: 实现真正的多页分割逻辑
    // 这里可以添加将大图分割成多个页面的逻辑
  }

  /**
   * 导出为SVG格式
   */
  private async exportAsSVG(options: AdvancedExportOptions, onProgress?: (progress: number) => void): Promise<Blob> {
    const { width, height, svgOptions } = options;

    if (!svgOptions) {
      throw new Error('SVG options are required for SVG export');
    }

    try {
      onProgress?.(10);

      // 计算实际尺寸
      const actualWidth = width || this.canvas.getWidth();
      const actualHeight = height || this.canvas.getHeight();

      onProgress?.(20);

      // 获取SVG字符串，使用Fabric.js的内置SVG导出
      const svgOptions_fabric: fabric.IToSVGOptions = {
        width: actualWidth,
        height: actualHeight,
        viewBox: svgOptions.viewBox ? {
          x: 0,
          y: 0,
          width: actualWidth,
          height: actualHeight,
        } : undefined,
        suppressPreamble: false, // 包含XML声明
        reviver: (markup: string) => {
          // 可以在这里对每个对象的SVG进行自定义处理
          return markup;
        },
      };

      onProgress?.(40);

      let svgString = this.canvas.toSVG(svgOptions_fabric);

      onProgress?.(60);

      // 添加SVG命名空间和属性
      svgString = this.enhanceSVGHeader(svgString, actualWidth, actualHeight, svgOptions);

      onProgress?.(70);

      // 处理SVG优化选项
      if (svgOptions.optimized) {
        svgString = this.optimizeSVG(svgString);
      }

      onProgress?.(80);

      if (!svgOptions.includeStyles) {
        svgString = this.removeInlineStyles(svgString);
      }

      onProgress?.(90);

      if (!svgOptions.embedImages) {
        svgString = await this.processEmbeddedImages(svgString);
      }

      onProgress?.(100);

      return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

    } catch (error) {
      console.error('SVG export failed:', error);
      throw new Error(`SVG导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量导出
   */
  async batchExport(settingsArray: AdvancedExportOptions[], onProgress?: (progress: number) => void): Promise<Blob[]> {
    const results: Blob[] = [];
    const total = settingsArray.length;

    for (let i = 0; i < total; i++) {
      const settings = settingsArray[i];
      try {
        const blob = await this.exportCanvas(settings);
        results.push(blob);
        
        if (onProgress) {
          onProgress((i + 1) / total * 100);
        }
      } catch (error) {
        console.error(`Export failed for settings ${i}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * 计算缩放因子（基于DPI）
   */
  private calculateScaleFactor(scale: number, dpi: number): number {
    const baseDPI = 72; // 屏幕默认DPI
    return scale * (dpi / baseDPI);
  }

  /**
   * 获取PDF页面尺寸（毫米）
   */
  private getPDFPageDimensions(pageSize: string, orientation: string) {
    const sizes: Record<string, { width: number; height: number }> = {
      'A4': { width: 210, height: 297 },
      'A3': { width: 297, height: 420 },
      'A5': { width: 148, height: 210 },
      'Letter': { width: 216, height: 279 },
      'Legal': { width: 216, height: 356 },
    };

    let dimensions = sizes[pageSize] || sizes['A4'];

    if (orientation === 'landscape') {
      dimensions = {
        width: dimensions.height,
        height: dimensions.width,
      };
    }

    return dimensions;
  }

  /**
   * 增强SVG头部信息
   */
  private enhanceSVGHeader(svgString: string, width: number, height: number, svgOptions: any): string {
    // 确保SVG有正确的命名空间和属性
    const svgTag = svgString.match(/<svg[^>]*>/)?.[0];
    if (!svgTag) return svgString;

    let enhancedSvgTag = svgTag;

    // 添加标准命名空间
    if (!enhancedSvgTag.includes('xmlns=')) {
      enhancedSvgTag = enhancedSvgTag.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!enhancedSvgTag.includes('xmlns:xlink=')) {
      enhancedSvgTag = enhancedSvgTag.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // 确保有正确的尺寸属性
    if (!enhancedSvgTag.includes('width=')) {
      enhancedSvgTag = enhancedSvgTag.replace('<svg', `<svg width="${width}"`);
    }
    if (!enhancedSvgTag.includes('height=')) {
      enhancedSvgTag = enhancedSvgTag.replace('<svg', `<svg height="${height}"`);
    }

    // 添加viewBox（如果启用）
    if (svgOptions.viewBox && !enhancedSvgTag.includes('viewBox=')) {
      enhancedSvgTag = enhancedSvgTag.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`);
    }

    return svgString.replace(svgTag, enhancedSvgTag);
  }

  /**
   * 优化SVG代码
   */
  private optimizeSVG(svgString: string): string {
    let optimized = svgString;

    // 移除注释
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');

    // 移除不必要的空白
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.replace(/>\s+</g, '><');

    // 移除空的属性
    optimized = optimized.replace(/\s+[a-zA-Z-]+=""\s*/g, ' ');

    // 简化数字精度
    optimized = optimized.replace(/(\d+\.\d{3,})/g, (match) => {
      return parseFloat(match).toFixed(2);
    });

    // 移除默认值
    optimized = optimized.replace(/\s+fill="black"/g, ''); // 黑色是默认填充
    optimized = optimized.replace(/\s+stroke="none"/g, ''); // none是默认描边
    optimized = optimized.replace(/\s+stroke-width="1"/g, ''); // 1是默认描边宽度

    return optimized.trim();
  }

  /**
   * 移除内联样式
   */
  private removeInlineStyles(svgString: string): string {
    // 移除style属性
    let result = svgString.replace(/\s+style="[^"]*"/g, '');
    
    // 移除<style>标签
    result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
    
    return result;
  }

  /**
   * 处理嵌入图片
   */
  private async processEmbeddedImages(svgString: string): Promise<string> {
    // 查找所有base64图片
    const base64Pattern = /data:image\/[^;]+;base64,[^"]+/g;
    const matches = svgString.match(base64Pattern);

    if (!matches || matches.length === 0) {
      return svgString;
    }

    let processedSvg = svgString;

    // 对于每个base64图片，可以选择：
    // 1. 保持嵌入（当前实现）
    // 2. 提取为外部文件（需要额外的文件管理）
    // 3. 转换为更优化的格式

    // 简化实现：保持原样，但可以添加压缩
    for (const match of matches) {
      try {
        // 这里可以添加图片压缩逻辑
        // 目前保持原样
      } catch (error) {
        console.warn('Failed to process embedded image:', error);
      }
    }

    return processedSvg;
  }

  /**
   * 验证SVG有效性
   */
  private validateSVG(svgString: string): boolean {
    try {
      // 基本的SVG结构验证
      if (!svgString.includes('<svg') || !svgString.includes('</svg>')) {
        return false;
      }

      // 检查是否有未闭合的标签（简单检查）
      const openTags = (svgString.match(/<[^\/][^>]*>/g) || []).length;
      const closeTags = (svgString.match(/<\/[^>]*>/g) || []).length;
      const selfClosingTags = (svgString.match(/<[^>]*\/>/g) || []).length;

      // 简单的标签平衡检查
      return openTags === closeTags + selfClosingTags;
    } catch (error) {
      return false;
    }
  }

  /**
   * 处理跨域图片问题
   */
  private async handleCrossOriginImages(): Promise<void> {
    const objects = this.canvas.getObjects();
    const imageObjects = objects.filter(obj => obj.type === 'image') as fabric.Image[];

    for (const imageObj of imageObjects) {
      try {
        const imgElement = imageObj.getElement() as HTMLImageElement;
        if (imgElement && imgElement.src) {
          // 检查是否是跨域图片
          if (this.isCrossOriginImage(imgElement.src)) {
            // 尝试重新加载图片并设置crossOrigin
            await this.reloadImageWithCORS(imageObj, imgElement.src);
          }
        }
      } catch (error) {
        console.warn('Failed to handle cross-origin image:', error);
        // 继续处理其他图片，不中断导出过程
      }
    }
  }

  /**
   * 检查是否是跨域图片
   */
  private isCrossOriginImage(src: string): boolean {
    if (src.startsWith('data:')) return false; // base64图片不是跨域
    if (src.startsWith('blob:')) return false; // blob图片不是跨域
    
    try {
      const url = new URL(src, window.location.href);
      return url.origin !== window.location.origin;
    } catch {
      return false;
    }
  }

  /**
   * 重新加载图片并设置CORS
   */
  private async reloadImageWithCORS(imageObj: fabric.Image, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // 更新fabric.js图片对象的元素
          imageObj.setElement(img);
          this.canvas.renderAll();
          resolve();
        } catch (error) {
          console.warn('Failed to update image element:', error);
          resolve(); // 即使失败也继续，不中断导出
        }
      };
      
      img.onerror = () => {
        console.warn('Failed to reload image with CORS:', src);
        resolve(); // 即使失败也继续，不中断导出
      };
      
      // 添加时间戳避免缓存问题
      const separator = src.includes('?') ? '&' : '?';
      img.src = `${src}${separator}_t=${Date.now()}`;
      
      // 设置超时
      setTimeout(() => {
        console.warn('Image reload timeout:', src);
        resolve();
      }, 5000);
    });
  }

  /**
   * 安全的toDataURL方法
   */
  private async safeToDataURL(options: fabric.IDataURLOptions): Promise<string> {
    try {
      // 首先尝试正常导出
      return this.canvas.toDataURL(options);
    } catch (error) {
      if (error instanceof Error && error.message.includes('tainted')) {
        console.warn('Canvas is tainted, attempting fallback export method');
        return await this.fallbackExport(options);
      }
      throw error;
    }
  }

  /**
   * 备用导出方法（当画布被污染时）
   */
  private async fallbackExport(options: fabric.IDataURLOptions): Promise<string> {
    // 创建一个新的临时画布
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      throw new Error('无法创建临时画布上下文');
    }

    // 设置临时画布尺寸
    const width = options.width || this.canvas.getWidth();
    const height = options.height || this.canvas.getHeight();
    const multiplier = options.multiplier || 1;
    
    tempCanvas.width = width * multiplier;
    tempCanvas.height = height * multiplier;
    
    // 设置背景色
    if (options.format !== 'png' || !this.isTransparentBackground()) {
      tempCtx.fillStyle = this.canvas.backgroundColor as string || '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    // 渲染所有对象到临时画布
    const objects = this.canvas.getObjects();
    for (const obj of objects) {
      try {
        await this.renderObjectToCanvas(obj, tempCtx, multiplier);
      } catch (error) {
        console.warn('Failed to render object:', obj.type, error);
        // 继续渲染其他对象
      }
    }

    // 导出临时画布
    return tempCanvas.toDataURL(options.format === 'png' ? 'image/png' : 'image/jpeg', options.quality);
  }

  /**
   * 检查是否是透明背景
   */
  private isTransparentBackground(): boolean {
    return !this.canvas.backgroundColor || this.canvas.backgroundColor === 'transparent' || this.canvas.backgroundColor === '';
  }

  /**
   * 将fabric对象渲染到画布上下文
   */
  private async renderObjectToCanvas(obj: fabric.Object, ctx: CanvasRenderingContext2D, multiplier: number): Promise<void> {
    ctx.save();
    
    try {
      // 应用变换
      const matrix = obj.calcTransformMatrix();
      ctx.transform(
        matrix[0] * multiplier,
        matrix[1] * multiplier,
        matrix[2] * multiplier,
        matrix[3] * multiplier,
        matrix[4] * multiplier,
        matrix[5] * multiplier
      );

      // 根据对象类型进行渲染
      if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') {
        this.renderTextObject(obj as fabric.Text, ctx);
      } else if (obj.type === 'image') {
        await this.renderImageObject(obj as fabric.Image, ctx);
      } else if (obj.type === 'rect') {
        this.renderRectObject(obj as fabric.Rect, ctx);
      } else if (obj.type === 'circle') {
        this.renderCircleObject(obj as fabric.Circle, ctx);
      } else {
        // 对于其他类型，尝试使用通用渲染方法
        this.renderGenericObject(obj, ctx);
      }
    } finally {
      ctx.restore();
    }
  }

  /**
   * 渲染文本对象
   */
  private renderTextObject(textObj: fabric.Text, ctx: CanvasRenderingContext2D): void {
    const text = textObj.text || '';
    const fontSize = textObj.fontSize || 16;
    const fontFamily = textObj.fontFamily || 'Arial';
    const fill = textObj.fill as string || '#000000';

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fill;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 简单的文本渲染（不处理复杂的文本样式）
    ctx.fillText(text, 0, 0);
  }

  /**
   * 渲染图片对象
   */
  private async renderImageObject(imageObj: fabric.Image, ctx: CanvasRenderingContext2D): Promise<void> {
    const imgElement = imageObj.getElement() as HTMLImageElement;
    if (imgElement && imgElement.complete) {
      const width = imageObj.width || imgElement.width;
      const height = imageObj.height || imgElement.height;
      
      try {
        ctx.drawImage(imgElement, 0, 0, width, height);
      } catch (error) {
        console.warn('Failed to draw image, using placeholder');
        // 绘制占位符
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(0, 0, width, height);
      }
    }
  }

  /**
   * 渲染矩形对象
   */
  private renderRectObject(rectObj: fabric.Rect, ctx: CanvasRenderingContext2D): void {
    const width = rectObj.width || 0;
    const height = rectObj.height || 0;
    const fill = rectObj.fill as string;
    const stroke = rectObj.stroke as string;
    const strokeWidth = rectObj.strokeWidth || 0;

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, width, height);
    }

    if (stroke && strokeWidth > 0) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.strokeRect(0, 0, width, height);
    }
  }

  /**
   * 渲染圆形对象
   */
  private renderCircleObject(circleObj: fabric.Circle, ctx: CanvasRenderingContext2D): void {
    const radius = circleObj.radius || 0;
    const fill = circleObj.fill as string;
    const stroke = circleObj.stroke as string;
    const strokeWidth = circleObj.strokeWidth || 0;

    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }

    if (stroke && strokeWidth > 0) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  }

  /**
   * 渲染通用对象
   */
  private renderGenericObject(obj: fabric.Object, ctx: CanvasRenderingContext2D): void {
    // 对于不支持的对象类型，绘制一个占位符
    const width = obj.width || 50;
    const height = obj.height || 50;
    
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#ccc';
    ctx.strokeRect(0, 0, width, height);
    
    // 添加类型标识
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(obj.type || 'object', width / 2, height / 2);
  }

  /**
   * DataURL转Blob
   */
  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }

  /**
   * 生成文件名
   */
  static generateFileName(format: string, prefix = 'poster'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${prefix}-${timestamp}.${format}`;
  }

  /**
   * 下载Blob文件
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}