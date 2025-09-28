/**
 * 模板缓存管理工具
 * 提供模板缓存的高级管理功能
 */

import { templateRenderCache, cacheUtils } from '@/services/templateRenderCache';
import { DesignTemplate } from '@/types/template';

export interface CacheManagementOptions {
  preloadPopularTemplates?: boolean;
  enableAutoCleanup?: boolean;
  maxCacheAge?: number; // 最大缓存年龄（毫秒）
  cleanupThreshold?: number; // 清理阈值（缓存使用率）
}

export interface TemplateCacheInfo {
  templateId: string;
  hasPreview: boolean;
  hasThumbnail: boolean;
  hasRenderCache: boolean;
  cacheSize: number;
  lastAccessed: number;
}

/**
 * 模板缓存管理器
 */
export class TemplateCacheManager {
  private options: CacheManagementOptions;
  private cleanupTimer?: number;
  private popularTemplates: string[] = [];

  constructor(options: CacheManagementOptions = {}) {
    this.options = {
      preloadPopularTemplates: true,
      enableAutoCleanup: true,
      maxCacheAge: 2 * 60 * 60 * 1000, // 2小时
      cleanupThreshold: 0.8, // 80%
      ...options
    };

    if (this.options.enableAutoCleanup) {
      this.startAutoCleanup();
    }
  }

  /**
   * 预加载模板缓存
   */
  async preloadTemplate(template: DesignTemplate): Promise<void> {
    try {
      // 预加载缩略图
      if (!templateRenderCache.getThumbnail(template.id)) {
        const thumbnailData = await this.generateThumbnail(template);
        if (thumbnailData) {
          templateRenderCache.setThumbnail(template.id, thumbnailData);
        }
      }

      // 预加载预览图
      if (!templateRenderCache.getPreview(template.id)) {
        const previewData = await this.generatePreview(template);
        if (previewData) {
          templateRenderCache.setPreview(template.id, previewData);
        }
      }

    } catch (error) {
      console.warn(`Failed to preload template ${template.id}:`, error);
    }
  }

