import React from 'react';
import { fabric } from 'fabric';
import { Move, Pipette } from 'lucide-react';
import { EditorTool } from '@/types/tools';

// 移动工具（手型工具）
export class HandTool implements EditorTool {
  id = 'hand';
  name = '移动工具';
  icon = Move;
  category = 'utility' as const;
  shortcut = 'H';
  tooltip = '拖拽画布 (H)';

  config = {
    cursor: 'grab',
    allowSelection: false,
    allowDrawing: false,
  };

  private isDragging = false;
  private lastPoint: fabric.Point | null = null;

  activate(canvas: fabric.Canvas): void {
    canvas.selection = false;
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'grab';
    
    // 禁用所有对象的交互
    canvas.forEachObject((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });
    
    // 添加拖拽事件监听器
    canvas.on('mouse:down', this.handleMouseDown);
    canvas.on('mouse:move', this.handleMouseMove);
    canvas.on('mouse:up', this.handleMouseUp);
  }

  deactivate(canvas: fabric.Canvas): void {
    // 移除事件监听器
    canvas.off('mouse:down', this.handleMouseDown);
    canvas.off('mouse:move', this.handleMouseMove);
    canvas.off('mouse:up', this.handleMouseUp);
    
    // 恢复对象交互
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });
    
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    
    // 重置状态
    this.isDragging = false;
    this.lastPoint = null;
  }

  private handleMouseDown = (event: fabric.IEvent): void => {
    if (!event.e) return;
    
    const canvas = event.target as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);
    
    this.isDragging = true;
    this.lastPoint = new fabric.Point(pointer.x, pointer.y);
    canvas.defaultCursor = 'grabbing';
  };

  private handleMouseMove = (event: fabric.IEvent): void => {
    if (!this.isDragging || !this.lastPoint || !event.e) return;
    
    const canvas = event.target as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);
    const currentPoint = new fabric.Point(pointer.x, pointer.y);
    
    // 计算移动距离
    const deltaX = currentPoint.x - this.lastPoint.x;
    const deltaY = currentPoint.y - this.lastPoint.y;
    
    // 移动画布视口
    const vpt = canvas.viewportTransform;
    if (vpt) {
      vpt[4] += deltaX;
      vpt[5] += deltaY;
      canvas.requestRenderAll();
    }
    
    this.lastPoint = currentPoint;
  };

  private handleMouseUp = (): void => {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.lastPoint = null;
    
    // 恢复光标
    const canvas = event?.target as fabric.Canvas;
    if (canvas) {
      canvas.defaultCursor = 'grab';
    }
  };

  onCanvasEvent(event: fabric.IEvent): void {
    // 事件处理在私有方法中完成
  }

  onKeyDown(event: KeyboardEvent): boolean {
    // 空格键临时激活手型工具
    if (event.key === ' ') {
      return true;
    }
    return false;
  }
}

// 取色器工具
export class EyedropperTool implements EditorTool {
  id = 'eyedropper';
  name = '取色器工具';
  icon = Pipette;
  category = 'utility' as const;
  tooltip = '获取颜色';

  config = {
    cursor: 'crosshair',
    allowSelection: false,
    allowDrawing: false,
  };

  private onColorPicked?: (color: string) => void;

  activate(canvas: fabric.Canvas): void {
    canvas.selection = false;
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'crosshair';
    
    // 添加点击事件监听器
    canvas.on('mouse:down', this.handleMouseDown);
  }

  deactivate(canvas: fabric.Canvas): void {
    // 移除事件监听器
    canvas.off('mouse:down', this.handleMouseDown);
    
    canvas.selection = true;
    canvas.defaultCursor = 'default';
  }

  private handleMouseDown = (event: fabric.IEvent): void => {
    if (!event.e) return;
    
    const canvas = event.target as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);
    
    // 获取点击位置的颜色
    const color = this.getColorAtPoint(canvas, pointer.x, pointer.y);
    
    if (color && this.onColorPicked) {
      this.onColorPicked(color);
    }
  };

  private getColorAtPoint(canvas: fabric.Canvas, x: number, y: number): string | null {
    try {
      // 获取画布的像素数据
      const ctx = canvas.getContext();
      const imageData = ctx.getImageData(x, y, 1, 1);
      const pixel = imageData.data;
      
      // 转换为十六进制颜色
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    } catch (error) {
      console.error('Failed to get color at point:', error);
      return null;
    }
  }

  // 设置颜色选择回调
  setColorPickedCallback(callback: (color: string) => void): void {
    this.onColorPicked = callback;
  }

  onCanvasEvent(event: fabric.IEvent): void {
    // 事件处理在私有方法中完成
  }

  onKeyDown(event: KeyboardEvent): boolean {
    return false;
  }
}