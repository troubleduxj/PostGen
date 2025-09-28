// 字体缓存服务
export interface CachedFont {
  family: string;
  variants: string[];
  category: string;
  loadedAt: number;
  isLoaded: boolean;
}

export interface FontCacheConfig {
  maxCacheSize: number;
  cacheExpiry: number; // 毫秒
  preloadPopularFonts: boolean;
}

class FontCacheService {
  private cache = new Map<string, CachedFont>();
  private config: FontCacheConfig = {
    maxCacheSize: 100,
    cacheExpiry: 24 * 60 * 60 * 1000, // 24小时
    preloadPopularFonts: true
  };

  // 热门字体列表（用于预加载）
  private popularFonts = [
    'Open Sans',
    'Roboto',
    'Lato',
    'Montserrat',
    'Source Sans Pro',
    'Oswald',
    'Raleway',
    'Poppins',
    'Merriweather',
    'Ubuntu'
  ];

  constructor(config?: Partial<FontCacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // 从本地存储恢复缓存
    this.loadCacheFromStorage();
    
    // 预加载热门字体
    if (this.config.preloadPopularFonts) {
      this.preloadPopularFonts();
    }
  }

  // 添加字体到缓存
  addToCache(font: Omit<CachedFont, 'loadedAt'>): void {
    // 检查缓存大小限制
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictOldestFont();
    }

    const cachedFont: CachedFont = {
      ...font,
      loadedAt: Date.now()
    };

    this.cache.set(font.family, cachedFont);
    this.saveCacheToStorage();
  }

  // 从缓存获取字体
  getFromCache(fontFamily: string): CachedFont | null {
    const cached = this.cache.get(fontFamily);
    
    if (!cached) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - cached.loadedAt > this.config.cacheExpiry) {
      this.cache.delete(fontFamily);
      this.saveCacheToStorage();
      return null;
    }

    return cached;
  }

  // 检查字体是否在缓存中
  isInCache(fontFamily: string): boolean {
    return this.getFromCache(fontFamily) !== null;
  }

  // 检查字体是否已加载
  isFontLoaded(fontFamily: string): boolean {
    const cached = this.getFromCache(fontFamily);
    return cached?.isLoaded || false;
  }

  // 标记字体为已加载
  markAsLoaded(fontFamily: string): void {
    const cached = this.cache.get(fontFamily);
    if (cached) {
      cached.isLoaded = true;
      cached.loadedAt = Date.now();
      this.saveCacheToStorage();
    }
  }

  // 获取所有缓存的字体
  getAllCachedFonts(): CachedFont[] {
    return Array.from(this.cache.values());
  }

  // 获取已加载的字体
  getLoadedFonts(): CachedFont[] {
    return this.getAllCachedFonts().filter(font => font.isLoaded);
  }

  // 清理过期缓存
  cleanupExpiredCache(): void {
    const now = Date.now();
    const expired: string[] = [];

    this.cache.forEach((font, family) => {
      if (now - font.loadedAt > this.config.cacheExpiry) {
        expired.push(family);
      }
    });

    expired.forEach(family => {
      this.cache.delete(family);
    });

    if (expired.length > 0) {
      this.saveCacheToStorage();
    }
  }

  // 清空缓存
  clearCache(): void {
    this.cache.clear();
    this.saveCacheToStorage();
  }

  // 获取缓存统计信息
  getCacheStats(): {
    totalFonts: number;
    loadedFonts: number;
    cacheSize: string;
    oldestFont: string | null;
    newestFont: string | null;
  } {
    const fonts = this.getAllCachedFonts();
    const loadedFonts = fonts.filter(f => f.isLoaded);
    
    let oldest: CachedFont | null = null;
    let newest: CachedFont | null = null;

    fonts.forEach(font => {
      if (!oldest || font.loadedAt < oldest.loadedAt) {
        oldest = font;
      }
      if (!newest || font.loadedAt > newest.loadedAt) {
        newest = font;
      }
    });

    return {
      totalFonts: fonts.length,
      loadedFonts: loadedFonts.length,
      cacheSize: this.formatBytes(this.estimateCacheSize()),
      oldestFont: oldest?.family || null,
      newestFont: newest?.family || null
    };
  }

  // 预加载热门字体
  private async preloadPopularFonts(): Promise<void> {
    // 延迟执行，避免阻塞初始化
    setTimeout(async () => {
      for (const fontFamily of this.popularFonts) {
        if (!this.isInCache(fontFamily)) {
          this.addToCache({
            family: fontFamily,
            variants: ['400'],
            category: 'sans-serif',
            isLoaded: false
          });
        }
      }
    }, 1000);
  }

  // 移除最旧的字体
  private evictOldestFont(): void {
    let oldest: { family: string; loadedAt: number } | null = null;

    this.cache.forEach((font, family) => {
      if (!oldest || font.loadedAt < oldest.loadedAt) {
        oldest = { family, loadedAt: font.loadedAt };
      }
    });

    if (oldest) {
      this.cache.delete(oldest.family);
    }
  }

  // 从本地存储加载缓存
  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem('fontCache');
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data.fonts || []);
        
        // 清理过期缓存
        this.cleanupExpiredCache();
      }
    } catch (error) {
      console.error('Failed to load font cache from storage:', error);
    }
  }

  // 保存缓存到本地存储
  private saveCacheToStorage(): void {
    try {
      const data = {
        fonts: Array.from(this.cache.entries()),
        savedAt: Date.now()
      };
      localStorage.setItem('fontCache', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save font cache to storage:', error);
    }
  }

  // 估算缓存大小
  private estimateCacheSize(): number {
    const data = JSON.stringify(Array.from(this.cache.entries()));
    return new Blob([data]).size;
  }

  // 格式化字节数
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 创建单例实例
export const fontCacheService = new FontCacheService();