import { fabric } from 'fabric';

// 图片处理性能优化工具类
export class ImageProcessingOptimizer {
  private static instance: ImageProcessingOptimizer;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenContext: CanvasRenderingContext2D | null = null;
  private imageCache = new Map<string, HTMLImageElement>();
  private processingQueue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private maxCacheSize = 50; // 最大缓存图片数量
  private maxImageSize = 2048; // 最大处理图片尺寸

  private constructor() {
    this.initializeOffscreenCanvas();
  }

  public static getInstance(): ImageProcessingOptimizer {
    if (!ImageProcessingOptimizer.instance) {
      ImageProcessingOptimizer.instance = new ImageProcessingOptimizer();
    }
    return ImageProcessingOptimizer.instance;
  }

  // 初始化离屏Canvas
  private initializeOffscreenCanvas(): void {
    try {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenContext = this.offscreenCanvas.getContext('2d', {
        alpha: true,
        willReadFrequently: false,
        desynchronized: true
      });
    } catch (error) {
      console.warn('Failed to create offscreen canvas:', error);
    }
  }

  // 获取离屏Canvas
  public getOffscreenCanvas(width: number, height: number): {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  } | null {
    if (!this.offscreenCanvas || !this.offscreenContext) {
      return null;
    }

    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    this.offscreenContext.clearRect(0, 0, width, height);

    return {
      canvas: this.offscreenCanvas,
      context: this.offscreenContext
    };
  }

  // 图片缓存管理
  public cacheImage(key: string, image: HTMLImageElement): void {
    if (this.imageCache.size >= this.maxCacheSize) {
      // 删除最旧的缓存项
      const firstKey = this.imageCache.keys().next().value;
      this.imageCache.delete(firstKey);
    }
    this.imageCache.set(key, image);
  }

  public getCachedImage(key: string): HTMLImageElement | undefined {
    return this.imageCache.get(key);
  }

  public clearImageCache(): void {
    this.imageCache.clear();
  }

