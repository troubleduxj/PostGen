/**
 * 模板渲染缓存系统
 * 提供模板预览图和渲染结果的缓存机制
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // 数据大小（字节）
}

interface CacheConfig {
  maxSize: number; // 最大缓存大小（字节）
  maxEntries: number; // 最大缓存条目数
  ttl: number; // 生存时间（毫秒）
  cleanupInterval: number; // 清理间隔（毫秒）
}

interface RenderCacheStats {
  totalSize: number;
  entryCount: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
}

/**
 * LRU缓存实现，支持大小限制和TTL
 */
class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    totalSize: 0
  };
  private cleanupTimer?: number;

  constructor(config: CacheConfig) {
    this.config = config;
    this.startCleanupTimer();
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // 检查TTL
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    // 更新访问信息
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    // 移到最前面（LRU）
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    this.stats.hits++;
    return entry.data;
  }

  /**
   * 设置缓存项
   */
  set(key: string, data: T, size: number = 0): void {
    // 如果已存在，先删除旧的
    if (this.cache.has(key)) {
      this.delete(key);
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      size
    };

    // 检查是否需要清理空间
    this.ensureSpace(size);

    this.cache.set(key, entry);
    this.stats.totalSize += size;
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.totalSize -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.stats.totalSize = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): RenderCacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      totalSize: this.stats.totalSize,
      entryCount: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      missRate: total > 0 ? this.stats.misses / total : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses
    };
  }

  /**
   * 确保有足够空间
   */
  private ensureSpace(newItemSize: number): void {
    // 检查条目数限制
    while (this.cache.size >= this.config.maxEntries) {
      this.evictLRU();
    }

    // 检查大小限制
    while (this.stats.totalSize + newItemSize > this.config.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }
  }

  /**
   * 驱逐最少使用的项
   */
  private evictLRU(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.delete(firstKey);
    }
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * 清理过期项
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

/**
 * 模板渲染缓存管理器
 */
export class TemplateRenderCache {
  private previewCache: LRUCache<string>; // 预览图缓存（Base64）
  private renderCache: LRUCache<any>; // 渲染结果缓存
  private thumbnailCache: LRUCache<string>; // 缩略图缓存

  constructor() {
    // 预览图缓存配置（较大的图片）
    this.previewCache = new LRUCache<string>({
      maxSize: 50 * 1024 * 1024, // 50MB
      maxEntries: 100,
      ttl: 30 * 60 * 1000, // 30分钟
      cleanupInterval: 5 * 60 * 1000 // 5分钟清理一次
    });

    // 渲染结果缓存配置
    this.renderCache = new LRUCache<any>({
      maxSize: 100 * 1024 * 1024, // 100MB
      maxEntries: 200,
      ttl: 60 * 60 * 1000, // 1小时
      cleanupInterval: 10 * 60 * 1000 // 10分钟清理一次
    });

    // 缩略图缓存配置（小图片）
    this.thumbnailCache = new LRUCache<string>({
      maxSize: 20 * 1024 * 1024, // 20MB
      maxEntries: 500,
      ttl: 2 * 60 * 60 * 1000, // 2小时
      cleanupInterval: 15 * 60 * 1000 // 15分钟清理一次
    });
  }

  /**
   * 获取模板预览图
   */
  getPreview(templateId: string): string | null {
    return this.previewCache.get(templateId);
  }

  /**
   * 缓存模板预览图
   */
  setPreview(templateId: string, previewData: string): void {
    const size = this.estimateStringSize(previewData);
    this.previewCache.set(templateId, previewData, size);
  }

  /**
   * 获取模板缩略图
   */
  getThumbnail(templateId: string): string | null {
    return this.thumbnailCache.get(templateId);
  }

  /**
   * 缓存模板缩略图
   */
  setThumbnail(templateId: string, thumbnailData: string): void {
    const size = this.estimateStringSize(thumbnailData);
    this.thumbnailCache.set(templateId, thumbnailData, size);
  }

  /**
   * 获取渲染结果
   */
  getRenderResult(cacheKey: string): any | null {
    return this.renderCache.get(cacheKey);
  }

  /**
   * 缓存渲染结果
   */
  setRenderResult(cacheKey: string, renderData: any): void {
    const size = this.estimateObjectSize(renderData);
    this.renderCache.set(cacheKey, renderData, size);
  }

