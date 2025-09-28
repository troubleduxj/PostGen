import { useCallback, useEffect, useMemo } from 'react';
import { useHistoryStore } from '@/stores/historyStore';
import { useEditorStore } from '@/stores/editorStore';

// 操作类型定义
export interface OperationType {
  id: string;
  name: string;
  description: string;
  mergeable: boolean; // 是否可以与相同类型的操作合并
  mergeTimeWindow: number; // 合并时间窗口（毫秒）
}

// 预定义的操作类型
export const OPERATION_TYPES: Record<string, OperationType> = {
  OBJECT_MOVE: {
    id: 'object:moved',
    name: '移动对象',
    description: '拖拽移动对象位置',
    mergeable: true,
    mergeTimeWindow: 1000, // 1秒内的移动操作可以合并
  },
  OBJECT_SCALE: {
    id: 'object:scaled',
    name: '缩放对象',
    description: '调整对象大小',
    mergeable: true,
    mergeTimeWindow: 1000,
  },
  OBJECT_ROTATE: {
    id: 'object:rotated',
    name: '旋转对象',
    description: '旋转对象角度',
    mergeable: true,
    mergeTimeWindow: 1000,
  },
  TEXT_EDIT: {
    id: 'text:edited',
    name: '编辑文本',
    description: '修改文本内容',
    mergeable: true,
    mergeTimeWindow: 2000, // 文本编辑给更长的合并时间
  },
  OBJECT_ADD: {
    id: 'object:added',
    name: '添加对象',
    description: '向画布添加新对象',
    mergeable: false,
    mergeTimeWindow: 0,
  },
  OBJECT_DELETE: {
    id: 'object:removed',
    name: '删除对象',
    description: '从画布删除对象',
    mergeable: false,
    mergeTimeWindow: 0,
  },
  CANVAS_RESIZE: {
    id: 'canvas:resized',
    name: '调整画布',
    description: '修改画布尺寸',
    mergeable: false,
    mergeTimeWindow: 0,
  },
  BACKGROUND_CHANGE: {
    id: 'canvas:background',
    name: '更改背景',
    description: '修改画布背景',
    mergeable: false,
    mergeTimeWindow: 0,
  },
  LAYER_REORDER: {
    id: 'layer:reordered',
    name: '调整图层',
    description: '重新排列图层顺序',
    mergeable: false,
    mergeTimeWindow: 0,
  },
  TEMPLATE_APPLY: {
    id: 'template:applied',
    name: '应用模板',
    description: '应用设计模板',
    mergeable: false,
    mergeTimeWindow: 0,
  },
  IMAGE_FILTER: {
    id: 'image:filtered',
    name: '图片滤镜',
    description: '应用图片滤镜效果',
    mergeable: true,
    mergeTimeWindow: 1500,
  },
  IMAGE_CROP: {
    id: 'image:cropped',
    name: '裁剪图片',
    description: '裁剪图片区域',
    mergeable: false,
    mergeTimeWindow: 0,
  },
};

