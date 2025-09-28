import React, { useState, useEffect } from 'react';
import { Loader2, Download, Check, Star } from 'lucide-react';
import { googleFontsService } from '@/services/googleFonts';

interface FontPreviewProps {
  fontFamily: string;
  text?: string;
  size?: number;
  className?: string;
  showControls?: boolean;
  onFontSelect?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export const FontPreview: React.FC<FontPreviewProps> = ({
  fontFamily,
  text = '海报设计 Poster Design Aa Bb Cc 123',
  size = 18,
  className = '',
  showControls = false,
  onFontSelect,
  onToggleFavorite,
  isFavorite = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // 检查字体是否已加载
  useEffect(() => {
    const checkLoaded = () => {
      const loaded = googleFontsService.isFontLoaded(fontFamily);
      setIsLoaded(loaded);
    };

    checkLoaded();
    
    // 定期检查字体加载状态
    const interval = setInterval(checkLoaded, 500);
    
    return () => clearInterval(interval);
  }, [fontFamily]);

  // 加载字体
  const loadFont = async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setLoadError(false);

    try {
      const success = await googleFontsService.loadFont(fontFamily);
      if (success) {
        setIsLoaded(true);
      } else {
        setLoadError(true);
      }
    } catch (error) {
      console.error(`Failed to load font ${fontFamily}:`, error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 鼠标悬停时自动加载字体
  const handleMouseEnter = () => {
    if (!isLoaded && !isLoading && !loadError) {
      loadFont();
    }
  };

  return (
    <div
      className={`font-preview ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{fontFamily}</span>
          {isLoading && <Loader2 className="animate-spin text-blue-500" size={14} />}
          {isLoaded && <Check className="text-green-500" size={14} />}
          {loadError && <span className="text-red-500 text-xs">加载失败</span>}
        </div>
        
        {showControls && (
          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                className={`p-1 rounded transition-colors ${
                  isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'
                }`}
                title={isFavorite ? '取消收藏' : '添加收藏'}
              >
                <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
            
            {isLoaded && (
              <div className="text-green-500" title="字体已加载">
                <Download size={14} />
              </div>
            )}
          </div>
        )}
      </div>
      
      <div
        className={`text-gray-700 leading-relaxed cursor-pointer transition-all hover:text-gray-900 ${
          onFontSelect ? 'hover:bg-gray-50 p-2 rounded' : ''
        }`}
        style={{
          fontFamily: isLoaded ? fontFamily : 'Arial',
          fontSize: `${size}px`,
          opacity: isLoaded ? 1 : 0.7,
          minHeight: `${size * 1.5}px`,
          display: 'flex',
          alignItems: 'center'
        }}
        onClick={onFontSelect}
      >
        {loadError ? (
          <span className="text-red-500 text-sm">
            字体加载失败，点击重试
          </span>
        ) : (
          text
        )}
      </div>
      
      {!isLoaded && !isLoading && !loadError && (
        <div className="text-xs text-blue-600 mt-1">
          悬停或点击加载字体预览
        </div>
      )}
    </div>
  );
};

// 字体预览网格组件
interface FontPreviewGridProps {
  fonts: string[];
  onFontSelect: (fontFamily: string) => void;
  selectedFont?: string;
  className?: string;
}

export const FontPreviewGrid: React.FC<FontPreviewGridProps> = ({
  fonts,
  onFontSelect,
  selectedFont,
  className = ''
}) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 从本地存储加载收藏
  useEffect(() => {
    const saved = localStorage.getItem('fontPreview_favorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  // 切换收藏状态
  const toggleFavorite = (fontFamily: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(fontFamily)) {
      newFavorites.delete(fontFamily);
    } else {
      newFavorites.add(fontFamily);
    }
    setFavorites(newFavorites);
    localStorage.setItem('fontPreview_favorites', JSON.stringify([...newFavorites]));
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {fonts.map((fontFamily) => (
        <div
          key={fontFamily}
          className={`border rounded-lg p-4 transition-all hover:shadow-md ${
            selectedFont === fontFamily ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <FontPreview
            fontFamily={fontFamily}
            showControls={true}
            onFontSelect={() => onFontSelect(fontFamily)}
            onToggleFavorite={() => toggleFavorite(fontFamily)}
            isFavorite={favorites.has(fontFamily)}
          />
        </div>
      ))}
    </div>
  );
};