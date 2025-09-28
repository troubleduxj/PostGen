import React, { useState, useMemo, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  Clock,
  Eye,
  Trash2,
  Download,
  Upload,
  Settings,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useHistoryManager, OPERATION_TYPES } from '@/hooks/useHistoryManager';
import { HistoryEntry } from '@/stores/historyStore';
import { cn } from '@/utils/cn';

interface HistoryPanelProps {
  className?: string;
}

interface HistoryItemProps {
  entry: HistoryEntry;
  isActive: boolean;
  isFuture: boolean;
  onClick: () => void;
  onPreview?: () => void;
}

// 历史记录项组件
const HistoryItem: React.FC<HistoryItemProps> = ({
  entry,
  isActive,
  isFuture,
  onClick,
  onPreview,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOperationIcon = (action: string) => {
    const operationType = OPERATION_TYPES[action];
    if (operationType) {
      // 根据操作类型返回不同的图标
      switch (action) {
        case 'object:added':
          return '➕';
        case 'object:removed':
          return '➖';
        case 'object:moved':
          return '↔️';
        case 'object:scaled':
          return '🔍';
        case 'object:rotated':
          return '🔄';
        case 'text:edited':
          return '📝';
        case 'image:filtered':
          return '🎨';
        case 'image:cropped':
          return '✂️';
        case 'canvas:resized':
          return '📐';
        case 'canvas:background':
          return '🎭';
        case 'layer:reordered':
          return '📚';
        case 'template:applied':
          return '📋';
        default:
          return '⚡';
      }
    }
    return '⚡';
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200',
        'hover:bg-gray-50 active:bg-gray-100',
        isActive && 'bg-blue-50 border border-blue-200',
        isFuture && 'opacity-60',
        'border border-transparent'
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 缩略图或图标 */}
      <div className="flex-shrink-0">
        {entry.thumbnail ? (
          <img
            src={entry.thumbnail}
            alt="历史缩略图"
            className="w-12 h-9 object-cover rounded border border-gray-200"
          />
        ) : (
          <div className="w-12 h-9 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-lg">
            {getOperationIcon(entry.action)}
          </div>
        )}
      </div>

      {/* 操作信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900 truncate">
            {entry.description}
          </span>
          {entry.metadata?.merged && (
            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
              合并 {entry.metadata.mergeCount > 1 && `×${entry.metadata.mergeCount}`}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formatTime(entry.timestamp)}</span>
          
          {entry.objectsCount > 0 && (
            <>
              <span>•</span>
              <span>{entry.objectsCount} 个对象</span>
            </>
          )}
          
          <span>•</span>
          <span>{entry.canvasSize.width}×{entry.canvasSize.height}</span>
        </div>
      </div>

      {/* 操作按钮 */}
      {isHovered && onPreview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="flex-shrink-0 p-1.5 rounded hover:bg-gray-200 transition-colors"
          title="预览此状态"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
};

// 历史面板主组件
export const HistoryPanel: React.FC<HistoryPanelProps> = ({ className }) => {
  const {
    past,
    present,
    future,
    jumpToEntry,
    searchHistory,
    filterByAction,
    filterByTimeRange,
    clearHistory,
    exportHistory,
    importHistory,
    totalEntries,
    memoryUsage,
    optimizeMemory,
    setMaxHistorySize,
    setEnableThumbnails,
  } = useHistoryManager();

  // 本地状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 过滤和搜索逻辑
  const filteredEntries = useMemo(() => {
    let allEntries = [...past, ...(present ? [present] : []), ...future];
    
    // 应用搜索
    if (searchQuery.trim()) {
      allEntries = searchHistory(searchQuery.trim());
    }
    
    // 应用过滤器
    if (selectedFilter !== 'all') {
      if (selectedFilter.startsWith('action:')) {
        const action = selectedFilter.replace('action:', '');
        allEntries = filterByAction(action);
      } else if (selectedFilter === 'recent') {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        allEntries = filterByTimeRange(oneDayAgo, Date.now());
      }
    }
    
    return allEntries.sort((a, b) => b.timestamp - a.timestamp);
  }, [past, present, future, searchQuery, selectedFilter, searchHistory, filterByAction, filterByTimeRange]);

  // 处理条目点击
  const handleEntryClick = useCallback((entry: HistoryEntry) => {
    jumpToEntry(entry.id);
  }, [jumpToEntry]);

  // 处理导出
  const handleExport = useCallback(() => {
    try {
      const data = exportHistory();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `history_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出历史记录失败:', error);
    }
  }, [exportHistory]);

  // 处理导入
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = importHistory(data);
        if (success) {
          alert('历史记录导入成功！');
        } else {
          alert('导入失败：文件格式不正确');
        }
      } catch (error) {
        console.error('导入历史记录失败:', error);
        alert('导入失败：文件读取错误');
      }
    };
    reader.readAsText(file);
    
    // 重置文件输入
    event.target.value = '';
  }, [importHistory]);

  // 格式化内存使用量
  const formatMemoryUsage = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 获取当前条目索引
  const getCurrentIndex = () => {
    if (!present) return -1;
    return past.length;
  };

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <History className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">历史记录</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {totalEntries}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="设置"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* 搜索和过滤 */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索历史记录..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 过滤器 */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部操作</option>
                <option value="recent">最近24小时</option>
                <option value="action:object:added">添加对象</option>
                <option value="action:object:removed">删除对象</option>
                <option value="action:object:moved">移动对象</option>
                <option value="action:text:edited">编辑文本</option>
                <option value="action:image:filtered">图片滤镜</option>
                <option value="action:template:applied">应用模板</option>
              </select>
            </div>
          </div>

          {/* 设置面板 */}
          {showSettings && (
            <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">内存使用</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{formatMemoryUsage(memoryUsage)}</span>
                  <button
                    onClick={optimizeMemory}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    优化
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  <Download className="w-3 h-3" />
                  导出
                </button>
                
                <label className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors cursor-pointer">
                  <Upload className="w-3 h-3" />
                  导入
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={() => {
                    if (window.confirm('确定要清空所有历史记录吗？')) {
                      clearHistory();
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  清空
                </button>
              </div>
            </div>
          )}

          {/* 历史记录列表 */}
          <div className="flex-1 overflow-y-auto">
            {filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <History className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery || selectedFilter !== 'all' ? '没有找到匹配的记录' : '暂无历史记录'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredEntries.map((entry) => {
                  const isActive = present?.id === entry.id;
                  const isFuture = future.some(f => f.id === entry.id);
                  
                  return (
                    <HistoryItem
                      key={entry.id}
                      entry={entry}
                      isActive={isActive}
                      isFuture={isFuture}
                      onClick={() => handleEntryClick(entry)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* 底部状态栏 */}
          {totalEntries > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  当前位置: {getCurrentIndex() + 1} / {totalEntries}
                </span>
                <span>
                  {formatMemoryUsage(memoryUsage)}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryPanel;