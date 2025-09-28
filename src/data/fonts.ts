// 开源字体配置
export interface FontOption {
  name: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  variants: string[];
  source: 'google' | 'system' | 'custom';
  url?: string;
  description?: string;
  popular?: boolean;
}

// 系统字体
export const SYSTEM_FONTS: FontOption[] = [
  {
    name: 'Arial',
    family: 'Arial, sans-serif',
    category: 'sans-serif',
    variants: ['400', '700'],
    source: 'system',
    description: '经典无衬线字体，广泛支持'
  },
  {
    name: 'Helvetica',
    family: 'Helvetica, Arial, sans-serif',
    category: 'sans-serif',
    variants: ['300', '400', '700'],
    source: 'system',
    description: '现代无衬线字体，设计简洁'
  },
  {
    name: 'Times New Roman',
    family: '"Times New Roman", Times, serif',
    category: 'serif',
    variants: ['400', '700'],
    source: 'system',
    description: '经典衬线字体，适合正文阅读'
  },
  {
    name: 'Georgia',
    family: 'Georgia, serif',
    category: 'serif',
    variants: ['400', '700'],
    source: 'system',
    description: '优雅的衬线字体，屏幕显示效果好'
  },
  {
    name: 'Verdana',
    family: 'Verdana, sans-serif',
    category: 'sans-serif',
    variants: ['400', '700'],
    source: 'system',
    description: '清晰的无衬线字体，小尺寸显示效果好'
  },
  {
    name: 'Courier New',
    family: '"Courier New", Courier, monospace',
    category: 'monospace',
    variants: ['400', '700'],
    source: 'system',
    description: '等宽字体，适合代码和数据显示'
  }
];

// Google Fonts 热门字体
export const GOOGLE_FONTS: FontOption[] = [
  // 无衬线字体
  {
    name: 'Open Sans',
    family: '"Open Sans", sans-serif',
    category: 'sans-serif',
    variants: ['300', '400', '600', '700', '800'],
    source: 'google',
    description: '友好易读的无衬线字体',
    popular: true
  },
  {
    name: 'Roboto',
    family: 'Roboto, sans-serif',
    category: 'sans-serif',
    variants: ['100', '300', '400', '500', '700', '900'],
    source: 'google',
    description: 'Google设计的现代无衬线字体',
    popular: true
  },
  {
    name: 'Lato',
    family: 'Lato, sans-serif',
    category: 'sans-serif',
    variants: ['100', '300', '400', '700', '900'],
    source: 'google',
    description: '温暖友好的无衬线字体',
    popular: true
  },
  {
    name: 'Montserrat',
    family: 'Montserrat, sans-serif',
    category: 'sans-serif',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    source: 'google',
    description: '几何风格的现代无衬线字体',
    popular: true
  },
  {
    name: 'Source Sans Pro',
    family: '"Source Sans Pro", sans-serif',
    category: 'sans-serif',
    variants: ['200', '300', '400', '600', '700', '900'],
    source: 'google',
    description: 'Adobe设计的专业无衬线字体',
    popular: true
  },
  {
    name: 'Poppins',
    family: 'Poppins, sans-serif',
    category: 'sans-serif',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    source: 'google',
    description: '几何风格的圆润无衬线字体',
    popular: true
  },
  {
    name: 'Inter',
    family: 'Inter, sans-serif',
    category: 'sans-serif',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    source: 'google',
    description: '为屏幕显示优化的无衬线字体',
    popular: true
  },
  {
    name: 'Nunito',
    family: 'Nunito, sans-serif',
    category: 'sans-serif',
    variants: ['200', '300', '400', '500', '600', '700', '800', '900'],
    source: 'google',
    description: '圆润友好的无衬线字体'
  },
  {
    name: 'Work Sans',
    family: '"Work Sans", sans-serif',
    category: 'sans-serif',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    source: 'google',
    description: '为工作环境设计的无衬线字体'
  },
  {
    name: 'Raleway',
    family: 'Raleway, sans-serif',
    category: 'sans-serif',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    source: 'google',
    description: '优雅的细体无衬线字体'
  },

  // 衬线字体
  {
    name: 'Playfair Display',
    family: '"Playfair Display", serif',
    category: 'serif',
    variants: ['400', '500', '600', '700', '800', '900'],
    source: 'google',
    description: '优雅的展示衬线字体',
    popular: true
  },
  {
    name: 'Merriweather',
    family: 'Merriweather, serif',
    category: 'serif',
    variants: ['300', '400', '700', '900'],
    source: 'google',
    description: '为屏幕阅读优化的衬线字体'
  },
  {
    name: 'Lora',
    family: 'Lora, serif',
    category: 'serif',
    variants: ['400', '500', '600', '700'],
    source: 'google',
    description: '现代书法风格的衬线字体'
  },
  {
    name: 'Source Serif Pro',
    family: '"Source Serif Pro", serif',
    category: 'serif',
    variants: ['200', '300', '400', '600', '700', '900'],
    source: 'google',
    description: 'Adobe设计的专业衬线字体'
  },
  {
    name: 'Crimson Text',
    family: '"Crimson Text", serif',
    category: 'serif',
    variants: ['400', '600', '700'],
    source: 'google',
    description: '古典风格的衬线字体'
  },

  // 展示字体
  {
    name: 'Oswald',
    family: 'Oswald, sans-serif',
    category: 'display',
    variants: ['200', '300', '400', '500', '600', '700'],
    source: 'google',
    description: '紧凑的展示字体，适合标题',
    popular: true
  },
  {
    name: 'Bebas Neue',
    family: '"Bebas Neue", sans-serif',
    category: 'display',
    variants: ['400'],
    source: 'google',
    description: '粗体展示字体，冲击力强'
  },
  {
    name: 'Anton',
    family: 'Anton, sans-serif',
    category: 'display',
    variants: ['400'],
    source: 'google',
    description: '粗体无衬线展示字体'
  },
  {
    name: 'Righteous',
    family: 'Righteous, sans-serif',
    category: 'display',
    variants: ['400'],
    source: 'google',
    description: '友好的展示字体'
  },
  {
    name: 'Fredoka One',
    family: '"Fredoka One", sans-serif',
    category: 'display',
    variants: ['400'],
    source: 'google',
    description: '圆润可爱的展示字体'
  },

  // 手写字体
  {
    name: 'Dancing Script',
    family: '"Dancing Script", cursive',
    category: 'handwriting',
    variants: ['400', '500', '600', '700'],
    source: 'google',
    description: '优雅的手写字体'
  },
  {
    name: 'Pacifico',
    family: 'Pacifico, cursive',
    category: 'handwriting',
    variants: ['400'],
    source: 'google',
    description: '友好的手写字体'
  },
  {
    name: 'Satisfy',
    family: 'Satisfy, cursive',
    category: 'handwriting',
    variants: ['400'],
    source: 'google',
    description: '自然的手写字体'
  },
  {
    name: 'Kalam',
    family: 'Kalam, cursive',
    category: 'handwriting',
    variants: ['300', '400', '700'],
    source: 'google',
    description: '手绘风格的字体'
  },

  // 等宽字体
  {
    name: 'Roboto Mono',
    family: '"Roboto Mono", monospace',
    category: 'monospace',
    variants: ['100', '200', '300', '400', '500', '600', '700'],
    source: 'google',
    description: 'Google设计的等宽字体'
  },
  {
    name: 'Source Code Pro',
    family: '"Source Code Pro", monospace',
    category: 'monospace',
    variants: ['200', '300', '400', '500', '600', '700', '900'],
    source: 'google',
    description: 'Adobe设计的代码字体'
  },
  {
    name: 'Fira Code',
    family: '"Fira Code", monospace',
    category: 'monospace',
    variants: ['300', '400', '500', '600', '700'],
    source: 'google',
    description: '支持连字的代码字体'
  },
  {
    name: 'JetBrains Mono',
    family: '"JetBrains Mono", monospace',
    category: 'monospace',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800'],
    source: 'google',
    description: 'JetBrains设计的开发者字体'
  }
];

