import React, { useState, useEffect } from 'react';
import {
  Search,
  Star,
  Palette,
  Type,
  X,
  ChevronRight,
  Download,
  Eye,
  Wand2
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { 
  ALL_DESIGN_TEMPLATES, 
  DesignTemplate,
  getTemplatesByCategory,
  searchTemplates
} from '@/data/designTemplates';
import { TemplateService } from '@/services/templateService';

interface DesignTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

// 分类信息
const TEMPLATE_CATEGORIES = [
  { key: 'avatar', name: '头像设计', icon: '👤', description: '个人头像、社交媒体头像' },
  { key: 'reading', name: '读书卡片', icon: '📚', description: '读书笔记、书摘、书评' },
  { key: 'education', name: '学习教育', icon: '🎓', description: '知识卡片、学习笔记' },
  { key: 'lifestyle', name: '生活记录', icon: '📔', description: '日记、心情、美食记录' },
  { key: 'business', name: '商业设计', icon: '💼', description: 'Logo、品牌、产品介绍' }
];

export const DesignTemplateSelector: React.FC<DesignTemplateSelectorProps> = ({
  isOpen,
  onClose,
  category = 'avatar'
}) => {
  const { canvas, updateCanvasState } = useEditorStore();
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [previewTemplate, setPreviewTemplate] = useState<DesignTemplate | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // 从本地存储加载收藏
  useEffect(() => {
    const savedFavorites = localStorage.getItem('template_favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // 保存收藏到本地存储
  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem('template_favorites', JSON.stringify([...newFavorites]));
  };

  // 切换收藏状态
  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  // 应用模板
  const applyTemplate = async (template: DesignTemplate) => {
    if (!canvas) return;

    setIsApplying(true);
    try {
      // 更新画布尺寸
      updateCanvasState({
        width: template.width,
        height: template.height
      });

      // 应用模板
      await TemplateService.applyTemplate(canvas, template);
      
      onClose();
    } catch (error) {
      console.error('Failed to apply template:', error);
    } finally {
      setIsApplying(false);
    }
  };

  // 预览模板
  const previewTemplateHandler = (template: DesignTemplate) => {
    setPreviewTemplate(template);
  };

  // 获取过滤后的模板
  const getFilteredTemplates = () => {
    if (searchQuery) {
      return searchTemplates(searchQuery);
    }
    
    if (selectedCategory === 'favorites') {
      const allTemplates = Object.values(ALL_DESIGN_TEMPLATES).flat();
      return allTemplates.filter(template => favorites.has(template.id));
    }
    
    return getTemplatesByCategory(selectedCategory);
  };

  if (!isOpen) return null;

  const filteredTemplates = getFilteredTemplates();
  const currentCategory = TEMPLATE_CATEGORIES.find(cat => cat.key === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[85vh] flex">
        {/* 左侧分类导航 */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* 头部 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">设计模板</h2>
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
                placeholder="搜索模板..."
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
                    <div className="text-xs text-gray-500">{favorites.size} 个模板</div>
                  </div>
                </button>
              </div>
            )}

            {/* 分类 */}
            <div className="space-y-2">
              {TEMPLATE_CATEGORIES.map((category) => {
                const categoryTemplates = getTemplatesByCategory(category.key);
                
                return (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.key ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500">{categoryTemplates.length} 个模板</div>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右侧模板展示 */}
        <div className="flex-1 flex flex-col">
          {/* 内容头部 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {searchQuery ? '搜索结果' : 
                   selectedCategory === 'favorites' ? '我的收藏' :
                   currentCategory?.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery ? `找到 ${filteredTemplates.length} 个结果` :
                   selectedCategory === 'favorites' ? '您收藏的设计模板' :
                   currentCategory?.description}
                </p>
              </div>
            </div>
          </div>

          {/* 模板网格 */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isFavorite={favorites.has(template.id)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                    onPreview={() => previewTemplateHandler(template)}
                    onApply={() => applyTemplate(template)}
                    isApplying={isApplying}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Wand2 size={48} className="mx-auto mb-4 opacity-50" />
                <p>暂无模板</p>
                <p className="text-sm">该分类下还没有设计模板</p>
              </div>
            )}
          </div>
        </div>

        {/* 预览面板 */}
        {previewTemplate && (
          <TemplatePreviewPanel
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onApply={() => applyTemplate(previewTemplate)}
            isApplying={isApplying}
          />
        )}
      </div>
    </div>
  );
};

// 模板卡片组件
interface TemplateCardProps {
  template: DesignTemplate;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPreview: () => void;
  onApply: () => void;
  isApplying: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isFavorite,
  onToggleFavorite,
  onPreview,
  onApply,
  isApplying
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* 模板预览图 */}
      <div className="aspect-square bg-gray-100 relative group">
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <Type size={48} />
        </div>
        
        {/* 悬停操作 */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onPreview}
            className="p-2 bg-white rounded-lg hover:bg-gray-100"
            title="预览"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={onApply}
            disabled={isApplying}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            title="应用模板"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* 模板信息 */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
          <button
            onClick={onToggleFavorite}
            className={`p-1 rounded transition-colors ${
              isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mb-3">{template.description}</p>
        
        {/* 标签 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 颜色调色板 */}
        <div className="flex items-center gap-1">
          <Palette size={12} className="text-gray-400" />
          <div className="flex gap-1">
            {template.colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 模板预览面板组件
interface TemplatePreviewPanelProps {
  template: DesignTemplate;
  onClose: () => void;
  onApply: () => void;
  isApplying: boolean;
}

const TemplatePreviewPanel: React.FC<TemplatePreviewPanelProps> = ({
  template,
  onClose,
  onApply,
  isApplying
}) => {
  return (
    <div className="w-96 border-l border-gray-200 flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">模板预览</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 预览内容 */}
      <div className="flex-1 p-4">
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          <Type size={48} className="text-gray-400" />
        </div>

        <h4 className="font-medium mb-2">{template.name}</h4>
        <p className="text-sm text-gray-600 mb-4">{template.description}</p>

        {/* 尺寸信息 */}
        <div className="mb-4">
          <div className="text-sm text-gray-500">尺寸</div>
          <div className="font-medium">{template.width} × {template.height}</div>
        </div>

        {/* 标签 */}
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">标签</div>
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 颜色调色板 */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">配色方案</div>
          <div className="grid grid-cols-4 gap-2">
            {template.colors.map((color, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-full h-8 rounded border border-gray-200 mb-1"
                  style={{ backgroundColor: color }}
                />
                <div className="text-xs text-gray-500">{color}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 应用按钮 */}
        <button
          onClick={onApply}
          disabled={isApplying}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? '应用中...' : '应用此模板'}
        </button>
      </div>
    </div>
  );
};