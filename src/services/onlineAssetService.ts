import { Asset } from '@/stores/assetLibraryStore';
import { unsplashService } from './unsplashService';
import { iconifyService } from './iconifyService';

// 在线素材服务统一接口
export interface OnlineAssetService {
  search(query: string, page?: number, limit?: number): Promise<OnlineAssetResult>;
  getFeatured(page?: number, limit?: number): Promise<OnlineAssetResult>;
  getByCategory(category: string, page?: number, limit?: number): Promise<OnlineAssetResult>;
}

// 在线素材结果接口
export interface OnlineAssetResult {
  assets: Asset[];
  total: number;
  hasMore: boolean;
  page: number;
}

// 缓存管理器
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
  
  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 错误处理器
class ErrorHandler {
  private retryAttempts = new Map<string, number>();
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1秒
  
  async withRetry<T>(
    key: string,
    operation: () => Promise<T>,
    customMaxRetries?: number
  ): Promise<T> {
    const maxRetries = customMaxRetries ?? this.maxRetries;
    const attempts = this.retryAttempts.get(key) || 0;
    
    try {
      const result = await operation();
      // 成功后重置重试次数
      this.retryAttempts.delete(key);
      return result;
    } catch (error) {
      if (attempts < maxRetries) {
        this.retryAttempts.set(key, attempts + 1);
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempts + 1)));
        
        return this.withRetry(key, operation, customMaxRetries);
      } else {
        // 达到最大重试次数，重置并抛出错误
        this.retryAttempts.delete(key);
        throw error;
      }
    }
  }
  
  reset(key?: string): void {
    if (key) {
      this.retryAttempts.delete(key);
    } else {
      this.retryAttempts.clear();
    }
  }
}

// Unsplash 服务适配器
class UnsplashServiceAdapter implements OnlineAssetService {
  private cache = new CacheManager();
  private errorHandler = new ErrorHandler();
  
