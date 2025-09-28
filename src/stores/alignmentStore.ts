import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fabric } from 'fabric';

// 对齐指南线类型
export interface AlignmentGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  objects: fabric.Object[];
  visible: boolean;
}

// 网格配置
export interface GridConfig {
  visible: boolean;
  size: number;
  color: string;
  opacity: number;
  snapEnabled: boolean;
  snapThreshold: number; // 吸附阈值（像素）
}

// 对齐工具状态
export interface AlignmentState {
  // 选中的对象
  selectedObjects: fabric.Object[];
  
  // 智能参考线
  guides: AlignmentGuide[];
  guidesVisible: boolean;
  snapToGuides: boolean;
  guideSnapThreshold: number;
  
  // 网格系统
  grid: GridConfig;
  
  // 对齐操作历史
  alignmentHistory: Array<{
    action: string;
    objects: string[];
    timestamp: number;
  }>;
}

export interface AlignmentStore extends AlignmentState {
  // 设置选中对象
  setSelectedObjects: (objects: fabric.Object[]) => void;
  
  // 对齐操作
  alignLeft: () => void;
  alignCenter: () => void;
  alignRight: () => void;
  alignTop: () => void;
  alignMiddle: () => void;
  alignBottom: () => void;
  
  // 分布操作
  distributeHorizontally: () => void;
  distributeVertically: () => void;
  
  // 参考线管理
  addGuide: (guide: Omit<AlignmentGuide, 'id'>) => void;
  removeGuide: (guideId: string) => void;
  clearGuides: () => void;
  toggleGuidesVisibility: () => void;
  setSnapToGuides: (enabled: boolean) => void;
  
  // 网格管理
  updateGridConfig: (config: Partial<GridConfig>) => void;
  toggleGrid: () => void;
  setSnapToGrid: (enabled: boolean) => void;
  
  // 智能对齐检测
  detectAlignmentGuides: (movingObject: fabric.Object, allObjects: fabric.Object[]) => AlignmentGuide[];
  snapToAlignment: (object: fabric.Object, guides: AlignmentGuide[]) => { x?: number; y?: number };
  
  // 工具方法
  getObjectBounds: (object: fabric.Object) => { left: number; top: number; right: number; bottom: number; centerX: number; centerY: number };
  calculateDistribution: (objects: fabric.Object[], direction: 'horizontal' | 'vertical') => Array<{ object: fabric.Object; position: number }>;
  
  // 重置状态
  reset: () => void;
}

const defaultGridConfig: GridConfig = {
  visible: false,
  size: 20,
  color: '#e5e7eb',
  opacity: 0.5,
  snapEnabled: false,
  snapThreshold: 5,
};

