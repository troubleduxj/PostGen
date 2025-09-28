import { Asset } from '@/stores/assetLibraryStore';

import { UNSPLASH_CONFIG, getErrorMessage } from '@/config/onlineAssets';

// Unsplash API 配置
const UNSPLASH_ACCESS_KEY = UNSPLASH_CONFIG.ACCESS_KEY;
const UNSPLASH_API_BASE = UNSPLASH_CONFIG.API_BASE;

// Unsplash 图片接口
interface UnsplashPhoto {
  id: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  width: number;
  height: number;
  user: {
    name: string;
    username: string;
  };
  tags?: Array<{
    title: string;
  }>;
}

// Unsplash 搜索响应
interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

// Unsplash 服务类
export class UnsplashService {
  private static instance: UnsplashService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = UNSPLASH_CONFIG.CACHE_DURATION;

  static getInstance(): UnsplashService {
    if (!UnsplashService.instance) {
      UnsplashService.instance = new UnsplashService();
    }
    return UnsplashService.instance;
  }

  // 获取缓存键
  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${paramString}`;
  }

  // 检查缓存
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  // 设置缓存
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 发起 API 请求
  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // 检查缓存
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) {
      return cached;
    }

    // 构建 URL
    const url = new URL(`${UNSPLASH_API_BASE}${endpoint}`);
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      });

      if (!response.ok) {
        const error = new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
        (error as any).response = { status: response.status };
        throw error;
      }

      const data = await response.json();
      
      // 缓存结果
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Unsplash API request failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // 搜索图片
  async searchPhotos(
    query: string, 
    page: number = 1, 
    perPage: number = 20,
    orientation?: 'landscape' | 'portrait' | 'squarish'
  ): Promise<{ assets: Asset[]; total: number; hasMore: boolean }> {
    try {
      const params: Record<string, any> = {
        query,
        page,
        per_page: perPage
      };

      if (orientation) {
        params.orientation = orientation;
      }

      const response = await this.request<UnsplashSearchResponse>('/search/photos', params);
      
      const assets = response.results.map(photo => this.convertToAsset(photo));
      
      return {
        assets,
        total: response.total,
        hasMore: page < response.total_pages
      };
    } catch (error) {
      console.error('Failed to search Unsplash photos:', error);
      return { assets: [], total: 0, hasMore: false };
    }
  }

  // 获取精选图片
  async getFeaturedPhotos(
    page: number = 1,
    perPage: number = 20,
    orderBy: 'latest' | 'oldest' | 'popular' = 'popular'
  ): Promise<{ assets: Asset[]; hasMore: boolean }> {
    try {
      const response = await this.request<UnsplashPhoto[]>('/photos', {
        page,
        per_page: perPage,
        order_by: orderBy
      });

      const assets = response.map(photo => this.convertToAsset(photo));
      
      return {
        assets,
        hasMore: response.length === perPage
      };
    } catch (error) {
      console.error('Failed to get featured Unsplash photos:', error);
      return { assets: [], hasMore: false };
    }
  }

  // 获取分类图片
  async getPhotosByCategory(
    category: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<{ assets: Asset[]; hasMore: boolean }> {
    // 使用搜索 API 按分类获取图片
    const result = await this.searchPhotos(category, page, perPage);
    return {
      assets: result.assets,
      hasMore: result.hasMore
    };
  }

  // 下载图片统计（Unsplash 要求）
  async trackDownload(photoId: string): Promise<void> {
    try {
      await this.request(`/photos/${photoId}/download`, {});
    } catch (error) {
      console.error('Failed to track download:', error);
      // 不抛出错误，因为这不应该影响用户体验
    }
  }

  // 转换 Unsplash 图片为 Asset 格式
  private convertToAsset(photo: UnsplashPhoto): Asset {
    const tags = [
      ...(photo.tags?.map(tag => tag.title) || []),
      photo.alt_description || '',
      photo.description || ''
    ].filter(Boolean);

    return {
      id: `unsplash-${photo.id}`,
      name: photo.alt_description || photo.description || `Photo by ${photo.user.name}`,
      type: 'image',
      category: 'photos',
      url: photo.urls.regular,
      thumbnail: photo.urls.thumb,
      tags,
      size: 0, // Unsplash 不提供文件大小
      dimensions: {
        width: photo.width,
        height: photo.height
      },
      isCustom: false,
      createdAt: new Date().toISOString(),
      source: 'unsplash'
    };
  }

  // 获取高质量图片 URL
  getHighQualityUrl(photoId: string, width?: number, height?: number): string {
    const unsplashId = photoId.replace('unsplash-', '');
    let url = `https://images.unsplash.com/photo-${unsplashId}`;
    
    const params: string[] = [];
    if (width) params.push(`w=${width}`);
    if (height) params.push(`h=${height}`);
    params.push('fit=crop');
    params.push('auto=format');
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return url;
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
  }

  // 获取缓存统计
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 导出单例实例
export const unsplashService = UnsplashService.getInstance();

// 预定义的搜索分类
export const UNSPLASH_CATEGORIES = [
  { id: 'nature', name: '自然', query: 'nature landscape' },
  { id: 'business', name: '商务', query: 'business office' },
  { id: 'technology', name: '科技', query: 'technology computer' },
  { id: 'people', name: '人物', query: 'people portrait' },
  { id: 'food', name: '美食', query: 'food cooking' },
  { id: 'travel', name: '旅行', query: 'travel destination' },
  { id: 'architecture', name: '建筑', query: 'architecture building' },
  { id: 'abstract', name: '抽象', query: 'abstract pattern' },
  { id: 'animals', name: '动物', query: 'animals wildlife' },
  { id: 'sports', name: '运动', query: 'sports fitness' }
];

// 工具函数：获取优化的图片 URL
export function getOptimizedImageUrl(
  originalUrl: string, 
  width?: number, 
  height?: number,
  quality: number = 80
): string {
  if (!originalUrl.includes('unsplash.com')) {
    return originalUrl;
  }

  const url = new URL(originalUrl);
  
  if (width) url.searchParams.set('w', width.toString());
  if (height) url.searchParams.set('h', height.toString());
  
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('q', quality.toString());

  return url.toString();
}