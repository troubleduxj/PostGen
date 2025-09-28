import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 素材类型定义
export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'icon' | 'shape' | 'pattern';
  category: string;
  url: string;
  thumbnail: string;
  tags: string[];
  size?: number;
  dimensions?: { width: number; height: number };
  isCustom: boolean;
  createdAt: string;
  source?: 'local' | 'unsplash' | 'iconify';
}

// 素材分类定义
export interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

// 上传进度状态
export interface UploadProgress {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

// 素材库状态
interface AssetLibraryState {
  // 素材数据
  assets: Asset[];
  categories: AssetCategory[];
  
  // 当前状态
  currentCategory: string;
  searchQuery: string;
  filteredAssets: Asset[];
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // 上传状态
  uploadProgress: UploadProgress[];
  
  // 在线素材
  onlineAssets: {
    unsplash: Asset[];
    iconify: Asset[];
  };
  
  // 分页
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

// 素材库操作接口
interface AssetLibraryActions {
  // 基础操作
  setCurrentCategory: (categoryId: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 素材管理
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void;
  removeAsset: (assetId: string) => void;
  updateAsset: (assetId: string, updates: Partial<Asset>) => void;
  
  // 分类管理
  addCategory: (category: Omit<AssetCategory, 'count'>) => void;
  removeCategory: (categoryId: string) => void;
  updateCategory: (categoryId: string, updates: Partial<AssetCategory>) => void;
  
  // 搜索和过滤
  filterAssets: () => void;
  searchAssets: (query: string) => Asset[];
  getAssetsByCategory: (categoryId: string) => Asset[];
  
  // 上传管理
  startUpload: (file: File) => Promise<string>;
  updateUploadProgress: (uploadId: string, progress: number) => void;
  completeUpload: (uploadId: string, asset: Asset) => void;
  failUpload: (uploadId: string, error: string) => void;
  removeUpload: (uploadId: string) => void;
  
  // 在线素材
  loadUnsplashAssets: (query?: string, page?: number) => Promise<void>;
  loadIconifyAssets: (query?: string, page?: number) => Promise<void>;
  
  // 分页
  loadMore: () => Promise<void>;
  resetPagination: () => void;
  
  // 工具方法
  generateThumbnail: (file: File) => Promise<string>;
  compressImage: (file: File, quality?: number) => Promise<File>;
  
  // 重置
  reset: () => void;
}

// 默认分类
const defaultCategories: AssetCategory[] = [
  { id: 'all', name: '全部', icon: '📋' },
  { id: 'icons', name: '图标', icon: '🎯' },
  { id: 'shapes', name: '形状', icon: '🔷' },
  { id: 'illustrations', name: '插画', icon: '🎨' },
  { id: 'photos', name: '照片', icon: '📷' },
  { id: 'patterns', name: '图案', icon: '🔳' },
  { id: 'backgrounds', name: '背景', icon: '🖼️' },
  { id: 'custom', name: '我的素材', icon: '💾' }
];

// 初始状态
const initialState: AssetLibraryState = {
  assets: [],
  categories: defaultCategories,
  currentCategory: 'all',
  searchQuery: '',
  filteredAssets: [],
  isLoading: false,
  error: null,
  uploadProgress: [],
  onlineAssets: {
    unsplash: [],
    iconify: []
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true
  }
};

export const useAssetLibraryStore = create<AssetLibraryState & AssetLibraryActions>()(
  persist(
    devtools(
      (set, get) => ({
        ...initialState,

        // 基础操作
        setCurrentCategory: (categoryId) => {
          set({ currentCategory: categoryId });
          get().filterAssets();
          get().resetPagination();
        },

        setSearchQuery: (query) => {
          set({ searchQuery: query });
          get().filterAssets();
          get().resetPagination();
        },

        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),

        // 素材管理
        addAsset: (assetData) => {
          const asset: Asset = {
            ...assetData,
            id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString()
          };

          set((state) => ({
            assets: [...state.assets, asset]
          }));

          get().filterAssets();
          get().updateCategoryCounts();
        },

        removeAsset: (assetId) => {
          set((state) => ({
            assets: state.assets.filter(asset => asset.id !== assetId)
          }));

          get().filterAssets();
          get().updateCategoryCounts();
        },

        updateAsset: (assetId, updates) => {
          set((state) => ({
            assets: state.assets.map(asset =>
              asset.id === assetId ? { ...asset, ...updates } : asset
            )
          }));

          get().filterAssets();
        },

        // 分类管理
        addCategory: (categoryData) => {
          const category: AssetCategory = {
            ...categoryData,
            count: 0
          };

          set((state) => ({
            categories: [...state.categories, category]
          }));

          get().updateCategoryCounts();
        },

        removeCategory: (categoryId) => {
          // 不能删除默认分类
          const defaultIds = ['all', 'icons', 'shapes', 'illustrations', 'photos', 'patterns', 'backgrounds', 'custom'];
          if (defaultIds.includes(categoryId)) return;

          set((state) => ({
            categories: state.categories.filter(cat => cat.id !== categoryId),
            // 如果删除的是当前分类，切换到全部
            currentCategory: state.currentCategory === categoryId ? 'all' : state.currentCategory
          }));

          get().filterAssets();
        },

        updateCategory: (categoryId, updates) => {
          set((state) => ({
            categories: state.categories.map(cat =>
              cat.id === categoryId ? { ...cat, ...updates } : cat
            )
          }));
        },

        // 搜索和过滤
        filterAssets: () => {
          const { assets, currentCategory, searchQuery, onlineAssets } = get();
          
          // 合并本地素材和在线素材
          let allAssets = [...assets];
          
          // 如果当前分类是图标，添加 Iconify 素材
          if (currentCategory === 'icons' || currentCategory === 'all') {
            allAssets = [...allAssets, ...onlineAssets.iconify];
          }
          
          // 如果当前分类是照片，添加 Unsplash 素材
          if (currentCategory === 'photos' || currentCategory === 'all') {
            allAssets = [...allAssets, ...onlineAssets.unsplash];
          }

          let filtered = allAssets;

          // 按分类过滤
          if (currentCategory !== 'all') {
            if (currentCategory === 'custom') {
              filtered = filtered.filter(asset => asset.isCustom);
            } else {
              filtered = filtered.filter(asset => asset.category === currentCategory);
            }
          }

          // 按搜索词过滤
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(asset =>
              asset.name.toLowerCase().includes(query) ||
              asset.tags.some(tag => tag.toLowerCase().includes(query))
            );
          }

          set({ filteredAssets: filtered });
        },

        searchAssets: (query) => {
          const { assets } = get();
          const lowercaseQuery = query.toLowerCase();
          
          return assets.filter(asset =>
            asset.name.toLowerCase().includes(lowercaseQuery) ||
            asset.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
          );
        },

        getAssetsByCategory: (categoryId) => {
          const { assets } = get();
          
          if (categoryId === 'all') return assets;
          if (categoryId === 'custom') return assets.filter(asset => asset.isCustom);
          
          return assets.filter(asset => asset.category === categoryId);
        },

        // 上传管理
        startUpload: async (file) => {
          const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const uploadProgress: UploadProgress = {
            id: uploadId,
            name: file.name,
            progress: 0,
            status: 'uploading'
          };

          set((state) => ({
            uploadProgress: [...state.uploadProgress, uploadProgress]
          }));

          try {
            // 生成缩略图
            get().updateUploadProgress(uploadId, 20);
            const thumbnail = await get().generateThumbnail(file);
            
            // 压缩图片
            get().updateUploadProgress(uploadId, 50);
            const compressedFile = await get().compressImage(file);
            
            // 创建 URL
            get().updateUploadProgress(uploadId, 80);
            const url = URL.createObjectURL(compressedFile);
            
            // 创建素材对象
            const asset: Asset = {
              id: uploadId,
              name: file.name.replace(/\.[^/.]+$/, ''), // 移除文件扩展名
              type: file.type.startsWith('image/') ? 'image' : 'pattern',
              category: file.type.startsWith('image/') ? 'photos' : 'patterns',
              url,
              thumbnail,
              tags: [],
              size: compressedFile.size,
              dimensions: await get().getImageDimensions(compressedFile),
              isCustom: true,
              createdAt: new Date().toISOString(),
              source: 'local'
            };

            get().completeUpload(uploadId, asset);
            return uploadId;

          } catch (error) {
            get().failUpload(uploadId, error instanceof Error ? error.message : '上传失败');
            throw error;
          }
        },

        updateUploadProgress: (uploadId, progress) => {
          set((state) => ({
            uploadProgress: state.uploadProgress.map(upload =>
              upload.id === uploadId ? { ...upload, progress } : upload
            )
          }));
        },

        completeUpload: (uploadId, asset) => {
          // 添加素材
          get().addAsset(asset);
          
          // 更新上传状态
          set((state) => ({
            uploadProgress: state.uploadProgress.map(upload =>
              upload.id === uploadId 
                ? { ...upload, progress: 100, status: 'completed' as const }
                : upload
            )
          }));

          // 3秒后移除上传记录
          setTimeout(() => {
            get().removeUpload(uploadId);
          }, 3000);
        },

        failUpload: (uploadId, error) => {
          set((state) => ({
            uploadProgress: state.uploadProgress.map(upload =>
              upload.id === uploadId 
                ? { ...upload, status: 'error' as const, error }
                : upload
            )
          }));
        },

        removeUpload: (uploadId) => {
          set((state) => ({
            uploadProgress: state.uploadProgress.filter(upload => upload.id !== uploadId)
          }));
        },

        // 在线素材
        loadUnsplashAssets: async (query = '', page = 1) => {
          // 这个方法现在主要用于初始化，实际的在线素材加载由 OnlineAssetBrowser 组件处理
          // 保持为空实现，因为在线素材不需要预加载到 store 中
        },

        loadIconifyAssets: async (query = '', page = 1) => {
          // 这个方法现在主要用于初始化，实际的在线素材加载由 OnlineAssetBrowser 组件处理
          // 保持为空实现，因为在线素材不需要预加载到 store 中
        },

        // 分页
        loadMore: async () => {
          const { pagination, currentCategory } = get();
          
          if (!pagination.hasMore) return;

          const nextPage = pagination.page + 1;
          
          set((state) => ({
            pagination: { ...state.pagination, page: nextPage }
          }));

          // 根据当前分类加载更多数据
          if (currentCategory === 'photos' || currentCategory === 'all') {
            await get().loadUnsplashAssets('', nextPage);
          }
          
          if (currentCategory === 'icons' || currentCategory === 'all') {
            await get().loadIconifyAssets('', nextPage);
          }
        },

        resetPagination: () => {
          set({
            pagination: {
              page: 1,
              pageSize: 20,
              total: 0,
              hasMore: true
            }
          });
        },

        // 工具方法
        generateThumbnail: async (file) => {
          return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
              const maxSize = 200;
              let { width, height } = img;

              // 计算缩略图尺寸
              if (width > height) {
                if (width > maxSize) {
                  height = (height * maxSize) / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width = (width * maxSize) / height;
                  height = maxSize;
                }
              }

              canvas.width = width;
              canvas.height = height;

              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            };

            img.onerror = () => reject(new Error('无法生成缩略图'));
            img.src = URL.createObjectURL(file);
          });
        },

