import { fabric } from 'fabric';

export interface DrawingTool {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  preview: string;
  config: {
    type: 'shape' | 'line' | 'brush';
    fabricType?: string;
    strokeWidth?: number;
    fill?: string;
    stroke?: string;
    brushType?: string;
    points?: number[];
    radius?: number;
    width?: number;
    height?: number;
  };
}

export interface DrawingCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// 绘制分类
export const drawingCategories: DrawingCategory[] = [
  { id: 'shapes', name: '基础图形', icon: '🔷', description: '矩形、圆形、多边形等' },
  { id: 'lines', name: '基础线条', icon: '📏', description: '直线、曲线、箭头等' },
  { id: 'brushes', name: '自由绘制', icon: '🖌️', description: '各种画笔和绘制工具' },
];

// 基础图形
export const basicShapes: DrawingTool[] = [
  {
    id: 'rectangle',
    name: '矩形',
    category: 'shapes',
    icon: '⬜',
    description: '绘制矩形',
    preview: '▭',
    config: {
      type: 'shape',
      fabricType: 'rect',
      width: 100,
      height: 80,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2
    }
  },
  {
    id: 'square',
    name: '正方形',
    category: 'shapes',
    icon: '🔲',
    description: '绘制正方形',
    preview: '■',
    config: {
      type: 'shape',
      fabricType: 'rect',
      width: 80,
      height: 80,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2
    }
  },
  {
    id: 'circle',
    name: '圆形',
    category: 'shapes',
    icon: '⭕',
    description: '绘制圆形',
    preview: '●',
    config: {
      type: 'shape',
      fabricType: 'circle',
      radius: 40,
      fill: '#f59e0b',
      stroke: '#d97706',
      strokeWidth: 2
    }
  },
  {
    id: 'ellipse',
    name: '椭圆',
    category: 'shapes',
    icon: '🔵',
    description: '绘制椭圆',
    preview: '⬭',
    config: {
      type: 'shape',
      fabricType: 'ellipse',
      width: 100,
      height: 60,
      fill: '#8b5cf6',
      stroke: '#7c3aed',
      strokeWidth: 2
    }
  },
  {
    id: 'triangle',
    name: '三角形',
    category: 'shapes',
    icon: '🔺',
    description: '绘制三角形',
    preview: '▲',
    config: {
      type: 'shape',
      fabricType: 'triangle',
      width: 80,
      height: 80,
      fill: '#ef4444',
      stroke: '#dc2626',
      strokeWidth: 2
    }
  },
  {
    id: 'polygon',
    name: '多边形',
    category: 'shapes',
    icon: '🔶',
    description: '绘制多边形',
    preview: '⬟',
    config: {
      type: 'shape',
      fabricType: 'polygon',
      points: [
        { x: 0, y: -50 },
        { x: 47, y: -15 },
        { x: 29, y: 40 },
        { x: -29, y: 40 },
        { x: -47, y: -15 }
      ],
      fill: '#06b6d4',
      stroke: '#0891b2',
      strokeWidth: 2
    }
  },
  {
    id: 'star',
    name: '星形',
    category: 'shapes',
    icon: '⭐',
    description: '绘制星形',
    preview: '★',
    config: {
      type: 'shape',
      fabricType: 'polygon',
      points: [
        { x: 0, y: -50 },
        { x: 14, y: -20 },
        { x: 47, y: -15 },
        { x: 23, y: 7 },
        { x: 29, y: 40 },
        { x: 0, y: 25 },
        { x: -29, y: 40 },
        { x: -23, y: 7 },
        { x: -47, y: -15 },
        { x: -14, y: -20 }
      ],
      fill: '#fbbf24',
      stroke: '#f59e0b',
      strokeWidth: 2
    }
  },
  {
    id: 'diamond',
    name: '菱形',
    category: 'shapes',
    icon: '💎',
    description: '绘制菱形',
    preview: '◆',
    config: {
      type: 'shape',
      fabricType: 'polygon',
      points: [
        { x: 0, y: -40 },
        { x: 40, y: 0 },
        { x: 0, y: 40 },
        { x: -40, y: 0 }
      ],
      fill: '#ec4899',
      stroke: '#db2777',
      strokeWidth: 2
    }
  }
];

