export interface TextEffect {
  id: string;
  name: string;
  category: string;
  preview: string;
  style: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    shadow?: string;
    textAlign?: string;
    fontStyle?: string;
    textDecoration?: string;
    backgroundColor?: string;
    borderRadius?: number;
    padding?: number;
    letterSpacing?: number;
    lineHeight?: number;
    textTransform?: string;
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      angle?: number;
    };
    effects?: {
      glow?: boolean;
      outline?: boolean;
      emboss?: boolean;
      shadow3d?: boolean;
    };
  };
}

export interface TextCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// 文本分类
export const textCategories: TextCategory[] = [
  { id: 'special', name: '特效字体', icon: '✨', description: '炫酷特效文字' },
  { id: 'artistic', name: '文艺花字', icon: '🌸', description: '优雅艺术字体' },
  { id: 'bubble', name: '气泡文字', icon: '💭', description: '可爱气泡效果' },
  { id: 'photo', name: '晒图标记', icon: '📸', description: '照片标记文字' },
  { id: 'ecommerce', name: '电商文字', icon: '🛒', description: '促销活动文字' },
  { id: 'explosion', name: '爆炸文字', icon: '💥', description: '震撼爆炸效果' },
  { id: 'festival', name: '节日热点', icon: '🎉', description: '节日庆典文字' },
  { id: 'stamp', name: '印章刻字', icon: '🔖', description: '传统印章风格' },
  { id: 'button', name: '按钮素材', icon: '🔘', description: '按钮样式文字' },
  { id: 'dialogue', name: '台词字母', icon: '💬', description: '对话台词效果' }
];

// 特效字体
export const specialEffects: TextEffect[] = [
  {
    id: 'neon-glow',
    name: '霓虹发光',
    category: 'special',
    preview: '霓虹',
    style: {
      fontSize: 48,
      fontFamily: 'Arial Black',
      fontWeight: 'bold',
      fill: '#00ffff',
      stroke: '#0080ff',
      strokeWidth: 2,
      shadow: '0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff',
      effects: { glow: true }
    }
  },
  {
    id: 'chrome-metal',
    name: '金属质感',
    category: 'special',
    preview: '金属',
    style: {
      fontSize: 48,
      fontFamily: 'Arial Black',
      fontWeight: 'bold',
      gradient: {
        type: 'linear',
        colors: ['#c0c0c0', '#808080', '#c0c0c0'],
        angle: 45
      },
      stroke: '#404040',
      strokeWidth: 1,
      effects: { emboss: true }
    }
  },
  {
    id: 'fire-text',
    name: '火焰文字',
    category: 'special',
    preview: '火焰',
    style: {
      fontSize: 48,
      fontFamily: 'Arial Black',
      fontWeight: 'bold',
      gradient: {
        type: 'linear',
        colors: ['#ff4500', '#ff6347', '#ffd700'],
        angle: 90
      },
      shadow: '0 0 10px #ff4500',
      effects: { glow: true }
    }
  }
];

// 文艺花字
export const artisticEffects: TextEffect[] = [
  {
    id: 'elegant-script',
    name: '优雅手写',
    category: 'artistic',
    preview: '优雅',
    style: {
      fontSize: 42,
      fontFamily: 'Brush Script MT',
      fontStyle: 'italic',
      fill: '#8b4513',
      letterSpacing: 2
    }
  },
  {
    id: 'floral-text',
    name: '花卉装饰',
    category: 'artistic',
    preview: '花卉',
    style: {
      fontSize: 40,
      fontFamily: 'Georgia',
      fontWeight: '300',
      fill: '#ff69b4',
      textDecoration: 'underline',
      letterSpacing: 1
    }
  },
  {
    id: 'vintage-style',
    name: '复古风格',
    category: 'artistic',
    preview: '复古',
    style: {
      fontSize: 44,
      fontFamily: 'Times New Roman',
      fontWeight: 'bold',
      fill: '#8b4513',
      stroke: '#654321',
      strokeWidth: 1,
      textTransform: 'uppercase'
    }
  }
];

// 气泡文字
export const bubbleEffects: TextEffect[] = [
  {
    id: 'cute-bubble',
    name: '可爱气泡',
    category: 'bubble',
    preview: '可爱',
    style: {
      fontSize: 36,
      fontFamily: 'Comic Sans MS',
      fontWeight: 'bold',
      fill: '#ff69b4',
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 10,
      stroke: '#ff69b4',
      strokeWidth: 2
    }
  },
  {
    id: 'speech-bubble',
    name: '对话气泡',
    category: 'bubble',
    preview: '对话',
    style: {
      fontSize: 32,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fill: '#333333',
      backgroundColor: '#f0f8ff',
      borderRadius: 15,
      padding: 12,
      stroke: '#87ceeb',
      strokeWidth: 2
    }
  }
];

// 晒图标记
export const photoEffects: TextEffect[] = [
  {
    id: 'photo-tag',
    name: '照片标签',
    category: 'photo',
    preview: '标签',
    style: {
      fontSize: 28,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: 8,
      borderRadius: 4
    }
  },
  {
    id: 'date-stamp',
    name: '日期戳',
    category: 'photo',
    preview: '2024',
    style: {
      fontSize: 24,
      fontFamily: 'Courier New',
      fontWeight: 'normal',
      fill: '#ff6b35',
      backgroundColor: '#ffffff',
      padding: 6,
      stroke: '#ff6b35',
      strokeWidth: 1
    }
  }
];

