// 导出所有状态管理 stores
export { useEditorStore } from './editorStore';
export { useTextEditorStore } from './textEditorStore';
export { useImageProcessorStore } from './imageProcessorStore';
export { useLayerManagerStore } from './layerManagerStore';
export { useAlignmentStore } from './alignmentStore';

// 导出类型
export type {
  TextEditorState,
  TextEffects,
  TextStroke,
  TextShadow,
  TextGradient,
  GradientColor,
} from './textEditorStore';

export type {
  ImageProcessorState,
  ImageFilters,
  ImageAdjustments,
  CropRect,
  CropPreset,
  FilterPreset,
  ImageEditHistory,
} from './imageProcessorStore';

export type {
  LayerManagerState,
  Layer,
  LayerType,
  LayerSelection,
  LayerDragState,
  LayerFilter,
} from './layerManagerStore';

export type {
  AlignmentState,
  AlignmentGuide,
  GridConfig,
} from './alignmentStore';

// 创建一个 hook 来初始化所有 stores
export const useInitializeStores = () => {
  const editorStore = useEditorStore();
  const textEditorStore = useTextEditorStore();
  const imageProcessorStore = useImageProcessorStore();
  const layerManagerStore = useLayerManagerStore();
  const alignmentStore = useAlignmentStore();

  const initializeAll = () => {
    // 初始化编辑器主 store
    editorStore.initializeStores();
    
    // 启用自动保存（如果用户偏好设置中启用了）
    if (editorStore.preferences.autoSave) {
      editorStore.enableAutoSave();
    }
    
    console.log('All stores initialized successfully');
  };

  const resetAll = () => {
    editorStore.reset();
    textEditorStore.exitEditMode();
    imageProcessorStore.exitEditMode();
    layerManagerStore.reset();
    alignmentStore.reset();
    
    console.log('All stores reset successfully');
  };

  return {
    initializeAll,
    resetAll,
    stores: {
      editor: editorStore,
      textEditor: textEditorStore,
      imageProcessor: imageProcessorStore,
      layerManager: layerManagerStore,
      alignment: alignmentStore,
    },
  };
};

// 创建一个 hook 来同步所有 stores
export const useSyncStores = () => {
  const editorStore = useEditorStore();
  
  const syncAll = () => {
    editorStore.syncStores();
  };

  return { syncAll };
};

// 创建一个 hook 来管理持久化
export const usePersistence = () => {
  const editorStore = useEditorStore();
  
  const saveCurrentProject = async (name?: string) => {
    try {
      const projectId = await editorStore.saveProject(name);
      return projectId;
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      await editorStore.loadProject(projectId);
    } catch (error) {
      console.error('Failed to load project:', error);
      throw error;
    }
  };

  const deleteProject = (projectId: string) => {
    try {
      editorStore.deleteProject(projectId);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  };

  return {
    saveCurrentProject,
    loadProject,
    deleteProject,
    recentProjects: editorStore.recentProjects,
    preferences: editorStore.preferences,
    updatePreferences: editorStore.updatePreferences,
  };
};