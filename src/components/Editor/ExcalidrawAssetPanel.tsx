import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Download, Loader2, AlertCircle, Palette } from 'lucide-react';
import { excalidrawService, ExcalidrawLibrary, ExcalidrawLibraryItem } from '@/services/excalidrawService';
import { useEditorStore } from '@/stores/editorStore';

interface ExcalidrawAssetPanelProps {
  className?: string;
}

export const ExcalidrawAssetPanel: React.FC<ExcalidrawAssetPanelProps> = ({ className = '' }) => {
  const { canvas } = useEditorStore();
  const [libraries, setLibraries] = useState<Array<{name: string; url: string; tags: string[]; library?: ExcalidrawLibrary}>>([]);
  const [expandedLibraries, setExpandedLibraries] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化加载库列表
  useEffect(() => {
    loadAvailableLibraries();
  }, []);

  const loadAvailableLibraries = async () => {
    try {
      setLoading(true);
      const availableLibraries = await excalidrawService.getAvailableLibraries();
      setLibraries(availableLibraries);
      setError(null);
    } catch (err) {
      setError('加载Excalidraw库失败');
      console.error('Error loading libraries:', err);
    } finally {
      setLoading(false);
    }
  };

  // 加载指定库的内容
  const loadLibraryContent = async (libraryInfo: any) => {
    if (libraryInfo.library) return; // 已经加载过了

    try {
      const library = await excalidrawService.loadLibrary(libraryInfo.url);
      if (library) {
        setLibraries(prev => 
          prev.map(lib => 
            lib.url === libraryInfo.url 
              ? { ...lib, library }
              : lib
          )
        );
      }
    } catch (err) {
      console.error('Error loading library content:', err);
      // 设置错误状态但不阻止UI
      setLibraries(prev => 
        prev.map(lib => 
          lib.url === libraryInfo.url 
            ? { ...lib, error: true }
            : lib
        )
      );
    }
  };

  // 切换库展开状态
  const toggleLibrary = async (libraryInfo: any) => {
    const newExpanded = new Set(expandedLibraries);
    
    if (newExpanded.has(libraryInfo.url)) {
      newExpanded.delete(libraryInfo.url);
    } else {
      newExpanded.add(libraryInfo.url);
      // 如果库内容还没加载，现在加载
      if (!libraryInfo.library) {
        await loadLibraryContent(libraryInfo);
      }
    }
    
    setExpandedLibraries(newExpanded);
  };

  // 添加素材到画布
  const addItemToCanvas = async (item: ExcalidrawLibraryItem) => {
    if (!canvas) return;

    try {
      const fabricObject = await excalidrawService.convertToFabricObject(item);
      if (fabricObject) {
        fabricObject.set({
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          originX: 'center',
          originY: 'center',
        });

        canvas.add(fabricObject);
        canvas.setActiveObject(fabricObject);
        canvas.renderAll();
        
        console.log(`Added Excalidraw item: ${item.name}`);
      }
    } catch (error) {
      console.error('Failed to add Excalidraw item:', error);
    }
  };

  // 渲染素材项
  const renderLibraryItem = (item: ExcalidrawLibraryItem) => {
    // 根据元素类型生成简单的预览图标
    const getPreviewIcon = (item: ExcalidrawLibraryItem) => {
      if (!item.elements || item.elements.length === 0) return '📝';
      
      const firstElement = item.elements[0];
      switch (firstElement.type) {
        case 'rectangle': return '▭';
        case 'ellipse': return '○';
        case 'diamond': return '◇';
        case 'arrow': return '→';
        case 'line': return '—';
        case 'draw':
        case 'freedraw': return '✏️';
        case 'text': return 'T';
        default: return '✨';
      }
    };

    // 获取元素数量信息
    const elementCount = item.elements ? item.elements.length : 0;
    const elementTypes = item.elements ? [...new Set(item.elements.map(e => e.type))] : [];

    return (
      <div
        key={item.id}
        className="excalidraw-item group cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => addItemToCanvas(item)}
        title={`添加 ${item.name || 'Untitled'} (${elementCount} 个元素: ${elementTypes.join(', ')})`}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-9 bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 rounded flex items-center justify-center overflow-hidden relative">
            <span className="text-lg" style={{ filter: 'sepia(0.3)' }}>
              {getPreviewIcon(item)}
            </span>
            {elementCount > 1 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {elementCount}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-700 text-center leading-tight truncate w-full">
            {item.name || 'Untitled'}
          </span>
        </div>
      </div>
    );
  };

  // 过滤搜索结果
  const getFilteredItems = (library: ExcalidrawLibrary) => {
    if (!searchQuery.trim()) return library.libraryItems;
    return excalidrawService.searchLibraryItems(library, searchQuery);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">加载Excalidraw库...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-500">
        <AlertCircle className="w-8 h-8 mb-2 text-red-400" />
        <p className="text-sm text-center">{error}</p>
        <button
          onClick={loadAvailableLibraries}
          className="mt-2 text-xs text-blue-600 hover:text-blue-700"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className={`excalidraw-asset-panel h-full flex flex-col ${className}`}>
      {/* 头部 */}
      <div className="p-3 border-b border-gray-200">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="搜索手绘素材..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {libraries.map((libraryInfo) => {
            const isExpanded = expandedLibraries.has(libraryInfo.url);
            const isLoading = isExpanded && !libraryInfo.library;
            
            return (
              <div key={libraryInfo.url} className="library-group">
                {/* 库标题 */}
                <button
                  onClick={() => toggleLibrary(libraryInfo)}
                  className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-500" />
                  )}
                  <Download size={14} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{libraryInfo.name}</span>
                  {libraryInfo.library && (
                    <span className="text-xs text-gray-500 ml-auto">
                      ({libraryInfo.library.libraryItems.length})
                    </span>
                  )}
                  {isLoading && (
                    <Loader2 size={14} className="animate-spin text-gray-400 ml-auto" />
                  )}
                </button>
                
                {/* 库内容 */}
                {isExpanded && (
                  <div className="ml-6 mt-2 mb-3">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4 text-gray-500">
                        <Loader2 size={16} className="animate-spin mr-2" />
                        <span className="text-sm">加载中...</span>
                      </div>
                    ) : libraryInfo.library ? (
                      <div className="grid grid-cols-3 gap-2">
                        {getFilteredItems(libraryInfo.library).map(renderLibraryItem)}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <AlertCircle size={16} className="mx-auto mb-1" />
                        <p className="text-xs">加载失败</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Palette size={12} />
          <span>手绘风格素材</span>
        </div>
      </div>
    </div>
  );
};