// 导出所有工具
export * from './SelectTool';
export * from './TextTool';
export * from './ImageTool';
export * from './ShapeTool';
export * from './DrawTool';
export * from './UtilityTool';

// 工具注册函数 - 直接在这里实现
import { toolRegistry, ToolGroup } from '@/types/tools';
import { SelectTool } from './SelectTool';
import { TextTool } from './TextTool';
import { ImageTool } from './ImageTool';
import { RectangleTool, CircleTool, TriangleTool, LineTool } from './ShapeTool';
import { PenTool, EraserTool } from './DrawTool';
import { HandTool, EyedropperTool } from './UtilityTool';

export function registerDefaultTools(): void {
  try {
    // 基础工具
    toolRegistry.register(new SelectTool());
    
    // 文本工具
    toolRegistry.register(new TextTool());
    
    // 图片工具
    toolRegistry.register(new ImageTool());
    
    // 形状工具
    toolRegistry.register(new RectangleTool());
    toolRegistry.register(new CircleTool());
    toolRegistry.register(new TriangleTool());
    toolRegistry.register(new LineTool());
    
    // 绘制工具
    toolRegistry.register(new PenTool());
    toolRegistry.register(new EraserTool());
    
    // 实用工具
    toolRegistry.register(new HandTool());
    toolRegistry.register(new EyedropperTool());
    
    // 注册工具组
    registerDefaultToolGroups();
    
    console.log('Default tools registered successfully');
  } catch (error) {
    console.error('Error registering default tools:', error);
  }
}

export function registerDefaultToolGroups(): void {
  const groups: ToolGroup[] = [
    {
      id: 'basic',
      name: '基础工具',
      tools: ['select'],
      defaultExpanded: true,
    },
    {
      id: 'content',
      name: '内容工具',
      tools: ['text', 'image'],
      defaultExpanded: true,
    },
    {
      id: 'shapes',
      name: '形状工具',
      tools: ['rectangle', 'circle', 'triangle', 'line'],
      defaultExpanded: true,
    },
    {
      id: 'draw',
      name: '绘制工具',
      tools: ['pen', 'eraser'],
      defaultExpanded: false,
    },
    {
      id: 'utility',
      name: '实用工具',
      tools: ['hand', 'eyedropper'],
      defaultExpanded: false,
    },
  ];

  groups.forEach(group => {
    toolRegistry.registerGroup(group);
  });
}