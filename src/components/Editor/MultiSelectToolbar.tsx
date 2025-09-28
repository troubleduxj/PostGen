import React, { useState, useEffect } from 'react';
import {
  Group,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowUp,
  Minus,
  ArrowDown,
  Layers
} from 'lucide-react';
import { fabric } from 'fabric';
import { useEditorStore } from '@/stores/editorStore';
import { useLayerManagerStore } from '@/stores/layerManagerStore';

interface MultiSelectToolbarProps {
  selectedObjects: fabric.Object[];
  onClose: () => void;
}

export const MultiSelectToolbar: React.FC<MultiSelectToolbarProps> = ({
  selectedObjects,
  onClose
}) => {
  const { canvas } = useEditorStore();
  const { groupLayers, layers } = useLayerManagerStore();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (canvas && selectedObjects.length > 0) {
      try {
        // 获取当前的活动选择对象
        const activeSelection = canvas.getActiveObject();
        if (activeSelection && activeSelection.type === 'activeSelection') {
          const bounds = activeSelection.getBoundingRect();
          
          // 获取画布元素和容器的位置信息
          const canvasElement = canvas.getElement();
          const canvasRect = canvasElement.getBoundingClientRect();
          
          // 计算画布的缩放和偏移
          const zoom = canvas.getZoom();
          const vpt = canvas.viewportTransform;
          const canvasLeft = vpt ? vpt[4] : 0;
          const canvasTop = vpt ? vpt[5] : 0;
          
          // 计算选中区域在屏幕上的实际位置
          const screenX = canvasRect.left + (bounds.left + canvasLeft) * zoom;
          const screenY = canvasRect.top + (bounds.top + canvasTop) * zoom;
          const screenWidth = bounds.width * zoom;
          
          // 工具栏高度约为50px，确保在选中区域上方显示
          const toolbarHeight = 50;
          let toolbarY = screenY - toolbarHeight - 10;
          
          // 如果工具栏会超出屏幕顶部，则显示在选中区域下方
          if (toolbarY < 10) {
            toolbarY = screenY + bounds.height * zoom + 10;
          }
          
          // 确保工具栏在屏幕范围内
          const toolbarX = Math.max(150, Math.min(window.innerWidth - 150, screenX + screenWidth / 2));
          
          setPosition({
            x: toolbarX,
            y: Math.max(10, Math.min(window.innerHeight - toolbarHeight - 10, toolbarY))
          });
        } else {
          // 如果没有活动选择，使用画布中心
          const canvasElement = canvas.getElement();
          const canvasRect = canvasElement.getBoundingClientRect();
          setPosition({
            x: canvasRect.left + canvasRect.width / 2,
            y: canvasRect.top + 100
          });
        }
      } catch (error) {
        console.warn('Error calculating toolbar position:', error);
        // 使用默认位置
        setPosition({ x: 200, y: 100 });
      }
    }
  }, [selectedObjects, canvas]);

  // 组合选中对象
  const handleGroup = () => {
    if (selectedObjects.length >= 2) {
      const selectedLayerIds = selectedObjects.map(obj => {
        const layer = layers.find(l => l.fabricObject === obj);
        return layer?.id;
      }).filter(Boolean) as string[];

      if (selectedLayerIds.length >= 2) {
        groupLayers(selectedLayerIds, '组合');
        onClose();
      }
    }
  };

  // 复制选中对象
  const handleDuplicate = () => {
    selectedObjects.forEach(obj => {
      obj.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (cloned.left || 0) + 20,
          top: (cloned.top || 0) + 20,
        });
        canvas?.add(cloned);
      });
    });
    canvas?.renderAll();
  };

  // 删除选中对象
  const handleDelete = () => {
    if (window.confirm(`确定要删除选中的 ${selectedObjects.length} 个对象吗？`)) {
      selectedObjects.forEach(obj => {
        canvas?.remove(obj);
      });
      canvas?.renderAll();
      onClose();
    }
  };

  // 对齐操作
  const handleAlign = (type: string) => {
    if (!canvas || selectedObjects.length < 2) return;

    // 计算选中对象的边界
    let minLeft = Infinity, maxRight = -Infinity;
    let minTop = Infinity, maxBottom = -Infinity;

    // 首先计算所有对象的边界
    selectedObjects.forEach(obj => {
      const objLeft = obj.left || 0;
      const objTop = obj.top || 0;
      const objWidth = (obj.width || 0) * (obj.scaleX || 1);
      const objHeight = (obj.height || 0) * (obj.scaleY || 1);

      minLeft = Math.min(minLeft, objLeft);
      maxRight = Math.max(maxRight, objLeft + objWidth);
      minTop = Math.min(minTop, objTop);
      maxBottom = Math.max(maxBottom, objTop + objHeight);
    });

    // 对每个对象进行对齐
    selectedObjects.forEach(obj => {
      const objWidth = (obj.width || 0) * (obj.scaleX || 1);
      const objHeight = (obj.height || 0) * (obj.scaleY || 1);

      switch (type) {
        case 'left':
          obj.set({ left: minLeft });
          break;
        case 'center':
          obj.set({ left: (minLeft + maxRight) / 2 - objWidth / 2 });
          break;
        case 'right':
          obj.set({ left: maxRight - objWidth });
          break;
        case 'top':
          obj.set({ top: minTop });
          break;
        case 'middle':
          obj.set({ top: (minTop + maxBottom) / 2 - objHeight / 2 });
          break;
        case 'bottom':
          obj.set({ top: maxBottom - objHeight });
          break;
      }

      obj.setCoords();
    });

    canvas.renderAll();
  };

  // 分布对象
  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    if (selectedObjects.length < 3) return;

    // 按位置排序对象
    const sorted = [...selectedObjects].sort((a, b) => {
      if (direction === 'horizontal') {
        return (a.left || 0) - (b.left || 0);
      } else {
        return (a.top || 0) - (b.top || 0);
      }
    });

    // 计算第一个和最后一个对象的位置
    const firstObj = sorted[0];
    const lastObj = sorted[sorted.length - 1];

    const firstPos = direction === 'horizontal' ? (firstObj.left || 0) : (firstObj.top || 0);
    const lastPos = direction === 'horizontal' ? (lastObj.left || 0) : (lastObj.top || 0);
    const lastSize = direction === 'horizontal' 
      ? ((lastObj.width || 0) * (lastObj.scaleX || 1))
      : ((lastObj.height || 0) * (lastObj.scaleY || 1));

    const totalSpace = (lastPos + lastSize) - firstPos;

    // 计算所有对象的总尺寸
    const objectsSpace = sorted.reduce((sum, obj) => {
      const size = direction === 'horizontal' 
        ? ((obj.width || 0) * (obj.scaleX || 1))
        : ((obj.height || 0) * (obj.scaleY || 1));
      return sum + size;
    }, 0);

    // 计算间隔
    const gap = (totalSpace - objectsSpace) / (sorted.length - 1);

    // 分布对象
    let currentPos = firstPos;

    sorted.forEach((obj, index) => {
      if (index === 0) return; // 跳过第一个对象

      const objSize = direction === 'horizontal' 
        ? ((obj.width || 0) * (obj.scaleX || 1))
        : ((obj.height || 0) * (obj.scaleY || 1));

      if (direction === 'horizontal') {
        obj.set({ left: currentPos });
        currentPos += objSize + gap;
      } else {
        obj.set({ top: currentPos });
        currentPos += objSize + gap;
      }

      obj.setCoords();
    });

    canvas?.renderAll();
  };

  if (selectedObjects.length < 2) return null;

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-2 flex items-center gap-1 z-50 backdrop-blur-sm"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)',
        minWidth: '300px'
      }}
    >
      {/* 组合按钮 */}
      <button
        onClick={handleGroup}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
        title="组合选中对象 (Ctrl+G)"
      >
        <Group size={16} />
      </button>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* 对齐按钮 */}
      <button
        onClick={() => handleAlign('left')}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
        title="左对齐"
      >
        <AlignLeft size={16} />
      </button>

      <button
        onClick={() => handleAlign('center')}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
        title="水平居中"
      >
        <AlignCenter size={16} />
      </button>

      <button
        onClick={() => handleAlign('right')}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
        title="右对齐"
      >
        <AlignRight size={16} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        onClick={() => handleAlign('top')}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
        title="顶部对齐"
      >
        <ArrowUp size={16} />
      </button>

      <button
        onClick={() => handleAlign('middle')}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
        title="垂直居中"
      >
        <Minus size={16} />
      </button>

      <button
        onClick={() => handleAlign('bottom')}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
        title="底部对齐"
      >
        <ArrowDown size={16} />
      </button>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* 分布按钮 */}
      <button
        onClick={() => handleDistribute('horizontal')}
        className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
          selectedObjects.length < 3 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'hover:bg-gray-100'
        }`}
        title="水平分布"
        disabled={selectedObjects.length < 3}
      >
        <AlignJustify size={16} />
      </button>

      <button
        onClick={() => handleDistribute('vertical')}
        className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
          selectedObjects.length < 3 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'hover:bg-gray-100'
        }`}
        title="垂直分布"
        disabled={selectedObjects.length < 3}
      >
        <Layers size={16} />
      </button>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* 复制按钮 */}
      <button
        onClick={handleDuplicate}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
        title="复制选中对象"
      >
        <Copy size={16} />
      </button>

      {/* 删除按钮 */}
      <button
        onClick={handleDelete}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-red-100 text-red-600 transition-colors"
        title="删除选中对象"
      >
        <Trash2 size={16} />
      </button>

      {/* 选中对象数量显示 */}
      <div className="ml-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
        {selectedObjects.length} 个对象
      </div>
    </div>
  );
};