// 基础线条
export const basicLines: DrawingTool[] = [
  {
    id: 'straight-line',
    name: '直线',
    category: 'lines',
    icon: '📏',
    description: '绘制直线',
    preview: '—',
    config: {
      type: 'line',
      fabricType: 'line',
      stroke: '#374151',
      strokeWidth: 2,
      points: [0, 0, 100, 0]
    }
  },
  {
    id: 'dashed-line',
    name: '虚线',
    category: 'lines',
    icon: '┅',
    description: '绘制虚线',
    preview: '- - -',
    config: {
      type: 'line',
      fabricType: 'line',
      stroke: '#374151',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      points: [0, 0, 100, 0]
    }
  },
  {
    id: 'dotted-line',
    name: '点线',
    category: 'lines',
    icon: '⋯',
    description: '绘制点线',
    preview: '• • •',
    config: {
      type: 'line',
      fabricType: 'line',
      stroke: '#374151',
      strokeWidth: 2,
      strokeDashArray: [2, 8],
      points: [0, 0, 100, 0]
    }
  },
  {
    id: 'arrow-line',
    name: '箭头',
    category: 'lines',
    icon: '➡️',
    description: '绘制箭头',
    preview: '→',
    config: {
      type: 'line',
      fabricType: 'path',
      stroke: '#374151',
      strokeWidth: 2,
      fill: 'transparent'
    }
  },
  {
    id: 'double-arrow',
    name: '双向箭头',
    category: 'lines',
    icon: '↔️',
    description: '绘制双向箭头',
    preview: '↔',
    config: {
      type: 'line',
      fabricType: 'path',
      stroke: '#374151',
      strokeWidth: 2,
      fill: 'transparent'
    }
  },
  {
    id: 'curved-line',
    name: '曲线',
    category: 'lines',
    icon: '〰️',
    description: '绘制曲线',
    preview: '∿',
    config: {
      type: 'line',
      fabricType: 'path',
      stroke: '#374151',
      strokeWidth: 2,
      fill: 'transparent'
    }
  }
];

// 自由绘制画笔
export const brushTools: DrawingTool[] = [
  {
    id: 'pencil',
    name: '铅笔',
    category: 'brushes',
    icon: '✏️',
    description: '铅笔绘制',
    preview: '✎',
    config: {
      type: 'brush',
      brushType: 'pencil',
      strokeWidth: 2,
      stroke: '#374151'
    }
  },
  {
    id: 'pen',
    name: '钢笔',
    category: 'brushes',
    icon: '🖊️',
    description: '钢笔绘制',
    preview: '✒',
    config: {
      type: 'brush',
      brushType: 'pen',
      strokeWidth: 3,
      stroke: '#1f2937'
    }
  },
  {
    id: 'marker',
    name: '马克笔',
    category: 'brushes',
    icon: '🖍️',
    description: '马克笔绘制',
    preview: '🖍',
    config: {
      type: 'brush',
      brushType: 'marker',
      strokeWidth: 8,
      stroke: '#3b82f6'
    }
  },
  {
    id: 'brush',
    name: '画笔',
    category: 'brushes',
    icon: '🖌️',
    description: '画笔绘制',
    preview: '🎨',
    config: {
      type: 'brush',
      brushType: 'brush',
      strokeWidth: 5,
      stroke: '#059669'
    }
  },
  {
    id: 'spray',
    name: '喷枪',
    category: 'brushes',
    icon: '💨',
    description: '喷枪效果',
    preview: '⋯',
    config: {
      type: 'brush',
      brushType: 'spray',
      strokeWidth: 10,
      stroke: '#8b5cf6'
    }
  },
  {
    id: 'chalk',
    name: '粉笔',
    category: 'brushes',
    icon: '🖍',
    description: '粉笔效果',
    preview: '∼',
    config: {
      type: 'brush',
      brushType: 'chalk',
      strokeWidth: 6,
      stroke: '#f59e0b'
    }
  },
  {
    id: 'charcoal',
    name: '炭笔',
    category: 'brushes',
    icon: '⚫',
    description: '炭笔效果',
    preview: '▓',
    config: {
      type: 'brush',
      brushType: 'charcoal',
      strokeWidth: 4,
      stroke: '#1f2937'
    }
  },
  {
    id: 'highlighter',
    name: '荧光笔',
    category: 'brushes',
    icon: '🔆',
    description: '荧光笔效果',
    preview: '▬',
    config: {
      type: 'brush',
      brushType: 'highlighter',
      strokeWidth: 12,
      stroke: '#fbbf24'
    }
  }
];

