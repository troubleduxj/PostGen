import { useEffect, useState, useCallback } from 'react';
import { toolManager } from '@/utils/toolManager';
import { toolRegistry, EditorTool } from '@/types/tools';
import { useEditorStore } from '@/stores/editorStore';

// 工具管理器 Hook
export const useToolManager = () => {
  const { canvas } = useEditorStore();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [availableTools, setAvailableTools] = useState<EditorTool[]>([]);

  // 初始化工具管理器
  useEffect(() => {
    if (canvas) {
      toolManager.setCanvas(canvas);
    }
  }, [canvas]);

  // 监听工具变更
  useEffect(() => {
    const handleToolChange = (toolId: string | null) => {
      setActiveTool(toolId);
    };

    const handleRegistryChange = () => {
      setAvailableTools(toolRegistry.getAllTools());
    };

    toolManager.addToolChangeListener(handleToolChange);
    toolRegistry.addListener(handleRegistryChange);

    // 初始化状态
    setActiveTool(toolManager.state.activeTool);
    setAvailableTools(toolRegistry.getAllTools());

    return () => {
      toolManager.removeToolChangeListener(handleToolChange);
      toolRegistry.removeListener(handleRegistryChange);
    };
  }, []);

  // 激活工具
  const activateToolById = useCallback((toolId: string) => {
    toolManager.activateTool(toolId);
  }, []);

  // 停用当前工具
  const deactivateTool = useCallback(() => {
    toolManager.deactivateTool();
  }, []);

  // 获取当前激活的工具
  const getActiveTool = useCallback(() => {
    return toolManager.getActiveTool();
  }, []);

  // 获取工具状态
  const getToolState = useCallback((toolId: string) => {
    return toolManager.getToolState(toolId);
  }, []);

  // 设置工具状态
  const setToolState = useCallback((toolId: string, state: any) => {
    toolManager.setToolState(toolId, state);
  }, []);

  // 注册快捷键
  const registerShortcut = useCallback((key: string, toolId: string) => {
    toolManager.registerShortcut(key, toolId);
  }, []);

  // 注销快捷键
  const unregisterShortcut = useCallback((key: string) => {
    toolManager.unregisterShortcut(key);
  }, []);

  // 获取所有快捷键
  const getShortcuts = useCallback(() => {
    return new Map(toolManager.state.shortcuts);
  }, []);

  return {
    // 状态
    activeTool,
    availableTools,
    
    // 工具操作
    activateToolById,
    deactivateTool,
    getActiveTool,
    
    // 状态管理
    getToolState,
    setToolState,
    
    // 快捷键管理
    registerShortcut,
    unregisterShortcut,
    getShortcuts,
    
    // 工具管理器实例
    toolManager,
  };
};

// 工具注册 Hook
export const useToolRegistry = () => {
  const [tools, setTools] = useState<EditorTool[]>([]);
  const [groups, setGroups] = useState(toolRegistry.getAllGroups());

  useEffect(() => {
    const handleChange = () => {
      setTools(toolRegistry.getAllTools());
      setGroups(toolRegistry.getAllGroups());
    };

    toolRegistry.addListener(handleChange);
    handleChange(); // 初始化

    return () => {
      toolRegistry.removeListener(handleChange);
    };
  }, []);

  // 注册工具
  const registerTool = useCallback((tool: EditorTool) => {
    toolRegistry.register(tool);
  }, []);

  // 注销工具
  const unregisterTool = useCallback((toolId: string) => {
    toolRegistry.unregister(toolId);
  }, []);

  // 获取工具
  const getTool = useCallback((toolId: string) => {
    return toolRegistry.getTool(toolId);
  }, []);

  // 按分类获取工具
  const getToolsByCategory = useCallback((category: string) => {
    return toolRegistry.getToolsByCategory(category);
  }, []);

  return {
    // 状态
    tools,
    groups,
    
    // 操作
    registerTool,
    unregisterTool,
    getTool,
    getToolsByCategory,
    
    // 注册表实例
    registry: toolRegistry,
  };
};