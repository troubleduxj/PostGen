import { ToolState } from '@/types/tools';

// 工具状态持久化管理器
export class ToolStatePersistence {
  private storageKey = 'poster-editor-tool-states';

  // 保存工具状态到本地存储
  saveToolStates(toolStates: Map<string, any>): void {
    try {
      const statesObject: Record<string, any> = {};
      toolStates.forEach((state, toolId) => {
        statesObject[toolId] = state;
      });
      
      localStorage.setItem(this.storageKey, JSON.stringify(statesObject));
    } catch (error) {
      console.error('Failed to save tool states:', error);
    }
  }

  // 从本地存储加载工具状态
  loadToolStates(): Map<string, any> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return new Map();

      const statesObject = JSON.parse(stored);
      const toolStates = new Map<string, any>();
      
      Object.entries(statesObject).forEach(([toolId, state]) => {
        toolStates.set(toolId, state);
      });
      
      return toolStates;
    } catch (error) {
      console.error('Failed to load tool states:', error);
      return new Map();
    }
  }

  // 保存快捷键映射
  saveShortcuts(shortcuts: Map<string, string>): void {
    try {
      const shortcutsObject: Record<string, string> = {};
      shortcuts.forEach((toolId, key) => {
        shortcutsObject[key] = toolId;
      });
      
      localStorage.setItem(`${this.storageKey}-shortcuts`, JSON.stringify(shortcutsObject));
    } catch (error) {
      console.error('Failed to save shortcuts:', error);
    }
  }

  // 加载快捷键映射
  loadShortcuts(): Map<string, string> {
    try {
      const stored = localStorage.getItem(`${this.storageKey}-shortcuts`);
      if (!stored) return new Map();

      const shortcutsObject = JSON.parse(stored);
      const shortcuts = new Map<string, string>();
      
      Object.entries(shortcutsObject).forEach(([key, toolId]) => {
        shortcuts.set(key, toolId as string);
      });
      
      return shortcuts;
    } catch (error) {
      console.error('Failed to load shortcuts:', error);
      return new Map();
    }
  }

  // 保存完整的工具状态
  saveFullToolState(toolState: ToolState): void {
    this.saveToolStates(toolState.toolStates);
    this.saveShortcuts(toolState.shortcuts);
    
    // 保存当前激活的工具
    try {
      localStorage.setItem(`${this.storageKey}-active-tool`, toolState.activeTool || '');
    } catch (error) {
      console.error('Failed to save active tool:', error);
    }
  }

  // 加载完整的工具状态
  loadFullToolState(): Partial<ToolState> {
    const toolStates = this.loadToolStates();
    const shortcuts = this.loadShortcuts();
    
    let activeTool: string | null = null;
    try {
      const stored = localStorage.getItem(`${this.storageKey}-active-tool`);
      activeTool = stored || null;
    } catch (error) {
      console.error('Failed to load active tool:', error);
    }

    return {
      toolStates,
      shortcuts,
      activeTool,
    };
  }

  // 清除所有保存的工具状态
  clearAllStates(): void {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(`${this.storageKey}-shortcuts`);
      localStorage.removeItem(`${this.storageKey}-active-tool`);
    } catch (error) {
      console.error('Failed to clear tool states:', error);
    }
  }

  // 保存单个工具的状态
  saveToolState(toolId: string, state: any): void {
    const allStates = this.loadToolStates();
    allStates.set(toolId, state);
    this.saveToolStates(allStates);
  }

  // 加载单个工具的状态
  loadToolState(toolId: string): any {
    const allStates = this.loadToolStates();
    return allStates.get(toolId);
  }

  // 删除单个工具的状态
  removeToolState(toolId: string): void {
    const allStates = this.loadToolStates();
    allStates.delete(toolId);
    this.saveToolStates(allStates);
  }
}

// 全局工具状态持久化实例
export const toolStatePersistence = new ToolStatePersistence();