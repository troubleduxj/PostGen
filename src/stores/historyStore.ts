import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fabric } from 'fabric';

// 历史记录条目接口
export interface HistoryEntry {
  id: string;
  timestamp: number;
  action: string;
  description: string;
  canvasState: string; // JSON序列化的画布状态
  thumbnail?: string; // 缩略图数据URL
  objectsCount: number;
  canvasSize: { width: number; height: number };
  metadata?: {
    objectType?: string;
    objectId?: string;
    previousValue?: any;
    newValue?: any;
  };
}

// 历史记录状态接口
export interface HistoryState {
  // 历史记录栈
  past: HistoryEntry[];
  present: HistoryEntry | null;
  future: HistoryEntry[];
  
  // 配置选项
  maxHistorySize: number;
  enableThumbnails: boolean;
  compressionEnabled: boolean;
  
  // 状态标志
  isRecording: boolean;
  lastSaveTime: number;
  
  // 统计信息
  totalOperations: number;
  memoryUsage: number; // 估算的内存使用量（字节）
}

// 历史记录操作接口
export interface HistoryActions {
  // 核心操作
  saveState: (action: string, description?: string, metadata?: any) => void;
  undo: () => boolean;
  redo: () => boolean;
  
  // 状态管理
  canUndo: () => boolean;
  canRedo: () => boolean;
  getCurrentEntry: () => HistoryEntry | null;
  getHistorySize: () => number;
  
  // 历史记录管理
  clearHistory: () => void;
  removeOldEntries: (keepCount?: number) => void;
  compressHistory: () => void;
  
  // 配置管理
  setMaxHistorySize: (size: number) => void;
  setEnableThumbnails: (enabled: boolean) => void;
  setCompressionEnabled: (enabled: boolean) => void;
  
  // 搜索和过滤
  searchHistory: (query: string) => HistoryEntry[];
  filterByAction: (action: string) => HistoryEntry[];
  filterByTimeRange: (startTime: number, endTime: number) => HistoryEntry[];
  
  // 导出和导入
  exportHistory: () => string;
  importHistory: (data: string) => boolean;
  
  // 内存管理
  calculateMemoryUsage: () => number;
  optimizeMemory: () => void;
  
  // 批量操作
  startBatch: () => void;
  endBatch: (description?: string) => void;
  
  // 重置
  reset: () => void;
}

// 历史记录存储类型
export type HistoryStore = HistoryState & HistoryActions;

// 默认配置
const DEFAULT_MAX_HISTORY_SIZE = 50;
const DEFAULT_ENABLE_THUMBNAILS = true;
const DEFAULT_COMPRESSION_ENABLED = true;
const MAX_MEMORY_USAGE = 50 * 1024 * 1024; // 50MB

// 操作类型映射
const ACTION_DESCRIPTIONS: Record<string, string> = {
  'object:added': '添加对象',
  'object:removed': '删除对象',
  'object:modified': '修改对象',
  'object:moved': '移动对象',
  'object:scaled': '缩放对象',
  'object:rotated': '旋转对象',
  'text:edited': '编辑文本',
  'image:uploaded': '上传图片',
  'image:filtered': '应用滤镜',
  'image:cropped': '裁剪图片',
  'canvas:resized': '调整画布大小',
  'canvas:background': '更改背景',
  'layer:reordered': '调整图层顺序',
  'template:applied': '应用模板',
  'batch:operation': '批量操作',
};

// 工具函数：生成缩略图
const generateThumbnail = (canvas: fabric.Canvas): string | undefined => {
  try {
    // 检查画布是否有效
    if (!canvas || typeof canvas.toDataURL !== 'function') {
      return undefined;
    }
    
    return canvas.toDataURL({
      format: 'png',
      quality: 0.3,
      multiplier: 0.1, // 缩小到10%
      width: 100,
      height: 75,
    });
  } catch (error) {
    console.warn('Failed to generate thumbnail:', error);
    return undefined;
  }
};

