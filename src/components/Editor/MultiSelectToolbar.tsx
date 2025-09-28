import React, { useState, useEffect } from 'react';
import {
  Group,
  Ungroup,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignTop,
  AlignMiddle,
  AlignBottom,
  Layers,
  Move,
  RotateCw
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
  const { groupLayers, ungroupLayer, layers } = useLayerManagerStore();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (canvas && selectedObjects.length > 0) {
      // 计算选中对象的边界框
      const group = new fabric.Group(selectedObjects);
      const bounds = group.getBoundingRect();
      
      // 设置工具栏位置在选中区域上方
      setPosition({
        x: bounds.left + bounds.width / 2,
        y: bounds.top - 50
      });
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

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    // 计算选中对象的边界
    let minLeft = Infinity, maxRight = -Infinity;
    let minTop = Infinity, maxBottom = -Infinity;
    
    selectedObjects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      minLeft = Math.min(minLeft, bounds.left);
      maxRight = Math.max(maxRight, bounds.left + bounds.width);
      minTop = Math.min(minTop, bounds.top);
      maxBottom = Math.max(maxBottom, bounds.top + bounds.height);
    });

    selectedObjects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      
      switch (type) {
        case 'left':
          obj.set({ left: minLeft });
          break;
        case 'center':
          obj.set({ left: (minLeft + maxRight) / 2 - bounds.width / 2 });
          break;
        case 'right':
          obj.set({ left: maxRight - bounds.width });
          break;
        case 'top':
          obj.set({ top: minTop });
          break;
        case 'middle':
          obj.set({ top: (minTop + maxBottom) / 2 - bounds.height / 2 });
          break;
        case 'bottom':
          obj.set({ top: maxBottom - bounds.height });
          break;
      }
      
      obj.setCoords();
    });
    
    canvas.renderAll();
  };

  // 分布对象
  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    if (selectedObjects.length < 3) return;

    const sorted = [...selectedObjects].sort((a, b) => {
      const boundsA = a.getBoundingRect();
      const boundsB = b.getBoundingRect();
      
      if (direction === 'horizontal') {
        return boundsA.left - boundsB.left;
      } else {
        return boundsA.top - boundsB.top;
      }
    });

    const first = sorted[0].getBoundingRect();
    const last = sorted[sorted.length - 1].getBoundingRect();
    
    const totalSpace = direction === 'horizontal' 
      ? (last.left + last.width) - first.left
      : (last.top + last.height) - first.top;
    
    const objectsSpace = sorted.reduce((sum, obj) => {
      const bounds = obj.getBoundingRect();
      return sum + (direction === 'horizontal' ? bounds.width : bounds.height);
    }, 0);
    
    const gap = (totalSpace - objectsSpace) / (sorted.length - 1);
    
    let currentPos = direction === 'horizontal' ? first.left : first.top;
    
    sorted.forEach((obj, index) => {
      if (index === 0) return; // 跳过第一个对象
      
      if (direction === 'horizontal') {
        obj.set({ left: currentPos });
        currentPos += obj.getBoundingRect().width + gap;
      } else {
        obj.set({ top: currentPos });
        currentPos += obj.getBoundingRect().height + gap;
      }
      
      obj.setCoords();
    });
    
    canvas?.renderAll();
  };

  if (selectedObjects.length < 2) return null;

  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-1 z-50"
      style={{
        left: position.x - 150, // 居中显示
        top: Math.max(10, position.y), // 确保不超出顶部
        transform: 'translateX(-50%)'
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
        <AlignTop size={16} />
      </button>
      
      <button
        onClick={() => handleAlign('middle')}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
        title="垂直居中"
      >
        <AlignMiddle size={16} />
      </button>
      
      <button
        onClick={() => handleAlign('bottom')}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
        title="底部对齐"
      >
        <AlignBottom size={16} />
      </button>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* 分布按钮 */}
      <button
        onClick={() => handleDistribute('horizontal')}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
        title="水平分布"
        disabled={selectedObjects.length < 3}
      >
        <AlignJustify size={16} />
      </button>
      
      <button
        onClick={() => handleDistribute('vertical')}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
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