  /**
   * 生成渲染缓存键
   */
  generateRenderKey(templateId: string, options: any = {}): string {
    const optionsStr = JSON.stringify(options);
    return `${templateId}_${this.hashString(optionsStr)}`;
  }

  /**
   * 使模板缓存失效
   */
  invalidateTemplate(templateId: string): void {
    // 删除预览图缓存
    this.previewCache.delete(templateId);
    
    // 删除缩略图缓存
    this.thumbnailCache.delete(templateId);
    
    // 删除相关的渲染结果缓存
    this.invalidateRenderCache(templateId);
  }

  /**
   * 使渲染缓存失效
   */
  private invalidateRenderCache(templateId: string): void {
    // 找到所有相关的渲染缓存键并删除
    const keysToDelete: string[] = [];
    
    // 这里需要遍历所有键，找到匹配的
    // 在实际实现中，可以维护一个模板ID到缓存键的映射
    for (const key of (this.renderCache as any).cache.keys()) {
      if (key.startsWith(templateId + '_')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.renderCache.delete(key));
  }

  /**
   * 预热缓存
   */
  async warmupCache(templateIds: string[]): Promise<void> {
    // 这里可以预加载热门模板的预览图
    // 实际实现中需要配合模板渲染器
    console.log('Warming up cache for templates:', templateIds);
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    preview: RenderCacheStats;
    render: RenderCacheStats;
    thumbnail: RenderCacheStats;
    total: {
      totalSize: number;
      totalEntries: number;
    };
  } {
    const previewStats = this.previewCache.getStats();
    const renderStats = this.renderCache.getStats();
    const thumbnailStats = this.thumbnailCache.getStats();

    return {
      preview: previewStats,
      render: renderStats,
      thumbnail: thumbnailStats,
      total: {
        totalSize: previewStats.totalSize + renderStats.totalSize + thumbnailStats.totalSize,
        totalEntries: previewStats.entryCount + renderStats.entryCount + thumbnailStats.entryCount
      }
    };
  }

  /**
   * 清空所有缓存
   */
  clearAll(): void {
    this.previewCache.clear();
    this.renderCache.clear();
    this.thumbnailCache.clear();
  }

  /**
   * 销毁缓存系统
   */
  destroy(): void {
    this.previewCache.destroy();
    this.renderCache.destroy();
    this.thumbnailCache.destroy();
  }

  /**
   * 估算字符串大小（字节）
   */
  private estimateStringSize(str: string): number {
    return new Blob([str]).size;
  }

  /**
   * 估算对象大小（字节）
   */
  private estimateObjectSize(obj: any): number {
    const jsonStr = JSON.stringify(obj);
    return this.estimateStringSize(jsonStr);
  }

  /**
   * 字符串哈希函数
   */
  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    return Math.abs(hash).toString(36);
  }
}

// 全局缓存实例
export const templateRenderCache = new TemplateRenderCache();

// 缓存管理工具函数
export const cacheUtils = {
  /**
   * 获取缓存使用情况
   */
  getCacheUsage(): string {
    const stats = templateRenderCache.getStats();
    const totalSizeMB = (stats.total.totalSize / (1024 * 1024)).toFixed(2);
    
    return `缓存使用: ${totalSizeMB}MB, 条目: ${stats.total.totalEntries}`;
  },

  /**
   * 清理缓存
   */
  cleanupCache(): void {
    templateRenderCache.clearAll();
    console.log('Template render cache cleared');
  },

  /**
   * 获取缓存命中率报告
   */
  getCacheReport(): string {
    const stats = templateRenderCache.getStats();
    
    return `
缓存报告:
- 预览图缓存: ${(stats.preview.hitRate * 100).toFixed(1)}% 命中率, ${stats.preview.entryCount} 条目
- 渲染结果缓存: ${(stats.render.hitRate * 100).toFixed(1)}% 命中率, ${stats.render.entryCount} 条目  
- 缩略图缓存: ${(stats.thumbnail.hitRate * 100).toFixed(1)}% 命中率, ${stats.thumbnail.entryCount} 条目
- 总大小: ${(stats.total.totalSize / (1024 * 1024)).toFixed(2)}MB
    `.trim();
  }
};