export const useAlignmentStore = create<AlignmentStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      selectedObjects: [],
      guides: [],
      guidesVisible: true,
      snapToGuides: true,
      guideSnapThreshold: 5,
      grid: defaultGridConfig,
      alignmentHistory: [],

      // 设置选中对象
      setSelectedObjects: (objects) => {
        set({ selectedObjects: objects });
      },

      // 对齐操作
      alignLeft: () => {
        const { selectedObjects } = get();
        if (selectedObjects.length < 2) return;

        const leftmost = Math.min(...selectedObjects.map(obj => obj.left || 0));
        
        selectedObjects.forEach(obj => {
          obj.set({ left: leftmost });
        });

        // 记录操作历史
        const history = get().alignmentHistory;
        set({
          alignmentHistory: [...history, {
            action: 'align-left',
            objects: selectedObjects.map(obj => (obj as any).id || obj.type || ''),
            timestamp: Date.now(),
          }]
        });
      },

      alignCenter: () => {
        const { selectedObjects } = get();
        if (selectedObjects.length < 2) return;

        const bounds = selectedObjects.map(obj => get().getObjectBounds(obj));
        const leftmost = Math.min(...bounds.map(b => b.left));
        const rightmost = Math.max(...bounds.map(b => b.right));
        const centerX = (leftmost + rightmost) / 2;

        selectedObjects.forEach((obj, index) => {
          const objBounds = bounds[index];
          const objWidth = objBounds.right - objBounds.left;
          obj.set({ left: centerX - objWidth / 2 });
        });

        const history = get().alignmentHistory;
        set({
          alignmentHistory: [...history, {
            action: 'align-center',
            objects: selectedObjects.map(obj => (obj as any).id || obj.type || ''),
            timestamp: Date.now(),
          }]
        });
      },

      alignRight: () => {
        const { selectedObjects } = get();
        if (selectedObjects.length < 2) return;

        const bounds = selectedObjects.map(obj => get().getObjectBounds(obj));
        const rightmost = Math.max(...bounds.map(b => b.right));

        selectedObjects.forEach((obj, index) => {
          const objBounds = bounds[index];
          const objWidth = objBounds.right - objBounds.left;
          obj.set({ left: rightmost - objWidth });
        });

        const history = get().alignmentHistory;
        set({
          alignmentHistory: [...history, {
            action: 'align-right',
            objects: selectedObjects.map(obj => (obj as any).id || obj.type || ''),
            timestamp: Date.now(),
          }]
        });
      },

      alignTop: () => {
        const { selectedObjects } = get();
        if (selectedObjects.length < 2) return;

        const topmost = Math.min(...selectedObjects.map(obj => obj.top || 0));
        
        selectedObjects.forEach(obj => {
          obj.set({ top: topmost });
        });

        const history = get().alignmentHistory;
        set({
          alignmentHistory: [...history, {
            action: 'align-top',
            objects: selectedObjects.map(obj => (obj as any).id || obj.type || ''),
            timestamp: Date.now(),
          }]
        });
      },

      alignMiddle: () => {
        const { selectedObjects } = get();
        if (selectedObjects.length < 2) return;

        const bounds = selectedObjects.map(obj => get().getObjectBounds(obj));
        const topmost = Math.min(...bounds.map(b => b.top));
        const bottommost = Math.max(...bounds.map(b => b.bottom));
        const centerY = (topmost + bottommost) / 2;

        selectedObjects.forEach((obj, index) => {
          const objBounds = bounds[index];
          const objHeight = objBounds.bottom - objBounds.top;
          obj.set({ top: centerY - objHeight / 2 });
        });

        const history = get().alignmentHistory;
        set({
          alignmentHistory: [...history, {
            action: 'align-middle',
            objects: selectedObjects.map(obj => (obj as any).id || obj.type || ''),
            timestamp: Date.now(),
          }]
        });
      },

      alignBottom: () => {
        const { selectedObjects } = get();
        if (selectedObjects.length < 2) return;

        const bounds = selectedObjects.map(obj => get().getObjectBounds(obj));
        const bottommost = Math.max(...bounds.map(b => b.bottom));

        selectedObjects.forEach((obj, index) => {
          const objBounds = bounds[index];
          const objHeight = objBounds.bottom - objBounds.top;
          obj.set({ top: bottommost - objHeight });
        });

        const history = get().alignmentHistory;
        set({
          alignmentHistory: [...history, {
            action: 'align-bottom',
            objects: selectedObjects.map(obj => (obj as any).id || obj.type || ''),
            timestamp: Date.now(),
          }]
        });
      },

      // 分布操作
      distributeHorizontally: () => {
        const { selectedObjects } = get();
        if (selectedObjects.length < 3) return;

        const distribution = get().calculateDistribution(selectedObjects, 'horizontal');
        
        distribution.forEach(({ object, position }) => {
          object.set({ left: position });
        });

        const history = get().alignmentHistory;
        set({
          alignmentHistory: [...history, {
            action: 'distribute-horizontally',
            objects: selectedObjects.map(obj => (obj as any).id || obj.type || ''),
            timestamp: Date.now(),
          }]
        });
      },

      distributeVertically: () => {
        const { selectedObjects } = get();
        if (selectedObjects.length < 3) return;

        const distribution = get().calculateDistribution(selectedObjects, 'vertical');
        
        distribution.forEach(({ object, position }) => {
          object.set({ top: position });
        });

        const history = get().alignmentHistory;
        set({
          alignmentHistory: [...history, {
            action: 'distribute-vertically',
            objects: selectedObjects.map(obj => (obj as any).id || obj.type || ''),
            timestamp: Date.now(),
          }]
        });
      },

      // 参考线管理
      addGuide: (guide) => {
        const { guides } = get();
        const newGuide: AlignmentGuide = {
          ...guide,
          id: `guide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        set({ guides: [...guides, newGuide] });
      },

      removeGuide: (guideId) => {
        const { guides } = get();
        set({ guides: guides.filter(g => g.id !== guideId) });
      },

      clearGuides: () => {
        set({ guides: [] });
      },

      toggleGuidesVisibility: () => {
        set(state => ({ guidesVisible: !state.guidesVisible }));
      },

      setSnapToGuides: (enabled) => {
        set({ snapToGuides: enabled });
      },

      // 网格管理
      updateGridConfig: (config) => {
        const { grid } = get();
        set({ grid: { ...grid, ...config } });
      },

      toggleGrid: () => {
        const { grid } = get();
        set({ grid: { ...grid, visible: !grid.visible } });
      },

      setSnapToGrid: (enabled) => {
        const { grid } = get();
        set({ grid: { ...grid, snapEnabled: enabled } });
      },

      // 智能对齐检测
      detectAlignmentGuides: (movingObject, allObjects) => {
        const guides: AlignmentGuide[] = [];
        const movingBounds = get().getObjectBounds(movingObject);
        const threshold = get().guideSnapThreshold;

        allObjects.forEach(obj => {
          if (obj === movingObject) return;
          
          const objBounds = get().getObjectBounds(obj);

          // 检测水平对齐
          if (Math.abs(movingBounds.centerY - objBounds.centerY) < threshold) {
            guides.push({
              id: `h_${(obj as any).id || obj.type}_center`,
              type: 'horizontal',
              position: objBounds.centerY,
              objects: [obj],
              visible: true,
            });
          }
          if (Math.abs(movingBounds.top - objBounds.top) < threshold) {
            guides.push({
              id: `h_${(obj as any).id || obj.type}_top`,
              type: 'horizontal',
              position: objBounds.top,
              objects: [obj],
              visible: true,
            });
          }
          if (Math.abs(movingBounds.bottom - objBounds.bottom) < threshold) {
            guides.push({
              id: `h_${(obj as any).id || obj.type}_bottom`,
              type: 'horizontal',
              position: objBounds.bottom,
              objects: [obj],
              visible: true,
            });
          }

          // 检测垂直对齐
          if (Math.abs(movingBounds.centerX - objBounds.centerX) < threshold) {
            guides.push({
              id: `v_${(obj as any).id || obj.type}_center`,
              type: 'vertical',
              position: objBounds.centerX,
              objects: [obj],
              visible: true,
            });
          }
          if (Math.abs(movingBounds.left - objBounds.left) < threshold) {
            guides.push({
              id: `v_${(obj as any).id || obj.type}_left`,
              type: 'vertical',
              position: objBounds.left,
              objects: [obj],
              visible: true,
            });
          }
          if (Math.abs(movingBounds.right - objBounds.right) < threshold) {
            guides.push({
              id: `v_${(obj as any).id || obj.type}_right`,
              type: 'vertical',
              position: objBounds.right,
              objects: [obj],
              visible: true,
            });
          }
        });

        return guides;
      },

      snapToAlignment: (object, guides) => {
        const snap: { x?: number; y?: number } = {};
        const objBounds = get().getObjectBounds(object);

        guides.forEach(guide => {
          if (guide.type === 'horizontal') {
            // 水平参考线，调整 Y 位置
            const objHeight = objBounds.bottom - objBounds.top;
            snap.y = guide.position - objHeight / 2;
          } else {
            // 垂直参考线，调整 X 位置
            const objWidth = objBounds.right - objBounds.left;
            snap.x = guide.position - objWidth / 2;
          }
        });

        return snap;
      },

      // 工具方法
      getObjectBounds: (object) => {
        const left = object.left || 0;
        const top = object.top || 0;
        const width = (object.width || 0) * (object.scaleX || 1);
        const height = (object.height || 0) * (object.scaleY || 1);

        return {
          left,
          top,
          right: left + width,
          bottom: top + height,
          centerX: left + width / 2,
          centerY: top + height / 2,
        };
      },

      calculateDistribution: (objects, direction) => {
        if (objects.length < 3) return [];

        const bounds = objects.map(obj => get().getObjectBounds(obj));
        
        if (direction === 'horizontal') {
          // 按左边缘排序
          const sorted = objects.map((obj, index) => ({ obj, bounds: bounds[index] }))
            .sort((a, b) => a.bounds.left - b.bounds.left);
          
          const first = sorted[0].bounds;
          const last = sorted[sorted.length - 1].bounds;
          const totalSpace = last.left - first.left;
          const spacing = totalSpace / (objects.length - 1);

          return sorted.map((item, index) => ({
            object: item.obj,
            position: first.left + spacing * index,
          }));
        } else {
          // 按顶部边缘排序
          const sorted = objects.map((obj, index) => ({ obj, bounds: bounds[index] }))
            .sort((a, b) => a.bounds.top - b.bounds.top);
          
          const first = sorted[0].bounds;
          const last = sorted[sorted.length - 1].bounds;
          const totalSpace = last.top - first.top;
          const spacing = totalSpace / (objects.length - 1);

          return sorted.map((item, index) => ({
            object: item.obj,
            position: first.top + spacing * index,
          }));
        }
      },

      // 重置状态
      reset: () => {
        set({
          selectedObjects: [],
          guides: [],
          guidesVisible: true,
          snapToGuides: true,
          guideSnapThreshold: 5,
          grid: defaultGridConfig,
          alignmentHistory: [],
        });
      },
    }),
    {
      name: 'alignment-store',
    }
  )
);