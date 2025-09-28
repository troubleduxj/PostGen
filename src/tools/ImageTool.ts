import React from 'react';
import { fabric } from 'fabric';
import { Image } from 'lucide-react';
import { EditorTool } from '@/types/tools';

export class ImageTool implements EditorTool {
  id = 'image';
  name = '图片工具';
  icon = Image;
  category = 'image' as const;
  shortcut = 'I';
  tooltip = '添加图片 (I)';

  config = {
    cursor: 'crosshair',
    allowSelection: true,
    allowDrawing: false,
  };

  activate(canvas: fabric.Canvas): void {
    canvas.selection = true;
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'crosshair';
    
    // 立即触发文件选择
    this.triggerImageUpload(canvas);
  }

  deactivate(canvas: fabric.Canvas): void {
    canvas.defaultCursor = 'default';
  }

  private triggerImageUpload(canvas: fabric.Canvas): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.loadImageFromFile(canvas, file);
      }
    };
    
    input.click();
  }

  private loadImageFromFile(canvas: fabric.Canvas, file: File): void {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      
      fabric.Image.fromURL(imgUrl, (img) => {
        // 设置图片属性
        img.set({
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
        });
        
        // 确保图片不会太大
        const maxWidth = canvas.getWidth() * 0.8;
        const maxHeight = canvas.getHeight() * 0.8;
        
        if (img.width && img.height) {
          const scaleX = maxWidth / img.width;
          const scaleY = maxHeight / img.height;
          const scale = Math.min(scaleX, scaleY, 1); // 不放大，只缩小
          
          img.set({
            scaleX: scale,
            scaleY: scale,
          });
        }
        
        // 居中放置
        img.set({
          left: (canvas.getWidth() - (img.width || 0) * (img.scaleX || 1)) / 2,
          top: (canvas.getHeight() - (img.height || 0) * (img.scaleY || 1)) / 2,
        });
        
        // 添加到画布
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        
      }, {
        crossOrigin: 'anonymous'
      });
    };
    
    reader.onerror = () => {
      console.error('Failed to load image file');
    };
    
    reader.readAsDataURL(file);
  }

  onCanvasEvent(event: fabric.IEvent): void {
    // 图片工具主要通过文件上传处理，不需要特殊的画布事件
  }

  onKeyDown(event: KeyboardEvent): boolean {
    // 支持 Ctrl+V 粘贴图片（如果剪贴板中有图片）
    if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
      this.handlePaste();
      return true;
    }
    
    return false;
  }

  private async handlePaste(): Promise<void> {
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], 'pasted-image.png', { type });
            
            // 这里需要获取当前画布引用
            // 暂时先记录，后续在工具管理器中处理
            console.log('Pasted image file:', file);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  }
}