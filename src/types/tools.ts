import React from 'react';
import { fabric } from 'fabric';

// 工具插件接口
export interface EditorTool {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: 'basic' | 'shape' | 'text' | 'image' | 'draw' | 'utility';
  shortcut?: string;
  tooltip?: string;
  
  // 工具生命周期方法
  activate(canvas: fabric.Canvas): void;
  deactivate(canvas: fabric.Canvas): void;
  
  // 事件处理
  onCanvasEvent?(event: fabric.IEvent): void;
  onKeyDown?(event: KeyboardEvent): boolean; // 返回true表示事件已处理
  onKeyUp?(event: KeyboardEvent): boolean;
  
  // UI组件
  getToolbar?(): React.ComponentType;
  getPropertyPanel?(): React.ComponentType<{ object: fabric.Object }>;
  
  // 工具配置
  config?: {
    cursor?: string;
    allowSelection?: boolean;
    allowDrawing?: boolean;
    requiresObject?: boolean; // 是否需要选中对象才能使用
  };
}

// 工具组配置
export interface ToolGroup {
  id: string;
  name: string;
  icon?: React.ComponentType<any>;
  tools: string[]; // 工具ID列表
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// 工具注册表
export class ToolRegistry {
  private tools: Map<string, EditorTool> = new Map();
  private groups: Map<string, ToolGroup> = new Map();
  private listeners: Set<() => void> = new Set();

  // 注册工具
  register(tool: EditorTool): void {
    if (this.tools.has(tool.id)) {
      // 静默跳过已存在的工具，避免重复注册
      return;
    }
    
    this.tools.set(tool.id, tool);
    this.notifyListeners();
  }

  // 注销工具
  unregister(toolId: string): void {
    if (this.tools.delete(toolId)) {
      this.notifyListeners();
    }
  }

  // 获取工具
  getTool(toolId: string): EditorTool | undefined {
    return this.tools.get(toolId);
  }

  // 获取所有工具
  getAllTools(): EditorTool[] {
    return Array.from(this.tools.values());
  }

  // 按分类获取工具
  getToolsByCategory(category: string): EditorTool[] {
    return this.getAllTools().filter(tool => tool.category === category);
  }

  // 注册工具组
  registerGroup(group: ToolGroup): void {
    this.groups.set(group.id, group);
    this.notifyListeners();
  }

  // 获取工具组
  getGroup(groupId: string): ToolGroup | undefined {
    return this.groups.get(groupId);
  }

  // 获取所有工具组
  getAllGroups(): ToolGroup[] {
    return Array.from(this.groups.values());
  }

  // 检查工具是否存在
  hasTool(toolId: string): boolean {
    return this.tools.has(toolId);
  }

  // 添加变更监听器
  addListener(listener: () => void): void {
    this.listeners.add(listener);
  }

  // 移除变更监听器
  removeListener(listener: () => void): void {
    this.listeners.delete(listener);
  }

  // 通知监听器
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // 清空所有工具
  clear(): void {
    this.tools.clear();
    this.groups.clear();
    this.notifyListeners();
  }
}

// 全局工具注册表实例
export const toolRegistry = new ToolRegistry();

// 工具状态接口
export interface ToolState {
  activeTool: string | null;
  toolStates: Map<string, any>; // 每个工具的私有状态
  shortcuts: Map<string, string>; // 快捷键映射
}

// 工具管理器接口
export interface ToolManager {
  registry: ToolRegistry;
  state: ToolState;
  
  // 工具操作
  activateTool(toolId: string): void;
  deactivateTool(): void;
  getActiveTool(): EditorTool | null;
  
  // 状态管理
  getToolState(toolId: string): any;
  setToolState(toolId: string, state: any): void;
  
  // 快捷键管理
  registerShortcut(key: string, toolId: string): void;
  unregisterShortcut(key: string): void;
  handleKeyDown(event: KeyboardEvent): boolean;
  handleKeyUp(event: KeyboardEvent): boolean;
}