import React from 'react';
import { Undo2, Redo2, History, RotateCcw } from 'lucide-react';
import { useHistoryManager } from '@/hooks/useHistoryManager';
import { cn } from '@/utils/cn';

interface UndoRedoButtonsProps {
  className?: string;
  showLabels?: boolean;
  showHistoryButton?: boolean;
  onHistoryClick?: () => void;
}

export const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({
  className,
  showLabels = false,
  showHistoryButton = false,
  onHistoryClick,
}) => {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    totalEntries,
    currentEntry,
  } = useHistoryManager();

  const handleUndo = () => {
    const success = undo();
    if (!success) {
      console.warn('无法撤销：没有可撤销的操作');
    }
  };

  const handleRedo = () => {
    const success = redo();
    if (!success) {
      console.warn('无法重做：没有可重做的操作');
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
      clearHistory();
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* 撤销按钮 */}
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200',
          'hover:bg-gray-100 active:bg-gray-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
        )}
        title={`撤销${currentEntry ? ` - ${currentEntry.description}` : ''} (Ctrl+Z)`}
      >
        <Undo2 className="w-4 h-4" />
        {showLabels && <span className="text-sm">撤销</span>}
      </button>

      {/* 重做按钮 */}
      <button
        onClick={handleRedo}
        disabled={!canRedo}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200',
          'hover:bg-gray-100 active:bg-gray-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
        )}
        title="重做 (Ctrl+Y 或 Ctrl+Shift+Z)"
      >
        <Redo2 className="w-4 h-4" />
        {showLabels && <span className="text-sm">重做</span>}
      </button>

      {/* 分隔线 */}
      {showHistoryButton && (
        <div className="w-px h-6 bg-gray-300 mx-1" />
      )}

      {/* 历史记录按钮 */}
      {showHistoryButton && (
        <button
          onClick={onHistoryClick}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200',
            'hover:bg-gray-100 active:bg-gray-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
          )}
          title={`历史记录 (${totalEntries} 条记录)`}
        >
          <History className="w-4 h-4" />
          {showLabels && <span className="text-sm">历史</span>}
          {totalEntries > 0 && (
            <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {totalEntries}
            </span>
          )}
        </button>
      )}

      {/* 清空历史按钮 */}
      {showHistoryButton && totalEntries > 0 && (
        <button
          onClick={handleClearHistory}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200',
            'hover:bg-red-50 active:bg-red-100 text-red-600',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1'
          )}
          title="清空历史记录"
        >
          <RotateCcw className="w-4 h-4" />
          {showLabels && <span className="text-sm">清空</span>}
        </button>
      )}
    </div>
  );
};

// 简化版本的撤销重做按钮（仅图标）
export const SimpleUndoRedoButtons: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <UndoRedoButtons 
      className={className}
      showLabels={false}
      showHistoryButton={false}
    />
  );
};

// 完整版本的撤销重做按钮（包含历史记录）
export const FullUndoRedoButtons: React.FC<{ 
  className?: string;
  onHistoryClick?: () => void;
}> = ({ className, onHistoryClick }) => {
  return (
    <UndoRedoButtons 
      className={className}
      showLabels={true}
      showHistoryButton={true}
      onHistoryClick={onHistoryClick}
    />
  );
};

export default UndoRedoButtons;