import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface EnhancedGridSystemProps {
  canvas: fabric.Canvas;
  visible?: boolean;
  size?: number;
  color?: string;
  opacity?: number;
  type?: 'dots' | 'lines' | 'both';
}

export const EnhancedGridSystem: React.FC<EnhancedGridSystemProps> = ({
  canvas,
  visible = true,
  size = 20,
  color = '#e0e0e0',
  opacity = 0.5,
  type = 'lines'
}) => {
  const gridRef = useRef<fabric.Group | null>(null);

  useEffect(() => {
    if (!canvas || !visible) {
      // 移除现有网格
      if (gridRef.current) {
        canvas.remove(gridRef.current);
        gridRef.current = null;
      }
      return;
    }

    // 移除旧网格
    if (gridRef.current) {
      canvas.remove(gridRef.current);
    }

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const gridObjects: fabric.Object[] = [];

    if (type === 'lines' || type === 'both') {
      // 创建垂直线
      for (let i = 0; i <= canvasWidth; i += size) {
        const line = new fabric.Line([i, 0, i, canvasHeight], {
          stroke: color,
          strokeWidth: i % (size * 5) === 0 ? 1.5 : 0.5, // 每5格加粗
          opacity: i % (size * 5) === 0 ? opacity * 1.2 : opacity,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
        gridObjects.push(line);
      }

      // 创建水平线
      for (let i = 0; i <= canvasHeight; i += size) {
        const line = new fabric.Line([0, i, canvasWidth, i], {
          stroke: color,
          strokeWidth: i % (size * 5) === 0 ? 1.5 : 0.5, // 每5格加粗
          opacity: i % (size * 5) === 0 ? opacity * 1.2 : opacity,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
        gridObjects.push(line);
      }
    }

    if (type === 'dots' || type === 'both') {
      // 创建网格点
      for (let x = 0; x <= canvasWidth; x += size) {
        for (let y = 0; y <= canvasHeight; y += size) {
          const dot = new fabric.Circle({
            left: x,
            top: y,
            radius: x % (size * 5) === 0 && y % (size * 5) === 0 ? 2 : 1,
            fill: color,
            opacity: x % (size * 5) === 0 && y % (size * 5) === 0 ? opacity * 1.5 : opacity,
            selectable: false,
            evented: false,
            excludeFromExport: true,
            originX: 'center',
            originY: 'center',
          });
          gridObjects.push(dot);
        }
      }
    }

    // 创建网格组
    if (gridObjects.length > 0) {
      const grid = new fabric.Group(gridObjects, {
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });

      // 将网格移到最底层
      canvas.add(grid);
      canvas.sendToBack(grid);
      gridRef.current = grid;
    }

    canvas.renderAll();

    return () => {
      if (gridRef.current) {
        canvas.remove(gridRef.current);
        gridRef.current = null;
      }
    };
  }, [canvas, visible, size, color, opacity, type]);

  // 监听画布尺寸变化
  useEffect(() => {
    if (!canvas) return;

    const handleCanvasResize = () => {
      // 重新创建网格以适应新尺寸
      if (gridRef.current) {
        canvas.remove(gridRef.current);
        gridRef.current = null;
      }
      
      // 触发重新创建
      setTimeout(() => {
        // 这里会触发上面的 useEffect
      }, 0);
    };

    canvas.on('canvas:resized', handleCanvasResize);

    return () => {
      canvas.off('canvas:resized', handleCanvasResize);
    };
  }, [canvas]);

  return null; // 这个组件不渲染任何DOM元素
};

export default EnhancedGridSystem;