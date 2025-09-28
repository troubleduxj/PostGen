import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Palette, 
  Grid, 
  Ruler,
  Eye,
  EyeOff,
  RotateCw,
  Maximize
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

interface CanvasPropertyPanelProps {
  className?: string;
}

export const CanvasPropertyPanel: React.FC<CanvasPropertyPanelProps> = ({ className = '' }) => {
  const { canvas, canvasState, updateCanvasState } = useEditorStore();
  const [localState, setLocalState] = useState({
    width: canvasState.width,
    height: canvasState.height,
    backgroundColor: canvasState.backgroundColor,
    zoom: Math.round(canvasState.zoom * 100),
    gridVisible: canvasState.gridVisible,
    snapToGrid: canvasState.snapToGrid,
    gridSize: canvasState.gridSize,
  });

  // 预设画布尺寸
  const canvasPresets = [
    { name: 'A4 竖版', width: 595, height: 842, icon: '📄' },
    { name: 'A4 横版', width: 842, height: 595, icon: '📄' },
    { name: 'Instagram 正方形', width: 1080, height: 1080, icon: '📱' },
    { name: 'Instagram 故事', width: 1080, height: 1920, icon: '📱' },
    { name: 'Facebook 封面', width: 1200, height: 630, icon: '📘' },
    { name: '微信朋友圈', width: 1080, height: 1260, icon: '💬' },
    { name: '海报 A3', width: 842, height: 1191, icon: '🎨' },
    { name: '名片', width: 354, height: 212, icon: '💳' },
    { name: '横幅广告', width: 1200, height: 300, icon: '🏷️' },
    { name: '自定义', width: 800, height: 600, icon: '⚙️' },
  ];

  // 背景颜色预设
  const backgroundPresets = [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da',
    '#000000', '#212529', '#343a40', '#495057', '#6c757d',
    '#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545',
    '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8',
  ];

  useEffect(() => {
    setLocalState({
      width: canvasState.width,
      height: canvasState.height,
      backgroundColor: canvasState.backgroundColor,
      zoom: Math.round(canvasState.zoom * 100),
      gridVisible: canvasState.gridVisible,
      snapToGrid: canvasState.snapToGrid,
      gridSize: canvasState.gridSize,
    });
  }, [canvasState]);

  const handleCanvasUpdate = (updates: Partial<typeof localState>) => {
    const newState = { ...localState, ...updates };
    setLocalState(newState);

    // 转换并更新画布状态
    const canvasUpdates: any = {};
    
    if (updates.width !== undefined) canvasUpdates.width = updates.width;
    if (updates.height !== undefined) canvasUpdates.height = updates.height;
    if (updates.backgroundColor !== undefined) canvasUpdates.backgroundColor = updates.backgroundColor;
    if (updates.zoom !== undefined) canvasUpdates.zoom = updates.zoom / 100;
    if (updates.gridVisible !== undefined) canvasUpdates.gridVisible = updates.gridVisible;
    if (updates.snapToGrid !== undefined) canvasUpdates.snapToGrid = updates.snapToGrid;
    if (updates.gridSize !== undefined) canvasUpdates.gridSize = updates.gridSize;

    updateCanvasState(canvasUpdates);
  };

  const applyPreset = (preset: typeof canvasPresets[0]) => {
    if (preset.name === '自定义') return;
    
    handleCanvasUpdate({
      width: preset.width,
      height: preset.height,
    });
  };

  const resetCanvas = () => {
    if (window.confirm('确定要重置画布设置吗？这将清除所有内容。')) {
      if (canvas) {
        canvas.clear();
        canvas.renderAll();
      }
      handleCanvasUpdate({
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        zoom: 100,
        gridVisible: false,
        snapToGrid: false,
        gridSize: 20,
      });
    }
  };

  const exportCanvas = () => {
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    
    const link = document.createElement('a');
    link.download = `poster-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className={`space-y-0 ${className}`}>
      {/* 画布信息 */}
      <div className="property-group">
        <h3 className="property-label flex items-center">
          <Monitor size={16} className="mr-2" />
          画布信息
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">宽度 (px)</label>
              <input
                type="number"
                value={localState.width}
                onChange={(e) => handleCanvasUpdate({ width: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                min="100"
                max="5000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">高度 (px)</label>
              <input
                type="number"
                value={localState.height}
                onChange={(e) => handleCanvasUpdate({ height: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                min="100"
                max="5000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">缩放比例</label>
            <input
              type="range"
              min="10"
              max="500"
              value={localState.zoom}
              onChange={(e) => handleCanvasUpdate({ zoom: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">{localState.zoom}%</div>
          </div>
        </div>
      </div>

      {/* 画布预设 */}
      <div className="property-group">
        <h3 className="property-label flex items-center">
          <Maximize size={16} className="mr-2" />
          画布预设
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {canvasPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="flex items-center justify-between p-2 text-sm border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center">
                <span className="mr-2">{preset.icon}</span>
                <span>{preset.name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {preset.width} × {preset.height}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 背景设置 */}
      <div className="property-group">
        <h3 className="property-label flex items-center">
          <Palette size={16} className="mr-2" />
          背景设置
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-2">背景颜色</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={localState.backgroundColor}
                onChange={(e) => handleCanvasUpdate({ backgroundColor: e.target.value })}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={localState.backgroundColor}
                onChange={(e) => handleCanvasUpdate({ backgroundColor: e.target.value })}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded font-mono"
                placeholder="#ffffff"
              />
            </div>
            
            {/* 颜色预设 */}
            <div className="grid grid-cols-10 gap-1">
              {backgroundPresets.map((color) => (
                <button
                  key={color}
                  onClick={() => handleCanvasUpdate({ backgroundColor: color })}
                  className={`w-6 h-6 rounded border-2 ${
                    localState.backgroundColor === color 
                      ? 'border-blue-500' 
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 网格设置 */}
      <div className="property-group">
        <h3 className="property-label flex items-center">
          <Grid size={16} className="mr-2" />
          网格设置
        </h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localState.gridVisible}
              onChange={(e) => handleCanvasUpdate({ gridVisible: e.target.checked })}
              className="mr-2"
            />
            {localState.gridVisible ? <Eye size={16} className="mr-2" /> : <EyeOff size={16} className="mr-2" />}
            <span className="text-sm">显示网格</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localState.snapToGrid}
              onChange={(e) => handleCanvasUpdate({ snapToGrid: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm">吸附到网格</span>
          </label>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">网格大小</label>
            <input
              type="range"
              min="5"
              max="50"
              value={localState.gridSize}
              onChange={(e) => handleCanvasUpdate({ gridSize: Number(e.target.value) })}
              className="w-full"
              disabled={!localState.gridVisible}
            />
            <div className="text-xs text-gray-500 text-center">{localState.gridSize}px</div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="property-group">
        <h3 className="property-label">操作</h3>
        <div className="space-y-2">
          <button
            onClick={exportCanvas}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Monitor size={16} />
            导出画布
          </button>
          
          <button
            onClick={resetCanvas}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
          >
            <RotateCw size={16} />
            重置画布
          </button>
        </div>
      </div>

      {/* 画布统计 */}
      <div className="property-group">
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-medium text-gray-700 mb-2">画布统计</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>尺寸:</span>
              <span>{localState.width} × {localState.height}</span>
            </div>
            <div className="flex justify-between">
              <span>比例:</span>
              <span>{(localState.width / localState.height).toFixed(2)}:1</span>
            </div>
            <div className="flex justify-between">
              <span>对象数量:</span>
              <span>{canvas?.getObjects().length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>缩放:</span>
              <span>{localState.zoom}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};