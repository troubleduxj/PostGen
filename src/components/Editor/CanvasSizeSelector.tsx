import React, { useState } from 'react';
import { Monitor, Smartphone, FileImage, Settings, Check } from 'lucide-react';

// 常用画布尺寸预设
export const CANVAS_PRESETS = {
  // 社交媒体
  social: [
    { name: 'Instagram 正方形', width: 1080, height: 1080, ratio: '1:1', icon: '📷' },
    { name: 'Instagram 故事', width: 1080, height: 1920, ratio: '9:16', icon: '📱' },
    { name: 'Facebook 封面', width: 1200, height: 630, ratio: '1.91:1', icon: '📘' },
    { name: 'Twitter 头图', width: 1500, height: 500, ratio: '3:1', icon: '🐦' },
    { name: 'LinkedIn 横幅', width: 1584, height: 396, ratio: '4:1', icon: '💼' },
  ],
  
  // 印刷品
  print: [
    { name: 'A4 纵向', width: 2480, height: 3508, ratio: 'A4', icon: '📄' },
    { name: 'A4 横向', width: 3508, height: 2480, ratio: 'A4', icon: '📄' },
    { name: 'A3 纵向', width: 3508, height: 4961, ratio: 'A3', icon: '📋' },
    { name: 'A5 纵向', width: 1748, height: 2480, ratio: 'A5', icon: '📝' },
    { name: '名片', width: 1050, height: 600, ratio: '1.75:1', icon: '💳' },
  ],
  
  // 海报
  poster: [
    { name: '电影海报', width: 2025, height: 3000, ratio: '2:3', icon: '🎬' },
    { name: '活动海报', width: 1800, height: 2400, ratio: '3:4', icon: '🎪' },
    { name: '宣传单页', width: 2100, height: 2970, ratio: 'A4', icon: '📢' },
    { name: '横幅广告', width: 3000, height: 1000, ratio: '3:1', icon: '🏷️' },
  ],
  
  // 数字屏幕
  digital: [
    { name: '桌面壁纸 HD', width: 1920, height: 1080, ratio: '16:9', icon: '🖥️' },
    { name: '桌面壁纸 4K', width: 3840, height: 2160, ratio: '16:9', icon: '🖥️' },
    { name: '手机壁纸', width: 1080, height: 1920, ratio: '9:16', icon: '📱' },
    { name: '平板壁纸', width: 2048, height: 2732, ratio: '3:4', icon: '📱' },
  ],
  
  // 自定义常用尺寸
  custom: [
    { name: '正方形 小', width: 800, height: 800, ratio: '1:1', icon: '⬜' },
    { name: '正方形 中', width: 1200, height: 1200, ratio: '1:1', icon: '⬜' },
    { name: '横向 16:9', width: 1600, height: 900, ratio: '16:9', icon: '📺' },
    { name: '纵向 9:16', width: 900, height: 1600, ratio: '9:16', icon: '📱' },
  ]
};

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
  const [activeCategory, setActiveCategory] = useState<keyof typeof CANVAS_PRESETS>('social');
  const [customWidth, setCustomWidth] = useState(currentWidth.toString());
  const [customHeight, setCustomHeight] = useState(currentHeight.toString());
  const [showCustom, setShowCustom] = useState(false);

  const categories = [
    { key: 'social' as const, name: '社交媒体', icon: Smartphone },
    { key: 'print' as const, name: '印刷品', icon: FileImage },
    { key: 'poster' as const, name: '海报', icon: Monitor },
    { key: 'digital' as const, name: '数字屏幕', icon: Monitor },
    { key: 'custom' as const, name: '常用尺寸', icon: Settings },
  ];

  const handlePresetSelect = (preset: typeof CANVAS_PRESETS.social[0]) => {
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
    <div className="canvas-size-selector">
      <div className="size-selector-header">
        <h3 className="text-lg font-semibold text-gray-900">选择画布尺寸</h3>
        <p className="text-sm text-gray-600 mt-1">
          当前: {currentWidth} × {currentHeight} 像素
        </p>
      </div>

      {/* 分类标签 */}
      <div className="category-tabs">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`category-tab ${activeCategory === category.key ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* 尺寸预设列表 */}
      <div className="presets-grid">
        {CANVAS_PRESETS[activeCategory].map((preset, index) => (
          <button
            key={index}
            onClick={() => handlePresetSelect(preset)}
            className={`preset-item ${isCurrentSize(preset.width, preset.height) ? 'current' : ''}`}
          >
            <div className="preset-icon">{preset.icon}</div>
            <div className="preset-info">
              <div className="preset-name">{preset.name}</div>
              <div className="preset-size">
                {preset.width} × {preset.height}
              </div>
              <div className="preset-ratio">{preset.ratio}</div>
            </div>
            {isCurrentSize(preset.width, preset.height) && (
              <Check size={16} className="preset-check" />
            )}
          </button>
        ))}
      </div>

      {/* 自定义尺寸 */}
      <div className="custom-size-section">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="custom-toggle"
        >
          <Settings size={16} />
          自定义尺寸
        </button>

        {showCustom && (
          <div className="custom-inputs">
            <div className="input-group">
              <label>宽度 (px)</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                min="1"
                max="10000"
                className="size-input"
              />
            </div>
            <div className="input-group">
              <label>高度 (px)</label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                min="1"
                max="10000"
                className="size-input"
              />
            </div>
            <button
              onClick={handleCustomSubmit}
              className="apply-custom-btn"
            >
              应用自定义尺寸
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasSizeSelector;