import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fabric } from 'fabric';

// 图层类型
export type LayerType = 'text' | 'image' | 'shape' | 'group' | 'background';

// 图层接口
export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  zIndex: number;
  fabricObject: fabric.Object;
  thumbnail?: string; // 图层缩略图
  parentId?: string; // 父图层ID（用于组合）
  children?: string[]; // 子图层ID列表
  createdAt: number;
  updatedAt: number;
}

// 图层选择状态
export interface LayerSelection {
  selectedLayerIds: string[];
  activeLayerId: string | null;
  multiSelect: boolean;
}

// 图层拖拽状态
export interface LayerDragState {
  isDragging: boolean;
  draggedLayerId: string | null;
  dragOverLayerId: string | null;
  dropPosition: 'above' | 'below' | 'inside' | null;
}

// 图层过滤和搜索
export interface LayerFilter {
  searchQuery: string;
  typeFilter: LayerType | 'all';
  visibilityFilter: 'all' | 'visible' | 'hidden';
  lockFilter: 'all' | 'locked' | 'unlocked';
}

// 图层管理器状态接口
export interface LayerManagerState {
  // 图层列表
  layers: Layer[];
  layerMap: Map<string, Layer>; // 快速查找图层
  
  // 选择状态
  selection: LayerSelection;
  
  // 拖拽状态
  dragState: LayerDragState;
  
  // 过滤和搜索
  filter: LayerFilter;
  
  // 同步状态
  isSyncing: boolean;
  lastSyncTime: number;
  
  // 自动命名计数器
  layerNameCounters: Record<LayerType, number>;
}

// 图层管理器操作接口
interface LayerManagerActions {
  // 图层基础操作
  addLayer: (fabricObject: fabric.Object, name?: string) => Layer;
  removeLayer: (layerId: string) => void;
  removeLayers: (layerIds: string[]) => void;
  duplicateLayer: (layerId: string) => Layer | null;
  duplicateLayers: (layerIds: string[]) => Layer[];
  
  // 图层属性操作
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  renameLayer: (layerId: string, newName: string) => void;
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  setLayerLock: (layerId: string, locked: boolean) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  
  // 批量操作
  setLayersVisibility: (layerIds: string[], visible: boolean) => void;
  setLayersLock: (layerIds: string[], locked: boolean) => void;
  deleteSelectedLayers: () => void;
  
  // 图层顺序操作
  moveLayer: (layerId: string, newIndex: number) => void;
  moveLayerUp: (layerId: string) => void;
  moveLayerDown: (layerId: string) => void;
  moveLayerToTop: (layerId: string) => void;
  moveLayerToBottom: (layerId: string) => void;
  reorderLayers: (layerIds: string[]) => void;
  
  // 图层选择操作
  selectLayer: (layerId: string, multiSelect?: boolean) => void;
  selectLayers: (layerIds: string[]) => void;
  selectAllLayers: () => void;
  clearSelection: () => void;
  setActiveLayer: (layerId: string | null) => void;
  
  // 图层组合操作
  groupLayers: (layerIds: string[], groupName?: string) => Layer | null;
  ungroupLayer: (groupLayerId: string) => void;
  
  // 拖拽操作
  startDrag: (layerId: string) => void;
  updateDrag: (dragOverLayerId: string, position: 'above' | 'below' | 'inside') => void;
  endDrag: () => void;
  cancelDrag: () => void;
  
  // 搜索和过滤
  setSearchQuery: (query: string) => void;
  setTypeFilter: (type: LayerType | 'all') => void;
  setVisibilityFilter: (filter: 'all' | 'visible' | 'hidden') => void;
  setLockFilter: (filter: 'all' | 'locked' | 'unlocked') => void;
  clearFilters: () => void;
  
  // 同步操作
  syncWithCanvas: (canvas: fabric.Canvas) => void;
  syncLayerWithObject: (layerId: string) => void;
  syncAllLayers: () => void;
  
  // 工具方法
  getFilteredLayers: () => Layer[];
  getLayerById: (layerId: string) => Layer | undefined;
  getLayerByObject: (fabricObject: fabric.Object) => Layer | undefined;
  generateLayerName: (type: LayerType) => string;
  generateThumbnail: (layer: Layer) => Promise<string>;
  
  // 重置
  reset: () => void;
}

type LayerManagerStore = LayerManagerState & LayerManagerActions;

