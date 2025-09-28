import { fontCacheService } from './fontCache';

// Google Fonts API 服务
export interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  files: Record<string, string>;
  kind: string;
  version: string;
}

export interface GoogleFontsResponse {
  kind: string;
  items: GoogleFont[];
}

export interface FontPreview {
  family: string;
  category: string;
  variants: string[];
  isLoaded: boolean;
  isLoading: boolean;
}

class GoogleFontsService {
  private apiKey: string = 'AIzaSyDummyKeyForDemo'; // 在实际项目中应该从环境变量获取
  private baseUrl = 'https://www.googleapis.com/webfonts/v1/webfonts';
  private fontCache = new Map<string, GoogleFont>();
  private loadedFonts = new Set<string>();
  private loadingFonts = new Set<string>();

  // 获取字体列表
  async getFontList(sort: 'alpha' | 'date' | 'popularity' | 'style' | 'trending' = 'popularity'): Promise<GoogleFont[]> {
    try {
      const url = `${this.baseUrl}?key=${this.apiKey}&sort=${sort}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GoogleFontsResponse = await response.json();
      
      // 缓存字体数据
      data.items.forEach(font => {
        this.fontCache.set(font.family, font);
      });
      
      return data.items;
    } catch (error) {
      console.error('Failed to fetch Google Fonts:', error);
      // 返回备用字体列表
      return this.getFallbackFonts();
    }
  }

  // 获取热门字体
  async getPopularFonts(limit: number = 50): Promise<GoogleFont[]> {
    const fonts = await this.getFontList('popularity');
    return fonts.slice(0, limit);
  }

  // 按分类获取字体
  async getFontsByCategory(category: string): Promise<GoogleFont[]> {
    const fonts = await this.getFontList();
    return fonts.filter(font => font.category === category);
  }

  // 搜索字体
  async searchFonts(query: string): Promise<GoogleFont[]> {
    const fonts = await this.getFontList();
    const searchTerm = query.toLowerCase();
    
    return fonts.filter(font => 
      font.family.toLowerCase().includes(searchTerm)
    );
  }

  // 加载字体
  async loadFont(fontFamily: string, variants: string[] = ['400']): Promise<boolean> {
    // 检查缓存
    if (fontCacheService.isFontLoaded(fontFamily)) {
      this.loadedFonts.add(fontFamily);
      return true;
    }

    if (this.loadedFonts.has(fontFamily)) {
      return true;
    }

    if (this.loadingFonts.has(fontFamily)) {
      // 等待正在加载的字体
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.loadedFonts.has(fontFamily)) {
            resolve(true);
          } else if (!this.loadingFonts.has(fontFamily)) {
            resolve(false);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    this.loadingFonts.add(fontFamily);

    try {
      // 添加到缓存（如果还没有）
      if (!fontCacheService.isInCache(fontFamily)) {
        const fontInfo = this.fontCache.get(fontFamily);
        fontCacheService.addToCache({
          family: fontFamily,
          variants,
          category: fontInfo?.category || 'sans-serif',
          isLoaded: false
        });
      }

      // 构建 Google Fonts URL
      const fontUrl = this.buildFontUrl(fontFamily, variants);
      
      // 创建 link 元素
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      link.crossOrigin = 'anonymous';
      
      // 添加到 head
      document.head.appendChild(link);

      // 等待字体加载完成
      await this.waitForFontLoad(fontFamily);
      
      this.loadedFonts.add(fontFamily);
      this.loadingFonts.delete(fontFamily);
      
      // 更新缓存状态
      fontCacheService.markAsLoaded(fontFamily);
      
      return true;
    } catch (error) {
      console.error(`Failed to load font ${fontFamily}:`, error);
      this.loadingFonts.delete(fontFamily);
      return false;
    }
  }

  // 构建 Google Fonts URL
  private buildFontUrl(fontFamily: string, variants: string[]): string {
    const family = fontFamily.replace(/\s+/g, '+');
    const weights = variants.join(',');
    return `https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap`;
  }

  // 等待字体加载完成
  private async waitForFontLoad(fontFamily: string, timeout: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkFont = () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Font load timeout: ${fontFamily}`));
          return;
        }

        // 使用 document.fonts.check 检查字体是否已加载
        if (document.fonts && document.fonts.check) {
          if (document.fonts.check(`16px "${fontFamily}"`)) {
            resolve();
            return;
          }
        } else {
          // 降级方案：使用 setTimeout 延迟
          setTimeout(() => resolve(), 1000);
          return;
        }

        setTimeout(checkFont, 100);
      };

      checkFont();
    });
  }

  // 检查字体是否已加载
  isFontLoaded(fontFamily: string): boolean {
    return this.loadedFonts.has(fontFamily) || fontCacheService.isFontLoaded(fontFamily);
  }

  // 检查字体是否正在加载
  isFontLoading(fontFamily: string): boolean {
    return this.loadingFonts.has(fontFamily);
  }

  // 获取字体信息
  getFontInfo(fontFamily: string): GoogleFont | undefined {
    return this.fontCache.get(fontFamily);
  }

  // 预加载字体
  async preloadFonts(fontFamilies: string[]): Promise<void> {
    const loadPromises = fontFamilies.map(family => this.loadFont(family));
    await Promise.allSettled(loadPromises);
  }

  // 获取备用字体列表（当 API 不可用时）
  private getFallbackFonts(): GoogleFont[] {
    return [
      {
        family: 'Open Sans',
        variants: ['300', '400', '600', '700'],
        subsets: ['latin'],
        category: 'sans-serif',
        files: {},
        kind: 'webfonts#webfont',
        version: 'v1'
      },
      {
        family: 'Roboto',
        variants: ['300', '400', '500', '700'],
        subsets: ['latin'],
        category: 'sans-serif',
        files: {},
        kind: 'webfonts#webfont',
        version: 'v1'
      },
      {
        family: 'Lato',
        variants: ['300', '400', '700'],
        subsets: ['latin'],
        category: 'sans-serif',
        files: {},
        kind: 'webfonts#webfont',
        version: 'v1'
      },
      {
        family: 'Montserrat',
        variants: ['300', '400', '500', '600', '700'],
        subsets: ['latin'],
        category: 'sans-serif',
        files: {},
        kind: 'webfonts#webfont',
        version: 'v1'
      },
      {
        family: 'Source Sans Pro',
        variants: ['300', '400', '600', '700'],
        subsets: ['latin'],
        category: 'sans-serif',
        files: {},
        kind: 'webfonts#webfont',
        version: 'v1'
      }
    ];
  }

  // 清理未使用的字体
  cleanup(): void {
    // 移除未使用的 link 元素
    const links = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const fontFamily = this.extractFontFamilyFromUrl(href);
        if (fontFamily && !this.loadedFonts.has(fontFamily)) {
          link.remove();
        }
      }
    });
  }

  // 从 URL 中提取字体名称
  private extractFontFamilyFromUrl(url: string): string | null {
    const match = url.match(/family=([^:&]+)/);
    return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
  }
}

// 创建单例实例
export const googleFontsService = new GoogleFontsService();