// 中文字体（需要特殊处理）
export const CHINESE_FONTS: FontOption[] = [
  {
    name: '思源黑体',
    family: '"Noto Sans SC", "Source Han Sans SC", sans-serif',
    category: 'sans-serif',
    variants: ['100', '300', '400', '500', '700', '900'],
    source: 'google',
    description: 'Google和Adobe联合开发的中文字体'
  },
  {
    name: '思源宋体',
    family: '"Noto Serif SC", "Source Han Serif SC", serif',
    category: 'serif',
    variants: ['200', '300', '400', '500', '600', '700', '900'],
    source: 'google',
    description: '优雅的中文衬线字体'
  },
  {
    name: '微软雅黑',
    family: '"Microsoft YaHei", "微软雅黑", sans-serif',
    category: 'sans-serif',
    variants: ['400', '700'],
    source: 'system',
    description: 'Windows系统默认中文字体'
  },
  {
    name: '苹方',
    family: '"PingFang SC", "苹方", sans-serif',
    category: 'sans-serif',
    variants: ['100', '200', '300', '400', '500', '600'],
    source: 'system',
    description: 'macOS系统默认中文字体'
  }
];

// 所有字体
export const ALL_FONTS: FontOption[] = [
  ...SYSTEM_FONTS,
  ...GOOGLE_FONTS,
  ...CHINESE_FONTS
];

// 按分类获取字体
export const getFontsByCategory = (category?: string): FontOption[] => {
  if (!category || category === 'all') {
    return ALL_FONTS;
  }
  return ALL_FONTS.filter(font => font.category === category);
};

// 获取热门字体
export const getPopularFonts = (): FontOption[] => {
  return ALL_FONTS.filter(font => font.popular);
};

// 获取Google字体的CSS URL
export const getGoogleFontUrl = (fonts: FontOption[]): string => {
  const googleFonts = fonts.filter(font => font.source === 'google');
  if (googleFonts.length === 0) return '';

  const families = googleFonts.map(font => {
    const family = font.name.replace(/\s+/g, '+');
    const weights = font.variants.join(',');
    return `${family}:wght@${weights}`;
  }).join('&family=');

  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
};

// 字体分类
export const FONT_CATEGORIES = [
  { id: 'all', name: '全部', value: '' },
  { id: 'sans-serif', name: '无衬线', value: 'sans-serif' },
  { id: 'serif', name: '衬线', value: 'serif' },
  { id: 'display', name: '展示', value: 'display' },
  { id: 'handwriting', name: '手写', value: 'handwriting' },
  { id: 'monospace', name: '等宽', value: 'monospace' }
];