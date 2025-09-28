import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Star, Download, Check, X } from 'lucide-react';
import { googleFontsService, GoogleFont } from '@/services/googleFonts';
import { fontCacheService } from '@/services/fontCache';

interface FontSearchProps {
  onFontSelect: (fontFamily: string) => void;
  selectedFont?: string;
  className?: string;
}

export const FontSearch: React.FC<FontSearchProps> = ({
  onFontSelect,
  selectedFont,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleFont[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 从本地存储加载收藏
  useEffect(() => {
    const savedFavorites = localStorage.getItem('fontSearch_favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // 搜索字体
  const searchFonts = useMemo(() => {
    const debounce = (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
      };
    };

    return debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await googleFontsService.searchFonts(query);
        setSearchResults(results.slice(0, 20)); // 限制结果数量
      } catch (error) {
        console.error('Font search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  // 处理搜索输入
  useEffect(() => {
    searchFonts(searchQuery);
  }, [searchQuery, searchFonts]);

  // 加载字体预览
  const loadFontPreview = async (fontFamily: string) => {
    if (googleFontsService.isFontLoaded(fontFamily) || loadingFonts.has(fontFamily)) {
      return;
    }

    setLoadingFonts(prev => new Set(prev).add(fontFamily));

    try {
      await googleFontsService.loadFont(fontFamily, ['400']);
    } catch (error) {
      console.error(`Failed to load font preview for ${fontFamily}:`, error);
    } finally {
      setLoadingFonts(prev => {
        const newSet = new Set(prev);
        newSet.delete(fontFamily);
        return newSet;
      });
    }
  };

  // 切换收藏状态
  const toggleFavorite = (fontFamily: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(fontFamily)) {
      newFavorites.delete(fontFamily);
    } else {
      newFavorites.add(fontFamily);
    }
    setFavorites(newFavorites);
    localStorage.setItem('fontSearch_favorites', JSON.stringify([...newFavorites]));
  };

  // 处理字体选择
  const handleFontSelect = (fontFamily: string) => {
    onFontSelect(fontFamily);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="搜索 Google Fonts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 搜索结果 */}
      {(searchQuery || searchResults.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">搜索中...</span>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((font) => (
                <FontSearchItem
                  key={font.family}
                  font={font}
                  isSelected={selectedFont === font.family}
                  isLoading={loadingFonts.has(font.family)}
                  isLoaded={googleFontsService.isFontLoaded(font.family)}
                  isFavorite={favorites.has(font.family)}
                  onSelect={() => handleFontSelect(font.family)}
                  onToggleFavorite={() => toggleFavorite(font.family)}
                  onLoadPreview={() => loadFontPreview(font.family)}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="py-8 text-center text-gray-500">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">未找到匹配的字体</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

// 字体搜索项组件
interface FontSearchItemProps {
  font: GoogleFont;
  isSelected: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onLoadPreview: () => void;
}

const FontSearchItem: React.FC<FontSearchItemProps> = ({
  font,
  isSelected,
  isLoading,
  isLoaded,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onLoadPreview
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!isLoaded && !isLoading) {
      onLoadPreview();
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900 truncate">{font.family}</span>
          <span className="text-xs text-gray-500 capitalize">{font.category}</span>
          {isLoading && <Loader2 className="animate-spin text-blue-500" size={12} />}
          {isLoaded && <Check className="text-green-500" size={12} />}
        </div>
        
        <div
          className="text-lg text-gray-700 truncate"
          style={{
            fontFamily: isLoaded ? font.family : 'Arial',
            opacity: isLoaded ? 1 : 0.7
          }}
        >
          海报设计 Poster Design
        </div>
        
        {isHovered && !isLoaded && !isLoading && (
          <div className="text-xs text-blue-600 mt-1">
            点击加载字体预览
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-1 rounded transition-colors ${
            isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'
          }`}
          title={isFavorite ? '取消收藏' : '添加收藏'}
        >
          <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        
        {isLoaded && (
          <div className="text-green-500" title="字体已加载">
            <Download size={14} />
          </div>
        )}
      </div>
    </div>
  );
};