// 电商文字
export const ecommerceEffects: TextEffect[] = [
  {
    id: 'sale-banner',
    name: '促销横幅',
    category: 'ecommerce',
    preview: 'SALE',
    style: {
      fontSize: 48,
      fontFamily: 'Arial Black',
      fontWeight: 'bold',
      fill: '#ffffff',
      backgroundColor: '#ff0000',
      padding: 15,
      textTransform: 'uppercase',
      letterSpacing: 3
    }
  },
  {
    id: 'discount-tag',
    name: '折扣标签',
    category: 'ecommerce',
    preview: '50%OFF',
    style: {
      fontSize: 36,
      fontFamily: 'Impact',
      fontWeight: 'bold',
      fill: '#ffd700',
      stroke: '#ff4500',
      strokeWidth: 2,
      textTransform: 'uppercase',
      shadow: '2px 2px 4px rgba(0,0,0,0.5)'
    }
  }
];

// 爆炸文字
export const explosionEffects: TextEffect[] = [
  {
    id: 'boom-text',
    name: '爆炸效果',
    category: 'explosion',
    preview: 'BOOM',
    style: {
      fontSize: 56,
      fontFamily: 'Arial Black',
      fontWeight: 'bold',
      gradient: {
        type: 'radial',
        colors: ['#ff0000', '#ff4500', '#ffd700']
      },
      stroke: '#8b0000',
      strokeWidth: 3,
      shadow: '0 0 20px #ff0000',
      textTransform: 'uppercase',
      effects: { glow: true, outline: true }
    }
  },
  {
    id: 'impact-text',
    name: '冲击文字',
    category: 'explosion',
    preview: 'POW',
    style: {
      fontSize: 52,
      fontFamily: 'Impact',
      fontWeight: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 4,
      shadow: '4px 4px 0px #000000',
      textTransform: 'uppercase',
      effects: { shadow3d: true }
    }
  }
];

// 节日热点
export const festivalEffects: TextEffect[] = [
  {
    id: 'christmas-text',
    name: '圣诞节',
    category: 'festival',
    preview: '圣诞',
    style: {
      fontSize: 44,
      fontFamily: 'Georgia',
      fontWeight: 'bold',
      gradient: {
        type: 'linear',
        colors: ['#ff0000', '#00ff00'],
        angle: 45
      },
      stroke: '#ffd700',
      strokeWidth: 2,
      shadow: '0 0 10px #ffd700'
    }
  },
  {
    id: 'new-year-text',
    name: '新年快乐',
    category: 'festival',
    preview: '新年',
    style: {
      fontSize: 40,
      fontFamily: 'Arial Black',
      fontWeight: 'bold',
      gradient: {
        type: 'linear',
        colors: ['#ffd700', '#ff6347', '#ff1493'],
        angle: 90
      },
      stroke: '#8b0000',
      strokeWidth: 2,
      effects: { glow: true }
    }
  }
];

// 印章刻字
export const stampEffects: TextEffect[] = [
  {
    id: 'red-seal',
    name: '红色印章',
    category: 'stamp',
    preview: '印章',
    style: {
      fontSize: 32,
      fontFamily: 'SimSun',
      fontWeight: 'bold',
      fill: '#dc143c',
      stroke: '#8b0000',
      strokeWidth: 2,
      backgroundColor: '#ffffff',
      borderRadius: 50,
      padding: 15
    }
  },
  {
    id: 'official-stamp',
    name: '官方印章',
    category: 'stamp',
    preview: '官方',
    style: {
      fontSize: 28,
      fontFamily: 'KaiTi',
      fontWeight: 'bold',
      fill: '#8b0000',
      stroke: '#dc143c',
      strokeWidth: 1,
      textTransform: 'uppercase'
    }
  }
];

// 按钮素材
export const buttonEffects: TextEffect[] = [
  {
    id: 'primary-button',
    name: '主要按钮',
    category: 'button',
    preview: '点击',
    style: {
      fontSize: 32,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#ffffff',
      backgroundColor: '#007bff',
      borderRadius: 8,
      padding: 12,
      textAlign: 'center'
    }
  },
  {
    id: 'gradient-button',
    name: '渐变按钮',
    category: 'button',
    preview: '按钮',
    style: {
      fontSize: 30,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#ffffff',
      gradient: {
        type: 'linear',
        colors: ['#667eea', '#764ba2'],
        angle: 45
      },
      borderRadius: 25,
      padding: 15,
      shadow: '0 4px 15px rgba(0,0,0,0.2)'
    }
  }
];

// 台词字母
export const dialogueEffects: TextEffect[] = [
  {
    id: 'comic-dialogue',
    name: '漫画对话',
    category: 'dialogue',
    preview: '对话',
    style: {
      fontSize: 36,
      fontFamily: 'Comic Sans MS',
      fontWeight: 'bold',
      fill: '#000000',
      backgroundColor: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      borderRadius: 20,
      padding: 10
    }
  },
  {
    id: 'movie-subtitle',
    name: '电影字幕',
    category: 'dialogue',
    preview: '字幕',
    style: {
      fontSize: 32,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 8
    }
  }
];

// 合并所有效果
export const allTextEffects: TextEffect[] = [
  ...specialEffects,
  ...artisticEffects,
  ...bubbleEffects,
  ...photoEffects,
  ...ecommerceEffects,
  ...explosionEffects,
  ...festivalEffects,
  ...stampEffects,
  ...buttonEffects,
  ...dialogueEffects
];

// 根据分类获取文本效果
export const getTextEffectsByCategory = (categoryId: string): TextEffect[] => {
  return allTextEffects.filter(effect => effect.category === categoryId);
};

// 搜索文本效果
export const searchTextEffects = (query: string): TextEffect[] => {
  const lowercaseQuery = query.toLowerCase();
  return allTextEffects.filter(effect => 
    effect.name.toLowerCase().includes(lowercaseQuery) ||
    effect.preview.toLowerCase().includes(lowercaseQuery)
  );
};