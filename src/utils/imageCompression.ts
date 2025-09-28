// 图片压缩和处理工具

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

export interface ImageInfo {
  width: number;
  height: number;
  size: number;
  type: string;
  aspectRatio: number;
}

// 默认压缩选项
const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'jpeg',
  maintainAspectRatio: true
};

/**
 * 压缩图片文件
 */
export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('无法创建 Canvas 上下文'));
      return;
    }

    img.onload = () => {
      try {
        // 计算新的尺寸
        const { width, height } = calculateNewDimensions(
          img.width, 
          img.height, 
          opts.maxWidth, 
          opts.maxHeight,
          opts.maintainAspectRatio
        );

        // 设置 Canvas 尺寸
        canvas.width = width;
        canvas.height = height;

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: `image/${opts.format}`,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('压缩失败'));
            }
          },
          `image/${opts.format}`,
          opts.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 生成缩略图
 */
export async function generateThumbnail(
  file: File,
  size: number = 200,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('无法创建 Canvas 上下文'));
      return;
    }

    img.onload = () => {
      try {
        // 计算缩略图尺寸（正方形）
        const { width, height } = calculateThumbnailSize(img.width, img.height, size);
        
        canvas.width = size;
        canvas.height = size;

        // 填充白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // 居中绘制图片
        const x = (size - width) / 2;
        const y = (size - height) / 2;
        ctx.drawImage(img, x, y, width, height);

        // 转换为 Data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 获取图片信息
 */
export async function getImageInfo(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
        aspectRatio: img.width / img.height
      });
    };

    img.onerror = () => reject(new Error('无法获取图片信息'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 批量压缩图片
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (progress: number, current: number, total: number) => void
): Promise<File[]> {
  const results: File[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const compressedFile = await compressImage(files[i], options);
      results.push(compressedFile);
      
      if (onProgress) {
        onProgress(((i + 1) / files.length) * 100, i + 1, files.length);
      }
    } catch (error) {
      console.error(`压缩文件 ${files[i].name} 失败:`, error);
      // 如果压缩失败，使用原文件
      results.push(files[i]);
    }
  }
  
  return results;
}

/**
 * 转换图片格式
 */
export async function convertImageFormat(
  file: File,
  targetFormat: 'jpeg' | 'png' | 'webp',
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('无法创建 Canvas 上下文'));
      return;
    }

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;

        // 如果目标格式是 JPEG，先填充白色背景
        if (targetFormat === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFileName = file.name.replace(/\.[^/.]+$/, `.${targetFormat}`);
              const convertedFile = new File([blob], newFileName, {
                type: `image/${targetFormat}`,
                lastModified: Date.now()
              });
              resolve(convertedFile);
            } else {
              reject(new Error('格式转换失败'));
            }
          },
          `image/${targetFormat}`,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 裁剪图片
 */
export async function cropImage(
  file: File,
  cropArea: { x: number; y: number; width: number; height: number },
  outputSize?: { width: number; height: number }
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('无法创建 Canvas 上下文'));
      return;
    }

    img.onload = () => {
      try {
        const { x, y, width, height } = cropArea;
        const outputWidth = outputSize?.width || width;
        const outputHeight = outputSize?.height || height;

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        // 裁剪并缩放
        ctx.drawImage(
          img,
          x, y, width, height,
          0, 0, outputWidth, outputHeight
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const croppedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(croppedFile);
            } else {
              reject(new Error('裁剪失败'));
            }
          },
          file.type,
          0.9
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 计算新的图片尺寸
 */
function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean = true
): { width: number; height: number } {
  if (!maintainAspectRatio) {
    return {
      width: Math.min(originalWidth, maxWidth),
      height: Math.min(originalHeight, maxHeight)
    };
  }

  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;

  // 如果宽度超出限制
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  // 如果高度超出限制
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * 计算缩略图尺寸
 */
function calculateThumbnailSize(
  originalWidth: number,
  originalHeight: number,
  maxSize: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;

  if (width > height) {
    if (width > maxSize) {
      width = maxSize;
      height = width / aspectRatio;
    }
  } else {
    if (height > maxSize) {
      height = maxSize;
      width = height * aspectRatio;
    }
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: '只支持图片文件' };
  }

  // 检查支持的格式
  const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: '不支持的图片格式' };
  }

  // 检查文件大小 (50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '文件大小不能超过 50MB' };
  }

  return { valid: true };
}

/**
 * 获取推荐的压缩选项
 */
export function getRecommendedCompressionOptions(
  imageInfo: ImageInfo,
  targetUse: 'thumbnail' | 'display' | 'print' = 'display'
): CompressionOptions {
  const { width, height, size } = imageInfo;

  switch (targetUse) {
    case 'thumbnail':
      return {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.7,
        format: 'jpeg'
      };

    case 'display':
      return {
        maxWidth: Math.min(width, 1920),
        maxHeight: Math.min(height, 1080),
        quality: size > 2 * 1024 * 1024 ? 0.8 : 0.9, // 大文件降低质量
        format: 'jpeg'
      };

    case 'print':
      return {
        maxWidth: Math.min(width, 3840),
        maxHeight: Math.min(height, 2160),
        quality: 0.95,
        format: 'jpeg'
      };

    default:
      return DEFAULT_OPTIONS;
  }
}