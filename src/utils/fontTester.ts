// 字体测试工具
export class FontTester {
  // 测试字体是否可用
  static testFont(fontFamily: string): boolean {
    // 创建测试元素
    const testElement = document.createElement('div');
    testElement.style.fontFamily = fontFamily;
    testElement.style.fontSize = '16px';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.top = '-9999px';
    testElement.textContent = 'Test Font';
    
    document.body.appendChild(testElement);
    
    // 获取计算样式
    const computedStyle = window.getComputedStyle(testElement);
    const actualFontFamily = computedStyle.fontFamily;
    
    // 清理
    document.body.removeChild(testElement);
    
    // 检查字体是否被应用
    return actualFontFamily.includes(fontFamily.replace(/['"]/g, ''));
  }

  // 加载Google字体并测试
  static async loadAndTestGoogleFont(fontName: string): Promise<boolean> {
    try {
      // 检查是否已经加载
      if (this.testFont(fontName)) {
        console.log(`Font ${fontName} already available`);
        return true;
      }

      // 加载字体
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      
      // 等待加载完成
      await new Promise<void>((resolve, reject) => {
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load ${fontName}`));
        document.head.appendChild(link);
      });

      // 等待字体实际可用
      let attempts = 0;
      const maxAttempts = 20;
      
      while (attempts < maxAttempts) {
        if (this.testFont(fontName)) {
          console.log(`Font ${fontName} loaded successfully after ${attempts + 1} attempts`);
          return true;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      console.warn(`Font ${fontName} loaded but not detected as available`);
      return false;
    } catch (error) {
      console.error(`Failed to load font ${fontName}:`, error);
      return false;
    }
  }

  // 获取所有可用字体
  static getAvailableFonts(): string[] {
    const testFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New',
      'Open Sans', 'Roboto', 'Lato', 'Montserrat', 'Source Sans Pro', 'Poppins',
      'Inter', 'Nunito', 'Work Sans', 'Raleway', 'Playfair Display', 'Merriweather',
      'Lora', 'Source Serif Pro', 'Oswald', 'Bebas Neue', 'Anton', 'Righteous',
      'Dancing Script', 'Pacifico', 'Roboto Mono', 'Source Code Pro'
    ];

    return testFonts.filter(font => this.testFont(font));
  }

  // 预加载常用字体
  static async preloadCommonFonts(): Promise<void> {
    const commonFonts = [
      'Open Sans', 'Roboto', 'Lato', 'Montserrat', 'Source Sans Pro'
    ];

    const loadPromises = commonFonts.map(font => 
      this.loadAndTestGoogleFont(font).catch(error => {
        console.warn(`Failed to preload ${font}:`, error);
        return false;
      })
    );

    await Promise.allSettled(loadPromises);
    console.log('Font preloading completed');
  }
}

// 在开发环境中暴露到全局
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).FontTester = FontTester;
}