// 工具函数：压缩画布状态
const compressCanvasState = (canvasState: string): string => {
  try {
    // 简单的压缩：移除不必要的空白字符
    const parsed = JSON.parse(canvasState);
    return JSON.stringify(parsed);
  } catch (error) {
    console.warn('Failed to compress canvas state:', error);
    return canvasState;
  }
};

// 工具函数：计算字符串大小（字节）
const getStringSize = (str: string): number => {
  return new Blob([str]).size;
};

// 批量操作管理
let batchOperations: Array<{ action: string; description?: string; metadata?: any }> = [];
let isBatching = false;

export const useHistoryStore = create<HistoryStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      past: [],
      present: null,
      future: [],
      maxHistorySize: DEFAULT_MAX_HISTORY_SIZE,
      enableThumbnails: DEFAULT_ENABLE_THUMBNAILS,
      compressionEnabled: DEFAULT_COMPRESSION_ENABLED,
      isRecording: true,
      lastSaveTime: 0,
      totalOperations: 0,
      memoryUsage: 0,

      // 核心操作
      saveState: (action: string, description?: string, metadata?: any) => {
        const state = get();
        
        // 如果正在批量操作，只记录操作信息
        if (isBatching) {
          batchOperations.push({ action, description, metadata });
          return;
        }
        
        // 如果未启用记录，直接返回
        if (!state.isRecording) return;

        // 获取画布实例
        const editorStore = (window as any).__editorStore;
        const canvas = editorStore?.getState?.()?.canvas;
        if (!canvas) return;

        try {
          // 序列化画布状态，添加错误处理
          let canvasState: string;
          try {
            const canvasJSON = canvas.toJSON();
            canvasState = JSON.stringify(canvasJSON);
          } catch (serializationError) {
            console.warn('Canvas serialization failed, using fallback:', serializationError);
            // 使用简化的状态作为后备
            canvasState = JSON.stringify({
              version: '5.3.0',
              objects: [],
              background: canvas.backgroundColor || '#ffffff',
              width: canvas.getWidth(),
              height: canvas.getHeight(),
            });
          }
          
          // 如果启用压缩，压缩状态数据
          if (state.compressionEnabled) {
            canvasState = compressCanvasState(canvasState);
          }

          // 生成缩略图
          let thumbnail: string | undefined;
          if (state.enableThumbnails) {
            thumbnail = generateThumbnail(canvas);
          }

          // 创建历史记录条目
          const entry: HistoryEntry = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            action,
            description: description || ACTION_DESCRIPTIONS[action] || action,
            canvasState,
            thumbnail,
            objectsCount: canvas.getObjects().length,
            canvasSize: {
              width: canvas.getWidth(),
              height: canvas.getHeight(),
            },
            metadata,
          };

          set((state) => {
            // 如果当前不在历史记录的末尾，清除future
            const newPast = state.present ? [...state.past, state.present] : state.past;
            
            // 限制历史记录数量
            let finalPast = newPast;
            if (finalPast.length >= state.maxHistorySize) {
              finalPast = finalPast.slice(-state.maxHistorySize + 1);
            }

            const newState = {
              past: finalPast,
              present: entry,
              future: [],
              lastSaveTime: Date.now(),
              totalOperations: state.totalOperations + 1,
            };

            // 计算内存使用量
            const memoryUsage = get().calculateMemoryUsage();
            
            // 如果内存使用过多，自动优化
            if (memoryUsage > MAX_MEMORY_USAGE) {
              setTimeout(() => get().optimizeMemory(), 0);
            }

            return { ...newState, memoryUsage };
          });
        } catch (error) {
          console.error('Failed to save history state:', error);
        }
      },

      undo: () => {
        const state = get();
        if (!state.canUndo()) return false;

        const editorStore = (window as any).__editorStore;
        const canvas = editorStore?.getState?.()?.canvas;
        if (!canvas) return false;

        try {
          const previous = state.past[state.past.length - 1];
          
          // 恢复画布状态
          canvas.loadFromJSON(previous.canvasState, () => {
            canvas.renderAll();
            
            set((state) => ({
              past: state.past.slice(0, -1),
              present: previous,
              future: state.present ? [state.present, ...state.future] : state.future,
            }));
          });

          return true;
        } catch (error) {
          console.error('Failed to undo:', error);
          return false;
        }
      },

      redo: () => {
        const state = get();
        if (!state.canRedo()) return false;

        const editorStore = (window as any).__editorStore;
        const canvas = editorStore?.getState?.()?.canvas;
        if (!canvas) return false;

        try {
          const next = state.future[0];
          
          // 恢复画布状态
          canvas.loadFromJSON(next.canvasState, () => {
            canvas.renderAll();
            
            set((state) => ({
              past: state.present ? [...state.past, state.present] : state.past,
              present: next,
              future: state.future.slice(1),
            }));
          });

          return true;
        } catch (error) {
          console.error('Failed to redo:', error);
          return false;
        }
      },

      // 状态查询
      canUndo: () => {
        const state = get();
        return state.past.length > 0;
      },

      canRedo: () => {
        const state = get();
        return state.future.length > 0;
      },

      getCurrentEntry: () => {
        return get().present;
      },

      getHistorySize: () => {
        const state = get();
        return state.past.length + (state.present ? 1 : 0) + state.future.length;
      },

      // 历史记录管理
      clearHistory: () => {
        set({
          past: [],
          present: null,
          future: [],
          totalOperations: 0,
          memoryUsage: 0,
        });
      },

      removeOldEntries: (keepCount = 20) => {
        set((state) => {
          const totalEntries = state.past.length + (state.present ? 1 : 0);
          if (totalEntries <= keepCount) return state;

          const entriesToRemove = totalEntries - keepCount;
          const newPast = state.past.slice(entriesToRemove);

          return {
            ...state,
            past: newPast,
          };
        });
      },

      compressHistory: () => {
        set((state) => {
          const compressPast = state.past.map(entry => ({
            ...entry,
            canvasState: compressCanvasState(entry.canvasState),
            thumbnail: undefined, // 移除缩略图以节省空间
          }));

          const compressPresent = state.present ? {
            ...state.present,
            canvasState: compressCanvasState(state.present.canvasState),
          } : null;

          const compressFuture = state.future.map(entry => ({
            ...entry,
            canvasState: compressCanvasState(entry.canvasState),
            thumbnail: undefined,
          }));

          return {
            ...state,
            past: compressPast,
            present: compressPresent,
            future: compressFuture,
          };
        });
      },

      // 配置管理
      setMaxHistorySize: (size: number) => {
        set({ maxHistorySize: Math.max(1, Math.min(size, 100)) });
        
        // 如果当前历史记录超过新的限制，移除旧条目
        const state = get();
        if (state.getHistorySize() > size) {
          state.removeOldEntries(size);
        }
      },

      setEnableThumbnails: (enabled: boolean) => {
        set({ enableThumbnails: enabled });
      },

      setCompressionEnabled: (enabled: boolean) => {
        set({ compressionEnabled: enabled });
      },

      // 搜索和过滤
      searchHistory: (query: string) => {
        const state = get();
        const allEntries = [...state.past, ...(state.present ? [state.present] : []), ...state.future];
        
        const lowerQuery = query.toLowerCase();
        return allEntries.filter(entry => 
          entry.description.toLowerCase().includes(lowerQuery) ||
          entry.action.toLowerCase().includes(lowerQuery)
        );
      },

      filterByAction: (action: string) => {
        const state = get();
        const allEntries = [...state.past, ...(state.present ? [state.present] : []), ...state.future];
        
        return allEntries.filter(entry => entry.action === action);
      },

      filterByTimeRange: (startTime: number, endTime: number) => {
        const state = get();
        const allEntries = [...state.past, ...(state.present ? [state.present] : []), ...state.future];
        
        return allEntries.filter(entry => 
          entry.timestamp >= startTime && entry.timestamp <= endTime
        );
      },

      // 导出和导入
      exportHistory: () => {
        const state = get();
        const exportData = {
          past: state.past,
          present: state.present,
          future: state.future,
          totalOperations: state.totalOperations,
          exportTime: Date.now(),
        };
        
        return JSON.stringify(exportData);
      },

      importHistory: (data: string) => {
        try {
          const importData = JSON.parse(data);
          
          // 验证数据格式
          if (!importData.past || !Array.isArray(importData.past)) {
            return false;
          }

          set({
            past: importData.past,
            present: importData.present || null,
            future: importData.future || [],
            totalOperations: importData.totalOperations || 0,
          });

          return true;
        } catch (error) {
          console.error('Failed to import history:', error);
          return false;
        }
      },

      // 内存管理
      calculateMemoryUsage: () => {
        const state = get();
        let totalSize = 0;

        // 计算past的大小
        state.past.forEach(entry => {
          totalSize += getStringSize(entry.canvasState);
          if (entry.thumbnail) {
            totalSize += getStringSize(entry.thumbnail);
          }
        });

        // 计算present的大小
        if (state.present) {
          totalSize += getStringSize(state.present.canvasState);
          if (state.present.thumbnail) {
            totalSize += getStringSize(state.present.thumbnail);
          }
        }

        // 计算future的大小
        state.future.forEach(entry => {
          totalSize += getStringSize(entry.canvasState);
          if (entry.thumbnail) {
            totalSize += getStringSize(entry.thumbnail);
          }
        });

        return totalSize;
      },

      optimizeMemory: () => {
        const state = get();
        
        // 1. 压缩历史记录
        state.compressHistory();
        
        // 2. 移除旧的条目
        const currentSize = state.calculateMemoryUsage();
        if (currentSize > MAX_MEMORY_USAGE) {
          const targetSize = Math.floor(state.maxHistorySize * 0.7);
          state.removeOldEntries(targetSize);
        }
        
        // 3. 更新内存使用量
        set({ memoryUsage: state.calculateMemoryUsage() });
      },

      // 批量操作
      startBatch: () => {
        isBatching = true;
        batchOperations = [];
      },

      endBatch: (description?: string) => {
        if (!isBatching || batchOperations.length === 0) {
          isBatching = false;
          batchOperations = [];
          return;
        }

        // 合并批量操作为单个历史记录条目
        const batchDescription = description || `批量操作 (${batchOperations.length} 个操作)`;
        const batchMetadata = {
          operations: batchOperations.map(op => ({
            action: op.action,
            description: op.description,
          })),
          count: batchOperations.length,
        };

        isBatching = false;
        batchOperations = [];

        // 保存批量操作状态
        get().saveState('batch:operation', batchDescription, batchMetadata);
      },

      // 重置
      reset: () => {
        isBatching = false;
        batchOperations = [];
        
        set({
          past: [],
          present: null,
          future: [],
          maxHistorySize: DEFAULT_MAX_HISTORY_SIZE,
          enableThumbnails: DEFAULT_ENABLE_THUMBNAILS,
          compressionEnabled: DEFAULT_COMPRESSION_ENABLED,
          isRecording: true,
          lastSaveTime: 0,
          totalOperations: 0,
          memoryUsage: 0,
        });
      },
    }),
    {
      name: 'history-store',
    }
  )
);

// 导出工具函数供外部使用
export { generateThumbnail, compressCanvasState, getStringSize };

// 全局引用，供其他模块使用
if (typeof window !== 'undefined') {
  (window as any).__historyStore = useHistoryStore;
}