  // 图片尺寸优化
  public optimizeImageSize(
    image: HTMLImageElement,
    maxWidth: number = this.maxImageSize,
    maxHeight: number = this.maxImageSize
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const { naturalWidth, naturalHeight } = image;
      
      // 如果图片尺寸已经合适，直接返回
      if (naturalWidth <= maxWidth && naturalHeight <= maxHeight) {
        resolve(image);
        return;
      }

      // 计算缩放比例
      const scaleX = maxWidth / naturalWidth;
      const scaleY = maxHeight / naturalHeight;
      const scale = Math.min(scaleX, scaleY);

      const newWidth = Math.floor(naturalWidth * scale);
      const newHeight = Math.floor(naturalHeight * scale);

      const offscreen = this.getOffscreenCanvas(newWidth, newHeight);
      if (!offscreen) {
        reject(new Error('Failed to create offscreen canvas'));
        return;
      }

      // 使用高质量缩放
      offscreen.context.imageSmoothingEnabled = true;
      offscreen.context.imageSmoothingQuality = 'high';
      offscreen.context.drawImage(image, 0, 0, newWidth, newHeight);

      // 创建新的图片对象
      const optimizedImage = new Image();
      optimizedImage.onload = () => resolve(optimizedImage);
      optimizedImage.onerror = () => reject(new Error('Failed to create optimized image'));
      optimizedImage.src = offscreen.canvas.toDataURL('image/jpeg', 0.9);
    });
  }

  // 分块处理大图片
  public async processImageInChunks<T>(
    image: HTMLImageElement,
    chunkSize: number,
    processor: (
      imageData: ImageData,
      x: number,
      y: number,
      width: number,
      height: number
    ) => ImageData | Promise<ImageData>,
    onProgress?: (progress: number) => void
  ): Promise<HTMLImageElement> {
    const { naturalWidth, naturalHeight } = image;
    const offscreen = this.getOffscreenCanvas(naturalWidth, naturalHeight);
    
    if (!offscreen) {
      throw new Error('Failed to create offscreen canvas');
    }

    // 绘制原始图片
    offscreen.context.drawImage(image, 0, 0);

    const totalChunks = Math.ceil(naturalWidth / chunkSize) * Math.ceil(naturalHeight / chunkSize);
    let processedChunks = 0;

    // 分块处理
    for (let y = 0; y < naturalHeight; y += chunkSize) {
      for (let x = 0; x < naturalWidth; x += chunkSize) {
        const width = Math.min(chunkSize, naturalWidth - x);
        const height = Math.min(chunkSize, naturalHeight - y);

        // 获取当前块的图像数据
        const imageData = offscreen.context.getImageData(x, y, width, height);
        
        // 处理当前块
        const processedData = await processor(imageData, x, y, width, height);
        
        // 将处理后的数据写回
        offscreen.context.putImageData(processedData, x, y);

        processedChunks++;
        onProgress?.(processedChunks / totalChunks);

        // 让出控制权，避免阻塞UI
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // 创建处理后的图片
    return new Promise((resolve, reject) => {
      const processedImage = new Image();
      processedImage.onload = () => resolve(processedImage);
      processedImage.onerror = () => reject(new Error('Failed to create processed image'));
      processedImage.src = offscreen.canvas.toDataURL();
    });
  }

  // 异步队列处理
  public async queueProcessing(task: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.processingQueue.push(async () => {
        try {
          await task();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const task = this.processingQueue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          console.error('Processing task failed:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  // 内存管理
  public getMemoryUsage(): {
    cacheSize: number;
    maxCacheSize: number;
    queueLength: number;
  } {
    return {
      cacheSize: this.imageCache.size,
      maxCacheSize: this.maxCacheSize,
      queueLength: this.processingQueue.length
    };
  }

  public cleanup(): void {
    this.clearImageCache();
    this.processingQueue.length = 0;
    this.isProcessing = false;
    
    if (this.offscreenCanvas) {
      this.offscreenCanvas.width = 0;
      this.offscreenCanvas.height = 0;
    }
  }

  // Fabric.js 图片优化
  public optimizeFabricImage(fabricImage: fabric.Image): Promise<fabric.Image> {
    return new Promise((resolve, reject) => {
      if (!fabricImage.getElement()) {
        reject(new Error('No image element found'));
        return;
      }

      const imageElement = fabricImage.getElement() as HTMLImageElement;
      const cacheKey = `fabric_${imageElement.src}_${Date.now()}`;

      // 检查缓存
      const cachedImage = this.getCachedImage(cacheKey);
      if (cachedImage) {
        const optimizedFabricImage = new fabric.Image(cachedImage, {
          ...fabricImage.toObject(),
        });
        resolve(optimizedFabricImage);
        return;
      }

      // 优化图片尺寸
      this.optimizeImageSize(imageElement)
        .then(optimizedImage => {
          this.cacheImage(cacheKey, optimizedImage);
          
          const optimizedFabricImage = new fabric.Image(optimizedImage, {
            ...fabricImage.toObject(),
          });
          
          resolve(optimizedFabricImage);
        })
        .catch(reject);
    });
  }

  // 批量处理图片
  public async batchProcessImages(
    images: fabric.Image[],
    onProgress?: (current: number, total: number) => void
  ): Promise<fabric.Image[]> {
    const results: fabric.Image[] = [];
    
    for (let i = 0; i < images.length; i++) {
      try {
        const optimizedImage = await this.optimizeFabricImage(images[i]);
        results.push(optimizedImage);
        onProgress?.(i + 1, images.length);
      } catch (error) {
        console.error(`Failed to process image ${i}:`, error);
        results.push(images[i]); // 使用原始图片作为后备
      }
    }

    return results;
  }
}

// 图片处理进度管理器
export class ProcessingProgressManager {
  private progressCallbacks = new Map<string, (progress: number) => void>();
  private currentProgress = new Map<string, number>();

  public registerProgress(id: string, callback: (progress: number) => void): void {
    this.progressCallbacks.set(id, callback);
    this.currentProgress.set(id, 0);
  }

  public updateProgress(id: string, progress: number): void {
    this.currentProgress.set(id, progress);
    const callback = this.progressCallbacks.get(id);
    callback?.(progress);
  }

  public completeProgress(id: string): void {
    this.updateProgress(id, 100);
    setTimeout(() => {
      this.progressCallbacks.delete(id);
      this.currentProgress.delete(id);
    }, 1000);
  }

  public getProgress(id: string): number {
    return this.currentProgress.get(id) || 0;
  }

  public cleanup(): void {
    this.progressCallbacks.clear();
    this.currentProgress.clear();
  }
}

// 图片格式优化工具
export class ImageFormatOptimizer {
  // 根据图片内容选择最佳格式
  public static getBestFormat(
    image: HTMLImageElement,
    hasTransparency: boolean = false
  ): 'png' | 'jpeg' | 'webp' {
    // 如果有透明度，使用PNG
    if (hasTransparency) {
      return 'png';
    }

    // 检查浏览器是否支持WebP
    if (this.supportsWebP()) {
      return 'webp';
    }

    // 默认使用JPEG
    return 'jpeg';
  }

  // 检查WebP支持
  private static supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // 获取最佳质量设置
  public static getBestQuality(format: string, fileSize?: number): number {
    switch (format) {
      case 'jpeg':
      case 'webp':
        // 根据文件大小调整质量
        if (fileSize && fileSize > 1024 * 1024) { // 大于1MB
          return 0.8;
        }
        return 0.9;
      case 'png':
        return 1.0; // PNG是无损格式
      default:
        return 0.9;
    }
  }
}

// 导出单例实例
export const imageOptimizer = ImageProcessingOptimizer.getInstance();
export const progressManager = new ProcessingProgressManager();