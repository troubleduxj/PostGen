import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Grid, List, Filter, Star, Clock, User, Plus, Save } from 'lucide-react';
import { Template, TemplateCategory } from '@/types';
import { templateCategories } from '@/data/templates';
import { useTemplateStore } from '@/stores/templateStore';
import { useEditorStore } from '@/stores/editorStore';
import { TemplateCard } from './TemplateCard';
import { TemplateProgressModal } from './TemplateProgressModal';
import { SaveTemplateModal } from './SaveTemplateModal';
import { CustomTemplateManager } from './CustomTemplateManager';

interface TemplatePanelProps {
  onTemplateSelect?: (template: Template) => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'popular';

export const TemplatePanel: React.FC<TemplatePanelProps> = ({
  onTemplateSelect,
  className = ''
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Template store
  const {
    selectedCategory,
    searchQuery,
    viewMode,
    sortBy,
    isApplyingTemplate,
    applicationProgress,
    error,
    isLoading,
    customTemplates,
    setSelectedCategory,
    setSearchQuery,
    setViewMode,
    setSortBy,
    getTemplatesByCategory,
    searchTemplates,
    applyTemplate,
    addToFavorites,
    removeFromFavorites,
    saveCustomTemplate,
    clearError
  } = useTemplateStore();

  // Editor store
  const { canvas } = useEditorStore();

  // 过滤和搜索模板
  const filteredTemplates = useMemo(() => {
    let result: Template[] = [];

    // 按分类过滤
    if (selectedCategory !== 'all') {
      result = getTemplatesByCategory(selectedCategory);
    } else {
      result = getTemplatesByCategory('all');
    }

    // 按搜索关键词过滤
    if (searchQuery.trim()) {
      const searchResults = searchTemplates(searchQuery);
      // 如果有分类选择，进一步过滤
      if (selectedCategory !== 'all') {
        result = searchResults.filter(template => {
          if (selectedCategory === 'custom') return !template.isPublic;
          if (selectedCategory === 'favorites') return true; // 收藏已在 store 中处理
          if (selectedCategory === 'recent') return true; // 最近使用已在 store 中处理
          return template.category === selectedCategory;
        });
      } else {
        result = searchResults;
      }
    }

    // 排序
    switch (sortBy) {
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'date':
        result = [...result].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case 'popular':
      default:
        // 保持原有顺序（假设已按热度排序）
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy, getTemplatesByCategory, searchTemplates]);

  // 监听应用模板状态
  useEffect(() => {
    if (isApplyingTemplate || applicationProgress) {
      setShowProgressModal(true);
    } else {
      setShowProgressModal(false);
    }
  }, [isApplyingTemplate, applicationProgress]);

  // 处理分类选择
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, [setSelectedCategory]);

  // 处理搜索
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  // 处理模板选择
  const handleTemplateSelect = useCallback(async (template: Template) => {
    if (!canvas) {
      console.error('Canvas not available');
      return;
    }

    try {
      clearError();
      await applyTemplate(canvas, template, {
        clearCanvas: true,
        preserveCanvasSize: false
      });
      onTemplateSelect?.(template);
    } catch (error) {
      console.error('Failed to apply template:', error);
    }
  }, [canvas, applyTemplate, onTemplateSelect, clearError]);

  // 处理收藏
  const handleFavorite = useCallback((template: Template, isFavorited: boolean) => {
    if (isFavorited) {
      removeFromFavorites(template.id);
    } else {
      addToFavorites(template.id);
    }
  }, [addToFavorites, removeFromFavorites]);

  // 处理进度模态框关闭
  const handleProgressModalClose = useCallback(() => {
    setShowProgressModal(false);
    clearError();
  }, [clearError]);

  // 处理保存模板
  const handleSaveTemplate = useCallback(async (templateInfo: any) => {
    if (!canvas) {
      console.error('Canvas not available');
      return;
    }

    try {
      await saveCustomTemplate(canvas, templateInfo);
    } catch (error) {
      console.error('Failed to save template:', error);
      throw error;
    }
  }, [canvas, saveCustomTemplate]);

  return (
    <div className={`template-panel flex flex-col h-full bg-white ${className}`}>
      {/* 头部搜索和控制区 */}
      <div className="template-header p-4 border-b border-gray-200">
        {/* 搜索框 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* 视图模式切换 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="网格视图"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="列表视图"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* 过滤器按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border ${
                showFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
              title="筛选"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* 排序选择 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="popular">热门</option>
            <option value="date">最新</option>
            <option value="name">名称</option>
          </select>
        </div>

        {/* 筛选器面板 */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">分类:</span>
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-3 h-3" />
                <span>保存模板</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`px-3 py-1 text-sm rounded-full border ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => handleCategorySelect('custom')}
                className={`px-3 py-1 text-sm rounded-full border flex items-center space-x-1 ${
                  selectedCategory === 'custom'
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>📝</span>
                <span>我的模板</span>
                <span className="text-xs opacity-75">({customTemplates.length})</span>
              </button>
              <button
                onClick={() => handleCategorySelect('favorites')}
                className={`px-3 py-1 text-sm rounded-full border flex items-center space-x-1 ${
                  selectedCategory === 'favorites'
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>⭐</span>
                <span>收藏</span>
              </button>
              <button
                onClick={() => handleCategorySelect('recent')}
                className={`px-3 py-1 text-sm rounded-full border flex items-center space-x-1 ${
                  selectedCategory === 'recent'
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>🕒</span>
                <span>最近使用</span>
              </button>
              {templateCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`px-3 py-1 text-sm rounded-full border flex items-center space-x-1 ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <span className="text-xs opacity-75">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 模板列表 */}
      <div className="template-content flex-1 overflow-y-auto">
        {selectedCategory === 'custom' ? (
          <div className="p-4">
            <CustomTemplateManager
              templates={customTemplates}
              onApply={handleTemplateSelect}
            />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-medium mb-2">未找到相关模板</p>
            <p className="text-sm">尝试调整搜索关键词或筛选条件</p>
          </div>
        ) : (
          <div className={`p-4 ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-3'
          }`}>
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                viewMode={viewMode}
                onSelect={handleTemplateSelect}
                onFavorite={(template, isFavorited) => handleFavorite(template, isFavorited)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部统计信息 */}
      <div className="template-footer px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>共 {filteredTemplates.length} 个模板</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>收藏</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>最近使用</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>我的模板</span>
            </div>
          </div>
        </div>
      </div>

      {/* 模板应用进度模态框 */}
      <TemplateProgressModal
        isOpen={showProgressModal}
        progress={applicationProgress}
        onClose={handleProgressModalClose}
      />

      {/* 保存模板模态框 */}
      <SaveTemplateModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveTemplate}
        isLoading={isLoading}
      />
    </div>
  );
};

export default TemplatePanel;