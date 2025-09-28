import { fabric } from 'fabric';
import { AlignmentGuide } from '@/stores/alignmentStore';

// 对象边界信息
export interface ObjectBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

// 获取对象的精确边界
export const getObjectBounds = (object: fabric.Object): ObjectBounds => {
  const boundingRect = object.getBoundingRect();
  
  return {
    left: boundingRect.left,
    top: boundingRect.top,
    right: boundingRect.left + boundingRect.width,
    bottom: boundingRect.top + boundingRect.height,
    centerX: boundingRect.left + boundingRect.width / 2,
    centerY: boundingRect.top + boundingRect.height / 2,
    width: boundingRect.width,
    height: boundingRect.height,
  };
};

// 检测两个对象之间的对齐关系
export const detectAlignment = (
  obj1: fabric.Object,
  obj2: fabric.Object,
  threshold: number = 5
): AlignmentGuide[] => {
  const bounds1 = getObjectBounds(obj1);
  const bounds2 = getObjectBounds(obj2);
  const guides: AlignmentGuide[] = [];

  // 检测水平对齐
  if (Math.abs(bounds1.centerY - bounds2.centerY) <= threshold) {
    guides.push({
      id: `h_center_${(obj1 as any).id || obj1.type}_${(obj2 as any).id || obj2.type}`,
      type: 'horizontal',
      position: bounds2.centerY,
      objects: [obj2],
      visible: true,
    });
  }

  if (Math.abs(bounds1.top - bounds2.top) <= threshold) {
    guides.push({
      id: `h_top_${(obj1 as any).id || obj1.type}_${(obj2 as any).id || obj2.type}`,
      type: 'horizontal',
      position: bounds2.top,
      objects: [obj2],
      visible: true,
    });
  }

  if (Math.abs(bounds1.bottom - bounds2.bottom) <= threshold) {
    guides.push({
      id: `h_bottom_${(obj1 as any).id || obj1.type}_${(obj2 as any).id || obj2.type}`,
      type: 'horizontal',
      position: bounds2.bottom,
      objects: [obj2],
      visible: true,
    });
  }

  // 检测垂直对齐
  if (Math.abs(bounds1.centerX - bounds2.centerX) <= threshold) {
    guides.push({
      id: `v_center_${(obj1 as any).id || obj1.type}_${(obj2 as any).id || obj2.type}`,
      type: 'vertical',
      position: bounds2.centerX,
      objects: [obj2],
      visible: true,
    });
  }

  if (Math.abs(bounds1.left - bounds2.left) <= threshold) {
    guides.push({
      id: `v_left_${(obj1 as any).id || obj1.type}_${(obj2 as any).id || obj2.type}`,
      type: 'vertical',
      position: bounds2.left,
      objects: [obj2],
      visible: true,
    });
  }

  if (Math.abs(bounds1.right - bounds2.right) <= threshold) {
    guides.push({
      id: `v_right_${(obj1 as any).id || obj1.type}_${(obj2 as any).id || obj2.type}`,
      type: 'vertical',
      position: bounds2.right,
      objects: [obj2],
      visible: true,
    });
  }

  return guides;
};

// 检测对象与画布边界的对齐
export const detectCanvasAlignment = (
  object: fabric.Object,
  canvas: fabric.Canvas,
  threshold: number = 5
): AlignmentGuide[] => {
  const bounds = getObjectBounds(object);
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const guides: AlignmentGuide[] = [];

  // 检测与画布中心的对齐
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;

  if (Math.abs(bounds.centerX - canvasCenterX) <= threshold) {
    guides.push({
      id: 'canvas_center_x',
      type: 'vertical',
      position: canvasCenterX,
      objects: [],
      visible: true,
    });
  }

  if (Math.abs(bounds.centerY - canvasCenterY) <= threshold) {
    guides.push({
      id: 'canvas_center_y',
      type: 'horizontal',
      position: canvasCenterY,
      objects: [],
      visible: true,
    });
  }

  // 检测与画布边缘的对齐
  if (Math.abs(bounds.left) <= threshold) {
    guides.push({
      id: 'canvas_left',
      type: 'vertical',
      position: 0,
      objects: [],
      visible: true,
    });
  }

  if (Math.abs(bounds.right - canvasWidth) <= threshold) {
    guides.push({
      id: 'canvas_right',
      type: 'vertical',
      position: canvasWidth,
      objects: [],
      visible: true,
    });
  }

  if (Math.abs(bounds.top) <= threshold) {
    guides.push({
      id: 'canvas_top',
      type: 'horizontal',
      position: 0,
      objects: [],
      visible: true,
    });
  }

  if (Math.abs(bounds.bottom - canvasHeight) <= threshold) {
    guides.push({
      id: 'canvas_bottom',
      type: 'horizontal',
      position: canvasHeight,
      objects: [],
      visible: true,
    });
  }

  return guides;
};