// 历史管理器钩子
export const useHistoryManager = () => {
  const historyStore = useHistoryStore();
  const editorStore = useEditorStore();

  // 智能操作合并逻辑
  const shouldMergeOperation = useCallback((
    newAction: string,
    newMetadata: any,
    lastEntry: any
  ): boolean => {
    if (!lastEntry) return false;

    const operationType = OPERATION_TYPES[newAction];
    if (!operationType || !operationType.mergeable) return false;

    // 检查是否是相同类型的操作
    if (lastEntry.action !== newAction) return false;

    // 检查时间窗口
    const timeDiff = Date.now() - lastEntry.timestamp;
    if (timeDiff > operationType.mergeTimeWindow) return false;

    // 检查是否是同一个对象
    if (newMetadata?.objectId && lastEntry.metadata?.objectId) {
      return newMetadata.objectId === lastEntry.metadata.objectId;
    }

    return true;
  }, []);

  // 增强的保存状态方法
  const saveState = useCallback((
    action: string,
    description?: string,
    metadata?: any
  ) => {
    const currentEntry = historyStore.getCurrentEntry();
    
    // 检查是否应该合并操作
    if (shouldMergeOperation(action, metadata, currentEntry)) {
      // 合并操作：更新当前条目而不是创建新条目
      const operationType = OPERATION_TYPES[action];
      const mergedDescription = description || operationType?.description || action;
      
      // 直接更新当前状态，不创建新的历史条目
      historyStore.saveState(action, `${mergedDescription} (合并)`, {
        ...metadata,
        merged: true,
        mergeCount: (currentEntry?.metadata?.mergeCount || 0) + 1,
      });
    } else {
      // 正常保存新的历史条目
      const operationType = OPERATION_TYPES[action];
      const finalDescription = description || operationType?.description || action;
      
      historyStore.saveState(action, finalDescription, metadata);
    }
  }, [historyStore, shouldMergeOperation]);

  // 增强的撤销方法
  const undo = useCallback(() => {
    const success = historyStore.undo();
    if (success) {
      // 触发编辑器状态同步
      editorStore.syncStores();
      
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('history:undo', {
        detail: { entry: historyStore.getCurrentEntry() }
      }));
    }
    return success;
  }, [historyStore, editorStore]);

  // 增强的重做方法
  const redo = useCallback(() => {
    const success = historyStore.redo();
    if (success) {
      // 触发编辑器状态同步
      editorStore.syncStores();
      
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('history:redo', {
        detail: { entry: historyStore.getCurrentEntry() }
      }));
    }
    return success;
  }, [historyStore, editorStore]);

  // 批量操作管理
  const startBatchOperation = useCallback((description?: string) => {
    historyStore.startBatch();
    
    // 触发批量操作开始事件
    window.dispatchEvent(new CustomEvent('history:batchStart', {
      detail: { description }
    }));
  }, [historyStore]);

  const endBatchOperation = useCallback((description?: string) => {
    historyStore.endBatch(description);
    
    // 触发批量操作结束事件
    window.dispatchEvent(new CustomEvent('history:batchEnd', {
      detail: { description }
    }));
  }, [historyStore]);

  // 跳转到特定历史条目
  const jumpToEntry = useCallback((entryId: string) => {
    const allEntries = [
      ...historyStore.past,
      ...(historyStore.present ? [historyStore.present] : []),
      ...historyStore.future
    ];
    
    const targetEntry = allEntries.find(entry => entry.id === entryId);
    if (!targetEntry) return false;

    const canvas = editorStore.canvas;
    if (!canvas) return false;

    try {
      canvas.loadFromJSON(targetEntry.canvasState, () => {
        canvas.renderAll();
        
        // 更新历史状态
        const targetIndex = historyStore.past.findIndex(entry => entry.id === entryId);
        if (targetIndex >= 0) {
          // 目标在past中
          const newPast = historyStore.past.slice(0, targetIndex);
          const newFuture = [
            ...historyStore.past.slice(targetIndex + 1),
            ...(historyStore.present ? [historyStore.present] : []),
            ...historyStore.future
          ];
          
          historyStore.past = newPast;
          historyStore.present = targetEntry;
          historyStore.future = newFuture;
        } else if (historyStore.present?.id === entryId) {
          // 目标就是当前状态，无需操作
        } else {
          // 目标在future中
          const futureIndex = historyStore.future.findIndex(entry => entry.id === entryId);
          if (futureIndex >= 0) {
            const newPast = [
              ...historyStore.past,
              ...(historyStore.present ? [historyStore.present] : []),
              ...historyStore.future.slice(0, futureIndex)
            ];
            const newFuture = historyStore.future.slice(futureIndex + 1);
            
            historyStore.past = newPast;
            historyStore.present = targetEntry;
            historyStore.future = newFuture;
          }
        }
        
        // 同步编辑器状态
        editorStore.syncStores();
        
        // 触发跳转事件
        window.dispatchEvent(new CustomEvent('history:jump', {
          detail: { entry: targetEntry }
        }));
      });
      
      return true;
    } catch (error) {
      console.error('Failed to jump to history entry:', error);
      return false;
    }
  }, [historyStore, editorStore]);

  // 获取历史统计信息
  const getHistoryStats = useMemo(() => ({
    totalEntries: historyStore.getHistorySize(),
    canUndo: historyStore.canUndo(),
    canRedo: historyStore.canRedo(),
    memoryUsage: historyStore.memoryUsage,
    totalOperations: historyStore.totalOperations,
    currentEntry: historyStore.getCurrentEntry(),
  }), [
    historyStore.past.length,
    historyStore.present,
    historyStore.future.length,
    historyStore.memoryUsage,
    historyStore.totalOperations,
  ]);

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 防止在输入框中触发
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true'
      ) {
        return;
      }

      const isCtrl = event.ctrlKey || event.metaKey;
      
      // Ctrl+Z: 撤销
      if (isCtrl && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      
      // Ctrl+Shift+Z 或 Ctrl+Y: 重做
      if (isCtrl && ((event.key.toLowerCase() === 'z' && event.shiftKey) || event.key.toLowerCase() === 'y')) {
        event.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // 自动保存状态（监听画布变化）
  useEffect(() => {
    const canvas = editorStore.canvas;
    if (!canvas) return;

    let saveTimeout: NodeJS.Timeout;
    
    const handleCanvasChange = (event: any) => {
      // 防抖：延迟保存以避免频繁的状态保存
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const eventType = event.e?.type || event.type;
        let action = 'object:modified';
        let metadata: any = {};

        // 根据事件类型确定操作类型
        switch (eventType) {
          case 'moving':
          case 'moved':
            action = 'object:moved';
            break;
          case 'scaling':
          case 'scaled':
            action = 'object:scaled';
            break;
          case 'rotating':
          case 'rotated':
            action = 'object:rotated';
            break;
          case 'text:changed':
            action = 'text:edited';
            break;
        }

        // 获取对象信息
        if (event.target) {
          metadata.objectId = event.target.id || `${event.target.type}_${Date.now()}`;
          metadata.objectType = event.target.type;
        }

        saveState(action, undefined, metadata);
      }, 300); // 300ms 防抖
    };

    // 监听对象修改事件
    canvas.on('object:modified', handleCanvasChange);
    canvas.on('object:moving', handleCanvasChange);
    canvas.on('object:scaling', handleCanvasChange);
    canvas.on('object:rotating', handleCanvasChange);
    canvas.on('text:changed', handleCanvasChange);

    // 监听对象添加/删除事件（立即保存）
    canvas.on('object:added', (event) => {
      const metadata = {
        objectId: event.target?.id || `${event.target?.type}_${Date.now()}`,
        objectType: event.target?.type,
      };
      saveState('object:added', undefined, metadata);
    });

    canvas.on('object:removed', (event) => {
      const metadata = {
        objectId: event.target?.id || `${event.target?.type}_${Date.now()}`,
        objectType: event.target?.type,
      };
      saveState('object:removed', undefined, metadata);
    });

    return () => {
      clearTimeout(saveTimeout);
      canvas.off('object:modified', handleCanvasChange);
      canvas.off('object:moving', handleCanvasChange);
      canvas.off('object:scaling', handleCanvasChange);
      canvas.off('object:rotating', handleCanvasChange);
      canvas.off('text:changed', handleCanvasChange);
    };
  }, [editorStore.canvas, saveState]);

  return {
    // 核心操作
    saveState,
    undo,
    redo,
    
    // 批量操作
    startBatchOperation,
    endBatchOperation,
    
    // 导航
    jumpToEntry,
    
    // 状态查询
    ...getHistoryStats,
    
    // 历史记录管理
    clearHistory: historyStore.clearHistory,
    searchHistory: historyStore.searchHistory,
    filterByAction: historyStore.filterByAction,
    filterByTimeRange: historyStore.filterByTimeRange,
    
    // 配置
    setMaxHistorySize: historyStore.setMaxHistorySize,
    setEnableThumbnails: historyStore.setEnableThumbnails,
    
    // 内存管理
    optimizeMemory: historyStore.optimizeMemory,
    
    // 导出/导入
    exportHistory: historyStore.exportHistory,
    importHistory: historyStore.importHistory,
    
    // 操作类型
    OPERATION_TYPES,
  };
};