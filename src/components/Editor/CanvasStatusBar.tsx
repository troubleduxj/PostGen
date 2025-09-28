import React from 'react';
import { 
  Layers, 
  MousePointer, 
  Eye,
  Lock,
  Wifi,
  WifiOff,
  Save,
  Clock
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useHistoryManager } from '@/hooks/useHistoryManager';

interface CanvasStatusBarProps {
  className?: string;
}

export const CanvasStatusBar: React.FC<CanvasStatusBarProps> = ({ className = '' }) => {
  const {
    canvasState,
    selectedObjects,
    canvas,
    lastSaveTime = 0,
    preferences = { autoSave: false }
  } = useEditorStore();

  const {
    totalEntries,
    currentEntry,
    canUndo,
    canRedo
  } = useHistoryManager();

  // 获取画布对象数量
  const objectCount = canvas?.getObjects().length || 0;
  
  // 获取选中对象信息
  const selectedCount = selectedObjects.length;
  const selectedObject = selectedObjects[0];

  // 格式化最后保存时间
  const formatLastSaveTime = (timestamp: number) => {
    if (!timestamp) return '未保存';
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return '刚刚保存';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前保存`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前保存`;
    return new Date(timestamp).toLocaleDateString();
  };

  // 获取网络状态
  const isOnline = navigator.onLine;

  return (
    <div 
      className={`canvas-status-bar ${className}`}
      style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        height: '40px',
        zIndex: 10,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: '12px'
      }}
    >
      {/* 左侧信息 */}
      <div className="status-section">
        {/* 画布信息 */}
        <div className="status-item">
          <span className="status-label">画布:</span>
          <span className="status-value">
            {canvasState.width} × {canvasState.height}
          </span>
        </div>

        {/* 缩放信息 */}
        <div className="status-item">
          <span className="status-label">缩放:</span>
          <span className="status-value">
            {Math.round(canvasState.zoom * 100)}%
          </span>
        </div>

        {/* 对象数量 */}
        <div className="status-item">
          <Layers size={14} className="status-icon" />
          <span className="status-value">{objectCount}</span>
        </div>

        {/* 选中对象信息 */}
        {selectedCount > 0 && (
          <div className="status-item">
            <MousePointer size={14} className="status-icon" />
            <span className="status-value">
              {selectedCount > 1 ? `${selectedCount} 个对象` : selectedObject?.type || '对象'}
            </span>
            {selectedObject && (
              <div className="object-properties">
                {selectedObject.visible === false && (
                  <Eye size={12} className="property-icon opacity-50" />
                )}
                {(selectedObject.lockMovementX || selectedObject.lockMovementY) && (
                  <Lock size={12} className="property-icon" />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 中间信息 */}
      <div className="status-section">
        {/* 历史记录状态 */}
        <div className="status-item">
          <span className="status-label">历史:</span>
          <span className="status-value">{totalEntries}</span>
          <div className="history-indicators">
            <span className={`history-indicator ${canUndo ? 'active' : ''}`} title="可撤销">
              ←
            </span>
            <span className={`history-indicator ${canRedo ? 'active' : ''}`} title="可重做">
              →
            </span>
          </div>
        </div>

        {/* 当前操作 */}
        {currentEntry && (
          <div className="status-item">
            <span className="status-label">操作:</span>
            <span className="status-value truncate max-w-32">
              {currentEntry.description}
            </span>
          </div>
        )}
      </div>

      {/* 右侧信息 */}
      <div className="status-section">
        {/* 自动保存状态 */}
        {preferences?.autoSave && (
          <div className="status-item">
            <Save size={14} className="status-icon text-green-500" />
            <span className="status-value text-green-600">自动保存</span>
          </div>
        )}

        {/* 最后保存时间 */}
        <div className="status-item">
          <Clock size={14} className="status-icon" />
          <span className="status-value">
            {formatLastSaveTime(lastSaveTime)}
          </span>
        </div>

        {/* 网络状态 */}
        <div className="status-item">
          {isOnline ? (
            <Wifi size={14} className="status-icon text-green-500" />
          ) : (
            <WifiOff size={14} className="status-icon text-red-500" />
          )}
          <span className={`status-value ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? '在线' : '离线'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CanvasStatusBar;