import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Template, TemplateCategory } from '@/types';
import { templates, templateCategories } from '@/data/templates';
import { templateService, TemplateApplicationProgress } from '@/services/templateService';
import { 
  DesignTemplate, 
  TemplateSearchQuery, 
  TemplateSearchResult, 
  RecommendationCriteria,
  TemplateFilters,
  TemplateStats,
  TemplateCategory as NewTemplateCategory,
  TemplateValidationResult
} from '@/types/template';

interface TemplateState {
  // 模板数据
  templates: Template[];
  categories: TemplateCategory[];
  customTemplates: Template[];
  favoriteTemplates: string[]; // 收藏的模板ID列表
  recentTemplates: string[]; // 最近使用的模板ID列表
  
  // UI状态
  selectedCategory: string;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'date' | 'popular';
  isLoading: boolean;
  error: string | null;
  
  // 应用模板状态
  isApplyingTemplate: boolean;
  applicationProgress: TemplateApplicationProgress | null;
  
  // 预览状态
  previewTemplate: Template | null;
  isGeneratingPreview: boolean;
}

interface TemplateStore extends TemplateState {
  // 模板获取
  getAllTemplates: () => Template[];
  getTemplatesByCategory: (categoryId: string) => Template[];
  searchTemplates: (query: string) => Template[];
  getTemplate: (templateId: string) => Template | undefined;
  getFavoriteTemplates: () => Template[];
  getRecentTemplates: () => Template[];
  
  // 筛选和排序
  setSelectedCategory: (categoryId: string) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sortBy: 'name' | 'date' | 'popular') => void;
  
  // 模板操作
  applyTemplate: (canvas: fabric.Canvas, template: Template, options?: any) => Promise<void>;
  previewTemplate: (template: Template) => Promise<string>;
  addToFavorites: (templateId: string) => void;
  removeFromFavorites: (templateId: string) => void;
  addToRecent: (templateId: string) => void;
  
  // 自定义模板管理
  saveCustomTemplate: (canvas: fabric.Canvas, templateInfo: any) => Promise<Template>;
  deleteCustomTemplate: (templateId: string) => void;
  updateCustomTemplate: (templateId: string, updates: Partial<Template>) => void;
  
  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 重置
  reset: () => void;
}

const initialState: TemplateState = {
  templates: templates,
  categories: templateCategories,
  customTemplates: [],
  favoriteTemplates: [],
  recentTemplates: [],
  
  selectedCategory: 'all',
  searchQuery: '',
  viewMode: 'grid',
  sortBy: 'popular',
  isLoading: false,
  error: null,
  
  isApplyingTemplate: false,
  applicationProgress: null,
  
  previewTemplate: null,
  isGeneratingPreview: false,
};

// 新的设计模板存储接口
export interface DesignTemplateStore {
  // 模板数据
  templates: Map<string, DesignTemplate>;
  userTemplates: Map<string, DesignTemplate>;
  templateStats: Map<string, TemplateStats>;
  
  // 缓存管理
  cache: Map<string, any>;
  cacheExpiry: Map<string, number>;
  maxCacheSize: number;
  
  // 状态
  isLoading: boolean;
  error: string | null;
  
  // 基础 CRUD 操作
  getTemplate: (id: string) => Promise<DesignTemplate | null>;
  getTemplatesByCategory: (category: NewTemplateCategory) => Promise<DesignTemplate[]>;
  getTemplatesBySize: (width: number, height: number) => Promise<DesignTemplate[]>;
  getAllTemplates: () => Promise<DesignTemplate[]>;
  
  // 搜索和筛选
  searchTemplates: (query: TemplateSearchQuery) => Promise<TemplateSearchResult>;
  filterTemplates: (filters: TemplateFilters) => Promise<DesignTemplate[]>;
  