// 计算吸附位置
export const calculateSnapPosition = (
  object: fabric.Object,
  guides: AlignmentGuide[]
): { left?: number; top?: number } => {
  const bounds = getObjectBounds(object);
  const snapPosition: { left?: number; top?: number } = {};

  guides.forEach(guide => {
    if (guide.type === 'horizontal') {
      // 水平参考线，调整垂直位置
      snapPosition.top = guide.position - bounds.height / 2;
    } else {
      // 垂直参考线，调整水平位置
      snapPosition.left = guide.position - bounds.width / 2;
    }
  });

  return snapPosition;
};

// 检测等距分布
export const detectEqualSpacing = (
  objects: fabric.Object[],
  direction: 'horizontal' | 'vertical',
  threshold: number = 5
): boolean => {
  if (objects.length < 3) return false;

  const bounds = objects.map(obj => getObjectBounds(obj));
  
  if (direction === 'horizontal') {
    // 按左边缘排序
    bounds.sort((a, b) => a.left - b.left);
    
    // 计算间距
    const spacings: number[] = [];
    for (let i = 1; i < bounds.length; i++) {
      spacings.push(bounds[i].left - bounds[i - 1].right);
    }
    
    // 检查间距是否相等
    const firstSpacing = spacings[0];
    return spacings.every(spacing => Math.abs(spacing - firstSpacing) <= threshold);
  } else {
    // 按顶部边缘排序
    bounds.sort((a, b) => a.top - b.top);
    
    // 计算间距
    const spacings: number[] = [];
    for (let i = 1; i < bounds.length; i++) {
      spacings.push(bounds[i].top - bounds[i - 1].bottom);
    }
    
    // 检查间距是否相等
    const firstSpacing = spacings[0];
    return spacings.every(spacing => Math.abs(spacing - firstSpacing) <= threshold);
  }
};

// 计算对象组的边界
export const getGroupBounds = (objects: fabric.Object[]): ObjectBounds => {
  if (objects.length === 0) {
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      centerX: 0,
      centerY: 0,
      width: 0,
      height: 0,
    };
  }

  const bounds = objects.map(obj => getObjectBounds(obj));
  
  const left = Math.min(...bounds.map(b => b.left));
  const top = Math.min(...bounds.map(b => b.top));
  const right = Math.max(...bounds.map(b => b.right));
  const bottom = Math.max(...bounds.map(b => b.bottom));

  return {
    left,
    top,
    right,
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
    width: right - left,
    height: bottom - top,
  };
};

// 检测智能间距建议
export const detectSmartSpacing = (
  objects: fabric.Object[],
  direction: 'horizontal' | 'vertical'
): number => {
  if (objects.length < 2) return 20; // 默认间距

  const bounds = objects.map(obj => getObjectBounds(obj));
  const spacings: number[] = [];

  if (direction === 'horizontal') {
    bounds.sort((a, b) => a.left - b.left);
    for (let i = 1; i < bounds.length; i++) {
      spacings.push(bounds[i].left - bounds[i - 1].right);
    }
  } else {
    bounds.sort((a, b) => a.top - b.top);
    for (let i = 1; i < bounds.length; i++) {
      spacings.push(bounds[i].top - bounds[i - 1].bottom);
    }
  }

  // 返回最常见的间距值
  if (spacings.length === 0) return 20;
  
  // 简单的众数计算
  const spacingCounts = new Map<number, number>();
  spacings.forEach(spacing => {
    const rounded = Math.round(spacing / 5) * 5; // 四舍五入到5的倍数
    spacingCounts.set(rounded, (spacingCounts.get(rounded) || 0) + 1);
  });

  let mostCommonSpacing = 20;
  let maxCount = 0;
  spacingCounts.forEach((count, spacing) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonSpacing = spacing;
    }
  });

  return Math.max(mostCommonSpacing, 5); // 最小间距为5px
};