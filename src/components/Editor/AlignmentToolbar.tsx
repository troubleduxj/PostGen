import React from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  ArrowRightLeft,
  ArrowUpDown,
  Grid3X3,
  Magnet,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAlignmentStore } from '@/stores/alignmentStore';
import { useEditorStore } from '@/stores/editorStore';

interface AlignmentToolbarProps {
  className?: string;
}

export const AlignmentToolbar: React.FC<AlignmentToolbarProps> = ({ className = '' }) => {
  const {
    selectedObjects,
    alignLeft,
    alignCenter,
    alignRight,
    alignTop,
    alignMiddle,
    alignBottom,
    distributeHorizontally,
    distributeVertically,
    grid,
    guidesVisible,
    snapToGuides,
    toggleGrid,
    setSnapToGrid,
    toggleGuidesVisibility,
    setSnapToGuides,
  } = useAlignmentStore();

  const { canvas } = useEditorStore();

  // 检查是否有足够的对象进行对齐操作
  const canAlign = selectedObjects.length >= 2;
  const canDistribute = selectedObjects.length >= 3;

  // 处理对齐操作
  const handleAlign = (alignType: string) => {
    if (!canAlign || !canvas) return;

    switch (alignType) {
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

    // 重新渲染画布
    canvas.renderAll();
  };

  // 处理分布操作
  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    if (!canDistribute || !canvas) return;

    if (direction === 'horizontal') {
      distributeHorizontally();
    } else {
      distributeVertically();
    }

    // 重新渲染画布
    canvas.renderAll();
  };

  // 切换网格显示
  const handleToggleGrid = () => {
    toggleGrid();
    if (canvas) {
      canvas.renderAll();
    }
  };

  // 切换网格吸附
  const handleToggleSnapToGrid = () => {
    setSnapToGrid(!grid.snapEnabled);
  };

  // 切换参考线显示
  const handleToggleGuides = () => {
    toggleGuidesVisibility();
    if (canvas) {
      canvas.renderAll();
    }
  };

  // 切换参考线吸附
  const handleToggleSnapToGuides = () => {
    setSnapToGuides(!snapToGuides);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-2 flex items-center gap-1 ${className}`}>
      {/* 水平对齐 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleAlign('left')}
          disabled={!canAlign}
          className="toolbar-btn disabled:opacity-50 disabled:cursor-not-allowed"
          title="左对齐"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => handleAlign('center')}
          disabled={!canAlign}
          className="toolbar-btn disabled:opacity-50 disabled:cursor-not-allowed"
          title="水平居中对齐"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => handleAlign('right')}
          disabled={!canAlign}
          className="toolbar-btn disabled:opacity-50 disabled:cursor-not-allowed"
          title="右对齐"
        >
          <AlignRight size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* 垂直对齐 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleAlign('top')}
          disabled={!canAlign}
          className="toolbar-btn disabled:opacity-50 disabled:cursor-not-allowed"
          title="顶部对齐"
        >
          <AlignVerticalJustifyStart size={16} />
        </button>
        <button
          onClick={() => handleAlign('middle')}
          disabled={!canAlign}
          className="toolbar-btn disabled:opacity-50 disabled:cursor-not-allowed"
          title="垂直居中对齐"
        >
          <AlignVerticalJustifyCenter size={16} />
        </button>
        <button
          onClick={() => handleAlign('bottom')}
          disabled={!canAlign}
          className="toolbar-btn disabled:opacity-50 disabled:cursor-not-allowed"
          title="底部对齐"
        >
          <AlignVerticalJustifyEnd size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* 分布 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleDistribute('horizontal')}
          disabled={!canDistribute}
          className="toolbar-btn disabled:opacity-50 disabled:cursor-not-allowed"
          title="水平分布"
        >
          <ArrowRightLeft size={16} />
        </button>
        <button
          onClick={() => handleDistribute('vertical')}
          disabled={!canDistribute}
          className="toolbar-btn disabled:opacity-50 disabled:cursor-not-allowed"
          title="垂直分布"
        >
          <ArrowUpDown size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* 网格控制 */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleToggleGrid}
          className={`toolbar-btn ${grid.visible ? 'active' : ''}`}
          title="显示/隐藏网格"
        >
          <Grid3X3 size={16} />
        </button>
        <button
          onClick={handleToggleSnapToGrid}
          className={`toolbar-btn ${grid.snapEnabled ? 'active' : ''}`}
          title="网格吸附"
        >
          <Magnet size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* 参考线控制 */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleToggleGuides}
          className={`toolbar-btn ${guidesVisible ? 'active' : ''}`}
          title="显示/隐藏参考线"
        >
          {guidesVisible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button
          onClick={handleToggleSnapToGuides}
          className={`toolbar-btn ${snapToGuides ? 'active' : ''}`}
          title="参考线吸附"
        >
          <Magnet size={16} className={snapToGuides ? 'text-blue-600' : ''} />
        </button>
      </div>

      {/* 状态指示 */}
      {selectedObjects.length > 0 && (
        <div className="ml-2 text-xs text-gray-500">
          已选择 {selectedObjects.length} 个对象
        </div>
      )}
    </div>
  );
};