// 默认选择状态
const defaultSelection: LayerSelection = {
  selectedLayerIds: [],
  activeLayerId: null,
  multiSelect: false,
};

// 默认拖拽状态
const defaultDragState: LayerDragState = {
  isDragging: false,
  draggedLayerId: null,
  dragOverLayerId: null,
  dropPosition: null,
};

// 默认过滤状态
const defaultFilter: LayerFilter = {
  searchQuery: '',
  typeFilter: 'all',
  visibilityFilter: 'all',
  lockFilter: 'all',
};

// 默认命名计数器
const defaultNameCounters: Record<LayerType, number> = {
  text: 0,
  image: 0,
  shape: 0,
  group: 0,
  background: 0,
};

export const useLayerManagerStore = create<LayerManagerStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      layers: [],
      layerMap: new Map(),
      selection: defaultSelection,
      dragState: defaultDragState,
      filter: defaultFilter,
      isSyncing: false,
      lastSyncTime: 0,
      layerNameCounters: { ...defaultNameCounters },

      // 图层基础操作
      addLayer: (fabricObject, name) => {
        const { layers, layerMap, layerNameCounters } = get();
        
        // 检查对象是否已经有图层ID
        const existingLayerId = fabricObject.get('layerId');
        if (existingLayerId && layerMap.has(existingLayerId)) {
          console.log('Layer already exists for object:', existingLayerId);
          return layerMap.get(existingLayerId)!;
        }
        
        // 生成图层ID
        const layerId = existingLayerId || `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 确定图层类型
        let type: LayerType = 'shape';
        if (fabricObject instanceof fabric.IText || fabricObject instanceof fabric.Text) {
          type = 'text';
        } else if (fabricObject instanceof fabric.Image) {
          type = 'image';
        } else if (fabricObject instanceof fabric.Group) {
          type = 'group';
        }
        
        // 生成图层名称
        const layerName = name || get().generateLayerName(type);
        
        // 创建图层对象
        const layer: Layer = {
          id: layerId,
          name: layerName,
          type,
          visible: fabricObject.visible !== false,
          locked: fabricObject.selectable === false,
          opacity: fabricObject.opacity || 1,
          zIndex: layers.length,
          fabricObject,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        // 设置 Fabric 对象的 ID
        fabricObject.set('layerId', layerId);
        
        // 更新状态
        const newLayers = [...layers, layer];
        const newLayerMap = new Map(layerMap);
        newLayerMap.set(layerId, layer);
        
        // 更新命名计数器
        const newCounters = { ...layerNameCounters };
        newCounters[type]++;
        
        set({
          layers: newLayers,
          layerMap: newLayerMap,
          layerNameCounters: newCounters,
          lastSyncTime: Date.now(),
        });
        
        console.log('Layer added:', {
          layerId,
          name: layerName,
          type,
          totalLayers: newLayers.length
        });
        
        // 生成缩略图
        get().generateThumbnail(layer);
        
        return layer;
      },

      removeLayer: (layerId) => {
        const { layers, layerMap, selection } = get();
        const layer = layerMap.get(layerId);
        if (!layer) return;
        
        // 从画布移除对象
        if (layer.fabricObject && layer.fabricObject.canvas) {
          layer.fabricObject.canvas.remove(layer.fabricObject);
        }
        
        // 更新图层列表
        const newLayers = layers.filter(l => l.id !== layerId);
        const newLayerMap = new Map(layerMap);
        newLayerMap.delete(layerId);
        
        // 更新选择状态
        const newSelection = {
          ...selection,
          selectedLayerIds: selection.selectedLayerIds.filter(id => id !== layerId),
          activeLayerId: selection.activeLayerId === layerId ? null : selection.activeLayerId,
        };
        
        set({
          layers: newLayers,
          layerMap: newLayerMap,
          selection: newSelection,
          lastSyncTime: Date.now(),
        });
      },

      removeLayers: (layerIds) => {
        layerIds.forEach(layerId => get().removeLayer(layerId));
      },

      duplicateLayer: (layerId) => {
        const { layerMap } = get();
        const layer = layerMap.get(layerId);
        if (!layer) return null;
        
        // 克隆 Fabric 对象
        return new Promise<Layer | null>((resolve) => {
          layer.fabricObject.clone((cloned: fabric.Object) => {
            // 偏移位置
            cloned.set({
              left: (cloned.left || 0) + 20,
              top: (cloned.top || 0) + 20,
            });
            
            // 添加到画布
            if (layer.fabricObject.canvas) {
              layer.fabricObject.canvas.add(cloned);
            }
            
            // 创建新图层
            const newLayer = get().addLayer(cloned, `${layer.name} 副本`);
            resolve(newLayer);
          });
        });
      },

      duplicateLayers: (layerIds) => {
        const promises = layerIds.map(layerId => get().duplicateLayer(layerId));
        return Promise.all(promises).then(layers => layers.filter(Boolean) as Layer[]);
      },

      // 图层属性操作
      updateLayer: (layerId, updates) => {
        const { layers, layerMap } = get();
        const layer = layerMap.get(layerId);
        if (!layer) return;
        
        const updatedLayer = { ...layer, ...updates, updatedAt: Date.now() };
        
        // 更新 Fabric 对象属性
        if (updates.visible !== undefined) {
          layer.fabricObject.set('visible', updates.visible);
        }
        if (updates.locked !== undefined) {
          layer.fabricObject.set('selectable', !updates.locked);
          layer.fabricObject.set('evented', !updates.locked);
        }
        if (updates.opacity !== undefined) {
          layer.fabricObject.set('opacity', updates.opacity);
        }
        
        // 更新状态
        const newLayers = layers.map(l => l.id === layerId ? updatedLayer : l);
        const newLayerMap = new Map(layerMap);
        newLayerMap.set(layerId, updatedLayer);
        
        set({
          layers: newLayers,
          layerMap: newLayerMap,
          lastSyncTime: Date.now(),
        });
        
        // 重新渲染画布
        layer.fabricObject.canvas?.renderAll();
      },

      renameLayer: (layerId, newName) => {
        get().updateLayer(layerId, { name: newName });
      },

      setLayerVisibility: (layerId, visible) => {
        get().updateLayer(layerId, { visible });
      },

      setLayerLock: (layerId, locked) => {
        get().updateLayer(layerId, { locked });
      },

      setLayerOpacity: (layerId, opacity) => {
        get().updateLayer(layerId, { opacity });
      },

      // 批量操作
      setLayersVisibility: (layerIds, visible) => {
        layerIds.forEach(layerId => get().setLayerVisibility(layerId, visible));
      },

      setLayersLock: (layerIds, locked) => {
        layerIds.forEach(layerId => get().setLayerLock(layerId, locked));
      },

      deleteSelectedLayers: () => {
        const { selection } = get();
        get().removeLayers(selection.selectedLayerIds);
      },

      // 图层顺序操作
      moveLayer: (layerId, newIndex) => {
        const { layers, layerMap } = get();
        const layer = layerMap.get(layerId);
        if (!layer) return;
        
        const currentIndex = layers.findIndex(l => l.id === layerId);
        if (currentIndex === -1) return;
        
        // 重新排列图层
        const newLayers = [...layers];
        newLayers.splice(currentIndex, 1);
        newLayers.splice(newIndex, 0, layer);
        
        // 更新 z-index
        const updatedLayers = newLayers.map((l, index) => ({
          ...l,
          zIndex: index,
          updatedAt: Date.now(),
        }));
        
        // 更新 Fabric 对象的 z-index
        updatedLayers.forEach((l, index) => {
          if (l.fabricObject.canvas) {
            l.fabricObject.moveTo(index);
          }
        });
        
        // 更新状态
        const newLayerMap = new Map();
        updatedLayers.forEach(l => newLayerMap.set(l.id, l));
        
        set({
          layers: updatedLayers,
          layerMap: newLayerMap,
          lastSyncTime: Date.now(),
        });
        
        // 重新渲染画布
        layer.fabricObject.canvas?.renderAll();
      },

      moveLayerUp: (layerId) => {
        const { layers } = get();
        const currentIndex = layers.findIndex(l => l.id === layerId);
        if (currentIndex > 0) {
          get().moveLayer(layerId, currentIndex - 1);
        }
      },

      moveLayerDown: (layerId) => {
        const { layers } = get();
        const currentIndex = layers.findIndex(l => l.id === layerId);
        if (currentIndex < layers.length - 1) {
          get().moveLayer(layerId, currentIndex + 1);
        }
      },

      moveLayerToTop: (layerId) => {
        get().moveLayer(layerId, 0);
      },

      moveLayerToBottom: (layerId) => {
        const { layers } = get();
        get().moveLayer(layerId, layers.length - 1);
      },

      reorderLayers: (layerIds) => {
        const { layers, layerMap } = get();
        
        // 根据新的顺序重新排列图层
        const reorderedLayers = layerIds
          .map(id => layerMap.get(id))
          .filter(Boolean) as Layer[];
        
        // 添加未在重排序列表中的图层
        const remainingLayers = layers.filter(l => !layerIds.includes(l.id));
        const newLayers = [...reorderedLayers, ...remainingLayers];
        
        // 更新 z-index
        const updatedLayers = newLayers.map((l, index) => ({
          ...l,
          zIndex: index,
          updatedAt: Date.now(),
        }));
        
        // 更新 Fabric 对象顺序
        updatedLayers.forEach((l, index) => {
          if (l.fabricObject.canvas) {
            l.fabricObject.moveTo(index);
          }
        });
        
        // 更新状态
        const newLayerMap = new Map();
        updatedLayers.forEach(l => newLayerMap.set(l.id, l));
        
        set({
          layers: updatedLayers,
          layerMap: newLayerMap,
          lastSyncTime: Date.now(),
        });
      },

      // 图层选择操作
      selectLayer: (layerId, multiSelect = false) => {
        const { selection, layerMap } = get();
        const layer = layerMap.get(layerId);
        if (!layer) return;
        
        let newSelectedIds: string[];
        
        if (multiSelect) {
          if (selection.selectedLayerIds.includes(layerId)) {
            // 取消选择
            newSelectedIds = selection.selectedLayerIds.filter(id => id !== layerId);
          } else {
            // 添加到选择
            newSelectedIds = [...selection.selectedLayerIds, layerId];
          }
        } else {
          // 单选
          newSelectedIds = [layerId];
        }
        
        set({
          selection: {
            selectedLayerIds: newSelectedIds,
            activeLayerId: layerId,
            multiSelect,
          },
        });
        
        // 同步画布选择
        if (layer.fabricObject.canvas) {
          if (multiSelect && newSelectedIds.length > 1) {
            const selectedObjects = newSelectedIds
              .map(id => layerMap.get(id)?.fabricObject)
              .filter(Boolean) as fabric.Object[];
            
            const activeSelection = new fabric.ActiveSelection(selectedObjects, {
              canvas: layer.fabricObject.canvas,
            });
            layer.fabricObject.canvas.setActiveObject(activeSelection);
          } else if (newSelectedIds.length === 1) {
            layer.fabricObject.canvas.setActiveObject(layer.fabricObject);
          } else {
            layer.fabricObject.canvas.discardActiveObject();
          }
          layer.fabricObject.canvas.renderAll();
        }
      },

      selectLayers: (layerIds) => {
        set({
          selection: {
            selectedLayerIds: layerIds,
            activeLayerId: layerIds[0] || null,
            multiSelect: layerIds.length > 1,
          },
        });
      },

      selectAllLayers: () => {
        const { layers } = get();
        const allLayerIds = layers.map(l => l.id);
        get().selectLayers(allLayerIds);
      },

      clearSelection: () => {
        set({ selection: defaultSelection });
      },

      setActiveLayer: (layerId) => {
        const { selection } = get();
        set({
          selection: {
            ...selection,
            activeLayerId: layerId,
          },
        });
      },

      // 图层组合操作
      groupLayers: (layerIds, groupName) => {
        const { layerMap } = get();
        
        if (layerIds.length < 2) return null;
        
        const layersToGroup = layerIds
          .map(id => layerMap.get(id))
          .filter(Boolean) as Layer[];
        
        if (layersToGroup.length < 2) return null;
        
        const fabricObjects = layersToGroup.map(l => l.fabricObject);
        const canvas = fabricObjects[0].canvas;
        
        if (!canvas) return null;
        
        // 清除当前选择
        canvas.discardActiveObject();
        
        // 创建 Fabric 组合
        const group = new fabric.Group(fabricObjects, {
          left: 0,
          top: 0,
        });
        
        // 移除原始对象
        fabricObjects.forEach(obj => canvas.remove(obj));
        
        // 添加组合到画布
        canvas.add(group);
        
        // 选中新创建的组合
        canvas.setActiveObject(group);
        canvas.renderAll();
        
        // 移除原始图层
        layerIds.forEach(layerId => get().removeLayer(layerId));
        
        // 创建组合图层
        const groupLayer = get().addLayer(group, groupName || '组合');
        
        console.log(`成功组合 ${layerIds.length} 个图层`);
        return groupLayer;
      },

      ungroupLayer: (groupLayerId) => {
        const { layerMap } = get();
        const groupLayer = layerMap.get(groupLayerId);
        
        if (!groupLayer || groupLayer.type !== 'group') return;
        
        const group = groupLayer.fabricObject as fabric.Group;
        const canvas = group.canvas;
        
        if (!canvas) return;
        
        // 清除当前选择
        canvas.discardActiveObject();
        
        // 获取组合中的对象
        const objects = group.getObjects();
        
        // 移除组合
        canvas.remove(group);
        
        // 添加单独的对象并创建多选
        const addedObjects: fabric.Object[] = [];
        objects.forEach(obj => {
          // 重新计算对象的位置（因为组合会改变坐标系）
          const matrix = group.calcTransformMatrix();
          const point = fabric.util.transformPoint(
            new fabric.Point(obj.left || 0, obj.top || 0),
            matrix
          );
          
          obj.set({
            left: point.x,
            top: point.y,
          });
          
          canvas.add(obj);
          addedObjects.push(obj);
          get().addLayer(obj);
        });
        
        // 选中所有取消组合的对象
        if (addedObjects.length > 1) {
          const selection = new fabric.ActiveSelection(addedObjects, {
            canvas: canvas,
          });
          canvas.setActiveObject(selection);
        } else if (addedObjects.length === 1) {
          canvas.setActiveObject(addedObjects[0]);
        }
        
        canvas.renderAll();
        
        // 移除组合图层
        get().removeLayer(groupLayerId);
        
        console.log(`成功取消组合，恢复 ${objects.length} 个对象`);
      },

      // 拖拽操作
      startDrag: (layerId) => {
        set({
          dragState: {
            isDragging: true,
            draggedLayerId: layerId,
            dragOverLayerId: null,
            dropPosition: null,
          },
        });
      },

      updateDrag: (dragOverLayerId, position) => {
        const { dragState } = get();
        set({
          dragState: {
            ...dragState,
            dragOverLayerId,
            dropPosition: position,
          },
        });
      },

      endDrag: () => {
        const { dragState } = get();
        
        if (dragState.isDragging && dragState.draggedLayerId && dragState.dragOverLayerId) {
          const { layers } = get();
          const draggedIndex = layers.findIndex(l => l.id === dragState.draggedLayerId);
          const targetIndex = layers.findIndex(l => l.id === dragState.dragOverLayerId);
          
          if (draggedIndex !== -1 && targetIndex !== -1) {
            let newIndex = targetIndex;
            if (dragState.dropPosition === 'below') {
              newIndex = targetIndex + 1;
            }
            
            get().moveLayer(dragState.draggedLayerId, newIndex);
          }
        }
        
        set({ dragState: defaultDragState });
      },

      cancelDrag: () => {
        set({ dragState: defaultDragState });
      },

      // 搜索和过滤
      setSearchQuery: (query) => {
        const { filter } = get();
        set({ filter: { ...filter, searchQuery: query } });
      },

      setTypeFilter: (type) => {
        const { filter } = get();
        set({ filter: { ...filter, typeFilter: type } });
      },

      setVisibilityFilter: (visibilityFilter) => {
        const { filter } = get();
        set({ filter: { ...filter, visibilityFilter } });
      },

      setLockFilter: (lockFilter) => {
        const { filter } = get();
        set({ filter: { ...filter, lockFilter } });
      },

      clearFilters: () => {
        set({ filter: defaultFilter });
      },

      // 同步操作
      syncWithCanvas: (canvas) => {
        set({ isSyncing: true });
        
        try {
          const objects = canvas.getObjects();
          const { layerMap } = get();
          
          console.log('Syncing with canvas:', {
            canvasObjects: objects.length,
            existingLayers: layerMap.size
          });
          
          // 检查是否有新对象需要添加图层
          objects.forEach(obj => {
            const layerId = obj.get('layerId');
            if (!layerId || !layerMap.has(layerId)) {
              console.log('Adding layer for object without layerId:', obj.type);
              get().addLayer(obj);
            }
          });
          
          // 检查是否有图层对应的对象已被删除
          const objectIds = new Set(objects.map(obj => obj.get('layerId')).filter(Boolean));
          const layersToRemove = Array.from(layerMap.keys()).filter(layerId => !objectIds.has(layerId));
          
          if (layersToRemove.length > 0) {
            console.log('Removing orphaned layers:', layersToRemove);
            layersToRemove.forEach(layerId => get().removeLayer(layerId));
          }
          
          set({ lastSyncTime: Date.now() });
          
          console.log('Sync completed:', {
            totalLayers: get().layers.length
          });
        } catch (error) {
          console.error('Failed to sync with canvas:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      syncLayerWithObject: (layerId) => {
        const { layerMap } = get();
        const layer = layerMap.get(layerId);
        if (!layer) return;
        
        const obj = layer.fabricObject;
        const updates: Partial<Layer> = {
          visible: obj.visible !== false,
          locked: obj.selectable === false,
          opacity: obj.opacity || 1,
          updatedAt: Date.now(),
        };
        
        get().updateLayer(layerId, updates);
      },

      syncAllLayers: () => {
        const { layers } = get();
        layers.forEach(layer => get().syncLayerWithObject(layer.id));
      },

      // 工具方法
      getFilteredLayers: () => {
        const { layers, filter } = get();
        
        return layers.filter(layer => {
          // 搜索过滤
          if (filter.searchQuery && !layer.name.toLowerCase().includes(filter.searchQuery.toLowerCase())) {
            return false;
          }
          
          // 类型过滤
          if (filter.typeFilter !== 'all' && layer.type !== filter.typeFilter) {
            return false;
          }
          
          // 可见性过滤
          if (filter.visibilityFilter === 'visible' && !layer.visible) {
            return false;
          }
          if (filter.visibilityFilter === 'hidden' && layer.visible) {
            return false;
          }
          
          // 锁定过滤
          if (filter.lockFilter === 'locked' && !layer.locked) {
            return false;
          }
          if (filter.lockFilter === 'unlocked' && layer.locked) {
            return false;
          }
          
          return true;
        });
      },

      getLayerById: (layerId) => {
        const { layerMap } = get();
        return layerMap.get(layerId);
      },

      getLayerByObject: (fabricObject) => {
        const layerId = fabricObject.get('layerId');
        return layerId ? get().getLayerById(layerId) : undefined;
      },

      generateLayerName: (type) => {
        const { layerNameCounters } = get();
        const counter = layerNameCounters[type] + 1;
        
        const typeNames = {
          text: '文本',
          image: '图片',
          shape: '形状',
          group: '组合',
          background: '背景',
        };
        
        return `${typeNames[type]} ${counter}`;
      },

      generateThumbnail: async (layer) => {
        return new Promise<string>((resolve) => {
          try {
            const obj = layer.fabricObject;
            const canvas = obj.canvas;
            
            if (!canvas) {
              resolve('');
              return;
            }
            
            // 创建临时画布用于生成缩略图
            const tempCanvas = new fabric.Canvas(document.createElement('canvas'), {
              width: 64,
              height: 64,
            });
            
            // 克隆对象到临时画布
            obj.clone((cloned: fabric.Object) => {
              try {
                // 缩放对象以适应缩略图尺寸
                const bounds = cloned.getBoundingRect();
                const scale = Math.min(60 / bounds.width, 60 / bounds.height);
                
                cloned.set({
                  left: 32,
                  top: 32,
                  scaleX: (cloned.scaleX || 1) * scale,
                  scaleY: (cloned.scaleY || 1) * scale,
                  originX: 'center',
                  originY: 'center'
                });
                
                tempCanvas.add(cloned);
                tempCanvas.renderAll();
                
                // 生成缩略图数据URL
                const thumbnail = tempCanvas.toDataURL({
                  format: 'png',
                  quality: 0.8,
                  multiplier: 1,
                });
                
                // 更新图层缩略图
                get().updateLayer(layer.id, { thumbnail });
                
                // 清理临时画布
                tempCanvas.dispose();
                
                resolve(thumbnail);
              } catch (error) {
                console.error('Failed to generate thumbnail:', error);
                tempCanvas.dispose();
                resolve('');
              }
            });
          } catch (error) {
            console.error('Failed to generate thumbnail:', error);
            resolve('');
          }
        });
      },

      // 重置
      reset: () => {
        set({
          layers: [],
          layerMap: new Map(),
          selection: defaultSelection,
          dragState: defaultDragState,
          filter: defaultFilter,
          isSyncing: false,
          lastSyncTime: 0,
          layerNameCounters: { ...defaultNameCounters },
        });
      },
    }),
    {
      name: 'layer-manager-store',
    }
  )
);