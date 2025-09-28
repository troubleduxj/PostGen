import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Smartphone,
  User,
  BookOpen,
  GraduationCap,
  Heart,
  Briefcase,
  Image,
  Printer,
  Settings,
  Search,
  Star,
  Maximize2,
  RotateCw,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { 
  ALL_CANVAS_PRESETS, 
  PRESET_CATEGORIES, 
  CanvasPreset,
  searchPresets,
  getPresetsByCategory
} from '@/config/canvasPresets';

interface EnhancedCanvasSizeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

// 分类图标映射
const CATEGORY_ICONS = {
  social: Smartphone,
  mobile: Smartphone,
  avatar: User,
  reading: BookOpen,
  education: GraduationCap,
  lifestyle: Heart,
  business: Briefcase,
  poster: Image,
  print: Printer,
  digital: Monitor,
  custom: Settings
};

export const EnhancedCanvasSizeSelector: React.FC<EnhancedCanvasSizeSelectorProps> = ({
  isOpen,
  onClose
}) => {
  const { canvasState, updateCanvasState } = useEditorStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('social');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [customSize, setCustomSize] = useState({ width: 1080, height: 1080 });
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['social']));

  // 从本地存储加载收藏
  useEffect(() => {
    const savedFavorites = localStorage.getItem('canvas_favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // 保存收藏到本地存储
  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem('canvas_favorites', JSON.stringify([...newFavorites]));
  };

  // 切换收藏状态
  const toggleFavorite = (presetKey: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(presetKey)) {
      newFavorites.delete(presetKey);
    } else {
      newFavorites.add(presetKey);
    }
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  // 应用预设尺寸
  const applyPreset = (preset: CanvasPreset) => {
    updateCanvasState({
      width: preset.width,
      height: preset.height
    });
    onClose();
  };

  // 应用自定义尺寸
  const applyCustomSize = () => {
    updateCanvasState({
      width: customSize.width,
      height: customSize.height
    });
    onClose();
  };

  // 交换宽高
  const swapDimensions = () => {
    setCustomSize(prev => ({
      width: prev.height,
      height: prev.width
    }));
  };

  // 获取过滤后的预设
  const getFilteredPresets = () => {
    if (searchQuery) {
      return searchPresets(searchQuery);
    }
    
    if (selectedCategory === 'favorites') {
      const allPresets = Object.values(ALL_CANVAS_PRESETS).flat();
      return allPresets.filter(preset => 
        favorites.has(`${preset.category}-${preset.name}`)
      );
    }
    
    return getPresetsByCategory(selectedCategory as keyof typeof ALL_CANVAS_PRESETS);
  };

  // 切换分类展开状态
  const toggleCategoryExpanded = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  if (!isOpen) return null;

  const filteredPresets = getFilteredPresets();
  const popularCategories = PRESET_CATEGORIES.filter(cat => cat.popular);
  const otherCategories = PRESET_CATEGORIES.filter(cat => !cat.popular);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex">
        {/* 左侧分类导航 */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* 头部 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">画布尺寸</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="搜索尺寸..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* 分类列表 */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* 收藏夹 */}
            {favorites.size > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setSelectedCategory('favorites')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedCategory === 'favorites' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <Star size={20} />
                  <div>
                    <div className="font-medium">我的收藏</div>
                    <div className="text-xs text-gray-500">{favorites.size} 个收藏</div>
                  </div>
                </button>
              </div>
            )}

            {/* 热门分类 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">热门分类</h3>
              <div className="space-y-1">
                {popularCategories.map((category) => {
                  const Icon = CATEGORY_ICONS[category.key];
                  const isExpanded = expandedCategories.has(category.key);
                  const categoryPresets = getPresetsByCategory(category.key);
                  
                  return (
                    <div key={category.key}>
                      <button
                        onClick={() => {
                          setSelectedCategory(category.key);
                          toggleCategoryExpanded(category.key);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedCategory === category.key ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={20} />
                        <div className="flex-1">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-gray-500">{categoryPresets.length} 个尺寸</div>
                        </div>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      
                      {/* 子预设列表 */}
                      {isExpanded && selectedCategory === category.key && (
                        <div className="ml-8 mt-2 space-y-1">
                          {categoryPresets.slice(0, 5).map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => applyPreset(preset)}
                              className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded"
                            >
                              <div className="font-medium">{preset.name}</div>
                              <div className="text-xs text-gray-500">{preset.width} × {preset.height}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 其他分类 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">其他分类</h3>
              <div className="space-y-1">
                {otherCategories.map((category) => {
                  const Icon = CATEGORY_ICONS[category.key];
                  const categoryPresets = getPresetsByCategory(category.key);
                  
                  return (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.key ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500">{categoryPresets.length} 个尺寸</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 自定义尺寸 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50"
              >
                <Settings size={20} />
                <div>
                  <div className="font-medium">自定义尺寸</div>
                  <div className="text-xs text-gray-500">输入自定义宽高</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 flex flex-col">
          {/* 内容头部 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {searchQuery ? '搜索结果' : 
                   selectedCategory === 'favorites' ? '我的收藏' :
                   PRESET_CATEGORIES.find(cat => cat.key === selectedCategory)?.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery ? `找到 ${filteredPresets.length} 个结果` :
                   selectedCategory === 'favorites' ? '您收藏的画布尺寸' :
                   PRESET_CATEGORIES.find(cat => cat.key === selectedCategory)?.description}
                </p>
              </div>
              
              {/* 当前画布尺寸 */}
              <div className="text-right">
                <div className="text-sm text-gray-500">当前尺寸</div>
                <div className="font-medium">{canvasState.width} × {canvasState.height}</div>
              </div>
            </div>
          </div>

          {/* 预设网格 */}
          <div className="flex-1 overflow-y-auto p-6">
            {showCustomInput ? (
              /* 自定义尺寸输入 */
              <div className="max-w-md mx-auto">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium mb-4">自定义画布尺寸</h4>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">宽度 (px)</label>
                        <input
                          type="number"
                          value={customSize.width}
                          onChange={(e) => setCustomSize(prev => ({ ...prev, width: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="1"
                          max="10000"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          onClick={swapDimensions}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          title="交换宽高"
                        >
                          <RotateCw size={20} />
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">高度 (px)</label>
                        <input
                          type="number"
                          value={customSize.height}
                          onChange={(e) => setCustomSize(prev => ({ ...prev, height: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="1"
                          max="10000"
                        />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-2">
                        比例: {(customSize.width / customSize.height).toFixed(2)}:1
                      </div>
                      <button
                        onClick={applyCustomSize}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        应用尺寸
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 预设尺寸网格 */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPresets.map((preset) => {
                  const presetKey = `${preset.category}-${preset.name}`;
                  const isFavorite = favorites.has(presetKey);
                  
                  return (
                    <div
                      key={presetKey}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => applyPreset(preset)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{preset.icon}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{preset.name}</h4>
                            <p className="text-sm text-gray-500">{preset.ratio}</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(presetKey);
                          }}
                          className={`p-1 rounded transition-colors ${
                            isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      
                      <div className="mb-3">
                        <div className="font-medium text-gray-900">{preset.width} × {preset.height}</div>
                        {preset.description && (
                          <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                        )}
                      </div>
                      
                      {/* 尺寸预览 */}
                      <div className="bg-gray-100 rounded p-2 flex items-center justify-center h-16">
                        <div
                          className="bg-blue-200 border border-blue-300"
                          style={{
                            width: Math.min(40, (preset.width / Math.max(preset.width, preset.height)) * 40),
                            height: Math.min(40, (preset.height / Math.max(preset.width, preset.height)) * 40),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {filteredPresets.length === 0 && !showCustomInput && (
              <div className="text-center py-12 text-gray-500">
                <Maximize2 size={48} className="mx-auto mb-4 opacity-50" />
                <p>未找到匹配的尺寸预设</p>
                <p className="text-sm">尝试调整搜索条件或选择其他分类</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};