import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { 
  Crop, 
  Square, 
  Maximize, 
  Check, 
  X, 
  RotateCcw,
  Move
} from 'lucide-react';
import { useImageProcessorStore } from '@/stores/imageProcessorStore';

interface ImageCropToolProps {
  canvas: fabric.Canvas;
  image: fabric.Image;
  onCropComplete?: (croppedImage: fabric.Image) => void;
  onCancel?: () => void;
}

export const ImageCropTool: React.FC<ImageCropToolProps> = ({
  canvas,
  image,
  onCropComplete,
  onCancel
}) => {
  const {
    cropRect,
    cropPresets,
    setCropRect,
    setCropPreset,
    applyCrop,
    resetCrop,
    isProcessing
  } = useImageProcessorStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cropOverlayRef = useRef<fabric.Rect | null>(null);
  const cropHandlesRef = useRef<fabric.Group | null>(null);

  // 初始化裁剪工具
  useEffect(() => {
    if (!canvas || !image) return;

    initializeCropTool();
    return () => {
      cleanupCropTool();
    };
  }, [canvas, image]);

  // 初始化裁剪工具
  const initializeCropTool = () => {
    // 禁用画布选择
    canvas.selection = false;
    canvas.discardActiveObject();
    
    // 设置初始裁剪区域为图片的完整尺寸
    const imageWidth = (image.width || 0) * (image.scaleX || 1);
    const imageHeight = (image.height || 0) * (image.scaleY || 1);
    const imageLeft = image.left || 0;
    const imageTop = image.top || 0;

    setCropRect({
      x: imageLeft,
      y: imageTop,
      width: imageWidth,
      height: imageHeight
    });

    // 创建裁剪覆盖层
    createCropOverlay();
    
    // 绑定事件
    bindEvents();
  };

  // 创建裁剪覆盖层
  const createCropOverlay = () => {
    // 创建半透明遮罩
    const overlay = new fabric.Rect({
      left: cropRect.x,
      top: cropRect.y,
      width: cropRect.width,
      height: cropRect.height,
      fill: 'transparent',
      stroke: '#007bff',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
    });

    cropOverlayRef.current = overlay;
    canvas.add(overlay);

    // 创建裁剪控制点
    createCropHandles();
    
    canvas.renderAll();
  };

  // 创建裁剪控制点
  const createCropHandles = () => {
    const handleSize = 8;
    const handles: fabric.Object[] = [];

    // 创建8个控制点（四角 + 四边中点）
    const positions = [
      { name: 'tl', x: cropRect.x, y: cropRect.y },
      { name: 'tm', x: cropRect.x + cropRect.width / 2, y: cropRect.y },
      { name: 'tr', x: cropRect.x + cropRect.width, y: cropRect.y },
      { name: 'ml', x: cropRect.x, y: cropRect.y + cropRect.height / 2 },
      { name: 'mr', x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height / 2 },
      { name: 'bl', x: cropRect.x, y: cropRect.y + cropRect.height },
      { name: 'bm', x: cropRect.x + cropRect.width / 2, y: cropRect.y + cropRect.height },
      { name: 'br', x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height },
    ];

    positions.forEach(pos => {
      const handle = new fabric.Rect({
        left: pos.x - handleSize / 2,
        top: pos.y - handleSize / 2,
        width: handleSize,
        height: handleSize,
        fill: '#007bff',
        stroke: '#ffffff',
        strokeWidth: 1,
        selectable: false,
        hoverCursor: getCursorForHandle(pos.name),
        data: { handleType: pos.name }
      });

      handles.push(handle);
    });

    // 创建中心移动区域
    const moveArea = new fabric.Rect({
      left: cropRect.x,
      top: cropRect.y,
      width: cropRect.width,
      height: cropRect.height,
      fill: 'transparent',
      selectable: false,
      hoverCursor: 'move',
      data: { handleType: 'move' }
    });

    handles.push(moveArea);

    const handlesGroup = new fabric.Group(handles, {
      selectable: false,
      evented: true,
    });

    cropHandlesRef.current = handlesGroup;
    canvas.add(handlesGroup);
  };

  // 获取控制点对应的鼠标样式
  const getCursorForHandle = (handleType: string): string => {
    const cursors: Record<string, string> = {
      'tl': 'nw-resize',
      'tm': 'n-resize',
      'tr': 'ne-resize',
      'ml': 'w-resize',
      'mr': 'e-resize',
      'bl': 'sw-resize',
      'bm': 's-resize',
      'br': 'se-resize',
      'move': 'move'
    };
    return cursors[handleType] || 'default';
  };

  // 绑定事件
  const bindEvents = () => {
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
  };

  // 鼠标按下事件
  const handleMouseDown = (e: fabric.IEvent) => {
    const pointer = canvas.getPointer(e.e);
    const target = e.target;

    if (target && target.data && target.data.handleType) {
      setIsDragging(true);
      setDragHandle(target.data.handleType);
      setStartPos({ x: pointer.x, y: pointer.y });
    }
  };

  // 鼠标移动事件
  const handleMouseMove = (e: fabric.IEvent) => {
    if (!isDragging || !dragHandle) return;

    const pointer = canvas.getPointer(e.e);
    const deltaX = pointer.x - startPos.x;
    const deltaY = pointer.y - startPos.y;

    updateCropRect(dragHandle, deltaX, deltaY);
    setStartPos({ x: pointer.x, y: pointer.y });
  };

  // 鼠标释放事件
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragHandle(null);
  };

  // 更新裁剪区域
  const updateCropRect = (handleType: string, deltaX: number, deltaY: number) => {
    const newRect = { ...cropRect };
    const imageLeft = image.left || 0;
    const imageTop = image.top || 0;
    const imageWidth = (image.width || 0) * (image.scaleX || 1);
    const imageHeight = (image.height || 0) * (image.scaleY || 1);

    // 限制裁剪区域在图片范围内
    const constrainToImage = (rect: typeof newRect) => {
      rect.x = Math.max(imageLeft, Math.min(rect.x, imageLeft + imageWidth - rect.width));
      rect.y = Math.max(imageTop, Math.min(rect.y, imageTop + imageHeight - rect.height));
      rect.width = Math.max(10, Math.min(rect.width, imageLeft + imageWidth - rect.x));
      rect.height = Math.max(10, Math.min(rect.height, imageTop + imageHeight - rect.y));
    };

    switch (handleType) {
      case 'move':
        newRect.x += deltaX;
        newRect.y += deltaY;
        break;
      case 'tl':
        newRect.x += deltaX;
        newRect.y += deltaY;
        newRect.width -= deltaX;
        newRect.height -= deltaY;
        break;
      case 'tm':
        newRect.y += deltaY;
        newRect.height -= deltaY;
        break;
      case 'tr':
        newRect.y += deltaY;
        newRect.width += deltaX;
        newRect.height -= deltaY;
        break;
      case 'ml':
        newRect.x += deltaX;
        newRect.width -= deltaX;
        break;
      case 'mr':
        newRect.width += deltaX;
        break;
      case 'bl':
        newRect.x += deltaX;
        newRect.width -= deltaX;
        newRect.height += deltaY;
        break;
      case 'bm':
        newRect.height += deltaY;
        break;
      case 'br':
        newRect.width += deltaX;
        newRect.height += deltaY;
        break;
    }

    // 保持宽高比（如果设置了）
    if (cropRect.aspectRatio && cropRect.aspectRatio > 0) {
      if (handleType.includes('t') || handleType.includes('b')) {
        newRect.width = newRect.height * cropRect.aspectRatio;
      } else if (handleType.includes('l') || handleType.includes('r')) {
        newRect.height = newRect.width / cropRect.aspectRatio;
      }
    }

    constrainToImage(newRect);
    setCropRect(newRect);
    updateCropOverlay(newRect);
  };

  // 更新裁剪覆盖层
  const updateCropOverlay = (rect: typeof cropRect) => {
    if (cropOverlayRef.current) {
      cropOverlayRef.current.set({
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height
      });
    }

    if (cropHandlesRef.current) {
      canvas.remove(cropHandlesRef.current);
      createCropHandles();
    }

    canvas.renderAll();
  };

  // 清理裁剪工具
  const cleanupCropTool = () => {
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);

    if (cropOverlayRef.current) {
      canvas.remove(cropOverlayRef.current);
      cropOverlayRef.current = null;
    }

    if (cropHandlesRef.current) {
      canvas.remove(cropHandlesRef.current);
      cropHandlesRef.current = null;
    }

    canvas.selection = true;
    canvas.renderAll();
  };

  // 应用裁剪
  const handleApplyCrop = async () => {
    try {
      await applyCrop();
      cleanupCropTool();
      onCropComplete?.(image);
    } catch (error) {
      console.error('Failed to apply crop:', error);
    }
  };

  // 取消裁剪
  const handleCancel = () => {
    cleanupCropTool();
    onCancel?.();
  };

  // 重置裁剪区域
  const handleReset = () => {
    resetCrop();
    const imageWidth = (image.width || 0) * (image.scaleX || 1);
    const imageHeight = (image.height || 0) * (image.scaleY || 1);
    const imageLeft = image.left || 0;
    const imageTop = image.top || 0;

    const fullRect = {
      x: imageLeft,
      y: imageTop,
      width: imageWidth,
      height: imageHeight
    };

    setCropRect(fullRect);
    updateCropOverlay(fullRect);
  };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium flex items-center">
          <Crop size={16} className="mr-2" />
          图片裁剪
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="p-1 hover:bg-gray-100 rounded"
            title="重置"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* 裁剪预设 */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">裁剪比例</label>
        <div className="grid grid-cols-4 gap-1">
          {cropPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setCropPreset(preset)}
              className={`p-2 text-xs border rounded hover:bg-gray-50 ${
                cropRect.aspectRatio === preset.aspectRatio 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'border-gray-200'
              }`}
              title={`${preset.name} ${preset.aspectRatio > 0 ? `(${preset.aspectRatio.toFixed(2)})` : ''}`}
            >
              {preset.name === '自由' ? (
                <Maximize size={12} />
              ) : preset.name === '1:1' ? (
                <Square size={12} />
              ) : (
                <div className="w-3 h-2 border border-gray-400 rounded-sm" />
              )}
              <div className="mt-1">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 裁剪区域信息 */}
      <div className="mb-4 text-xs text-gray-600">
        <div>位置: ({Math.round(cropRect.x)}, {Math.round(cropRect.y)})</div>
        <div>尺寸: {Math.round(cropRect.width)} × {Math.round(cropRect.height)}</div>
        {cropRect.aspectRatio && (
          <div>比例: {cropRect.aspectRatio.toFixed(2)}:1</div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleApplyCrop}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <Check size={14} className="mr-1" />
          {isProcessing ? '处理中...' : '应用'}
        </button>
        <button
          onClick={handleCancel}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
        >
          <X size={14} className="mr-1" />
          取消
        </button>
      </div>

      {/* 使用说明 */}
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex items-center mb-1">
          <Move size={12} className="mr-1" />
          拖拽中心区域移动裁剪框
        </div>
        <div>拖拽边角调整大小</div>
      </div>
    </div>
  );
};