  async search(query: string, page = 1, limit = 20): Promise<OnlineAssetResult> {
    const cacheKey = `unsplash_search_${query}_${page}_${limit}`;
    
    // 检查缓存
    const cached = this.cache.get<OnlineAssetResult>(cacheKey);
    if (cached) return cached;
    
    // 执行搜索
    const result = await this.errorHandler.withRetry(
      `unsplash_search_${query}`,
      async () => {
        const response = await unsplashService.searchPhotos(query, page, limit);
        return {
          assets: response.assets,
          total: response.total,
          hasMore: response.hasMore,
          page
        };
      }
    );
    
    // 缓存结果
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  async getFeatured(page = 1, limit = 20): Promise<OnlineAssetResult> {
    const cacheKey = `unsplash_featured_${page}_${limit}`;
    
    // 检查缓存
    const cached = this.cache.get<OnlineAssetResult>(cacheKey);
    if (cached) return cached;
    
    // 获取精选图片
    const result = await this.errorHandler.withRetry(
      'unsplash_featured',
      async () => {
        const response = await unsplashService.getFeaturedPhotos(page, limit);
        return {
          assets: response.assets,
          total: response.assets.length, // Unsplash 精选没有总数
          hasMore: response.hasMore,
          page
        };
      }
    );
    
    // 缓存结果
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  async getByCategory(category: string, page = 1, limit = 20): Promise<OnlineAssetResult> {
    const cacheKey = `unsplash_category_${category}_${page}_${limit}`;
    
    // 检查缓存
    const cached = this.cache.get<OnlineAssetResult>(cacheKey);
    if (cached) return cached;
    
    // 按分类获取图片
    const result = await this.errorHandler.withRetry(
      `unsplash_category_${category}`,
      async () => {
        const response = await unsplashService.getPhotosByCategory(category, page, limit);
        return {
          assets: response.assets,
          total: response.assets.length,
          hasMore: response.hasMore,
          page
        };
      }
    );
    
    // 缓存结果
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  clearCache(): void {
    this.cache.clear();
  }
  
  resetErrors(): void {
    this.errorHandler.reset();
  }
}

// Iconify 服务适配器
class IconifyServiceAdapter implements OnlineAssetService {
  private cache = new CacheManager();
  private errorHandler = new ErrorHandler();
  
  async search(query: string, page = 1, limit = 20): Promise<OnlineAssetResult> {
    const cacheKey = `iconify_search_${query}_${page}_${limit}`;
    
    // 检查缓存
    const cached = this.cache.get<OnlineAssetResult>(cacheKey);
    if (cached) return cached;
    
    // 执行搜索
    const result = await this.errorHandler.withRetry(
      `iconify_search_${query}`,
      async () => {
        const start = (page - 1) * limit;
        const response = await iconifyService.searchIcons(query, limit, start);
        return {
          assets: response.assets,
          total: response.total,
          hasMore: response.hasMore,
          page
        };
      }
    );
    
    // 缓存结果
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  async getFeatured(page = 1, limit = 20): Promise<OnlineAssetResult> {
    const cacheKey = `iconify_featured_${page}_${limit}`;
    
    // 检查缓存
    const cached = this.cache.get<OnlineAssetResult>(cacheKey);
    if (cached) return cached;
    
    // 获取热门图标集的图标
    const result = await this.errorHandler.withRetry(
      'iconify_featured',
      async () => {
        const collections = await iconifyService.getPopularCollections(5);
        if (collections.length === 0) {
          return { assets: [], total: 0, hasMore: false, page };
        }
        
        // 从第一个热门图标集获取图标
        const collection = collections[0];
        const start = (page - 1) * limit;
        const response = await iconifyService.getCollectionIcons(collection.prefix, limit, start);
        
        return {
          assets: response.assets,
          total: collection.total,
          hasMore: response.hasMore,
          page
        };
      }
    );
    
    // 缓存结果
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  async getByCategory(category: string, page = 1, limit = 20): Promise<OnlineAssetResult> {
    // Iconify 的分类搜索实际上是关键词搜索
    return this.search(category, page, limit);
  }
  
  clearCache(): void {
    this.cache.clear();
  }
  
  resetErrors(): void {
    this.errorHandler.reset();
  }
}

// 在线素材管理器
export class OnlineAssetManager {
  private unsplashAdapter = new UnsplashServiceAdapter();
  private iconifyAdapter = new IconifyServiceAdapter();
  
  getService(source: 'unsplash' | 'iconify'): OnlineAssetService {
    switch (source) {
      case 'unsplash':
        return this.unsplashAdapter;
      case 'iconify':
        return this.iconifyAdapter;
      default:
        throw new Error(`Unknown asset source: ${source}`);
    }
  }
  
  // 清除所有缓存
  clearAllCaches(): void {
    this.unsplashAdapter.clearCache();
    this.iconifyAdapter.clearCache();
  }
  
  // 重置所有错误状态
  resetAllErrors(): void {
    this.unsplashAdapter.resetErrors();
    this.iconifyAdapter.resetErrors();
  }
  
  // 获取缓存统计
  getCacheStats(): { unsplash: any; iconify: any } {
    return {
      unsplash: {
        size: (this.unsplashAdapter as any).cache.size(),
        service: 'Unsplash'
      },
      iconify: {
        size: (this.iconifyAdapter as any).cache.size(),
        service: 'Iconify'
      }
    };
  }
  
  // 定期清理过期缓存
  startCacheCleanup(interval: number = 10 * 60 * 1000): () => void {
    const cleanup = () => {
      (this.unsplashAdapter as any).cache.cleanup();
      (this.iconifyAdapter as any).cache.cleanup();
    };
    
    const intervalId = setInterval(cleanup, interval);
    
    // 返回清理函数
    return () => clearInterval(intervalId);
  }
}

// 导出单例实例
export const onlineAssetManager = new OnlineAssetManager();

// 工具函数：预加载热门资源
export async function preloadPopularAssets(): Promise<void> {
  try {
    // 预加载 Unsplash 精选图片
    const unsplashService = onlineAssetManager.getService('unsplash');
    await unsplashService.getFeatured(1, 10);
    
    // 预加载 Iconify 热门图标
    const iconifyService = onlineAssetManager.getService('iconify');
    await iconifyService.getFeatured(1, 20);
    
    console.log('Popular assets preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload popular assets:', error);
  }
}

// 工具函数：批量搜索
export async function batchSearch(
  sources: ('unsplash' | 'iconify')[],
  query: string,
  limit: number = 10
): Promise<{ [key: string]: OnlineAssetResult }> {
  const results: { [key: string]: OnlineAssetResult } = {};
  
  const promises = sources.map(async (source) => {
    try {
      const service = onlineAssetManager.getService(source);
      const result = await service.search(query, 1, limit);
      results[source] = result;
    } catch (error) {
      console.error(`Failed to search ${source}:`, error);
      results[source] = {
        assets: [],
        total: 0,
        hasMore: false,
        page: 1
      };
    }
  });
  
  await Promise.all(promises);
  return results;
}

// 工具函数：检查服务可用性
export async function checkServiceAvailability(): Promise<{
  unsplash: boolean;
  iconify: boolean;
}> {
  const results = { unsplash: false, iconify: false };
  
  try {
    const unsplashService = onlineAssetManager.getService('unsplash');
    await unsplashService.getFeatured(1, 1);
    results.unsplash = true;
  } catch (error) {
    console.warn('Unsplash service unavailable:', error);
  }
  
  try {
    const iconifyService = onlineAssetManager.getService('iconify');
    await iconifyService.getFeatured(1, 1);
    results.iconify = true;
  } catch (error) {
    console.warn('Iconify service unavailable:', error);
  }
  
  return results;
}