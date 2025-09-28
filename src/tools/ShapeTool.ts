import React from 'react';
import { fabric } from 'fabric';
import { Square, Circle, Triangle, Minus } from 'lucide-react';
import { EditorTool } from '@/types/tools';

// 基础形状工具类
export abstract class BaseShapeTool implements EditorTool {
  abstract id: string;
  abstract name: string;
  abstract icon: React.ComponentType<any>;
  category = 'shape' as const;
  abstract shortcut?: string;
  abstract tooltip: string;

  config = {
    cursor: 'crosshair',
    allowSelection: true,
    allowDrawing: false,
  };

  private isDrawing = false;
  private startPoint: fabric.Point | null = null;

  activate(canvas: fabric.Canvas): void {
    canvas.selection = false; // 绘制时禁用选择
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'crosshair';
    
    // 添加鼠标事件监听器
    canvas.on('mouse:down', this.handleMouseDown);
    canvas.on('mouse:move', this.handleMouseMove);
    canvas.on('mouse:up', this.handleMouseUp);
  }

  deactivate(canvas: fabric.Canvas): void {
    // 移除事件监听器
    canvas.off('mouse:down', this.handleMouseDown);
    canvas.off('mouse:move', this.handleMouseMove);
    canvas.off('mouse:up', this.handleMouseUp);
    
    // 恢复选择模式
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    
    // 清理绘制状态
    this.isDrawing = false;
    this.startPoint = null;
  }

  private handleMouseDown = (event: fabric.IEvent): void => {
    if (!event.e) return;
    
    const canvas = event.target as unknown as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);
    
    this.isDrawing = true;
    this.startPoint = new fabric.Point(pointer.x, pointer.y);
  };

  private handleMouseMove = (event: fabric.IEvent): void => {
    if (!this.isDrawing || !this.startPoint || !event.e) return;
    
    const canvas = event.target as unknown as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);
    
    // 更新预览（如果需要的话）
    this.updatePreview(canvas, this.startPoint, new fabric.Point(pointer.x, pointer.y));
  };

  private handleMouseUp = (event: fabric.IEvent): void => {
    if (!this.isDrawing || !this.startPoint || !event.e) return;
    
    const canvas = event.target as unknown as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);
    const endPoint = new fabric.Point(pointer.x, pointer.y);
    
    // 创建形状
    this.createShape(canvas, this.startPoint, endPoint);
    
    // 重置状态
    this.isDrawing = false;
    this.startPoint = null;
  };

  // 子类需要实现的方法
  protected abstract createShape(canvas: fabric.Canvas, start: fabric.Point, end: fabric.Point): void;
  
  // 可选的预览更新方法
  protected updatePreview(canvas: fabric.Canvas, start: fabric.Point, current: fabric.Point): void {
    // 默认不实现预览
  }

  onCanvasEvent(event: fabric.IEvent): void {
    // 事件处理在私有方法中完成
  }

  onKeyDown(event: KeyboardEvent): boolean {
    // 按住 Shift 键绘制正方形/圆形
    if (event.key === 'Shift') {
      return true; // 表示我们处理了这个事件
    }
    return false;
  }
}

// 矩形工具
export class RectangleTool extends BaseShapeTool {
  id = 'rectangle';
  name = '矩形工具';
  icon = Square;
  shortcut = 'R';
  tooltip = '绘制矩形 (R)';

  protected createShape(canvas: fabric.Canvas, start: fabric.Point, end: fabric.Point): void {
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    
    // 最小尺寸检查
    if (width < 5 || height < 5) return;
    
    const rect = new fabric.Rect({
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      width,
      height,
      fill: '#3b82f6',
      stroke: '#1d4ed8',
      strokeWidth: 2,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  }
}

// 圆形工具
export class CircleTool extends BaseShapeTool {
  id = 'circle';
  name = '圆形工具';
  icon = Circle;
  shortcut = 'O';
  tooltip = '绘制圆形 (O)';

  protected createShape(canvas: fabric.Canvas, start: fabric.Point, end: fabric.Point): void {
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    const radius = Math.min(width, height) / 2;
    
    // 最小尺寸检查
    if (radius < 5) return;
    
    const circle = new fabric.Circle({
      left: Math.min(start.x, end.x) + width / 2 - radius,
      top: Math.min(start.y, end.y) + height / 2 - radius,
      radius,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2,
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  }
}

// 三角形工具
export class TriangleTool extends BaseShapeTool {
  id = 'triangle';
  name = '三角形工具';
  icon = Triangle;
  shortcut = undefined;
  tooltip = '绘制三角形';

  protected createShape(canvas: fabric.Canvas, start: fabric.Point, end: fabric.Point): void {
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    
    // 最小尺寸检查
    if (width < 5 || height < 5) return;
    
    const triangle = new fabric.Triangle({
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      width,
      height,
      fill: '#f59e0b',
      stroke: '#d97706',
      strokeWidth: 2,
    });

    canvas.add(triangle);
    canvas.setActiveObject(triangle);
    canvas.renderAll();
  }
}

// 直线工具
export class LineTool extends BaseShapeTool {
  id = 'line';
  name = '直线工具';
  icon = Minus;
  shortcut = 'L';
  tooltip = '绘制直线 (L)';

  protected createShape(canvas: fabric.Canvas, start: fabric.Point, end: fabric.Point): void {
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    
    // 最小长度检查
    if (distance < 5) return;
    
    const line = new fabric.Line([start.x, start.y, end.x, end.y], {
      stroke: '#ef4444',
      strokeWidth: 3,
      selectable: true,
    });

    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
  }
}