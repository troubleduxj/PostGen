import React, { useState, useRef, useCallback } from 'react';
import { Eye, Download, Heart, MoreHorizontal, User, Calendar, Tag } from 'lucide-react';
import { Template } from '@/types';

interface TemplateCardProps {
  template: Template;
  viewMode: 'grid' | 'list';
  onSelect: (template: Template) => void;
  onPreview?: (template: Template) => void;
  onFavorite?: (template: Template, isFavorited: boolean) => void;
  className?: string;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  viewMode,
  onSelect,
  onPreview,
  onFavorite,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // 处理图片加载
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  // 处理模板选择
  const handleSelect = useCallback(() => {
    onSelect(template);
  }, [template, onSelect]);

  // 处理预览
  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(template);
  }, [template, onPreview]);

  // 处理收藏
  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);
    onFavorite?.(template, isFavorited); // 传递当前状态，让父组件决定如何处理
  }, [template, onFavorite, isFavorited]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 生成缩略图占位符
  const generatePlaceholder = () => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
    const color = colors[template.id.length % colors.length];
    return (
      <div 
        className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
        style={{ backgroundColor: color }}
      >
        {template.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`template-card-list flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer ${className}`}
        onClick={handleSelect}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* 缩略图 */}
        <div className="flex-shrink-0 w-16 h-12 bg-gray-100 rounded overflow-hidden mr-4">
          {!imageError ? (
            <img
              ref={imageRef}
              src={template.thumbnail}
              alt={template.name}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            generatePlaceholder()
          )}
          {!imageLoaded && !imageError && (
            <div className="w-full h-full bg-gray-200 animate-pulse" />
          )}
        </div>

        {/* 模板信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {template.name}
              </h3>
              <p className="text-xs text-gray-500 truncate mt-1">
                {template.description}
              </p>
            </div>
            
            {/* 尺寸信息 */}
            <div className="flex-shrink-0 ml-4 text-xs text-gray-400">
              {template.width} × {template.height}
            </div>
          </div>

          {/* 标签和作者 */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              {template.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 2 && (
                <span className="text-xs text-gray-400">
                  +{template.tags.length - 2}
                </span>
              )}
            </div>

            {/* 操作按钮 */}
            {showActions && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={handlePreview}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="预览"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={handleFavorite}
                  className={`p-1 transition-colors ${
                    isFavorited 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                  title="收藏"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="更多"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 网格视图
  return (
    <div
      className={`template-card-grid bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ${className}`}
      onClick={handleSelect}
    >
      {/* 缩略图容器 */}
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        {!imageError ? (
          <img
            ref={imageRef}
            src={template.thumbnail}
            alt={template.name}
            className={`w-full h-full object-cover transition-all duration-200 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          generatePlaceholder()
        )}
        
        {/* 加载占位符 */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* 悬停操作层 */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button
              onClick={handlePreview}
              className="p-2 bg-white bg-opacity-90 rounded-full text-gray-700 hover:bg-opacity-100 transition-all"
              title="预览"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleFavorite}
              className={`p-2 bg-white bg-opacity-90 rounded-full transition-all hover:bg-opacity-100 ${
                isFavorited 
                  ? 'text-red-500' 
                  : 'text-gray-700 hover:text-red-500'
              }`}
              title="收藏"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* 尺寸标签 */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
          {template.width} × {template.height}
        </div>

        {/* 收藏状态指示器 */}
        {isFavorited && (
          <div className="absolute top-2 left-2">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
          </div>
        )}
      </div>

      {/* 模板信息 */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
            {template.name}
          </h3>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {template.description}
        </p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-400">
              +{template.tags.length - 3}
            </span>
          )}
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{template.author || '系统'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(template.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;