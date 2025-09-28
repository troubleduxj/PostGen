import { useState, useEffect, useCallback, useRef } from 'react';
import { Asset } from '@/stores/assetLibraryStore';
import { onlineAssetManager, OnlineAssetResult } from '@/services/onlineAssetService';
import { FEATURE_FLAGS } from '@/config/onlineAssets';

// 在线素材 Hook 配置
interface UseOnlineAssetsOptions {
  source: 'unsplash' | 'iconify';
  initialQuery?: string;
  initialCategory?: string;
  pageSize?: number;
  autoLoad?: boolean;
  enableCache?: boolean;
}

// 在线素材 Hook 返回值
interface UseOnlineAssetsReturn {
  // 数据状态
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  currentPage: number;
  
  // 操作方法
  search: (query: string) => Promise<void>;
  loadByCategory: (category: string) => Promise<void>;
  loadFeatured: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
  
  // 状态查询
  isEmpty: boolean;
  isFirstLoad: boolean;
}

export function useOnlineAssets(options: UseOnlineAssetsOptions): UseOnlineAssetsReturn {
  const {
    source,
    initialQuery = '',
    initialCategory = '',
    pageSize = 20,
    autoLoad = true,
    enableCache = FEATURE_FLAGS.ENABLE_CACHING
  } = options;

  // 状态管理
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentQuery, setCurrentQuery] = useState(initialQuery);
  const [currentCategory, setCurrentCategory] = useState(initialCategory);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // 引用管理
  const abortControllerRef = useRef<AbortController | null>(null);
  const serviceRef = useRef(onlineAssetManager.getService(source));

  // 取消当前请求
  const cancelCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // 执行加载
  const executeLoad = useCallback(async (
    loadFn: () => Promise<OnlineAssetResult>,
    append: boolean = false
  ): Promise<void> => {
    // 取消之前的请求
    cancelCurrentRequest();
    
    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await loadFn();
      
      // 检查请求是否被取消
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setAssets(prev => append ? [...prev, ...result.assets] : result.assets);
      setHasMore(result.hasMore);
      setTotal(result.total);
      setCurrentPage(result.page);
      setIsFirstLoad(false);

    } catch (err) {
      // 忽略取消的请求
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : '加载失败';
      setError(errorMessage);
      console.error('Failed to load online assets:', err);
      
      // 如果是第一次加载失败，设置空数组
      if (!append) {
        setAssets([]);
        setHasMore(false);
        setTotal(0);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [cancelCurrentRequest]);

  // 搜索资源
  const search = useCallback(async (query: string): Promise<void> => {
    setCurrentQuery(query);
    setCurrentCategory('');
    setCurrentPage(1);
    
    await executeLoad(async () => {
      return serviceRef.current.search(query, 1, pageSize);
    });
  }, [executeLoad, pageSize]);

  // 按分类加载
  const loadByCategory = useCallback(async (category: string): Promise<void> => {
    setCurrentCategory(category);
    setCurrentQuery('');
    setCurrentPage(1);
    
    await executeLoad(async () => {
      return serviceRef.current.getByCategory(category, 1, pageSize);
    });
  }, [executeLoad, pageSize]);

  // 加载精选资源
  const loadFeatured = useCallback(async (): Promise<void> => {
    setCurrentQuery('');
    setCurrentCategory('');
    setCurrentPage(1);
    
    await executeLoad(async () => {
      return serviceRef.current.getFeatured(1, pageSize);
    });
  }, [executeLoad, pageSize]);

  // 加载更多
  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || isLoading) return;
    
    const nextPage = currentPage + 1;
    
    await executeLoad(async () => {
      if (currentQuery) {
        return serviceRef.current.search(currentQuery, nextPage, pageSize);
      } else if (currentCategory) {
        return serviceRef.current.getByCategory(currentCategory, nextPage, pageSize);
      } else {
        return serviceRef.current.getFeatured(nextPage, pageSize);
      }
    }, true); // append = true
  }, [hasMore, isLoading, currentPage, currentQuery, currentCategory, executeLoad, pageSize]);

  // 刷新当前数据
  const refresh = useCallback(async (): Promise<void> => {
    setCurrentPage(1);
    
    await executeLoad(async () => {
      if (currentQuery) {
        return serviceRef.current.search(currentQuery, 1, pageSize);
      } else if (currentCategory) {
        return serviceRef.current.getByCategory(currentCategory, 1, pageSize);
      } else {
        return serviceRef.current.getFeatured(1, pageSize);
      }
    });
  }, [currentQuery, currentCategory, executeLoad, pageSize]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    cancelCurrentRequest();
    setAssets([]);
    setIsLoading(false);
    setError(null);
    setHasMore(true);
    setTotal(0);
    setCurrentPage(1);
    setCurrentQuery(initialQuery);
    setCurrentCategory(initialCategory);
    setIsFirstLoad(true);
  }, [cancelCurrentRequest, initialQuery, initialCategory]);

  // 自动加载
  useEffect(() => {
    if (autoLoad && isFirstLoad) {
      if (initialQuery) {
        search(initialQuery);
      } else if (initialCategory) {
        loadByCategory(initialCategory);
      } else {
        loadFeatured();
      }
    }
  }, [autoLoad, isFirstLoad, initialQuery, initialCategory, search, loadByCategory, loadFeatured]);

  // 清理函数
  useEffect(() => {
    return () => {
      cancelCurrentRequest();
    };
  }, [cancelCurrentRequest]);

  // 计算派生状态
  const isEmpty = assets.length === 0 && !isLoading && !error;

  return {
    // 数据状态
    assets,
    isLoading,
    error,
    hasMore,
    total,
    currentPage,
    
    // 操作方法
    search,
    loadByCategory,
    loadFeatured,
    loadMore,
    refresh,
    clearError,
    reset,
    
    // 状态查询
    isEmpty,
    isFirstLoad
  };
}

