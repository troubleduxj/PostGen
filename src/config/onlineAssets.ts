// 在线素材服务配置

// Unsplash 配置
export const UNSPLASH_CONFIG = {
  // 访问密钥 - 在生产环境中应该从环境变量获取
  ACCESS_KEY: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'demo-key',
  
  // API 基础 URL
  API_BASE: 'https://api.unsplash.com',
  
  // 默认参数
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 30,
  
  // 缓存配置
  CACHE_DURATION: 5 * 60 * 1000, // 5分钟
  
  // 速率限制
  RATE_LIMIT: {
    DEMO: 50, // 演示密钥每小时50次请求
    PRODUCTION: 5000 // 生产密钥每小时5000次请求
  },
  
  // 支持的图片方向
  ORIENTATIONS: ['landscape', 'portrait', 'squarish'] as const,
  
  // 支持的排序方式
  ORDER_BY: ['latest', 'oldest', 'popular'] as const
};

// Iconify 配置
export const ICONIFY_CONFIG = {
  // API 基础 URL
  API_BASE: 'https://api.iconify.design',
  
  // 默认参数
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  
  // 缓存配置
  CACHE_DURATION: 10 * 60 * 1000, // 10分钟
  
  // 热门图标集
  POPULAR_COLLECTIONS: [
    'mdi', 'fa', 'heroicons', 'lucide', 'tabler',
    'carbon', 'ant-design', 'bootstrap', 'feather', 'phosphor'
  ],
  
  // 图标大小配置
  ICON_SIZES: {
    THUMBNAIL: 64,
    SMALL: 24,
    MEDIUM: 32,
    LARGE: 48,
    XLARGE: 64
  }
};

// 通用配置
export const ONLINE_ASSETS_CONFIG = {
  // 网络超时时间
  TIMEOUT: 10000, // 10秒
  
  // 重试配置
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1秒
    BACKOFF_FACTOR: 2
  },
  
  // 缓存配置
  CACHE: {
    MAX_SIZE: 100, // 最大缓存条目数
    CLEANUP_INTERVAL: 10 * 60 * 1000 // 10分钟清理一次
  },
  
  // 图片优化配置
  IMAGE_OPTIMIZATION: {
    THUMBNAIL_SIZE: 200,
    PREVIEW_SIZE: 800,
    QUALITY: 80,
    FORMAT: 'webp' // 优先使用 WebP 格式
  },
  
  // 错误消息
  ERROR_MESSAGES: {
    NETWORK_ERROR: '网络连接失败，请检查网络设置',
    TIMEOUT_ERROR: '请求超时，请稍后重试',
    API_ERROR: 'API 服务暂时不可用',
    RATE_LIMIT_ERROR: '请求过于频繁，请稍后重试',
    INVALID_KEY_ERROR: 'API 密钥无效或已过期',
    QUOTA_EXCEEDED_ERROR: 'API 配额已用完',
    UNKNOWN_ERROR: '未知错误，请稍后重试'
  }
};

// 环境检测
export const ENVIRONMENT = {
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  HAS_UNSPLASH_KEY: Boolean(import.meta.env.VITE_UNSPLASH_ACCESS_KEY),
  HAS_ICONIFY_KEY: Boolean(import.meta.env.VITE_ICONIFY_ACCESS_KEY) // 如果需要的话
};

// 功能开关
export const FEATURE_FLAGS = {
  ENABLE_UNSPLASH: true,
  ENABLE_ICONIFY: true,
  ENABLE_CACHING: true,
  ENABLE_RETRY: true,
  ENABLE_PRELOAD: true,
  ENABLE_ANALYTICS: false // 使用统计
};

// 预设搜索关键词
export const PRESET_SEARCHES = {
  UNSPLASH: [
    { id: 'nature', name: '自然', query: 'nature landscape' },
    { id: 'business', name: '商务', query: 'business office' },
    { id: 'technology', name: '科技', query: 'technology computer' },
    { id: 'people', name: '人物', query: 'people portrait' },
    { id: 'food', name: '美食', query: 'food cooking' },
    { id: 'travel', name: '旅行', query: 'travel destination' },
    { id: 'architecture', name: '建筑', query: 'architecture building' },
    { id: 'abstract', name: '抽象', query: 'abstract pattern' }
  ],
  ICONIFY: [
    { id: 'ui', name: 'UI界面', query: 'ui interface button' },
    { id: 'business', name: '商务', query: 'business office work' },
    { id: 'communication', name: '通讯', query: 'communication chat message' },
    { id: 'media', name: '媒体', query: 'media music video' },
    { id: 'social', name: '社交', query: 'social network share' },
    { id: 'technology', name: '科技', query: 'technology computer device' },
    { id: 'transport', name: '交通', query: 'transport car plane' },
    { id: 'weather', name: '天气', query: 'weather sun rain cloud' }
  ]
};

// 工具函数：获取错误消息
export function getErrorMessage(error: any): string {
  if (error?.response?.status) {
    switch (error.response.status) {
      case 401:
        return ONLINE_ASSETS_CONFIG.ERROR_MESSAGES.INVALID_KEY_ERROR;
      case 403:
        return ONLINE_ASSETS_CONFIG.ERROR_MESSAGES.QUOTA_EXCEEDED_ERROR;
      case 429:
        return ONLINE_ASSETS_CONFIG.ERROR_MESSAGES.RATE_LIMIT_ERROR;
      case 500:
      case 502:
      case 503:
        return ONLINE_ASSETS_CONFIG.ERROR_MESSAGES.API_ERROR;
      default:
        return error.message || ONLINE_ASSETS_CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }
  
  if (error?.code === 'NETWORK_ERROR') {
    return ONLINE_ASSETS_CONFIG.ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (error?.code === 'TIMEOUT') {
    return ONLINE_ASSETS_CONFIG.ERROR_MESSAGES.TIMEOUT_ERROR;
  }
  
  return error?.message || ONLINE_ASSETS_CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR;
}

// 工具函数：检查 API 密钥
export function validateApiKeys(): { unsplash: boolean; iconify: boolean } {
  return {
    unsplash: ENVIRONMENT.HAS_UNSPLASH_KEY && UNSPLASH_CONFIG.ACCESS_KEY !== 'demo-key',
    iconify: true // Iconify 通常不需要 API 密钥
  };
}

// 工具函数：获取优化的图片 URL
export function getOptimizedImageUrl(
  originalUrl: string,
  width?: number,
  height?: number,
  quality?: number
): string {
  if (!originalUrl.includes('unsplash.com')) {
    return originalUrl;
  }
  
  const url = new URL(originalUrl);
  
  if (width) url.searchParams.set('w', width.toString());
  if (height) url.searchParams.set('h', height.toString());
  
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('q', (quality || ONLINE_ASSETS_CONFIG.IMAGE_OPTIMIZATION.QUALITY).toString());
  
  // 如果浏览器支持 WebP，使用 WebP 格式
  if (supportsWebP()) {
    url.searchParams.set('fm', 'webp');
  }
  
  return url.toString();
}

// 检查浏览器是否支持 WebP
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// 导出默认配置
export default {
  UNSPLASH: UNSPLASH_CONFIG,
  ICONIFY: ICONIFY_CONFIG,
  GENERAL: ONLINE_ASSETS_CONFIG,
  ENVIRONMENT,
  FEATURE_FLAGS,
  PRESET_SEARCHES
};