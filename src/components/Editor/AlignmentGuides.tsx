import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { useAlignmentStore, AlignmentGuide } from '@/stores/alignmentStore';


interface AlignmentGuidesProps {
  canvas: fabric.Canvas;
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({ canvas }) => {
  const {
    guides,
    guidesVisible,
    snapToGuides,

    detectAlignmentGuides,
    snapToAlignment,
    clearGuides,
    addGuide,
  } = useAlignmentStore();

  const guideLinesRef = useRef<fabric.Line[]>([]);
  const isDetectingRef = useRef(false);

  // 创建参考线对象
  const createGuideLine = (guide: AlignmentGuide): fabric.Line => {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    let line: fabric.Line;

    if (guide.type === 'horizontal') {
      // 水平参考线
      line = new fabric.Line([0, guide.position, canvasWidth, guide.position], {
        stroke: '#ff4757',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        opacity: 0.8,
      });
    } else {
      // 垂直参考线
      line = new fabric.Line([guide.position, 0, guide.position, canvasHeight], {
        stroke: '#ff4757',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        opacity: 0.8,
      });
    }

    // 添加自定义属性标识这是参考线
    (line as any).isAlignmentGuide = true;
    (line as any).guideId = guide.id;

    return line;
  };

  // 更新参考线显示
  const updateGuideLines = () => {
    // 清除现有参考线
    guideLinesRef.current.forEach(line => {
      canvas.remove(line);
    });
    guideLinesRef.current = [];

    // 如果参考线不可见，直接返回
    if (!guidesVisible) return;

    // 创建新的参考线
    guides.forEach(guide => {
      if (guide.visible) {
        const line = createGuideLine(guide);
        canvas.add(line);
        guideLinesRef.current.push(line);
      }
    });

    canvas.renderAll();
  };

  // 检测对象移动时的对齐
  const handleObjectMoving = (e: fabric.IEvent) => {
    if (!snapToGuides || isDetectingRef.current) return;

    const movingObject = e.target;
    if (!movingObject || (movingObject as any).isAlignmentGuide) return;

    isDetectingRef.current = true;

    // 获取所有其他对象
    const allObjects = canvas.getObjects().filter(obj => 
      obj !== movingObject && !(obj as any).isAlignmentGuide
    );

    // 检测对齐参考线
    const detectedGuides = detectAlignmentGuides(movingObject, allObjects);

    // 清除旧的参考线
    clearGuides();

    // 添加新检测到的参考线
    detectedGuides.forEach(guide => {
      addGuide(guide);
    });

    // 如果启用了吸附，调整对象位置
    if (detectedGuides.length > 0) {
      const snapPosition = snapToAlignment(movingObject, detectedGuides);
      
      if (snapPosition.x !== undefined) {
        movingObject.set({ left: snapPosition.x });
      }
      if (snapPosition.y !== undefined) {
        movingObject.set({ top: snapPosition.y });
      }
    }

    isDetectingRef.current = false;
  };

  // 对象移动结束时清除参考线
  const handleObjectMoved = () => {
    // 延迟清除参考线，给用户一点时间看到对齐效果
    setTimeout(() => {
      clearGuides();
    }, 500);
  };

  // 选择变化时更新选中对象
  const handleSelectionCreated = (e: fabric.IEvent) => {
    const selected = e.selected || [];
    useAlignmentStore.getState().setSelectedObjects(selected);
  };

  const handleSelectionUpdated = (e: fabric.IEvent) => {
    const selected = e.selected || [];
    useAlignmentStore.getState().setSelectedObjects(selected);
  };

  const handleSelectionCleared = () => {
    useAlignmentStore.getState().setSelectedObjects([]);
    clearGuides();
  };

  // 绑定画布事件
  useEffect(() => {
    if (!canvas) return;

    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:moved', handleObjectMoved);
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('selection:cleared', handleSelectionCleared);

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:moved', handleObjectMoved);
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionUpdated);
      canvas.off('selection:cleared', handleSelectionCleared);
    };
  }, [canvas, snapToGuides, guidesVisible]);

  // 监听参考线变化
  useEffect(() => {
    updateGuideLines();
  }, [guides, guidesVisible]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      guideLinesRef.current.forEach(line => {
        canvas?.remove(line);
      });
      guideLinesRef.current = [];
    };
  }, []);

  return null; // 这个组件不渲染任何 DOM，只处理画布上的参考线
};