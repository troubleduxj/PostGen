import { FontOption, getGoogleFontUrl } from '@/data/fonts';

// 字体加载服务
class FontLoaderService {
  private loadedFonts = new Set<string>();
  private loadingFonts = new Set<string>();
  private fontCache = new Map<string, FontOption>();

  // 加载单个字体
  async loadFont(font: FontOption): Promise<boolean> {
    const fontFamily = font.name;

    // 检查是否已加载
    if (this.loadedFonts.has(fontFamily)) {
      return true;
    }

    // 检查是否正在加载
    if (this.loadingFonts.has(fontFamily)) {
      return this.waitForFontLoad(fontFamily);
    }

    // 系统字体不需要加载
    if (font.source === 'system') {
      this.loadedFonts.add(fontFamily);
      return true;
    }

    this.loadingFonts.add(fontFamily);
    this.fontCache.set(fontFamily, font);

    try {
      if (font.source === 'google') {
        await this.loadGoogleFont(font);
      } else if (font.source === 'custom' && font.url) {
        await this.loadCustomFont(font);
      }

      this.loadedFonts.add(fontFamily);
      this.loadingFonts.delete(fontFamily);
      return true;
    } catch (error) {
      console.error(`Failed to load font ${fontFamily}:`, error);
      this.loadingFonts.delete(fontFamily);
      return false;
    }
  }

  // 加载Google字体
  private async loadGoogleFont(font: FontOption): Promise<void> {
    const url = getGoogleFontUrl([font]);
    
    // 检查是否已经有相同的link标签
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) {
      return this.waitForFontReady(font.name);
    }

    // 创建link标签
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    link.crossOrigin = 'anonymous';

    // 添加到head
    document.head.appendChild(link);

    // 等待字体加载完成
    return this.waitForFontReady(font.name);
  }

  // 加载自定义字体
  private async loadCustomFont(font: FontOption): Promise<void> {
    if (!font.url) {
      throw new Error('Custom font URL is required');
    }

    // 使用FontFace API加载字体
    if ('FontFace' in window) {
      const fontFace = new FontFace(font.name, `url(${font.url})`);
      await fontFace.load();
      document.fonts.add(fontFace);
    } else {
      // 降级方案：使用CSS @font-face
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: "${font.name}";
          src: url("${font.url}");
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
      
      // 等待字体加载
      await this.waitForFontReady(font.name);
    }
  }

  // 等待字体准备就绪
  private async waitForFontReady(fontFamily: string, timeout: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkFont = () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Font load timeout: ${fontFamily}`));
          return;
        }

        // 使用document.fonts.check检查字体是否可用
        if (document.fonts && document.fonts.check) {
          if (document.fonts.check(`16px "${fontFamily}"`)) {
            resolve();
            return;
          }
        } else {
          // 降级方案：简单延迟
          setTimeout(() => resolve(), 1000);
          return;
        }

        setTimeout(checkFont, 100);
      };

      checkFont();
    });
  }

  // 等待字体加载完成
  private async waitForFontLoad(fontFamily: string): Promise<boolean> {
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

  // 批量加载字体
  async loadFonts(fonts: FontOption[]): Promise<boolean[]> {
    const loadPromises = fonts.map(font => this.loadFont(font));
    return Promise.all(loadPromises);
  }

  // 预加载热门字体
  async preloadPopularFonts(): Promise<void> {
    const { getPopularFonts } = await import('@/data/fonts');
    const popularFonts = getPopularFonts();
    
    // 只预加载前10个热门字体，避免影响性能
    const fontsToPreload = popularFonts.slice(0, 10);
    
    // 异步加载，不阻塞主线程
    setTimeout(() => {
      this.loadFonts(fontsToPreload);
    }, 1000);
  }

  // 检查字体是否已加载
  isFontLoaded(fontFamily: string): boolean {
    return this.loadedFonts.has(fontFamily);
  }

  // 检查字体是否正在加载
  isFontLoading(fontFamily: string): boolean {
    return this.loadingFonts.has(fontFamily);
  }

  // 获取字体信息
  getFontInfo(fontFamily: string): FontOption | undefined {
    return this.fontCache.get(fontFamily);
  }

  // 获取已加载的字体列表
  getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts);
  }

  // 清理未使用的字体
  cleanup(): void {
    // 移除未使用的Google Fonts link标签
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

    // 清理FontFace
    if (document.fonts && document.fonts.clear) {
      // 注意：这会清理所有字体，在实际使用中需要更精细的控制
      // document.fonts.clear();
    }
  }

  // 从URL中提取字体名称
  private extractFontFamilyFromUrl(url: string): string | null {
    const match = url.match(/family=([^:&]+)/);
    return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
  }

  // 重置服务状态
  reset(): void {
    this.loadedFonts.clear();
    this.loadingFonts.clear();
    this.fontCache.clear();
  }
}

// 创建单例实例
export const fontLoaderService = new FontLoaderService();

// 初始化时预加载热门字体
if (typeof window !== 'undefined') {
  // 延迟预加载，避免影响页面初始加载
  setTimeout(() => {
    fontLoaderService.preloadPopularFonts();
  }, 2000);
}