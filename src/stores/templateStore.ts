import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Template, TemplateCategory } from '@/types';
import { templates, templateCategories } from '@/data/templates';
import { templateService, TemplateApplicationProgress } from '@/services/templateService';

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