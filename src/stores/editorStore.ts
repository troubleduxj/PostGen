import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { fabric } from 'fabric';
import { EditorState, Tool, PanelType, HistoryItem, CanvasState } from '@/types';
import { useTextEditorStore } from './textEditorStore';
import { useImageProcessorStore } from './imageProcessorStore';
import { useLayerManagerStore } from './layerManagerStore';
import { useHistoryStore } from './historyStore';

// 扩展的编辑器状态，包含新的功能模块
interface ExtendedEditorState extends EditorState {
  // 持久化设置
  preferences: {
    autoSave: boolean;
    autoSaveInterval: number; // 分钟
    theme: 'light' | 'dark' | 'auto';
    language: 'zh-CN' | 'en-US';
    showGrid: boolean;
    snapToGrid: boolean;
    showRulers: boolean;
    showGuides: boolean;
  };
  
  // 最近使用的项目
  recentProjects: Array<{
    id: string;
    name: string;
    thumbnail: string;
    lastModified: number;
    canvasState: string;
  }>;
  
  // 自动保存状态
  autoSaveTimer: NodeJS.Timeout | null;
  lastSaveTime: number;
}

interface EditorStore extends ExtendedEditorState {
  // Canvas 操作
  setCanvas: (canvas: fabric.Canvas) => void;
  updateCanvasState: (state: Partial<CanvasState>) => void;
  
  // 对象操作
  setActiveObject: (object: fabric.Object | null) => void;
  setSelectedObjects: (objects: fabric.Object[]) => void;
  addObject: (object: fabric.Object) => void;
  removeObject: (object: fabric.Object) => void;
  duplicateObject: (object: fabric.Object) => void;
  
  // 工具和面板
  setActiveTool: (tool: Tool) => void;
  setActivePanel: (panel: PanelType | null) => void;
  
  // 历史记录
  saveState: (action: string, data?: any) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // 画布操作
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetZoom: () => void;
  
  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 导出功能
  exportCanvas: (options: { format: string; quality: number }) => Promise<Blob>;
  
  // 功能模块集成
  initializeStores: () => void;
  syncStores: () => void;
  
  // 持久化功能
  saveProject: (name?: string) => Promise<string>;
  loadProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => void;
  updatePreferences: (preferences: Partial<ExtendedEditorState['preferences']>) => void;
  
  // 自动保存
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  
  // 重置编辑器
  reset: () => void;
}

const initialCanvasState: CanvasState = {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  zoom: 1,
  gridVisible: false,
  snapToGrid: false,
  gridSize: 20,
};

// 默认用户偏好设置
const defaultPreferences = {
  autoSave: true,
  autoSaveInterval: 5, // 5分钟
  theme: 'light' as const,
  language: 'zh-CN' as const,
  showGrid: false,
  snapToGrid: false,
  showRulers: false,
  showGuides: true,
};