        compressImage: async (file, quality = 0.8) => {
          return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
              const maxWidth = 1920;
              const maxHeight = 1080;
              let { width, height } = img;

              // 计算压缩后尺寸
              if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
              }

              canvas.width = width;
              canvas.height = height;

              ctx?.drawImage(img, 0, 0, width, height);
              
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    const compressedFile = new File([blob], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now()
                    });
                    resolve(compressedFile);
                  } else {
                    reject(new Error('压缩失败'));
                  }
                },
                'image/jpeg',
                quality
              );
            };

            img.onerror = () => reject(new Error('无法压缩图片'));
            img.src = URL.createObjectURL(file);
          });
        },

        // 获取图片尺寸
        getImageDimensions: async (file) => {
          return new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = () => reject(new Error('无法获取图片尺寸'));
            img.src = URL.createObjectURL(file);
          });
        },

        // 更新分类计数
        updateCategoryCounts: () => {
          const { assets, categories } = get();
          
          const updatedCategories = categories.map(category => {
            let count = 0;
            
            if (category.id === 'all') {
              count = assets.length;
            } else if (category.id === 'custom') {
              count = assets.filter(asset => asset.isCustom).length;
            } else {
              count = assets.filter(asset => asset.category === category.id).length;
            }
            
            return { ...category, count };
          });
          
          set({ categories: updatedCategories });
        },

        // 重置
        reset: () => {
          set({
            ...initialState,
            categories: defaultCategories
          });
        }
      }),
      {
        name: 'asset-library-store'
      }
    ),
    {
      name: 'poster-asset-library-storage',
      partialize: (state) => ({
        assets: state.assets.filter(asset => asset.isCustom), // 只持久化自定义素材
        categories: state.categories.filter(cat => !defaultCategories.find(def => def.id === cat.id)), // 只持久化自定义分类
        currentCategory: state.currentCategory
      })
    }
  )
);