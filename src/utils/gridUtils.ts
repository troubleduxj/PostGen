import { fabric } from 'fabric';

// 网格配置接口
export interface GridConfig {
  size: number;
  color: string;
  opacity: number;
  visible: boolean;
  snapEnabled: boolean;
  snapThreshold: number;
}

// 网格点接口
export interface GridPoint {
  x: number;
  y: number;
}

// 计算网格点
export const calculateGridPoints = (
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number
): GridPoint[] => {
  const points: GridPoint[] = [];
  
  for (let x = 0; x <= canvasWidth; x += gridSize) {
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      points.push({ x, y });
    }
  }
  
  return points;
};

// 找到最近的网格点
export const findNearestGridPoint = (
  x: number,
  y: number,
  gridSize: number
): GridPoint => {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
};

// 检查点是否在网格吸附范围内
export const isWithinSnapThreshold = (
  point: GridPoint,
  target: GridPoint,
  threshold: number
): boolean => {
  const distance = Math.sqrt(
    Math.pow(point.x - target.x, 2) + Math.pow(point.y - target.y, 2)
  );
  return distance <= threshold;
};

// 创建网格线数据
export const createGridLines = (
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number
): { horizontal: number[]; vertical: number[] } => {
  const horizontal: number[] = [];
  const vertical: number[] = [];
  
  // 水平线
  for (let y = 0; y <= canvasHeight; y += gridSize) {
    horizontal.push(y);
  }
  
  // 垂直线
  for (let x = 0; x <= canvasWidth; x += gridSize) {
    vertical.push(x);
  }
  
  return { horizontal, vertical };
};

// 创建网格 SVG 图案
export const createGridSVGPattern = (
  gridSize: number,
  color: string,
  opacity: number
): string => {
  return `
    <svg width="${gridSize}" height="${gridSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
          <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" 
                fill="none" 
                stroke="${color}" 
                stroke-width="1" 
                opacity="${opacity}"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  `;
};

// 创建网格 Canvas 图案
export const createGridCanvasPattern = (
  gridSize: number,
  color: string,
  opacity: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = gridSize;
  canvas.height = gridSize;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    // 右边线
    ctx.moveTo(gridSize, 0);
    ctx.lineTo(gridSize, gridSize);
    // 底边线
    ctx.moveTo(0, gridSize);
    ctx.lineTo(gridSize, gridSize);
    ctx.stroke();
  }
  
  return canvas;
};

// 对象吸附到网格
export const snapObjectToGrid = (
  object: fabric.Object,
  gridSize: number,
  snapThreshold: number
): { left?: number; top?: number } => {
  const objLeft = object.left || 0;
  const objTop = object.top || 0;
  
  const nearestPoint = findNearestGridPoint(objLeft, objTop, gridSize);
  const currentPoint = { x: objLeft, y: objTop };
  
  const snapPosition: { left?: number; top?: number } = {};
  
  if (isWithinSnapThreshold(currentPoint, nearestPoint, snapThreshold)) {
    snapPosition.left = nearestPoint.x;
    snapPosition.top = nearestPoint.y;
  }
  
  return snapPosition;
};

// 计算对象在网格中的位置
export const getObjectGridPosition = (
  object: fabric.Object,
  gridSize: number
): { gridX: number; gridY: number } => {
  const objLeft = object.left || 0;
  const objTop = object.top || 0;
  
  return {
    gridX: Math.round(objLeft / gridSize),
    gridY: Math.round(objTop / gridSize),
  };
};

// 将网格位置转换为像素位置
export const gridPositionToPixels = (
  gridX: number,
  gridY: number,
  gridSize: number
): { x: number; y: number } => {
  return {
    x: gridX * gridSize,
    y: gridY * gridSize,
  };
};

// 检查对象是否对齐到网格
export const isObjectAlignedToGrid = (
  object: fabric.Object,
  gridSize: number,
  tolerance: number = 1
): boolean => {
  const objLeft = object.left || 0;
  const objTop = object.top || 0;
  
  const nearestPoint = findNearestGridPoint(objLeft, objTop, gridSize);
  
  return (
    Math.abs(objLeft - nearestPoint.x) <= tolerance &&
    Math.abs(objTop - nearestPoint.y) <= tolerance
  );
};

// 获取网格统计信息
export const getGridStats = (
  objects: fabric.Object[],
  gridSize: number
): {
  totalObjects: number;
  alignedObjects: number;
  alignmentPercentage: number;
} => {
  const totalObjects = objects.filter(obj => 
    !(obj as any).isGrid && !(obj as any).isAlignmentGuide
  ).length;
  
  const alignedObjects = objects.filter(obj => {
    if ((obj as any).isGrid || (obj as any).isAlignmentGuide) return false;
    return isObjectAlignedToGrid(obj, gridSize);
  }).length;
  
  const alignmentPercentage = totalObjects > 0 ? (alignedObjects / totalObjects) * 100 : 0;
  
  return {
    totalObjects,
    alignedObjects,
    alignmentPercentage: Math.round(alignmentPercentage),
  };
};

// 自动调整网格大小建议
export const suggestGridSize = (
  objects: fabric.Object[],
  _canvasWidth: number,
  _canvasHeight: number
): number[] => {
  if (objects.length === 0) return [10, 20, 25, 50];
  
  // 分析对象间距
  const spacings: number[] = [];
  
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const obj1 = objects[i];
      const obj2 = objects[j];
      
      const dx = Math.abs((obj1.left || 0) - (obj2.left || 0));
      const dy = Math.abs((obj1.top || 0) - (obj2.top || 0));
      
      if (dx > 0) spacings.push(dx);
      if (dy > 0) spacings.push(dy);
    }
  }
  
  // 找到常见的间距
  const commonSpacings = spacings
    .filter(spacing => spacing >= 5 && spacing <= 100)
    .sort((a, b) => a - b);
  
  if (commonSpacings.length === 0) return [10, 20, 25, 50];
  
  // 计算建议的网格大小
  const suggestions = new Set<number>();
  
  // 添加常见间距的因子
  commonSpacings.forEach(spacing => {
    for (let divisor = 1; divisor <= 5; divisor++) {
      const gridSize = Math.round(spacing / divisor);
      if (gridSize >= 5 && gridSize <= 50) {
        suggestions.add(gridSize);
      }
    }
  });
  
  // 添加标准网格大小
  [5, 10, 15, 20, 25, 30, 40, 50].forEach(size => suggestions.add(size));
  
  return Array.from(suggestions).sort((a, b) => a - b).slice(0, 6);
};