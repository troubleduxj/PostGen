import React, { useState } from 'react';
import { Settings, Monitor, Smartphone, FileImage } from 'lucide-react';
import { CanvasSizeSelector, CANVAS_PRESETS } from './CanvasSizeSelector';

interface CanvasConfigButtonProps {
  currentWidth: number;
  currentHeight: number;
  onSizeChange: (width: number, height: number) => void;
  className?: string;
}

export const CanvasConfigButton: React.FC<CanvasConfigButtonProps> = ({
  currentWidth,
  currentHeight,
  onSizeChange,
  className = ''
}) => {
  const [showSelector, setShowSelector] = useState(false);

  // 快速尺寸选项 - 重点关注移动端和社交媒体
  const quickSizes = [
    { name: 'Instagram 正方形', width: 1080, height: 1080, icon: '📷' },
    { name: 'Instagram 故事', width: 1080, height: 1920, icon: '📱' },
    { name: '抖音/TikTok', width: 1080, height: 1920, icon: '🎵' },
    { name: '小红书笔记', width: 1080, height: 1440, icon: '📝' },
    { name: '微信朋友圈', width: 1080, height: 1080, icon: '💬' },
    { name: '手机海报', width: 1080, height: 1920, icon: '📄' },
    { name: 'YouTube 缩略图', width: 1280, height: 720, icon: '📺' },
    { name: 'A4 纵向', width: 2480, height: 3508, icon: '📄' },
  ];

  return (
    <div className={`canvas-config-button ${className}`}>
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="config-trigger"
        title={`当前画布: ${currentWidth} × ${currentHeight}`}
      >
        <Settings size={16} />
        <span className="config-text">
          {currentWidth} × {currentHeight}
        </span>
      </button>

      {showSelector && (
        <>
          {/* 遮罩层 */}
          <div 
            className="config-overlay"
            onClick={() => setShowSelector(false)}
          />
          
          {/* 配置面板 */}
          <div className="config-panel">
            <div className="config-header">
              <h4>画布尺寸设置</h4>
              <button
                onClick={() => setShowSelector(false)}
                className="config-close"
              >
                ×
              </button>
            </div>

            {/* 快速选择 */}
            <div className="quick-sizes">
              <h5>热门尺寸</h5>
              <div className="quick-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxHeight: '200px', overflowY: 'auto' }}>
                {quickSizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onSizeChange(size.width, size.height);
                      setShowSelector(false);
                    }}
                    className={`quick-item ${
                      currentWidth === size.width && currentHeight === size.height ? 'active' : ''
                    }`}
                    style={{ fontSize: '11px', padding: '6px' }}
                  >
                    <span className="quick-icon" style={{ fontSize: '14px' }}>{size.icon}</span>
                    <div className="quick-info">
                      <div className="quick-name" style={{ fontSize: '11px', lineHeight: '1.2' }}>{size.name}</div>
                      <div className="quick-size" style={{ fontSize: '10px' }}>{size.width} × {size.height}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 分类选择 */}
            <div className="category-section">
              <h5>更多尺寸</h5>
              <div className="category-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                <button
                  onClick={() => {
                    setShowSelector(false);
                    alert('社交媒体尺寸：包含抖音、小红书、Instagram、微信等25+种尺寸');
                  }}
                  className="category-btn"
                  style={{ fontSize: '10px' }}
                >
                  <Smartphone size={12} />
                  社交媒体
                </button>
                <button
                  onClick={() => {
                    setShowSelector(false);
                    alert('移动端尺寸：包含iPhone、Android、iPad等移动设备专用尺寸');
                  }}
                  className="category-btn"
                  style={{ fontSize: '10px' }}
                >
                  <Smartphone size={12} />
                  移动端
                </button>
                <button
                  onClick={() => {
                    setShowSelector(false);
                    alert('海报尺寸：包含电影海报、活动海报、宣传单等');
                  }}
                  className="category-btn"
                  style={{ fontSize: '10px' }}
                >
                  <FileImage size={12} />
                  海报
                </button>
                <button
                  onClick={() => {
                    setShowSelector(false);
                    alert('印刷品尺寸：包含A4、A3、名片等印刷标准尺寸');
                  }}
                  className="category-btn"
                  style={{ fontSize: '10px' }}
                >
                  <Monitor size={12} />
                  印刷品
                </button>
              </div>
            </div>

            {/* 自定义尺寸 */}
            <div className="custom-section">
              <h5>自定义尺寸</h5>
              <div className="custom-inputs">
                <input
                  type="number"
                  placeholder="宽度"
                  defaultValue={currentWidth}
                  className="custom-input"
                  id="custom-width"
                />
                <span>×</span>
                <input
                  type="number"
                  placeholder="高度"
                  defaultValue={currentHeight}
                  className="custom-input"
                  id="custom-height"
                />
                <button
                  onClick={() => {
                    const widthInput = document.getElementById('custom-width') as HTMLInputElement;
                    const heightInput = document.getElementById('custom-height') as HTMLInputElement;
                    const width = parseInt(widthInput.value);
                    const height = parseInt(heightInput.value);
                    
                    if (width > 0 && height > 0) {
                      onSizeChange(width, height);
                      setShowSelector(false);
                    }
                  }}
                  className="custom-apply"
                >
                  应用
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CanvasConfigButton;