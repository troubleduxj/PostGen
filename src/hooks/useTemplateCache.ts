/**
 * 模板缓存 React Hook
 * 提供组件级别的缓存管理功能
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { DesignTemplate } from '@/types/template';
import { templateRenderCache } from '@/services/templateRenderCache';
import { templateCacheManager, TemplateCacheInfo } from '@/utils/templateCacheManager';

export interface UseTemplateCacheOptions {
  preloadOnMount?: boolean;
  enableAutoPreload?: boolean;
  preloadDistance?: number; // 预加载距离（像素）
}

export interface TemplateCacheState {
  isLoading: boolean;
  hasPreview: boolean;
  hasThumbnail: boolean;
  cacheInfo: TemplateCacheInfo | null;
  error: string | null;
}

/**
 * 模板缓存Hook
 */
export function useTemplateCache(
  template: DesignTemplate | null,
  options: UseTemplateCacheOptions = {}
) {
  const {
    preloadOnMount = false,
    enableAutoPreload = true,
    preloadDistance = 200
  } = options;

  const [state, setState] = useState<TemplateCacheState>({
    isLoading: false,
    hasPreview: false,
    hasThumbnail: false,
    cacheInfo: null,
    error: null
  });

  const preloadTimeoutRef = useRef<number>();

  // 更新缓存状态
  const updateCacheState = useCallback(() => {
    if (!template) {
      setState(prev => ({
        ...prev,
        hasPreview: false,
        hasThumbnail: false,
        cacheInfo: null
      }));
      return;
    }

    const hasPreview = !!templateRenderCache.getPreview(template.id);
    const hasThumbnail = !!templateRenderCache.getThumbnail(template.id);
    const cacheInfo = templateCacheManager.getTemplateCacheInfo(template.id);

    setState(prev => ({
      ...prev,
      hasPreview,
      hasThumbnail,
      cacheInfo
    }));
  }, [template]);

  // 预加载模板
  const preloadTemplate = useCallback(async () => {
    if (!template || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await templateCacheManager.preloadTemplate(template);
      updateCacheState();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '预加载失败'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [template, state.isLoading, updateCacheState]);

  // 延迟预加载
  const schedulePreload = useCallback((delay: number = 500) => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }

    preloadTimeoutRef.current = setTimeout(() => {
      preloadTemplate();
    }, delay);
  }, [preloadTemplate]);

  // 取消预加载
  const cancelPreload = useCallback(() => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
      preloadTimeoutRef.current = undefined;
    }
  }, []);

  // 获取预览图
  const getPreview = useCallback((): string | null => {
    if (!template) return null;
    return templateRenderCache.getPreview(template.id);
  }, [template]);

  // 获取缩略图
  const getThumbnail = useCallback((): string | null => {
    if (!template) return null;
    return templateRenderCache.getThumbnail(template.id);
  }, [template]);

  // 清理模板缓存
  const clearCache = useCallback(() => {
    if (!template) return;
    templateCacheManager.clearTemplateCache(template.id);
    updateCacheState();
  }, [template, updateCacheState]);

  // 强制刷新缓存状态
  const refreshCacheState = useCallback(() => {
    updateCacheState();
  }, [updateCacheState]);

  // 初始化时预加载
  useEffect(() => {
    if (preloadOnMount && template) {
      preloadTemplate();
    } else {
      updateCacheState();
    }
  }, [template, preloadOnMount, preloadTemplate, updateCacheState]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    preloadTemplate,
    schedulePreload,
    cancelPreload,
    getPreview,
    getThumbnail,
    clearCache,
    refreshCacheState
  };
}

/**
 * 批量模板缓存Hook
 */
