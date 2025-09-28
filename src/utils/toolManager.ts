import { fabric } from 'fabric';
import { EditorTool, ToolRegistry, ToolState, ToolManager, toolRegistry } from '@/types/tools';
import { toolStatePersistence } from './toolStatePersistence';

export class EditorToolManager implements ToolManager {
  public registry: ToolRegistry;
  public state: ToolState;
  private canvas: fabric.Canvas | null = null;
  private listeners: Set<(toolId: string | null) => void> = new Set();

  constructor(registry: ToolRegistry = toolRegistry) {
    this.registry = registry;
    
    // 从持久化存储加载状态
    const persistedState = toolStatePersistence.loadFullToolState();
    this.state = {
      activeTool: persistedState.activeTool || null,
      toolStates: persistedState.toolStates || new Map(),
      shortcuts: persistedState.shortcuts || new Map(),
    };
  }

  // 设置画布引用
  setCanvas(canvas: fabric.Canvas | null): void {
    this.canvas = canvas;
  }

  // 激活工具
  activateTool(toolId: string): void {
    const tool = this.registry.getTool(toolId);
    if (!tool) {
      console.warn(`Tool "${toolId}" not found`);
      return;
    }

    // 检查是否需要选中对象
    if (tool.config?.requiresObject && !this.canvas?.getActiveObject()) {
      console.warn(`Tool "${toolId}" requires an active object`);
      return;
    }

    // 先停用当前工具
    this.deactivateTool();

    // 激活新工具
    if (this.canvas) {
      try {
        tool.activate(this.canvas);
        this.state.activeTool = toolId;
        
        // 应用工具配置
        this.applyToolConfig(tool);
        
        // 持久化保存当前工具
        toolStatePersistence.saveFullToolState(this.state);
        
        this.notifyListeners(toolId);
      } catch (error) {
        console.error(`Failed to activate tool "${toolId}":`, error);
      }
    }
  }

  // 停用当前工具
  deactivateTool(): void {
    if (this.state.activeTool && this.canvas) {
      const tool = this.registry.getTool(this.state.activeTool);
      if (tool) {
        try {
          tool.deactivate(this.canvas);
        } catch (error) {
          console.error(`Failed to deactivate tool "${this.state.activeTool}":`, error);
        }
      }
    }
    
    this.state.activeTool = null;
    
    // 持久化保存状态
    toolStatePersistence.saveFullToolState(this.state);
    
    this.notifyListeners(null);
  }

  // 获取当前激活的工具
  getActiveTool(): EditorTool | null {
    if (!this.state.activeTool) return null;
    return this.registry.getTool(this.state.activeTool) || null;
  }

  // 应用工具配置到画布
  private applyToolConfig(tool: EditorTool): void {
    if (!this.canvas || !tool.config) return;

    const config = tool.config;
    
    // 设置光标
    if (config.cursor) {
      this.canvas.defaultCursor = config.cursor;
      this.canvas.hoverCursor = config.cursor;
    }

    // 设置选择模式
    if (config.allowSelection !== undefined) {
      this.canvas.selection = config.allowSelection;
    }

    // 设置绘图模式
    if (config.allowDrawing !== undefined) {
      this.canvas.isDrawingMode = config.allowDrawing;
    }
  }

  // 获取工具状态
  getToolState(toolId: string): any {
    return this.state.toolStates.get(toolId);
  }

  // 设置工具状态
  setToolState(toolId: string, state: any): void {
    this.state.toolStates.set(toolId, state);
    // 持久化保存
    toolStatePersistence.saveToolState(toolId, state);
  }

  // 注册快捷键
  registerShortcut(key: string, toolId: string): void {
    this.state.shortcuts.set(key.toLowerCase(), toolId);
    // 持久化保存
    toolStatePersistence.saveShortcuts(this.state.shortcuts);
  }

  // 注销快捷键
  unregisterShortcut(key: string): void {
    this.state.shortcuts.delete(key.toLowerCase());
    // 持久化保存
    toolStatePersistence.saveShortcuts(this.state.shortcuts);
  }

  // 处理键盘按下事件
  handleKeyDown(event: KeyboardEvent): boolean {
    // 首先让当前工具处理事件
    const activeTool = this.getActiveTool();
    if (activeTool?.onKeyDown && activeTool.onKeyDown(event)) {
      return true;
    }

    // 处理快捷键
    const key = this.getKeyString(event);
    const toolId = this.state.shortcuts.get(key);
    
    if (toolId && this.registry.hasTool(toolId)) {
      event.preventDefault();
      this.activateTool(toolId);
      return true;
    }

    return false;
  }

  // 处理键盘释放事件
  handleKeyUp(event: KeyboardEvent): boolean {
    const activeTool = this.getActiveTool();
    if (activeTool?.onKeyUp) {
      return activeTool.onKeyUp(event);
    }
    return false;
  }

  // 处理画布事件
  handleCanvasEvent(event: fabric.IEvent): void {
    const activeTool = this.getActiveTool();
    if (activeTool?.onCanvasEvent) {
      activeTool.onCanvasEvent(event);
    }
  }

  // 生成快捷键字符串
  private getKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    
    parts.push(event.key.toLowerCase());
    
    return parts.join('+');
  }

  // 添加工具变更监听器
  addToolChangeListener(listener: (toolId: string | null) => void): void {
    this.listeners.add(listener);
  }

  // 移除工具变更监听器
  removeToolChangeListener(listener: (toolId: string | null) => void): void {
    this.listeners.delete(listener);
  }

  // 通知监听器
  private notifyListeners(toolId: string | null): void {
    this.listeners.forEach(listener => listener(toolId));
  }

  // 初始化默认快捷键
  initializeDefaultShortcuts(): void {
    // 只有在没有持久化快捷键时才设置默认值
    if (this.state.shortcuts.size === 0) {
      const shortcuts = [
        { key: 'v', toolId: 'select' },
        { key: 't', toolId: 'text' },
        { key: 'i', toolId: 'image' },
        { key: 'r', toolId: 'rectangle' },
        { key: 'o', toolId: 'circle' },
        { key: 'l', toolId: 'line' },
        { key: 'p', toolId: 'pen' },
        { key: 'e', toolId: 'eraser' },
        { key: 'h', toolId: 'hand' },
      ];

      shortcuts.forEach(({ key, toolId }) => {
        this.registerShortcut(key, toolId);
      });
    }
  }

  // 清理资源
  dispose(): void {
    this.deactivateTool();
    this.listeners.clear();
    this.state.toolStates.clear();
    this.state.shortcuts.clear();
  }
}

// 全局工具管理器实例
export const toolManager = new EditorToolManager();