import { useCallback } from 'react';
import { fabric } from 'fabric';
import { useAlignmentStore } from '@/stores/alignmentStore';
import { useEditorStore } from '@/stores/editorStore';
import {
  detectAlignment,
  detectCanvasAlignment,
  calculateSnapPosition,
  getObjectBounds,
} from '@/utils/alignmentUtils';
import {
  snapObjectToGrid,

  getGridStats,
} from '@/utils/gridUtils';

export const useAlignment = () => {
  const {
    selectedObjects,
    guides,
    guidesVisible,
    snapToGuides,
    guideSnapThreshold,
    grid,
    setSelectedObjects,
    alignLeft,
    alignCenter,
    alignRight,
    alignTop,
    alignMiddle,
    alignBottom,
    distributeHorizontally,
    distributeVertically,
    addGuide,
    clearGuides,
  } = useAlignmentStore();

  const { canvas } = useEditorStore();

  // 处理选择变化
  const handleSelectionChange = useCallback((objects: fabric.Object[]) => {
    setSelectedObjects(objects);
  }, [setSelectedObjects]);

  // 执行对齐操作
  const performAlignment = useCallback((type: string) => {
    if (!canvas || selectedObjects.length < 2) return;

    switch (type) {
      case 'left':
        alignLeft();
        break;
      case 'center':
        alignCenter();
        break;
      case 'right':
        alignRight();
        break;
      case 'top':
        alignTop();
        break;
      case 'middle':
        alignMiddle();
        break;
      case 'bottom':
        alignBottom();
        break;
    }

    canvas.renderAll();
  }, [canvas, selectedObjects, alignLeft, alignCenter, alignRight, alignTop, alignMiddle, alignBottom]);

  // 执行分布操作
  const performDistribution = useCallback((direction: 'horizontal' | 'vertical') => {
    if (!canvas || selectedObjects.length < 3) return;

    if (direction === 'horizontal') {
      distributeHorizontally();
    } else {
      distributeVertically();
    }

    canvas.renderAll();
  }, [canvas, selectedObjects, distributeHorizontally, distributeVertically]);

  // 智能对齐检测
  const detectSmartAlignment = useCallback((movingObject: fabric.Object) => {
    if (!canvas || !snapToGuides) return [];

    const allObjects = canvas.getObjects().filter(obj => 
      obj !== movingObject && 
      !(obj as any).isGrid && 
      !(obj as any).isAlignmentGuide
    );

    // 检测与其他对象的对齐
    const objectGuides = allObjects.flatMap(obj => 
      detectAlignment(movingObject, obj, guideSnapThreshold)
    );

    // 检测与画布的对齐
    const canvasGuides = detectCanvasAlignment(movingObject, canvas, guideSnapThreshold);

    return [...objectGuides, ...canvasGuides];
  }, [canvas, snapToGuides, guideSnapThreshold]);

  // 应用智能吸附
  const applySmartSnap = useCallback((object: fabric.Object) => {
    if (!canvas) return;

    let snapApplied = false;
    const snapPosition: { left?: number; top?: number } = {};

    // 网格吸附
    if (grid.snapEnabled) {
      const gridSnap = snapObjectToGrid(object, grid.size, grid.snapThreshold);
      if (gridSnap.left !== undefined || gridSnap.top !== undefined) {
        Object.assign(snapPosition, gridSnap);
        snapApplied = true;
      }
    }

    // 参考线吸附（优先级更高）
    if (snapToGuides) {
      const detectedGuides = detectSmartAlignment(object);
      if (detectedGuides.length > 0) {
        const guideSnap = calculateSnapPosition(object, detectedGuides);
        Object.assign(snapPosition, guideSnap);
        snapApplied = true;

        // 更新参考线显示
        clearGuides();
        detectedGuides.forEach(guide => addGuide(guide));
      }
    }

    // 应用吸附位置
    if (snapApplied) {
      object.set(snapPosition);
    }

    return snapApplied;
  }, [canvas, grid, snapToGuides, detectSmartAlignment, clearGuides, addGuide]);

  // 获取对齐状态
  const getAlignmentStatus = useCallback(() => {
    if (!canvas) return null;

    const allObjects = canvas.getObjects().filter(obj => 
      !(obj as any).isGrid && !(obj as any).isAlignmentGuide
    );

    const gridStats = getGridStats(allObjects, grid.size);
    
    return {
      selectedCount: selectedObjects.length,
      totalObjects: allObjects.length,
      canAlign: selectedObjects.length >= 2,
      canDistribute: selectedObjects.length >= 3,
      gridAlignment: gridStats,
      guidesActive: guides.length > 0,
    };
  }, [canvas, selectedObjects, grid.size, guides]);

  // 快速对齐到画布中心
  const alignToCanvasCenter = useCallback(() => {
    if (!canvas || selectedObjects.length === 0) return;

    const canvasCenter = {
      x: canvas.getWidth() / 2,
      y: canvas.getHeight() / 2,
    };

    selectedObjects.forEach(obj => {
      const bounds = getObjectBounds(obj);
      obj.set({
        left: canvasCenter.x - bounds.width / 2,
        top: canvasCenter.y - bounds.height / 2,
      });
    });

    canvas.renderAll();
  }, [canvas, selectedObjects]);

  // 均匀分布到画布
  const distributeToCanvas = useCallback((direction: 'horizontal' | 'vertical') => {
    if (!canvas || selectedObjects.length < 2) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const margin = 20; // 边距

    if (direction === 'horizontal') {
      const availableWidth = canvasWidth - 2 * margin;
      const spacing = availableWidth / (selectedObjects.length - 1);

      selectedObjects
        .sort((a, b) => (a.left || 0) - (b.left || 0))
        .forEach((obj, index) => {
          obj.set({ left: margin + spacing * index });
        });
    } else {
      const availableHeight = canvasHeight - 2 * margin;
      const spacing = availableHeight / (selectedObjects.length - 1);

      selectedObjects
        .sort((a, b) => (a.top || 0) - (b.top || 0))
        .forEach((obj, index) => {
          obj.set({ top: margin + spacing * index });
        });
    }

    canvas.renderAll();
  }, [canvas, selectedObjects]);

  // 自动整理对象
  const autoArrange = useCallback((type: 'grid' | 'row' | 'column') => {
    if (!canvas || selectedObjects.length < 2) return;

    const bounds = selectedObjects.map(obj => ({
      obj,
      bounds: getObjectBounds(obj),
    }));

    switch (type) {
      case 'grid': {
        const cols = Math.ceil(Math.sqrt(selectedObjects.length));
        const spacing = grid.size * 2;
        
        bounds.forEach(({ obj }, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          
          obj.set({
            left: col * spacing,
            top: row * spacing,
          });
        });
        break;
      }
      
      case 'row': {
        const spacing = grid.size * 2;
        bounds
          .sort((a, b) => a.bounds.left - b.bounds.left)
          .forEach(({ obj }, index) => {
            obj.set({ left: index * spacing });
          });
        break;
      }
      
      case 'column': {
        const spacing = grid.size * 2;
        bounds
          .sort((a, b) => a.bounds.top - b.bounds.top)
          .forEach(({ obj }, index) => {
            obj.set({ top: index * spacing });
          });
        break;
      }
    }

    canvas.renderAll();
  }, [canvas, selectedObjects, grid.size]);

  return {
    // 状态
    selectedObjects,
    guides,
    guidesVisible,
    snapToGuides,
    grid,
    
    // 基础对齐操作
    performAlignment,
    performDistribution,
    
    // 智能对齐
    detectSmartAlignment,
    applySmartSnap,
    
    // 高级对齐功能
    alignToCanvasCenter,
    distributeToCanvas,
    autoArrange,
    
    // 状态查询
    getAlignmentStatus,
    
    // 事件处理
    handleSelectionChange,
  };
};