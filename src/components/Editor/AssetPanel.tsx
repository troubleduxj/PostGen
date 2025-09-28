import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  Upload, 
  Grid3X3, 
  List, 
  Filter,
  Download,
  Trash2,
  Edit3,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Image,
  Shapes,
  Globe
} from 'lucide-react';
import { fabric } from 'fabric';
import { useEditorStore } from '@/stores/editorStore';
import { useAssetLibraryStore, Asset, AssetCategory } from '@/stores/assetLibraryStore';
import OnlineAssetBrowser from './OnlineAssetBrowser';

interface AssetPanelProps {
  className?: string;
}

export const AssetPanel: React.FC<AssetPanelProps> = ({ className = '' }) => {
  const { addObject } = useEditorStore();
  const {
    // 状态
    filteredAssets,
    categories,
    currentCategory,
    searchQuery,
    isLoading,
    error,
    uploadProgress,
    
    // 操作
    setCurrentCategory,
    setSearchQuery,
    filterAssets,
    startUpload,
    removeAsset,
    loadUnsplashAssets,
    loadIconifyAssets,
    loadMore,
    setError
  } = useAssetLibraryStore();

  const [activeTab, setActiveTab] = useState<'local' | 'unsplash' | 'iconify'>('local');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // 初始化加载在线素材
  useEffect(() => {
    loadUnsplashAssets();
    loadIconifyAssets();
  }, []);

  // 搜索防抖
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  // 处理搜索输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // 处理分类切换
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setSelectedAssets([]);
  };

  // 处理文件上传
  const handleFileUpload = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isImage) {
        setError('只支持图片文件');
        return false;
      }
      
      if (!isValidSize) {
        setError('文件大小不能超过 10MB');
        return false;
      }
      
      return true;
    });

    for (const file of validFiles) {
      try {
        await startUpload(file);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  // 处理拖拽上传
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // 添加素材到画布
  const addAssetToCanvas = async (asset: Asset) => {
    try {
      switch (asset.type) {
        case 'icon':
          // 加载 SVG 图标
          if (asset.url.startsWith('data:image/svg+xml')) {
            fabric.loadSVGFromURL(asset.url, (objects, options) => {
              const obj = fabric.util.groupSVGElements(objects, options);
              obj.set({
                left: 100,
                top: 100,
                scaleX: 2,
                scaleY: 2
              });
              addObject(obj);
            });
          }
          break;
          
        case 'image':
          // 加载图片
          fabric.Image.fromURL(asset.url, (img) => {
            img.set({
              left: 100,
              top: 100,
              scaleX: 0.5,
              scaleY: 0.5
            });
            addObject(img);
          }, { crossOrigin: 'anonymous' });
          break;
          
        case 'shape':
          // 处理形状素材
          addShapeToCanvas(asset);
          break;
          
        case 'pattern':
          // 处理图案素材
          fabric.Image.fromURL(asset.url, (img) => {
            img.set({
              left: 100,
              top: 100,
              scaleX: 0.3,
              scaleY: 0.3
            });
            addObject(img);
          });
          break;
          
        default:
          console.warn('Unknown asset type:', asset.type);
      }
    } catch (error) {
      console.error('Failed to add asset to canvas:', error);
      setError('添加素材失败');
    }
  };

  // 添加形状到画布
  const addShapeToCanvas = (asset: Asset) => {
    let shape: fabric.Object | null = null;
    
    switch (asset.id) {
      case 'shape-circle':
        shape = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: '#3b82f6'
        });
        break;
      case 'shape-square':
        shape = new fabric.Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: '#10b981'
        });
        break;
      case 'shape-triangle':
        shape = new fabric.Triangle({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: '#f59e0b'
        });
        break;
      default:
        console.warn('Unknown shape:', asset.id);
        return;
    }
    
    if (shape) {
      addObject(shape);
    }
  };

  // 处理素材选择
  const handleAssetSelect = (assetId: string, isMultiSelect: boolean = false) => {
    if (isMultiSelect) {
      setSelectedAssets(prev => 
        prev.includes(assetId) 
          ? prev.filter(id => id !== assetId)
          : [...prev, assetId]
      );
    } else {
      setSelectedAssets([assetId]);
    }
  };

  // 删除选中的素材
  const handleDeleteSelected = () => {
    selectedAssets.forEach(assetId => {
      removeAsset(assetId);
    });
    setSelectedAssets([]);
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* 标签页导航 */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('local')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'local'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>本地素材</span>
          </button>
          <button
            onClick={() => setActiveTab('unsplash')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'unsplash'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Unsplash</span>
          </button>
          <button
            onClick={() => setActiveTab('iconify')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'iconify'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shapes className="w-4 h-4" />
            <span>图标库</span>
          </button>
        </div>
      </div>

      {/* 本地素材面板 */}
      {activeTab === 'local' && (
        <>
          {/* 头部工具栏 */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200">
            {/* 搜索框 */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索素材..."
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 工具按钮 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>上传</span>
                </button>
                
                {selectedAssets.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>删除</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 分类标签 */}
          <div className="flex-shrink-0 p-4 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 text-xs rounded-full transition-colors ${
                    currentCategory === category.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  {category.count !== undefined && (
                    <span className="text-xs opacity-75">({category.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 上传进度 */}
          {uploadProgress.length > 0 && (
            <div className="flex-shrink-0 p-4 border-b border-gray-100">
              <div className="space-y-2">
                {uploadProgress.map((upload) => (
                  <UploadProgressItem key={upload.id} upload={upload} />
                ))}
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="flex-shrink-0 p-4 border-b border-red-100 bg-red-50">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 素材列表 */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && filteredAssets.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">加载中...</span>
              </div>
            ) : (
              <AssetGrid
                assets={filteredAssets}
                viewMode={viewMode}
                selectedAssets={selectedAssets}
                onAssetClick={addAssetToCanvas}
                onAssetSelect={handleAssetSelect}
                onLoadMore={loadMore}
              />
            )}
          </div>
        </>
      )}

      {/* 在线图片浏览器 */}
      {activeTab === 'unsplash' && (
        <div className="flex-1 p-4">
          <OnlineAssetBrowser
            source="unsplash"
            onAssetSelect={addAssetToCanvas}
          />
        </div>
      )}

      {/* 在线图标浏览器 */}
      {activeTab === 'iconify' && (
        <div className="flex-1 p-4">
          <OnlineAssetBrowser
            source="iconify"
            onAssetSelect={addAssetToCanvas}
          />
        </div>
      )}

      {/* 分类标签 */}
      <div className="flex-shrink-0 p-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`flex items-center space-x-1 px-3 py-1.5 text-xs rounded-full transition-colors ${
                currentCategory === category.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              {category.count !== undefined && (
                <span className="text-xs opacity-75">({category.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 上传进度 */}
      {uploadProgress.length > 0 && (
        <div className="flex-shrink-0 p-4 border-b border-gray-100">
          <div className="space-y-2">
            {uploadProgress.map((upload) => (
              <UploadProgressItem key={upload.id} upload={upload} />
            ))}
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="flex-shrink-0 p-4 border-b border-red-100 bg-red-50">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 素材列表 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && filteredAssets.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">加载中...</span>
          </div>
        ) : (
          <AssetGrid
            assets={filteredAssets}
            viewMode={viewMode}
            selectedAssets={selectedAssets}
            onAssetClick={addAssetToCanvas}
            onAssetSelect={handleAssetSelect}
            onLoadMore={loadMore}
          />
        )}
      </div>

      {/* 上传模态框 */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
        />
      )}
    </div>
  );
};

// 素材网格组件
interface AssetGridProps {
  assets: Asset[];
  viewMode: 'grid' | 'list';
  selectedAssets: string[];
  onAssetClick: (asset: Asset) => void;
  onAssetSelect: (assetId: string, isMultiSelect: boolean) => void;
  onLoadMore: () => void;
}

const AssetGrid: React.FC<AssetGridProps> = ({
  assets,
  viewMode,
  selectedAssets,
  onAssetClick,
  onAssetSelect,
  onLoadMore
}) => {
  const observerRef = useRef<IntersectionObserver>();
  const lastAssetRef = useRef<HTMLDivElement>(null);

  // 无限滚动
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (lastAssetRef.current) {
      observerRef.current.observe(lastAssetRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [assets.length, onLoadMore]);

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-500">
        <Grid3X3 className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm">暂无素材</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-3' : 'space-y-2'}>
        {assets.map((asset, index) => (
          <div
            key={asset.id}
            ref={index === assets.length - 1 ? lastAssetRef : null}
          >
            <AssetItem
              asset={asset}
              viewMode={viewMode}
              isSelected={selectedAssets.includes(asset.id)}
              onClick={() => onAssetClick(asset)}
              onSelect={(isMultiSelect) => onAssetSelect(asset.id, isMultiSelect)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 素材项组件
interface AssetItemProps {
  asset: Asset;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onClick: () => void;
  onSelect: (isMultiSelect: boolean) => void;
}

const AssetItem: React.FC<AssetItemProps> = ({
  asset,
  viewMode,
  isSelected,
  onClick,
  onSelect
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      onSelect(true);
    } else {
      onClick();
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(true);
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
        }`}
        onClick={handleClick}
      >
        <div className="flex-shrink-0">
          <img
            src={asset.thumbnail}
            alt={asset.name}
            className="w-12 h-12 object-cover rounded"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900 truncate">{asset.name}</div>
          <div className="text-xs text-gray-500">
            {asset.type} • {asset.isCustom ? '自定义' : asset.source}
          </div>
        </div>
        <button
          onClick={handleSelectClick}
          className={`w-4 h-4 rounded border-2 ${
            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
          }`}
        >
          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      onClick={handleClick}
    >
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 group-hover:shadow-md transition-shadow">
        <img
          src={asset.thumbnail}
          alt={asset.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
          loading="lazy"
        />
        
        {/* 选择按钮 */}
        <button
          onClick={handleSelectClick}
          className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 bg-white ${
            isSelected ? 'border-blue-600' : 'border-gray-300 opacity-0 group-hover:opacity-100'
          } transition-opacity`}
        >
          {isSelected && <CheckCircle className="w-4 h-4 text-blue-600" />}
        </button>

        {/* 素材类型标识 */}
        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black bg-opacity-50 text-white text-xs rounded">
          {getAssetTypeLabel(asset.type)}
        </div>
      </div>
      
      <div className="text-xs text-center">
        <div className="font-medium text-gray-900 truncate">{asset.name}</div>
        {asset.dimensions && (
          <div className="text-gray-500">
            {asset.dimensions.width} × {asset.dimensions.height}
          </div>
        )}
      </div>
    </div>
  );
};

// 上传进度项组件
interface UploadProgressItemProps {
  upload: any;
}

const UploadProgressItem: React.FC<UploadProgressItemProps> = ({ upload }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-900 truncate">{upload.name}</span>
          <span className="text-xs text-gray-500">{upload.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              upload.status === 'error' ? 'bg-red-500' : 
              upload.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${upload.progress}%` }}
          />
        </div>
      </div>
      
      <div className="flex-shrink-0">
        {upload.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        {upload.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
        {upload.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
      </div>
    </div>
  );
};

// 上传模态框组件
interface UploadModalProps {
  onClose: () => void;
  onUpload: (files: FileList) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
      onClose();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">上传素材</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">拖拽文件到此处或</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            选择文件
          </button>
          <p className="text-xs text-gray-500 mt-2">
            支持 JPG、PNG、GIF、SVG 格式，最大 10MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

// 工具函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function getAssetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    image: '图片',
    icon: '图标',
    shape: '形状',
    pattern: '图案'
  };
  return labels[type] || type;
}