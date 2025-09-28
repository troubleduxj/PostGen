import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { 
  Crop, 
  Sliders, 
  RotateCw, 
  Check, 
  X, 
  Eye,
  EyeOff,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { useImageProcessorStore } from '@/stores/imageProcessorStore';
import { ImageCropTool } from './ImageCropTool';
import { ImageFiltersPanel } from './ImageFiltersPanel';
import { ImageAdjustmentTools } from './ImageAdjustmentTools';
import { SimpleProgressIndicator } from './ImageProcessingProgress';
import { imageOptimizer } from '@/utils/imageProcessingOptimizer';

interface ImageEditingToolbarProps {
  canvas: fabric.Canvas;
  image: fabric.Image;
  onEditComplete?: (editedImage: fabric.Image) => void;
  onCancel?: () => void;
}

type EditMode = 'none' | 'crop' | 'filters' | 'adjustments';

export const ImageEditingToolbar: React.FC<ImageEditingToolbarProps> = ({
  canvas,
  image,
  onEditComplete,
  onCancel
}) => {
  const {
    isEditing,
    editMode,
    isProcessing,
    processingProgress,
    enterEditMode,
    exitEditMode,
    setEditMode,
    applyAllChanges,
    resetToOriginal,
    exportProcessedImage
  } = useImageProcessorStore();

  const [activeMode, setActiveMode] = useState<EditMode>('none');
  const [showPreview, setShowPreview] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // 初始化编辑模式
  useEffect(() => {
    if (!isEditing) {
      enterEditMode(image, 'crop');
    }
    return () => {
      if (isEditing) {
        exitEditMode();
      }
    };
  }, []);

  // 监听变化
  useEffect(() => {
    // 检查是否有未保存的更改
    // 这里应该根据实际的状态来判断
    setHasChanges(activeMode !== 'none');
  }, [activeMode]);

  // 切换编辑模式
  const handleModeChange = (mode: EditMode) => {
    setActiveMode(mode);
    setEditMode(mode);
  };

  // 应用所有更改
  const handleApplyChanges = async () => {
    try {
      await applyAllChanges();
      onEditComplete?.(image);
    } catch (error) {
      console.error('Failed to apply changes:', error);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    exitEditMode();
    onCancel?.();
  };

  // 重置到原始状态
  const handleReset = () => {
    resetToOriginal();
    setActiveMode('none');
    setHasChanges(false);
  };

  // 导出图片
  const handleExport = async () => {
    try {
      const dataURL = await exportProcessedImage('png', 1);
      
      // 创建下载链接
      const link = document.createElement('a');
      link.download = `edited-image-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
    }
  };

  // 工具按钮配置
  const toolButtons = [
    {
      id: 'crop',
      label: '裁剪',
      icon: Crop,
      mode: 'crop' as EditMode,
      tooltip: '裁剪图片'
    },
    {
      id: 'filters',
      label: '滤镜',
      icon: Sliders,
      mode: 'filters' as EditMode,
      tooltip: '应用滤镜效果'
    },
    {
      id: 'adjustments',
      label: '调整',
      icon: RotateCw,
      mode: 'adjustments' as EditMode,
      tooltip: '调整图片属性'
    }
  ];

  return (
    <>
      {/* 主工具栏 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 z-40">
        <div className="flex items-center space-x-2">
          {/* 工具按钮 */}
          {toolButtons.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => handleModeChange(tool.mode)}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                  activeMode === tool.mode
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'hover:bg-gray-100'
                }`}
                title={tool.tooltip}
              >
                <IconComponent size={20} />
                <span className="text-xs mt-1">{tool.label}</span>
              </button>
            );
          })}

          {/* 分隔线 */}
          <div className="w-px h-8 bg-gray-300" />

          {/* 预览切换 */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-gray-100"
            title={showPreview ? '隐藏预览' : '显示预览'}
          >
            {showPreview ? <Eye size={20} /> : <EyeOff size={20} />}
            <span className="text-xs mt-1">预览</span>
          </button>

          {/* 设置 */}
          <button
            className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-gray-100"
            title="设置"
          >
            <Settings size={20} />
            <span className="text-xs mt-1">设置</span>
          </button>

          {/* 分隔线 */}
          <div className="w-px h-8 bg-gray-300" />

          {/* 重置 */}
          <button
            onClick={handleReset}
            className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-gray-100 text-orange-600"
            title="重置所有更改"
          >
            <RefreshCw size={20} />
            <span className="text-xs mt-1">重置</span>
          </button>

          {/* 导出 */}
          <button
            onClick={handleExport}
            className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-gray-100 text-green-600"
            title="导出图片"
          >
            <Download size={20} />
            <span className="text-xs mt-1">导出</span>
          </button>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-3 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCancel}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <X size={16} className="mr-2" />
            取消
          </button>
          
          <button
            onClick={handleApplyChanges}
            disabled={!hasChanges || isProcessing}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check size={16} className="mr-2" />
            {isProcessing ? '处理中...' : '应用更改'}
          </button>
        </div>
        
        {hasChanges && (
          <div className="text-xs text-gray-500 text-center mt-2">
            有未保存的更改
          </div>
        )}
      </div>

      {/* 编辑面板 */}
      {activeMode === 'crop' && (
        <ImageCropTool
          canvas={canvas}
          image={image}
          onCropComplete={(croppedImage) => {
            setActiveMode('none');
            setHasChanges(true);
          }}
          onCancel={() => setActiveMode('none')}
        />
      )}

      {activeMode === 'filters' && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg border max-w-xs z-40">
          <ImageFiltersPanel
            canvas={canvas}
            image={image}
            onFiltersChange={() => setHasChanges(true)}
          />
        </div>
      )}

      {activeMode === 'adjustments' && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg border max-w-xs z-40">
          <ImageAdjustmentTools
            canvas={canvas}
            image={image}
            onAdjustmentChange={() => setHasChanges(true)}
          />
        </div>
      )}

      {/* 进度指示器 */}
      <SimpleProgressIndicator
        progress={processingProgress}
        message="正在处理图片..."
        visible={isProcessing}
      />

      {/* 键盘快捷键提示 */}
      <div className="absolute bottom-20 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-30">
        <div className="space-y-1">
          <div><kbd className="bg-gray-700 px-1 rounded">C</kbd> 裁剪</div>
          <div><kbd className="bg-gray-700 px-1 rounded">F</kbd> 滤镜</div>
          <div><kbd className="bg-gray-700 px-1 rounded">A</kbd> 调整</div>
          <div><kbd className="bg-gray-700 px-1 rounded">Enter</kbd> 应用</div>
          <div><kbd className="bg-gray-700 px-1 rounded">Esc</kbd> 取消</div>
        </div>
      </div>
    </>
  );
};