export function useBatchTemplateCache(
  templates: DesignTemplate[],
  options: UseTemplateCacheOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 批量预加载
  const preloadBatch = useCallback(async () => {
    if (templates.length === 0 || isLoading) return;

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const batchSize = 3;
      let completed = 0;

      for (let i = 0; i < templates.length; i += batchSize) {
        const batch = templates.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(template => templateCacheManager.preloadTemplate(template))
        );

        completed += batch.length;
        setProgress((completed / templates.length) * 100);

        // 避免阻塞UI
        await new Promise(resolve => setTimeout(resolve, 50));
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : '批量预加载失败');
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  }, [templates, isLoading]);

  // 获取缓存统计
  const getCacheStats = useCallback(() => {
    return templates.map(template => 
      templateCacheManager.getTemplateCacheInfo(template.id)
    );
  }, [templates]);

  return {
    isLoading,
    progress,
    error,
    preloadBatch,
    getCacheStats
  };
}

/**
 * 缓存统计Hook
 */
export function useCacheStats() {
  const [stats, setStats] = useState(() => templateRenderCache.getStats());
  const [refreshKey, setRefreshKey] = useState(0);

  // 刷新统计
  const refreshStats = useCallback(() => {
    setStats(templateRenderCache.getStats());
    setRefreshKey(prev => prev + 1);
  }, []);

  // 定期刷新统计
  useEffect(() => {
    const interval = setInterval(refreshStats, 5000); // 每5秒刷新
    return () => clearInterval(interval);
  }, [refreshStats]);

  // 获取格式化的统计信息
  const getFormattedStats = useCallback(() => {
    const totalSizeMB = (stats.total.totalSize / (1024 * 1024)).toFixed(2);
    const previewHitRate = (stats.preview.hitRate * 100).toFixed(1);
    const renderHitRate = (stats.render.hitRate * 100).toFixed(1);
    const thumbnailHitRate = (stats.thumbnail.hitRate * 100).toFixed(1);

    return {
      totalSize: `${totalSizeMB} MB`,
      totalEntries: stats.total.totalEntries,
      hitRates: {
        preview: `${previewHitRate}%`,
        render: `${renderHitRate}%`,
        thumbnail: `${thumbnailHitRate}%`
      },
      entryCounts: {
        preview: stats.preview.entryCount,
        render: stats.render.entryCount,
        thumbnail: stats.thumbnail.entryCount
      }
    };
  }, [stats]);

  return {
    stats,
    refreshStats,
    getFormattedStats,
    refreshKey
  };
}

/**
 * 智能预加载Hook
 * 基于用户滚动行为智能预加载模板
 */
export function useSmartPreload(
  templates: DesignTemplate[],
  containerRef: React.RefObject<HTMLElement>,
  options: UseTemplateCacheOptions = {}
) {
  const { preloadDistance = 200 } = options;
  const [preloadedIds, setPreloadedIds] = useState<Set<string>>(new Set());

  // 检查元素是否在预加载范围内
  const isInPreloadRange = useCallback((element: Element): boolean => {
    if (!containerRef.current) return false;

    const containerRect = containerRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const containerBottom = containerRect.bottom + preloadDistance;
    const containerTop = containerRect.top - preloadDistance;

    return elementRect.top < containerBottom && elementRect.bottom > containerTop;
  }, [containerRef, preloadDistance]);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const templateElements = containerRef.current.querySelectorAll('[data-template-id]');
    
    templateElements.forEach(element => {
      const templateId = element.getAttribute('data-template-id');
      if (!templateId || preloadedIds.has(templateId)) return;

      if (isInPreloadRange(element)) {
        const template = templates.find(t => t.id === templateId);
        if (template) {
          templateCacheManager.preloadTemplate(template);
          setPreloadedIds(prev => new Set(prev).add(templateId));
        }
      }
    });
  }, [containerRef, templates, preloadedIds, isInPreloadRange]);

  // 设置滚动监听
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 节流处理滚动事件
    let timeoutId: number;
    const throttledScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    container.addEventListener('scroll', throttledScroll);
    
    // 初始检查
    handleScroll();

    return () => {
      container.removeEventListener('scroll', throttledScroll);
      clearTimeout(timeoutId);
    };
  }, [containerRef, handleScroll]);

  return {
    preloadedCount: preloadedIds.size,
    preloadedIds: Array.from(preloadedIds)
  };
}