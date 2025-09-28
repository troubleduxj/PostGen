import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Check,
  Loader2,
  Star,
  Grid3X3,
  List,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';
import { googleFontsService, GoogleFont } from '@/services/googleFonts';
import { useTextEditorStore } from '@/stores/textEditorStore';
import { FontSearch } from './FontSearch';

interface FontLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onFontSelect: (fontFamily: string) => void;
}

// 字体分类
const FONT_CATEGORIES = [
  { id: 'all', name: '全部', value: '' },
  { id: 'sans-serif', name: '无衬线', value: 'sans-serif' },
  { id: 'serif', name: '衬线', value: 'serif' },
  { id: 'display', name: '展示', value: 'display' },
  { id: 'handwriting', name: '手写', value: 'handwriting' },
  { id: 'monospace', name: '等宽', value: 'monospace' }
];

// 排序选项
const SORT_OPTIONS = [
  { id: 'popularity', name: '热门度', value: 'popularity' },
  { id: 'alpha', name: '字母顺序', value: 'alpha' },
  { id: 'date', name: '最新', value: 'date' },
  { id: 'trending', name: '趋势', value: 'trending' }
];

export const FontLibrary: React.FC<FontLibraryProps> = ({
  isOpen,
  onClose,
  onFontSelect
}) => {
  const { recentFonts, addToRecentFonts } = useTextEditorStore();
  
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'alpha' | 'date' | 'trending'>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set());
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // 加载字体列表
  useEffect(() => {
    if (isOpen && fonts.length === 0) {
      loadFonts();
    }
  }, [isOpen]);

  // 从本地存储加载收藏字体
  useEffect(() => {
    const savedFavorites = localStorage.getItem('fontLibrary_favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  const loadFonts = async () => {
    setLoading(true);
    try {
      const fontList = await googleFontsService.getPopularFonts(200);
      setFonts(fontList);
    } catch (error) {
      console.error('Failed to load fonts:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤和排序字体
  const filteredFonts = useMemo(() => {
    let filtered = fonts;

    // 按分类过滤
    if (selectedCategory) {
      filtered = filtered.filter(font => font.category === selectedCategory);
    }

    // 按搜索词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(font =>
        font.family.toLowerCase().includes(query)
      );
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'alpha':
          return a.family.localeCompare(b.family);
        case 'date':
        case 'trending':
        case 'popularity':
        default:
          return 0; // Google Fonts API 已经按指定顺序返回
      }
    });

    return filtered;
  }, [fonts, selectedCategory, searchQuery, sortBy]);

  // 处理字体选择
  const handleFontSelect = async (fontFamily: string) => {
    // 添加到最近使用
    addToRecentFonts(fontFamily);
    
    // 加载字体
    if (!googleFontsService.isFontLoaded(fontFamily)) {
      setLoadingFonts(prev => new Set(prev).add(fontFamily));
      
      try {
        await googleFontsService.loadFont(fontFamily);
        setLoadedFonts(prev => new Set(prev).add(fontFamily));
      } catch (error) {
        console.error(`Failed to load font ${fontFamily}:`, error);
      } finally {
        setLoadingFonts(prev => {
          const newSet = new Set(prev);
          newSet.delete(fontFamily);
          return newSet;
        });
      }
    }
    
    // 通知父组件
    onFontSelect(fontFamily);
    onClose();
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
    localStorage.setItem('fontLibrary_favorites', JSON.stringify([...newFavorites]));
  };

  // 预加载字体预览
  const preloadFontPreview = async (fontFamily: string) => {
    if (!googleFontsService.isFontLoaded(fontFamily) && !googleFontsService.isFontLoading(fontFamily)) {
      try {
        await googleFontsService.loadFont(fontFamily, ['400']);
        setLoadedFonts(prev => new Set(prev).add(fontFamily));
      } catch (error) {
        console.error(`Failed to preload font ${fontFamily}:`, error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">字体库</h2>
            <span className="text-sm text-gray-500">
              {filteredFonts.length} 个字体
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* 工具栏 */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* 搜索和视图控制 */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <FontSearch
                onFontSelect={onFontSelect}
                selectedFont={undefined}
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              <Filter size={16} />
            </button>
            
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* 过滤器 */}
          {showFilters && (
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">分类:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  {FONT_CATEGORIES.map(category => (
                    <option key={category.id} value={category.value}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">排序:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.id} value={option.value}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 字体列表 */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="animate-spin" size={20} />
                <span>加载字体中...</span>
              </div>
            </div>
          ) : (
            <>
              {/* 最近使用的字体 */}
              {recentFonts.length > 0 && !searchQuery && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">最近使用</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recentFonts.slice(0, 6).map(fontFamily => (
                      <FontPreviewCard
                        key={`recent-${fontFamily}`}
                        fontFamily={fontFamily}
                        category=""
                        isLoading={loadingFonts.has(fontFamily)}
                        isLoaded={loadedFonts.has(fontFamily) || googleFontsService.isFontLoaded(fontFamily)}
                        isFavorite={favorites.has(fontFamily)}
                        viewMode={viewMode}
                        onSelect={() => handleFontSelect(fontFamily)}
                        onToggleFavorite={() => toggleFavorite(fontFamily)}
                        onPreload={() => preloadFontPreview(fontFamily)}
                      />
                    ))}
                  </div>
                  <div className="border-t border-gray-200 my-6" />
                </div>
              )}

              {/* 字体网格/列表 */}
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-2'
              }>
                {filteredFonts.map(font => (
                  <FontPreviewCard
                    key={font.family}
                    fontFamily={font.family}
                    category={font.category}
                    isLoading={loadingFonts.has(font.family)}
                    isLoaded={loadedFonts.has(font.family) || googleFontsService.isFontLoaded(font.family)}
                    isFavorite={favorites.has(font.family)}
                    viewMode={viewMode}
                    onSelect={() => handleFontSelect(font.family)}
                    onToggleFavorite={() => toggleFavorite(font.family)}
                    onPreload={() => preloadFontPreview(font.family)}
                  />
                ))}
              </div>

              {filteredFonts.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p>未找到匹配的字体</p>
                  <p className="text-sm">尝试调整搜索条件或分类筛选</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// 字体预览卡片组件
interface FontPreviewCardProps {
  fontFamily: string;
  category: string;
  isLoading: boolean;
  isLoaded: boolean;
  isFavorite: boolean;
  viewMode: 'grid' | 'list';
  onSelect: () => void;
  onToggleFavorite: () => void;
  onPreload: () => void;
}

const FontPreviewCard: React.FC<FontPreviewCardProps> = ({
  fontFamily,
  category,
  isLoading,
  isLoaded,
  isFavorite,
  viewMode,
  onSelect,
  onToggleFavorite,
  onPreload
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // 预览文本
  const previewText = '海报设计 Poster Design';

  // 鼠标悬停时预加载字体
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!isLoaded && !isLoading) {
      onPreload();
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onSelect}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{fontFamily}</span>
            <span className="text-xs text-gray-500 capitalize">{category}</span>
            {isLoading && <Loader2 className="animate-spin" size={12} />}
            {isLoaded && <Check className="text-green-500" size={12} />}
          </div>
          <div
            className="text-lg text-gray-700"
            style={{
              fontFamily: isLoaded ? fontFamily : 'Arial',
              opacity: isLoaded ? 1 : 0.7
            }}
          >
            {previewText}
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-2 rounded-lg transition-colors ${
            isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{fontFamily}</h4>
          <p className="text-xs text-gray-500 capitalize">{category}</p>
        </div>
        
        <div className="flex items-center gap-1">
          {isLoading && <Loader2 className="animate-spin text-blue-500" size={14} />}
          {isLoaded && <Check className="text-green-500" size={14} />}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`p-1 rounded transition-colors ${
              isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      
      <div
        className="text-lg text-gray-700 leading-relaxed"
        style={{
          fontFamily: isLoaded ? fontFamily : 'Arial',
          opacity: isLoaded ? 1 : 0.7,
          minHeight: '2.5rem'
        }}
      >
        {previewText}
      </div>
      
      {isHovered && !isLoaded && !isLoading && (
        <div className="mt-2 text-xs text-blue-600">
          点击加载字体预览
        </div>
      )}
    </div>
  );
};