  // 用户模板管理
  saveUserTemplate: (template: DesignTemplate) => Promise<string>;
  getUserTemplates: (userId?: string) => Promise<DesignTemplate[]>;
  updateUserTemplate: (id: string, updates: Partial<DesignTemplate>) => Promise<void>;
  deleteUserTemplate: (id: string) => Promise<void>;
  
  // 推荐系统
  getRecommendedTemplates: (criteria: RecommendationCriteria) => Promise<DesignTemplate[]>;
  getTrendingTemplates: (limit?: number) => Promise<DesignTemplate[]>;
  getPopularTemplates: (limit?: number) => Promise<DesignTemplate[]>;
  
  // 统计和分析
  updateTemplateStats: (templateId: string, action: 'view' | 'use' | 'favorite') => Promise<void>;
  getTemplateStats: (templateId: string) => Promise<TemplateStats | null>;
  
  // 缓存管理
  clearCache: () => void;
  getCacheSize: () => number;
  evictExpiredCache: () => void;
  
  // 本地存储
  saveToLocalStorage: (key: string, data: any) => void;
  loadFromLocalStorage: (key: string) => any;
  removeFromLocalStorage: (key: string) => void;
  
  // 验证
  validateTemplate: (template: DesignTemplate) => TemplateValidationResult;
  
  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// 创建新的设计模板存储
export const useDesignTemplateStore = create<DesignTemplateStore>()(
  persist(
    devtools(
      (set, get) => ({
        // 初始状态
        templates: new Map(),
        userTemplates: new Map(),
        templateStats: new Map(),
        cache: new Map(),
        cacheExpiry: new Map(),
        maxCacheSize: 100,
        isLoading: false,
        error: null,

        // 基础 CRUD 操作
        getTemplate: async (id: string) => {
          const state = get();
          
          // 先检查缓存
          const cacheKey = `template_${id}`;
          if (state.cache.has(cacheKey)) {
            const expiry = state.cacheExpiry.get(cacheKey);
            if (expiry && expiry > Date.now()) {
              return state.cache.get(cacheKey);
            }
          }
          
          // 从内存中查找
          let template = state.templates.get(id) || state.userTemplates.get(id);
          
          if (!template) {
            // 尝试从本地存储加载
            const stored = state.loadFromLocalStorage(`template_${id}`);
            if (stored) {
              template = stored;
              // 添加到内存
              if (stored.metadata?.author === 'user') {
                state.userTemplates.set(id, template);
              } else {
                state.templates.set(id, template);
              }
            }
          }
          
          if (template) {
            // 添加到缓存
            state.cache.set(cacheKey, template);
            state.cacheExpiry.set(cacheKey, Date.now() + 5 * 60 * 1000); // 5分钟缓存
            
            // 更新查看统计
            await get().updateTemplateStats(id, 'view');
          }
          
          return template || null;
        },

        getTemplatesByCategory: async (category: NewTemplateCategory) => {
          const state = get();
          const allTemplates = [...state.templates.values(), ...state.userTemplates.values()];
          return allTemplates.filter(template => template.category === category);
        },

        getTemplatesBySize: async (width: number, height: number) => {
          const state = get();
          const allTemplates = [...state.templates.values(), ...state.userTemplates.values()];
          const tolerance = 50; // 允许50像素的误差
          
          return allTemplates.filter(template => 
            Math.abs(template.canvas.width - width) <= tolerance &&
            Math.abs(template.canvas.height - height) <= tolerance
          );
        },

        getAllTemplates: async () => {
          const state = get();
          return [...state.templates.values(), ...state.userTemplates.values()];
        },

        // 搜索和筛选
        searchTemplates: async (query: TemplateSearchQuery) => {
          const state = get();
          let templates = await get().getAllTemplates();
          
          // 应用筛选条件
          if (query.category) {
            templates = templates.filter(t => t.category === query.category);
          }
          
          if (query.style) {
            templates = templates.filter(t => t.metadata.style === query.style);
          }
          
          if (query.size) {
            const tolerance = 50;
            templates = templates.filter(t => 
              Math.abs(t.canvas.width - query.size!.width) <= tolerance &&
              Math.abs(t.canvas.height - query.size!.height) <= tolerance
            );
          }
          
          if (query.colors && query.colors.length > 0) {
            templates = templates.filter(t => 
              query.colors!.some(color => t.metadata.colors.includes(color))
            );
          }
          
          if (query.industry && query.industry.length > 0) {
            templates = templates.filter(t => 
              query.industry!.some(industry => t.metadata.industry.includes(industry))
            );
          }
          
          if (query.tags && query.tags.length > 0) {
            templates = templates.filter(t => 
              query.tags!.some(tag => t.metadata.tags.includes(tag))
            );
          }
          
          if (query.difficulty) {
            templates = templates.filter(t => t.metadata.difficulty === query.difficulty);
          }
          
          if (query.keyword) {
            const keyword = query.keyword.toLowerCase();
            templates = templates.filter(t => 
              t.name.toLowerCase().includes(keyword) ||
              t.description.toLowerCase().includes(keyword) ||
              t.metadata.tags.some(tag => tag.toLowerCase().includes(keyword))
            );
          }
          
          // 分页处理
          const page = 1;
          const pageSize = 20;
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedTemplates = templates.slice(startIndex, endIndex);
          
          return {
            templates: paginatedTemplates,
            total: templates.length,
            page,
            pageSize,
            hasMore: endIndex < templates.length
          };
        },

        filterTemplates: async (filters: TemplateFilters) => {
          const query: TemplateSearchQuery = {
            category: filters.category,
            style: filters.style?.[0],
            colors: filters.colors,
            industry: filters.industry,
            difficulty: filters.difficulty?.[0],
            tags: filters.tags
          };
          
          const result = await get().searchTemplates(query);
          return result.templates;
        },

        // 用户模板管理
        saveUserTemplate: async (template: DesignTemplate) => {
          const state = get();
          const templateId = template.id || `user_template_${Date.now()}`;
          const userTemplate = {
            ...template,
            id: templateId,
            metadata: {
              ...template.metadata,
              author: 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          };
          
          // 保存到内存
          state.userTemplates.set(templateId, userTemplate);
          
          // 保存到本地存储
          state.saveToLocalStorage(`template_${templateId}`, userTemplate);
          state.saveToLocalStorage('user_template_ids', 
            Array.from(state.userTemplates.keys())
          );
          
          set({ userTemplates: new Map(state.userTemplates) });
          
          return templateId;
        },

        getUserTemplates: async (userId?: string) => {
          const state = get();
          return Array.from(state.userTemplates.values());
        },

        updateUserTemplate: async (id: string, updates: Partial<DesignTemplate>) => {
          const state = get();
          const template = state.userTemplates.get(id);
          
          if (template) {
            const updatedTemplate = {
              ...template,
              ...updates,
              metadata: {
                ...template.metadata,
                ...updates.metadata,
                updatedAt: new Date().toISOString()
              }
            };
            
            state.userTemplates.set(id, updatedTemplate);
            state.saveToLocalStorage(`template_${id}`, updatedTemplate);
            
            set({ userTemplates: new Map(state.userTemplates) });
          }
        },

        deleteUserTemplate: async (id: string) => {
          const state = get();
          state.userTemplates.delete(id);
          state.removeFromLocalStorage(`template_${id}`);
          
          // 更新用户模板ID列表
          state.saveToLocalStorage('user_template_ids', 
            Array.from(state.userTemplates.keys())
          );
          
          set({ userTemplates: new Map(state.userTemplates) });
        },

        // 推荐系统
        getRecommendedTemplates: async (criteria: RecommendationCriteria) => {
          const templates = await get().getAllTemplates();
          let scored = templates.map(template => ({
            template,
            score: 0
          }));
          
          // 基于画布尺寸的推荐
          if (criteria.canvasSize) {
            scored = scored.map(item => {
              const sizeDiff = Math.abs(item.template.canvas.width - criteria.canvasSize.width) +
                              Math.abs(item.template.canvas.height - criteria.canvasSize.height);
              const sizeScore = Math.max(0, 100 - sizeDiff / 10);
              return { ...item, score: item.score + sizeScore };
            });
          }
          
          // 基于用户历史的推荐
          if (criteria.userHistory.length > 0) {
            const historyTemplates = await Promise.all(
              criteria.userHistory.map(id => get().getTemplate(id))
            );
            const historyStyles = historyTemplates
              .filter(Boolean)
              .map(t => t!.metadata.style);
            
            scored = scored.map(item => {
              const styleScore = historyStyles.includes(item.template.metadata.style) ? 50 : 0;
              return { ...item, score: item.score + styleScore };
            });
          }
          
          // 基于偏好风格的推荐
          if (criteria.preferredStyles.length > 0) {
            scored = scored.map(item => {
              const styleScore = criteria.preferredStyles.includes(item.template.metadata.style) ? 30 : 0;
              return { ...item, score: item.score + styleScore };
            });
          }
          
          // 基于行业的推荐
          if (criteria.industry) {
            scored = scored.map(item => {
              const industryScore = item.template.metadata.industry.includes(criteria.industry!) ? 40 : 0;
              return { ...item, score: item.score + industryScore };
            });
          }
          
          // 基于关键词的推荐
          if (criteria.keywords && criteria.keywords.length > 0) {
            scored = scored.map(item => {
              const keywordScore = criteria.keywords!.some(keyword =>
                item.template.metadata.tags.some(tag => 
                  tag.toLowerCase().includes(keyword.toLowerCase())
                )
              ) ? 20 : 0;
              return { ...item, score: item.score + keywordScore };
            });
          }
          
          // 基于品牌色彩的推荐
          if (criteria.brandColors && criteria.brandColors.length > 0) {
            scored = scored.map(item => {
              const colorScore = criteria.brandColors!.some(color =>
                item.template.metadata.colors.includes(color)
              ) ? 25 : 0;
              return { ...item, score: item.score + colorScore };
            });
          }
          
          // 排序并返回前10个
          return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(item => item.template);
        },

        getTrendingTemplates: async (limit = 10) => {
          const state = get();
          const templates = await get().getAllTemplates();
          
          // 基于最近使用统计排序
          const templatesWithStats = await Promise.all(
            templates.map(async template => {
              const stats = await get().getTemplateStats(template.id);
              return { template, stats };
            })
          );
          
          return templatesWithStats
            .sort((a, b) => {
              const aRecentUsage = a.stats?.lastUsed ? new Date(a.stats.lastUsed).getTime() : 0;
              const bRecentUsage = b.stats?.lastUsed ? new Date(b.stats.lastUsed).getTime() : 0;
              return bRecentUsage - aRecentUsage;
            })
            .slice(0, limit)
            .map(item => item.template);
        },

        getPopularTemplates: async (limit = 10) => {
          const templates = await get().getAllTemplates();
          
          const templatesWithStats = await Promise.all(
            templates.map(async template => {
              const stats = await get().getTemplateStats(template.id);
              return { template, stats };
            })
          );
          
          return templatesWithStats
            .sort((a, b) => (b.stats?.usageCount || 0) - (a.stats?.usageCount || 0))
            .slice(0, limit)
            .map(item => item.template);
        },

        // 统计和分析
        updateTemplateStats: async (templateId: string, action: 'view' | 'use' | 'favorite') => {
          const state = get();
          let stats = state.templateStats.get(templateId) || {
            id: templateId,
            usageCount: 0,
            favoriteCount: 0,
            rating: 0,
            createdAt: new Date().toISOString()
          };
          
          switch (action) {
            case 'view':
              // 视图统计可以在这里处理，但不增加使用计数
              stats.lastUsed = new Date().toISOString();
              break;
            case 'use':
              stats.usageCount += 1;
              stats.lastUsed = new Date().toISOString();
              break;
            case 'favorite':
              stats.favoriteCount += 1;
              break;
          }
          
          state.templateStats.set(templateId, stats);
          state.saveToLocalStorage(`stats_${templateId}`, stats);
          
          set({ templateStats: new Map(state.templateStats) });
        },

        getTemplateStats: async (templateId: string) => {
          const state = get();
          let stats = state.templateStats.get(templateId);
          
          if (!stats) {
            // 尝试从本地存储加载
            stats = state.loadFromLocalStorage(`stats_${templateId}`);
            if (stats) {
              state.templateStats.set(templateId, stats);
            }
          }
          
          return stats || null;
        },

        // 缓存管理
        clearCache: () => {
          const state = get();
          state.cache.clear();
          state.cacheExpiry.clear();
          set({ cache: new Map(), cacheExpiry: new Map() });
        },

        getCacheSize: () => {
          return get().cache.size;
        },

        evictExpiredCache: () => {
          const state = get();
          const now = Date.now();
          
          for (const [key, expiry] of state.cacheExpiry.entries()) {
            if (expiry <= now) {
              state.cache.delete(key);
              state.cacheExpiry.delete(key);
            }
          }
          
          // 如果缓存超过最大大小，删除最旧的条目
          if (state.cache.size > state.maxCacheSize) {
            const entries = Array.from(state.cacheExpiry.entries());
            entries.sort((a, b) => a[1] - b[1]);
            
            const toDelete = entries.slice(0, entries.length - state.maxCacheSize);
            toDelete.forEach(([key]) => {
              state.cache.delete(key);
              state.cacheExpiry.delete(key);
            });
          }
          
          set({ cache: new Map(state.cache), cacheExpiry: new Map(state.cacheExpiry) });
        },

        // 本地存储
        saveToLocalStorage: (key: string, data: any) => {
          try {
            localStorage.setItem(`design_template_${key}`, JSON.stringify(data));
          } catch (error) {
            console.warn('Failed to save to localStorage:', error);
          }
        },

        loadFromLocalStorage: (key: string) => {
          try {
            const data = localStorage.getItem(`design_template_${key}`);
            return data ? JSON.parse(data) : null;
          } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return null;
          }
        },

        removeFromLocalStorage: (key: string) => {
          try {
            localStorage.removeItem(`design_template_${key}`);
          } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
          }
        },

        // 验证
        validateTemplate: (template: DesignTemplate) => {
          const errors: string[] = [];
          const warnings: string[] = [];
          
          // 验证必需字段
          if (!template.id) errors.push('模板ID不能为空');
          if (!template.name) errors.push('模板名称不能为空');
          if (!template.canvas) errors.push('画布配置不能为空');
          if (!template.objects || template.objects.length === 0) {
            warnings.push('模板没有包含任何对象');
          }
          
          // 验证画布配置
          if (template.canvas) {
            if (template.canvas.width <= 0) errors.push('画布宽度必须大于0');
            if (template.canvas.height <= 0) errors.push('画布高度必须大于0');
          }
          
          // 验证对象数据
          template.objects?.forEach((obj, index) => {
            if (!obj.id) errors.push(`对象 ${index} 缺少ID`);
            if (!obj.fabricObject) errors.push(`对象 ${index} 缺少Fabric.js数据`);
          });
          
          // 验证元数据
          if (template.metadata) {
            if (!template.metadata.createdAt) warnings.push('缺少创建时间');
            if (!template.metadata.author) warnings.push('缺少作者信息');
          }
          
          return {
            isValid: errors.length === 0,
            errors,
            warnings
          };
        },

        // 状态管理
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'design-template-store',
      }
    ),
    {
      name: 'design-template-storage',
      partialize: (state) => ({
        // 只持久化用户模板和统计数据
        userTemplates: Array.from(state.userTemplates.entries()),
        templateStats: Array.from(state.templateStats.entries()),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 恢复 Map 结构
          state.userTemplates = new Map(state.userTemplates as any);
          state.templateStats = new Map(state.templateStats as any);
          state.templates = new Map();
          state.cache = new Map();
          state.cacheExpiry = new Map();
          
          // 定期清理过期缓存
          setInterval(() => {
            state.evictExpiredCache();
          }, 5 * 60 * 1000); // 每5分钟清理一次
        }
      },
    }
  )
);

export const useTemplateStore = create<TemplateStore>()(
  persist(
    devtools(
      (set, get) => ({
        ...initialState,

        // 模板获取
        getAllTemplates: () => {
          const { templates, customTemplates } = get();
          return [...templates, ...customTemplates];
        },

        getTemplatesByCategory: (categoryId: string) => {
          const allTemplates = get().getAllTemplates();
          if (categoryId === 'all') return allTemplates;
          if (categoryId === 'custom') return get().customTemplates;
          if (categoryId === 'favorites') return get().getFavoriteTemplates();
          if (categoryId === 'recent') return get().getRecentTemplates();
          
          return allTemplates.filter(template => template.category === categoryId);
        },

        searchTemplates: (query: string) => {
          const allTemplates = get().getAllTemplates();
          if (!query.trim()) return allTemplates;
          
          const lowercaseQuery = query.toLowerCase();
          return allTemplates.filter(template =>
            template.name.toLowerCase().includes(lowercaseQuery) ||
            template.description.toLowerCase().includes(lowercaseQuery) ||
            template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
          );
        },

        getTemplate: (templateId: string) => {
          const allTemplates = get().getAllTemplates();
          return allTemplates.find(template => template.id === templateId);
        },

        getFavoriteTemplates: () => {
          const { favoriteTemplates } = get();
          const allTemplates = get().getAllTemplates();
          return allTemplates.filter(template => favoriteTemplates.includes(template.id));
        },

        getRecentTemplates: () => {
          const { recentTemplates } = get();
          const allTemplates = get().getAllTemplates();
          return recentTemplates
            .map(id => allTemplates.find(template => template.id === id))
            .filter(Boolean) as Template[];
        },

        // 筛选和排序
        setSelectedCategory: (categoryId: string) => {
          set({ selectedCategory: categoryId });
        },

        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
        },

        setViewMode: (mode: 'grid' | 'list') => {
          set({ viewMode: mode });
        },

        setSortBy: (sortBy: 'name' | 'date' | 'popular') => {
          set({ sortBy });
        },

        // 模板操作
        applyTemplate: async (canvas: fabric.Canvas, template: Template, options = {}) => {
          set({ 
            isApplyingTemplate: true, 
            applicationProgress: null,
            error: null 
          });

          try {
            await templateService.applyTemplate(canvas, template, {
              ...options,
              onProgress: (progress: TemplateApplicationProgress) => {
                set({ applicationProgress: progress });
              }
            });

            // 添加到最近使用
            get().addToRecent(template.id);

            set({ 
              isApplyingTemplate: false,
              applicationProgress: {
                stage: 'complete',
                progress: 100,
                message: '模板应用成功'
              }
            });

            // 清除进度信息
            setTimeout(() => {
              set({ applicationProgress: null });
            }, 2000);

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '模板应用失败';
            set({ 
              isApplyingTemplate: false,
              applicationProgress: null,
              error: errorMessage 
            });
            throw error;
          }
        },

        previewTemplate: async (template: Template) => {
          set({ isGeneratingPreview: true, previewTemplate: template });
          
          try {
            const thumbnail = await templateService.generateThumbnail(template, {
              width: 400,
              height: 600,
              quality: 0.9
            });
            
            set({ isGeneratingPreview: false });
            return thumbnail;
          } catch (error) {
            set({ 
              isGeneratingPreview: false,
              error: error instanceof Error ? error.message : '预览生成失败'
            });
            throw error;
          }
        },

        addToFavorites: (templateId: string) => {
          const { favoriteTemplates } = get();
          if (!favoriteTemplates.includes(templateId)) {
            set({ favoriteTemplates: [...favoriteTemplates, templateId] });
          }
        },

        removeFromFavorites: (templateId: string) => {
          const { favoriteTemplates } = get();
          set({ 
            favoriteTemplates: favoriteTemplates.filter(id => id !== templateId) 
          });
        },

        addToRecent: (templateId: string) => {
          const { recentTemplates } = get();
          const newRecent = [templateId, ...recentTemplates.filter(id => id !== templateId)];
          // 只保留最近10个
          set({ recentTemplates: newRecent.slice(0, 10) });
        },

        // 自定义模板管理
        saveCustomTemplate: async (canvas: fabric.Canvas, templateInfo: any) => {
          set({ isLoading: true, error: null });

          try {
            const template = templateService.createTemplateFromCanvas(canvas, templateInfo);
            
            const { customTemplates } = get();
            const newCustomTemplates = [...customTemplates, template];
            
            set({ 
              customTemplates: newCustomTemplates,
              isLoading: false 
            });

            // 保存到本地存储
            localStorage.setItem(
              `custom_template_${template.id}`, 
              JSON.stringify(template)
            );

            return template;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '保存模板失败';
            set({ isLoading: false, error: errorMessage });
            throw error;
          }
        },

        deleteCustomTemplate: (templateId: string) => {
          const { customTemplates, favoriteTemplates, recentTemplates } = get();
          
          set({
            customTemplates: customTemplates.filter(t => t.id !== templateId),
            favoriteTemplates: favoriteTemplates.filter(id => id !== templateId),
            recentTemplates: recentTemplates.filter(id => id !== templateId)
          });

          // 从本地存储删除
          localStorage.removeItem(`custom_template_${templateId}`);
        },

        updateCustomTemplate: (templateId: string, updates: Partial<Template>) => {
          const { customTemplates } = get();
          const updatedTemplates = customTemplates.map(template => 
            template.id === templateId 
              ? { ...template, ...updates, updatedAt: new Date().toISOString() }
              : template
          );
          
          set({ customTemplates: updatedTemplates });

          // 更新本地存储
          const updatedTemplate = updatedTemplates.find(t => t.id === templateId);
          if (updatedTemplate) {
            localStorage.setItem(
              `custom_template_${templateId}`, 
              JSON.stringify(updatedTemplate)
            );
          }
        },

        // 状态管理
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        clearError: () => {
          set({ error: null });
        },

        // 重置
        reset: () => {
          set({
            selectedCategory: 'all',
            searchQuery: '',
            viewMode: 'grid',
            sortBy: 'popular',
            isLoading: false,
            error: null,
            isApplyingTemplate: false,
            applicationProgress: null,
            previewTemplate: null,
            isGeneratingPreview: false,
          });
        },
      }),
      {
        name: 'template-store',
      }
    ),
    {
      name: 'poster-template-storage',
      partialize: (state) => ({
        customTemplates: state.customTemplates,
        favoriteTemplates: state.favoriteTemplates,
        recentTemplates: state.recentTemplates,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
      }),
      // 在加载时恢复自定义模板
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 从本地存储加载自定义模板
          const customTemplates: Template[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('custom_template_')) {
              try {
                const template = JSON.parse(localStorage.getItem(key) || '');
                customTemplates.push(template);
              } catch (error) {
                console.warn('Failed to load custom template:', key, error);
              }
            }
          }
          state.customTemplates = customTemplates;
        }
      },
    }
  )
);