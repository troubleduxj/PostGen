import React, { useState } from 'react';
import { Monitor, Smartphone, FileImage, Settings, Check, Maximize2 } from 'lucide-react';
import { EnhancedCanvasSizeSelector } from './EnhancedCanvasSizeSelector';
import { SOCIAL_MEDIA_PRESETS, AVATAR_PRESETS, READING_CARD_PRESETS } from '@/config/canvasPresets';

// 快速预设（显示在下拉菜单中的常用尺寸）
export const QUICK_PRESETS = [
  // 最热门的社交媒体尺寸
  ...SOCIAL_MEDIA_PRESETS.slice(0, 4),
  // 头像设计
  ...AVATAR_PRESETS.slice(0, 2),
  // 读书卡片
  ...READING_CARD_PRESETS.slice(0, 2),
];

interface CanvasSizeSelectorProps {
  currentWidth: number;
  currentHeight: number;
  onSizeChange: (width: number, height: number) => void;
  onClose?: () => void;
}

export const CanvasSizeSelector: React.FC<CanvasSizeSelectorProps> = ({
  currentWidth,
  currentHeight,
  onSizeChange,
  onClose
}) => {
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customWidth, setCustomWidth] = useState(currentWidth.toString());
  const [customHeight, setCustomHeight] = useState(currentHeight.toString());

  const handlePresetSelect = (preset: any) => {
    onSizeChange(preset.width, preset.height);
    onClose?.();
  };

  const handleCustomSubmit = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (width > 0 && height > 0 && width <= 10000 && height <= 10000) {
      onSizeChange(width, height);
      onClose?.();
    }
  };

  const isCurrentSize = (width: number, height: number) => {
    return currentWidth === width && currentHeight === height;
  };

  return (
    <>
      <div className="canvas-size-selector">
        <div className="size-selector-header">
          <h3 className="text-lg font-semibold text-gray-900">选择画布尺寸</h3>
          <p className="text-sm text-gray-600 mt-1">
            当前: {currentWidth} × {currentHeight} 像素
          </p>
        </div>

        {/* 快速预设 */}
        <div className="quick-presets mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">快速选择</h4>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_PRESETS.slice(0, 6).map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetSelect(preset)}
                className={`preset-item p-3 border rounded-lg text-left hover:border-blue-300 transition-colors ${
                  isCurrentSize(preset.width, preset.height) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{preset.icon}</span>
                  <span className="font-medium text-sm">{preset.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {preset.width} × {preset.height}
                </div>
                {isCurrentSize(preset.width, preset.height) && (
                  <Check size={14} className="text-blue-500 mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 更多尺寸按钮 */}
        <button
          onClick={() => setShowEnhanced(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Maximize2 size={16} />
          浏览更多尺寸预设
        </button>

        {/* 自定义尺寸 */}
        <div className="custom-size-section mt-4">
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="w-full flex items-center gap-2 p-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <Settings size={16} />
            自定义尺寸
          </button>

          {showCustom && (
            <div className="custom-inputs mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">宽度 (px)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    min="1"
                    max="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">高度 (px)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    min="1"
                    max="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleCustomSubmit}
                className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                应用自定义尺寸
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 增强版尺寸选择器 */}
      <EnhancedCanvasSizeSelector
        isOpen={showEnhanced}
        onClose={() => setShowEnhanced(false)}
      />
    </>
  );
};