import { fontLoaderService } from '@/services/fontLoader';
import { getPopularFonts } from '@/data/fonts';

// 字体初始化器
class FontInitializer {
  private initialized = false;

  // 初始化字体系统
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 预加载热门字体
      await this.preloadEssentialFonts();
      
      // 设置字体加载监听器
      this.setupFontLoadListeners();
      
      this.initialized = true;
      console.log('Font system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize font system:', error);
    }
  }

  // 预加载必要字体
  private async preloadEssentialFonts(): Promise<void> {
    const popularFonts = getPopularFonts();
    
    // 只预加载前5个最热门的字体，避免影响性能
    const essentialFonts = popularFonts.slice(0, 5);
    
    // 异步加载，不阻塞主线程
    const loadPromises = essentialFonts.map(font => 
      fontLoaderService.loadFont(font).catch(error => {
        console.warn(`Failed to preload font ${font.name}:`, error);
        return false;
      })
    );

    await Promise.allSettled(loadPromises);
  }

  // 设置字体加载监听器
  private setupFontLoadListeners(): void {
    // 监听字体加载事件
    if (document.fonts && document.fonts.addEventListener) {
      document.fonts.addEventListener('loadingdone', (event) => {
        console.log('Fonts loaded:', event);
      });

      document.fonts.addEventListener('loadingerror', (event) => {
        console.error('Font loading error:', event);
      });
    }
  }

  // 检查是否已初始化
  isInitialized(): boolean {
    return this.initialized;
  }

  // 重置初始化状态
  reset(): void {
    this.initialized = false;
  }
}

// 创建单例实例
export const fontInitializer = new FontInitializer();

// 自动初始化（在浏览器环境中）
if (typeof window !== 'undefined') {
  // 延迟初始化，避免影响页面加载
  setTimeout(() => {
    fontInitializer.initialize();
  }, 1000);
}