export const useEditorStore = create<EditorStore>()(
  persist(
    devtools(
      (set, get) => ({
      // 初始状态
      canvas: null,
      canvasState: initialCanvasState,
      activeObject: null,
      selectedObjects: [],
      activeTool: 'select',
      activePanel: null,
      history: [],
      historyIndex: -1,
      isLoading: false,
      error: null,
      
      // 扩展状态
      preferences: defaultPreferences,
      recentProjects: [],
      autoSaveTimer: null,
      lastSaveTime: 0,

      // Canvas 操作
      setCanvas: (canvas) => {
        set({ canvas });
        
        // 绑定画布事件
        canvas.on('selection:created', (e) => {
          const objects = e.selected || [];
          set({ 
            activeObject: objects[0] || null,
            selectedObjects: objects 
          });
        });
        
        canvas.on('selection:updated', (e) => {
          const objects = e.selected || [];
          set({ 
            activeObject: objects[0] || null,
            selectedObjects: objects 
          });
        });
        
        canvas.on('selection:cleared', () => {
          set({ 
            activeObject: null,
            selectedObjects: [] 
          });
        });
        
        canvas.on('object:modified', () => {
          get().saveState('object:modified');
        });
        
        canvas.on('object:added', () => {
          get().saveState('object:added');
        });
        
        canvas.on('object:removed', () => {
          get().saveState('object:removed');
        });

        // 绑定键盘事件处理
        const handleKeyDown = (e: KeyboardEvent) => {
          // 导入工具管理器并处理键盘事件
          import('@/utils/toolManager').then(({ toolManager }) => {
            toolManager.handleKeyDown(e);
          });
        };

        const handleKeyUp = (e: KeyboardEvent) => {
          import('@/utils/toolManager').then(({ toolManager }) => {
            toolManager.handleKeyUp(e);
          });
        };

        // 添加全局键盘事件监听
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // 保存清理函数
        (canvas as any)._keyboardCleanup = () => {
          document.removeEventListener('keydown', handleKeyDown);
          document.removeEventListener('keyup', handleKeyUp);
        };

        // 设置全局引用供历史记录系统使用
        (window as any).__editorStore = { getState: get };
      },

      updateCanvasState: (state) => {
        const { canvas, canvasState } = get();
        const newState = { ...canvasState, ...state };
        
        set({ canvasState: newState });
        
        if (canvas && canvas.setDimensions) {
          try {
            // 更新画布属性
            if (state.width !== undefined || state.height !== undefined) {
              canvas.setDimensions({
                width: newState.width,
                height: newState.height
              });
            }
            
            if (state.backgroundColor !== undefined) {
              canvas.setBackgroundColor(newState.backgroundColor, canvas.renderAll.bind(canvas));
            }
            
            if (state.zoom !== undefined) {
              canvas.setZoom(newState.zoom);
            }
            
            canvas.renderAll();
          } catch (error) {
            console.error('Error updating canvas state:', error);
          }
        }
      },

      // 对象操作
      setActiveObject: (object) => {
        set({ activeObject: object });
        const { canvas } = get();
        if (canvas) {
          if (object) {
            canvas.setActiveObject(object);
          } else {
            canvas.discardActiveObject();
          }
          canvas.renderAll();
        }
      },

      setSelectedObjects: (objects) => {
        set({ selectedObjects: objects });
      },

      addObject: (object) => {
        const { canvas } = get();
        if (canvas) {
          canvas.add(object);
          canvas.setActiveObject(object);
          canvas.renderAll();
          get().saveState('add:object', { objectType: object.type });
        }
      },

      removeObject: (object) => {
        const { canvas } = get();
        if (canvas) {
          canvas.remove(object);
          canvas.renderAll();
          get().saveState('remove:object', { objectType: object.type });
        }
      },

      duplicateObject: (object) => {
        const { canvas } = get();
        if (canvas) {
          object.clone((cloned: fabric.Object) => {
            cloned.set({
              left: (cloned.left || 0) + 20,
              top: (cloned.top || 0) + 20,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
            get().saveState('duplicate:object', { objectType: object.type });
          });
        }
      },

      // 工具和面板
      setActiveTool: (tool) => {
        set({ activeTool: tool });
        
        // 根据工具类型设置画布交互模式
        const { canvas } = get();
        if (canvas) {
          switch (tool) {
            case 'select':
              canvas.isDrawingMode = false;
              canvas.selection = true;
              break;
            case 'pen':
              canvas.isDrawingMode = true;
              canvas.selection = false;
              break;
            case 'hand':
              canvas.isDrawingMode = false;
              canvas.selection = false;
              break;
            default:
              canvas.isDrawingMode = false;
              canvas.selection = true;
          }
        }
      },

      setActivePanel: (panel) => {
        set({ activePanel: panel });
      },

      // 历史记录 - 委托给新的历史记录系统
      saveState: (action, data) => {
        const historyStore = useHistoryStore.getState();
        historyStore.saveState(action, undefined, data);
      },

      undo: () => {
        const historyStore = useHistoryStore.getState();
        return historyStore.undo();
      },

      redo: () => {
        const historyStore = useHistoryStore.getState();
        return historyStore.redo();
      },

      clearHistory: () => {
        const historyStore = useHistoryStore.getState();
        historyStore.clearHistory();
        set({ history: [], historyIndex: -1 });
      },

      // 画布操作
      zoomIn: () => {
        const { canvas, canvasState } = get();
        if (canvas) {
          const newZoom = Math.min(canvasState.zoom * 1.2, 5);
          get().updateCanvasState({ zoom: newZoom });
        }
      },

      zoomOut: () => {
        const { canvas, canvasState } = get();
        if (canvas) {
          const newZoom = Math.max(canvasState.zoom / 1.2, 0.1);
          get().updateCanvasState({ zoom: newZoom });
        }
      },

      zoomToFit: () => {
        const { canvas } = get();
        if (canvas) {
          const container = canvas.getElement().parentElement;
          if (container) {
            const containerWidth = container.clientWidth - 40;
            const containerHeight = container.clientHeight - 40;
            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();
            
            const scaleX = containerWidth / canvasWidth;
            const scaleY = containerHeight / canvasHeight;
            const scale = Math.min(scaleX, scaleY);
            
            get().updateCanvasState({ zoom: scale });
          }
        }
      },

      resetZoom: () => {
        get().updateCanvasState({ zoom: 1 });
      },

      // 状态管理
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      // 导出功能
      exportCanvas: async (options) => {
        const { canvas } = get();
        if (!canvas) throw new Error('Canvas not initialized');

        return new Promise((resolve, reject) => {
          try {
            const dataURL = canvas.toDataURL({
              format: options.format,
              quality: options.quality,
              multiplier: 1,
            });

            // 将 dataURL 转换为 Blob
            fetch(dataURL)
              .then(res => res.blob())
              .then(resolve)
              .catch(reject);
          } catch (error) {
            reject(error);
          }
        });
      },

      // 功能模块集成
      initializeStores: () => {
        // 初始化各个功能模块的 store
        // 这里可以设置模块间的通信和同步
        console.log('Initializing feature stores...');
      },

      syncStores: () => {
        // 同步各个 store 的状态
        const { canvas } = get();
        if (canvas) {
          // 同步图层管理器
          useLayerManagerStore.getState().syncWithCanvas(canvas);
        }
      },

      // 持久化功能
      saveProject: async (name) => {
        const { canvas, canvasState } = get();
        if (!canvas) throw new Error('No canvas to save');

        const projectId = `project_${Date.now()}`;
        const projectName = name || `项目 ${new Date().toLocaleString()}`;
        
        // 生成缩略图
        const thumbnail = canvas.toDataURL({
          format: 'png',
          quality: 0.5,
          multiplier: 0.2,
        });

        // 序列化画布状态
        const canvasData = JSON.stringify({
          canvas: canvas.toJSON(),
          canvasState,
          textEditor: useTextEditorStore.getState(),
          imageProcessor: useImageProcessorStore.getState(),
          layerManager: useLayerManagerStore.getState(),
        });

        const project = {
          id: projectId,
          name: projectName,
          thumbnail,
          lastModified: Date.now(),
          canvasState: canvasData,
        };

        // 保存到本地存储
        const { recentProjects } = get();
        const newProjects = [project, ...recentProjects.slice(0, 9)]; // 保留最近10个项目
        
        set({ 
          recentProjects: newProjects,
          lastSaveTime: Date.now(),
        });

        // 保存到 localStorage
        localStorage.setItem(`poster_project_${projectId}`, canvasData);

        return projectId;
      },

      loadProject: async (projectId) => {
        const { canvas } = get();
        if (!canvas) throw new Error('No canvas to load into');

        set({ isLoading: true });

        try {
          // 从 localStorage 加载项目数据
          const projectData = localStorage.getItem(`poster_project_${projectId}`);
          if (!projectData) throw new Error('Project not found');

          const data = JSON.parse(projectData);

          // 恢复画布状态
          canvas.loadFromJSON(data.canvas, () => {
            canvas.renderAll();
            
            // 恢复编辑器状态
            set({ canvasState: data.canvasState });
            
            // 恢复各个功能模块状态
            if (data.textEditor) {
              useTextEditorStore.setState(data.textEditor);
            }
            if (data.imageProcessor) {
              useImageProcessorStore.setState(data.imageProcessor);
            }
            if (data.layerManager) {
              useLayerManagerStore.setState(data.layerManager);
            }

            // 同步状态
            get().syncStores();
          });
        } catch (error) {
          console.error('Failed to load project:', error);
          set({ error: '加载项目失败' });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteProject: (projectId) => {
        // 从最近项目列表中移除
        const { recentProjects } = get();
        const newProjects = recentProjects.filter(p => p.id !== projectId);
        set({ recentProjects: newProjects });

        // 从 localStorage 中删除
        localStorage.removeItem(`poster_project_${projectId}`);
      },

      updatePreferences: (newPreferences) => {
        const { preferences } = get();
        const updatedPreferences = { ...preferences, ...newPreferences };
        set({ preferences: updatedPreferences });

        // 如果自动保存设置发生变化，重新配置自动保存
        if (newPreferences.autoSave !== undefined || newPreferences.autoSaveInterval !== undefined) {
          if (updatedPreferences.autoSave) {
            get().enableAutoSave();
          } else {
            get().disableAutoSave();
          }
        }
      },

      // 自动保存
      enableAutoSave: () => {
        const { autoSaveTimer, preferences } = get();
        
        // 清除现有定时器
        if (autoSaveTimer) {
          clearInterval(autoSaveTimer);
        }

        // 设置新的定时器
        const timer = setInterval(() => {
          const { canvas, lastSaveTime } = get();
          const now = Date.now();
          
          // 检查是否需要保存（距离上次保存超过设定间隔）
          if (canvas && now - lastSaveTime > preferences.autoSaveInterval * 60 * 1000) {
            get().saveProject('自动保存').catch(console.error);
          }
        }, 30000); // 每30秒检查一次

        set({ autoSaveTimer: timer });
      },

      disableAutoSave: () => {
        const { autoSaveTimer } = get();
        if (autoSaveTimer) {
          clearInterval(autoSaveTimer);
          set({ autoSaveTimer: null });
        }
      },

      // 重置编辑器
      reset: () => {
        const { canvas, autoSaveTimer } = get();
        
        // 清理自动保存定时器
        if (autoSaveTimer) {
          clearInterval(autoSaveTimer);
        }
        
        if (canvas) {
          // 清理键盘事件监听器
          if ((canvas as any)._keyboardCleanup) {
            (canvas as any)._keyboardCleanup();
          }
          
          canvas.clear();
          canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
        }
        
        // 重置所有功能模块
        useTextEditorStore.getState().exitEditMode();
        useImageProcessorStore.getState().exitEditMode();
        useLayerManagerStore.getState().reset();
        
        set({
          canvasState: initialCanvasState,
          activeObject: null,
          selectedObjects: [],
          activeTool: 'select',
          activePanel: null,
          history: [],
          historyIndex: -1,
          isLoading: false,
          error: null,
          autoSaveTimer: null,
          lastSaveTime: 0,
        });
      },
      }),
      {
        name: 'editor-store',
      }
    ),
    {
      name: 'poster-editor-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        recentProjects: state.recentProjects,
        canvasState: state.canvasState,
      }),
    }
  )
);