// 合并所有绘制工具
export const allDrawingTools: DrawingTool[] = [
  ...basicShapes,
  ...basicLines,
  ...brushTools
];

// 根据分类获取绘制工具
export const getDrawingToolsByCategory = (categoryId: string): DrawingTool[] => {
  return allDrawingTools.filter(tool => tool.category === categoryId);
};

// 搜索绘制工具
export const searchDrawingTools = (query: string): DrawingTool[] => {
  const lowercaseQuery = query.toLowerCase();
  return allDrawingTools.filter(tool => 
    tool.name.toLowerCase().includes(lowercaseQuery) ||
    tool.description.toLowerCase().includes(lowercaseQuery)
  );
};

// 创建Fabric.js对象的工厂函数
export const createFabricObject = (tool: DrawingTool, x: number, y: number): fabric.Object | null => {
  const { config } = tool;
  
  switch (config.fabricType) {
    case 'rect':
      return new fabric.Rect({
        left: x,
        top: y,
        width: config.width || 100,
        height: config.height || 80,
        fill: config.fill || '#3b82f6',
        stroke: config.stroke || '#1e40af',
        strokeWidth: config.strokeWidth || 2,
        originX: 'center',
        originY: 'center'
      });
      
    case 'circle':
      return new fabric.Circle({
        left: x,
        top: y,
        radius: config.radius || 40,
        fill: config.fill || '#f59e0b',
        stroke: config.stroke || '#d97706',
        strokeWidth: config.strokeWidth || 2,
        originX: 'center',
        originY: 'center'
      });
      
    case 'ellipse':
      return new fabric.Ellipse({
        left: x,
        top: y,
        rx: (config.width || 100) / 2,
        ry: (config.height || 60) / 2,
        fill: config.fill || '#8b5cf6',
        stroke: config.stroke || '#7c3aed',
        strokeWidth: config.strokeWidth || 2,
        originX: 'center',
        originY: 'center'
      });
      
    case 'triangle':
      return new fabric.Triangle({
        left: x,
        top: y,
        width: config.width || 80,
        height: config.height || 80,
        fill: config.fill || '#ef4444',
        stroke: config.stroke || '#dc2626',
        strokeWidth: config.strokeWidth || 2,
        originX: 'center',
        originY: 'center'
      });
      
    case 'polygon':
      return new fabric.Polygon(config.points || [], {
        left: x,
        top: y,
        fill: config.fill || '#06b6d4',
        stroke: config.stroke || '#0891b2',
        strokeWidth: config.strokeWidth || 2,
        originX: 'center',
        originY: 'center'
      });
      
    case 'line':
      const points = config.points || [0, 0, 100, 0];
      const line = new fabric.Line(points, {
        left: x,
        top: y,
        stroke: config.stroke || '#374151',
        strokeWidth: config.strokeWidth || 2,
        originX: 'center',
        originY: 'center'
      });
      
      if (config.strokeDashArray) {
        line.set('strokeDashArray', config.strokeDashArray);
      }
      
      return line;
      
    case 'path':
      // 根据工具类型创建不同的路径
      let pathString = '';
      
      if (tool.id === 'arrow-line') {
        pathString = 'M 0 0 L 80 0 M 70 -10 L 80 0 L 70 10';
      } else if (tool.id === 'double-arrow') {
        pathString = 'M 0 0 L 80 0 M 10 -10 L 0 0 L 10 10 M 70 -10 L 80 0 L 70 10';
      } else if (tool.id === 'curved-line') {
        pathString = 'M 0 0 Q 40 -20 80 0';
      }
      
      return new fabric.Path(pathString, {
        left: x,
        top: y,
        stroke: config.stroke || '#374151',
        strokeWidth: config.strokeWidth || 2,
        fill: config.fill || 'transparent',
        originX: 'center',
        originY: 'center'
      });
      
    default:
      return null;
  }
};