// 图片编辑入口组件
export const ImageEditor: React.FC<{
  canvas: fabric.Canvas;
  onEditComplete?: (editedImage: fabric.Image) => void;
}> = ({ canvas, onEditComplete }) => {
  const [editingImage, setEditingImage] = useState<fabric.Image | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // 监听图片双击事件
  useEffect(() => {
    const handleObjectDoubleClick = (e: fabric.IEvent) => {
      const target = e.target;
      if (target && target.type === 'image') {
        setEditingImage(target as fabric.Image);
        setShowEditor(true);
      }
    };

    canvas.on('mouse:dblclick', handleObjectDoubleClick);

    return () => {
      canvas.off('mouse:dblclick', handleObjectDoubleClick);
    };
  }, [canvas]);

  // 处理编辑完成
  const handleEditComplete = (editedImage: fabric.Image) => {
    setShowEditor(false);
    setEditingImage(null);
    onEditComplete?.(editedImage);
  };

  // 处理取消编辑
  const handleCancel = () => {
    setShowEditor(false);
    setEditingImage(null);
  };

  if (!showEditor || !editingImage) {
    return null;
  }

  return (
    <ImageEditingToolbar
      canvas={canvas}
      image={editingImage}
      onEditComplete={handleEditComplete}
      onCancel={handleCancel}
    />
  );
};