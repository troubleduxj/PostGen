import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { useAlignmentStore } from '@/stores/alignmentStore';

interface GridSystemProps {
  canvas: fabric.Canvas;
}

export const GridSystem: React.FC<GridSystemProps> = ({ canvas }) => {
  const {
    grid,

  } = useAlignmentStore();

  const gridPatternRef = useRef<fabric.Pattern | null>(null);
  const gridObjectRef = useRef<fabric.Rect | null>(null);

  // 创建网格图案
  const createGridPattern = (): fabric.Pattern => {
    const { size, color, opacity } = grid;
    
    // 创建网格画布
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = size;
    gridCanvas.height = size;
    const ctx = gridCanvas.getContext('2d');
    
    if (ctx) {
      // 设置网格样式
      ctx.strokeStyle = color;
      ctx.globalAlpha = opacity;
      ctx.lineWidth = 1;
      
      // 绘制网格线
      ctx.beginPath();
      // 垂直线
      ctx.moveTo(size, 0);
      ctx.lineTo(size, size);
      // 水平线
      ctx.moveTo(0, size);
      ctx.lineTo(size, size);
      ctx.stroke();
    }
    
    // 创建 Fabric.js 图案
    return new fabric.Pattern({
      source: gridCanvas as any,
      repeat: 'repeat',
    });
  };

  // 更新网格显示
  const updateGrid = () => {
    // 移除现有网格
    if (gridObjectRef.current) {
      canvas.remove(gridObjectRef.current);
      gridObjectRef.current = null;
    }

    // 如果网格不可见，直接返回
    if (!grid.visible) return;

    // 创建新的网格图案
    gridPatternRef.current = createGridPattern();

    // 创建网格矩形对象
    const gridRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      fill: gridPatternRef.current,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });

    // 添加自定义属性标识这是网格
    (gridRect as any).isGrid = true;

    // 将网格添加到画布底层
    canvas.insertAt(gridRect, 0, false);
    gridObjectRef.current = gridRect;

    canvas.renderAll();
  };

  // 网格吸附功能
  const snapToGrid = (object: fabric.Object): { left?: number; top?: number } => {
    if (!grid.snapEnabled) return {};

    const { size, snapThreshold } = grid;
    const objLeft = object.left || 0;
    const objTop = object.top || 0;

    const snapPosition: { left?: number; top?: number } = {};

    // 计算最近的网格点
    const nearestGridX = Math.round(objLeft / size) * size;
    const nearestGridY = Math.round(objTop / size) * size;

    // 检查是否在吸附阈值内
    if (Math.abs(objLeft - nearestGridX) <= snapThreshold) {
      snapPosition.left = nearestGridX;
    }

    if (Math.abs(objTop - nearestGridY) <= snapThreshold) {
      snapPosition.top = nearestGridY;
    }

    return snapPosition;
  };

  // 处理对象移动时的网格吸附
  const handleObjectMoving = (e: fabric.IEvent) => {
    const movingObject = e.target;
    if (!movingObject || (movingObject as any).isGrid || (movingObject as any).isAlignmentGuide) {
      return;
    }

    if (grid.snapEnabled) {
      const snapPosition = snapToGrid(movingObject);
      
      if (snapPosition.left !== undefined) {
        movingObject.set({ left: snapPosition.left });
      }
      if (snapPosition.top !== undefined) {
        movingObject.set({ top: snapPosition.top });
      }
    }
  };

  // 处理画布尺寸变化
  const handleCanvasResize = () => {
    if (gridObjectRef.current && grid.visible) {
      gridObjectRef.current.set({
        width: canvas.getWidth(),
        height: canvas.getHeight(),
      });
      canvas.renderAll();
    }
  };

  // 绑定画布事件
  useEffect(() => {
    if (!canvas) return;

    canvas.on('object:moving', handleObjectMoving);

    // 监听画布尺寸变化
    const resizeObserver = new ResizeObserver(handleCanvasResize);
    const canvasElement = canvas.getElement();
    if (canvasElement) {
      resizeObserver.observe(canvasElement);
    }

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      resizeObserver.disconnect();
    };
  }, [canvas, grid.snapEnabled, grid.snapThreshold]);

  // 监听网格配置变化
  useEffect(() => {
    updateGrid();
  }, [grid.visible, grid.size, grid.color, grid.opacity]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (gridObjectRef.current) {
        canvas?.remove(gridObjectRef.current);
        gridObjectRef.current = null;
      }
    };
  }, []);

  return null; // 这个组件不渲染任何 DOM，只处理画布上的网格
};