// 批量搜索 Hook
interface UseBatchSearchOptions {
  sources: ('unsplash' | 'iconify')[];
  limit?: number;
}

interface UseBatchSearchReturn {
  results: { [key: string]: Asset[] };
  isLoading: boolean;
  errors: { [key: string]: string | null };
  search: (query: string) => Promise<void>;
  clear: () => void;
}

export function useBatchSearch(options: UseBatchSearchOptions): UseBatchSearchReturn {
  const { sources, limit = 10 } = options;
  
  const [results, setResults] = useState<{ [key: string]: Asset[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const search = useCallback(async (query: string): Promise<void> => {
    setIsLoading(true);
    setErrors({});
    
    const newResults: { [key: string]: Asset[] } = {};
    const newErrors: { [key: string]: string | null } = {};

    const promises = sources.map(async (source) => {
      try {
        const service = onlineAssetManager.getService(source);
        const result = await service.search(query, 1, limit);
        newResults[source] = result.assets;
        newErrors[source] = null;
      } catch (error) {
        newResults[source] = [];
        newErrors[source] = error instanceof Error ? error.message : '搜索失败';
      }
    });

    await Promise.all(promises);
    
    setResults(newResults);
    setErrors(newErrors);
    setIsLoading(false);
  }, [sources, limit]);

  const clear = useCallback(() => {
    setResults({});
    setErrors({});
  }, []);

  return {
    results,
    isLoading,
    errors,
    search,
    clear
  };
}

// 服务可用性检查 Hook
interface UseServiceAvailabilityReturn {
  availability: { [key: string]: boolean };
  isChecking: boolean;
  lastChecked: Date | null;
  checkAvailability: () => Promise<void>;
}

export function useServiceAvailability(): UseServiceAvailabilityReturn {
  const [availability, setAvailability] = useState<{ [key: string]: boolean }>({});
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkAvailability = useCallback(async (): Promise<void> => {
    setIsChecking(true);
    
    const results: { [key: string]: boolean } = {};
    
    // 检查 Unsplash
    try {
      const unsplashService = onlineAssetManager.getService('unsplash');
      await unsplashService.getFeatured(1, 1);
      results.unsplash = true;
    } catch (error) {
      results.unsplash = false;
    }
    
    // 检查 Iconify
    try {
      const iconifyService = onlineAssetManager.getService('iconify');
      await iconifyService.getFeatured(1, 1);
      results.iconify = true;
    } catch (error) {
      results.iconify = false;
    }
    
    setAvailability(results);
    setLastChecked(new Date());
    setIsChecking(false);
  }, []);

  // 初始检查
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    availability,
    isChecking,
    lastChecked,
    checkAvailability
  };
}