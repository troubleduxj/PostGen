import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2,
  Minimize2,
  Move,
  MousePointer
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

interface CanvasZoomControlsProps {
  className?: string;
}

export const CanvasZoomControls: React.FC<CanvasZoomControlsProps> = ({ className = '' }) => {
  const {
    canvasState,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToFit,
    setActiveTool,
    activeTool
  } = useEditorStore();

  const [showZoomInput, setShowZoomInput] = useState(false);
  const [zoomInputValue, setZoomInputValue] = useState(Math.round(canvasState.zoom * 100).toString());

  const handleZoomInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(zoomInputValue);
    if (value >= 10 && value <= 500) {
      // 这里需要实现设置特定缩放值的功能
      // updateCanvasState({ zoom: value / 100 });
    }
    setShowZoomInput(false);
  };

  const zoomPresets = [25, 50, 75, 100, 125, 150, 200];

  return (
    <div className={`zoom-controls ${className}`}>
      {/* 工具切换 */}
      <div className="control-section">
        <button
          onClick={() => setActiveTool('select')}
          className={`control-btn ${activeTool === 'select' ? 'active' : ''}`}
          title="选择工具"
        >
          <MousePointer size={16} />
        </button>
        
        <button
          onClick={() => setActiveTool('hand')}
          className={`control-btn ${activeTool === 'hand' ? 'active' : ''}`}
          title="移动工具"
        >
          <Move size={16} />
        </button>
      </div>

      <div className="control-divider" />

      {/* 缩放控制 */}
      <div className="control-section">
        <button
          onClick={zoomOut}
          className="control-btn"
          title="缩小 (Ctrl + -)"
          disabled={canvasState.zoom <= 0.1}
        >
          <ZoomOut size={16} />
        </button>

        {/* 缩放显示/输入 */}
        {showZoomInput ? (
          <form onSubmit={handleZoomInputSubmit} className="zoom-input-form">
            <input
              type="number"
              value={zoomInputValue}
              onChange={(e) => setZoomInputValue(e.target.value)}
              onBlur={() => setShowZoomInput(false)}
              className="zoom-input"
              min="10"
              max="500"
              autoFocus
            />
            <span className="zoom-unit">%</span>
          </form>
        ) : (
          <button
            onClick={() => setShowZoomInput(true)}
            className="zoom-display-btn"
            title="点击输入缩放值"
          >
            {Math.round(canvasState.zoom * 100)}%
          </button>
        )}

        <button
          onClick={zoomIn}
          className="control-btn"
          title="放大 (Ctrl + +)"
          disabled={canvasState.zoom >= 5}
        >
          <ZoomIn size={16} />
        </button>
      </div>

      <div className="control-divider" />

      {/* 视图控制 */}
      <div className="control-section">
        <button
          onClick={zoomToFit}
          className="control-btn"
          title="适应窗口 (Ctrl + 1)"
        >
          <Maximize2 size={16} />
        </button>

        <button
          onClick={resetZoom}
          className="control-btn"
          title="实际大小 (Ctrl + 0)"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* 快速缩放预设 */}
      <div className="zoom-presets">
        {zoomPresets.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              // updateCanvasState({ zoom: preset / 100 });
            }}
            className={`preset-btn ${Math.round(canvasState.zoom * 100) === preset ? 'active' : ''}`}
            title={`缩放到 ${preset}%`}
          >
            {preset}%
          </button>
        ))}
      </div>
    </div>
  );
};

export default CanvasZoomControls;