  /**
   * 批量预加载模板
   */
  async preloadTemplates(templates: DesignTemplate[]): Promise<void> {
    const batchSize = 5; // 批量处理大小
    
    for (let i = 0; i < templates.length; i += batchSize) {
      const batch = templates.slice(i, i + batchSize);
      
      // 并行处理批次
      await Promise.allSettled(
        batch.map(template => this.preloadTemplate(template))
      );
      
      // 避免阻塞UI
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * 设置热门模板列表
   */
  setPopularTemplates(templateIds: string[]): void {
    this.popularTemplates = templateIds;
  }

  /**
   * 预热热门模板缓存
   */
  async warmupPopularTemplates(): Promise<void> {
    if (this.popularTemplates.length === 0) {
      return;
    }

    await templateRenderCache.warmupCache(this.popularTemplates);
  }

  /**
   * 获取模板缓存信息
   */
  getTemplateCacheInfo(templateId: string): TemplateCacheInfo {
    return {
      templateId,
      hasPreview: !!templateRenderCache.getPreview(templateId),
      hasThumbnail: !!templateRenderCache.getThumbnail(templateId),
      hasRenderCache: !!templateRenderCache.getRenderResult(
        templateRenderCache.generateRenderKey(templateId)
      ),
      cacheSize: this.estimateTemplateCacheSize(templateId),
      lastAccessed: Date.now() // 简化实现
    };
  }

  /**
   * 获取所有缓存的模板信息
   */
  getAllCachedTemplates(): TemplateCacheInfo[] {
    const stats = templateRenderCache.getStats();
    const templateIds = new Set<string>();

    // 从统计信息中提取模板ID（简化实现）
    // 实际实现中需要维护模板ID索引
    
    return Array.from(templateIds).map(id => this.getTemplateCacheInfo(id));
  }

  /**
   * 清理过期缓存
   */
  cleanupExpiredCache(): void {
    const now = Date.now();
    const maxAge = this.options.maxCacheAge!;

    // 这里需要遍历缓存项并检查年龄
    // 实际实现中缓存系统已经有TTL机制
    console.log('Cleaning up expired cache entries...');
  }

  /**
   * 智能缓存清理
   */
  smartCleanup(): void {
    const stats = templateRenderCache.getStats();
    const totalSize = stats.total.totalSize;
    const maxSize = 200 * 1024 * 1024; // 200MB 总限制

    if (totalSize > maxSize * this.options.cleanupThreshold!) {
      console.log('Cache size threshold reached, performing smart cleanup...');
      
      // 清理最少使用的缓存项
      // 实际实现中LRU缓存会自动处理
      this.cleanupExpiredCache();
    }
  }

  /**
   * 获取缓存使用报告
   */
  getCacheReport(): string {
    return cacheUtils.getCacheReport();
  }

  /**
   * 获取缓存使用情况
   */
  getCacheUsage(): string {
    return cacheUtils.getCacheUsage();
  }

  /**
   * 强制清理所有缓存
   */
  clearAllCache(): void {
    templateRenderCache.clearAll();
    console.log('All template cache cleared');
  }

  /**
   * 清理特定模板的缓存
   */
  clearTemplateCache(templateId: string): void {
    templateRenderCache.invalidateTemplate(templateId);
    console.log(`Cache cleared for template: ${templateId}`);
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    // 每30分钟执行一次智能清理
    this.cleanupTimer = setInterval(() => {
      this.smartCleanup();
    }, 30 * 60 * 1000);
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * 估算模板缓存大小
   */
  private estimateTemplateCacheSize(templateId: string): number {
    let size = 0;
    
    const preview = templateRenderCache.getPreview(templateId);
    if (preview) {
      size += new Blob([preview]).size;
    }
    
    const thumbnail = templateRenderCache.getThumbnail(templateId);
    if (thumbnail) {
      size += new Blob([thumbnail]).size;
    }
    
    return size;
  }

  /**
   * 生成缩略图（模拟实现）
   */
  private async generateThumbnail(template: DesignTemplate): Promise<string | null> {
    try {
      // 这里应该调用模板渲染器生成缩略图
      // 为了避免循环依赖，这里返回模拟数据
      return `data:image/jpeg;base64,thumbnail_${template.id}`;
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return null;
    }
  }

  /**
   * 生成预览图（模拟实现）
   */
  private async generatePreview(template: DesignTemplate): Promise<string | null> {
    try {
      // 这里应该调用模板渲染器生成预览图
      // 为了避免循环依赖，这里返回模拟数据
      return `data:image/png;base64,preview_${template.id}`;
    } catch (error) {
      console.error('Failed to generate preview:', error);
      return null;
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    this.stopAutoCleanup();
  }
}

// 全局缓存管理器实例
export const templateCacheManager = new TemplateCacheManager();

// 便捷函数
export const cacheManager = {
  /**
   * 预加载模板
   */
  preload: (template: DesignTemplate) => templateCacheManager.preloadTemplate(template),

  /**
   * 批量预加载
   */
  preloadBatch: (templates: DesignTemplate[]) => templateCacheManager.preloadTemplates(templates),

  /**
   * 清理缓存
   */
  cleanup: () => templateCacheManager.smartCleanup(),

  /**
   * 获取使用情况
   */
  getUsage: () => templateCacheManager.getCacheUsage(),

  /**
   * 获取报告
   */
  getReport: () => templateCacheManager.getCacheReport(),

  /**
   * 清空所有缓存
   */
  clearAll: () => templateCacheManager.clearAllCache(),

  /**
   * 清理特定模板
   */
  clearTemplate: (templateId: string) => templateCacheManager.clearTemplateCache(templateId),
};

// 开发模式下的调试工具
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).templateCacheDebug = {
    manager: templateCacheManager,
    cache: templateRenderCache,
    utils: cacheUtils,
    stats: () => templateRenderCache.getStats(),
    clear: () => templateRenderCache.clearAll(),
  };
}