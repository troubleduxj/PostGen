import React from 'react';
import { fabric } from 'fabric';
import { Pen, Eraser } from 'lucide-react';
import { EditorTool } from '@/types/tools';

// 画笔工具
export class PenTool implements EditorTool {
  id = 'pen';
  name = '画笔工具';
  icon = Pen;
  category = 'draw' as const;
  shortcut = 'P';
  tooltip = '自由绘制 (P)';

  config = {
    cursor: 'crosshair',
    allowSelection: false,
    allowDrawing: true,
  };

  private brushSettings = {
    width: 5,
    color: '#000000',
  };

  activate(canvas: fabric.Canvas): void {
    canvas.isDrawingMode = true;
    canvas.selection = false;
    
    // 设置画笔属性
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = this.brushSettings.width;
      canvas.freeDrawingBrush.color = this.brushSettings.color;
    }
    
    canvas.defaultCursor = 'crosshair';
  }

  deactivate(canvas: fabric.Canvas): void {
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.defaultCursor = 'default';
  }

  onCanvasEvent(event: fabric.IEvent): void {
    // 绘制事件由 Fabric.js 内置处理
  }

  onKeyDown(event: KeyboardEvent): boolean {
    // 支持数字键调整画笔大小
    const num = parseInt(event.key);
    if (num >= 1 && num <= 9) {
      this.setBrushWidth(num * 2);
      return true;
    }
    
    return false;
  }

  // 设置画笔宽度
  setBrushWidth(width: number): void {
    this.brushSettings.width = width;
    // 这里需要通过工具管理器获取画布引用
    // 暂时先保存设置
  }

  // 设置画笔颜色
  setBrushColor(color: string): void {
    this.brushSettings.color = color;
  }

  // 获取画笔设置
  getBrushSettings() {
    return { ...this.brushSettings };
  }
}

// 橡皮擦工具
export class EraserTool implements EditorTool {
  id = 'eraser';
  name = '橡皮擦工具';
  icon = Eraser;
  category = 'draw' as const;
  shortcut = 'E';
  tooltip = '擦除绘制内容 (E)';

  config = {
    cursor: 'crosshair',
    allowSelection: false,
    allowDrawing: true,
  };

  private eraserSettings = {
    width: 10,
  };

  activate(canvas: fabric.Canvas): void {
    canvas.isDrawingMode = true;
    canvas.selection = false;
    
    // 设置橡皮擦（使用特殊的画笔模式）
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = this.eraserSettings.width;
      // 橡皮擦使用目标混合模式
      (canvas.freeDrawingBrush as any).globalCompositeOperation = 'destination-out';
    }
    
    canvas.defaultCursor = 'crosshair';
  }

  deactivate(canvas: fabric.Canvas): void {
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    
    // 恢复正常的混合模式
    if (canvas.freeDrawingBrush) {
      (canvas.freeDrawingBrush as any).globalCompositeOperation = 'source-over';
    }
  }

  onCanvasEvent(event: fabric.IEvent): void {
    // 擦除事件由 Fabric.js 内置处理
  }

  onKeyDown(event: KeyboardEvent): boolean {
    // 支持数字键调整橡皮擦大小
    const num = parseInt(event.key);
    if (num >= 1 && num <= 9) {
      this.setEraserWidth(num * 3);
      return true;
    }
    
    return false;
  }

  // 设置橡皮擦宽度
  setEraserWidth(width: number): void {
    this.eraserSettings.width = width;
  }

  // 获取橡皮擦设置
  getEraserSettings() {
    return { ...this.eraserSettings };
  }
}