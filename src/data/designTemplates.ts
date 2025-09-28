// 设计模板配置
export interface DesignTemplate {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  thumbnail: string;
  description: string;
  elements: TemplateElement[];
  colors: string[];
  fonts: string[];
  tags: string[];
}

export interface TemplateElement {
  type: 'text' | 'shape' | 'image' | 'background';
  id: string;
  left: number;
  top: number;
  width?: number;
  height?: number;
  // 文本元素属性
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fill?: string;
  textAlign?: string;
  // 形状元素属性
  shapeType?: 'rect' | 'circle' | 'triangle';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  // 图片元素属性
  src?: string;
  // 背景属性
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;
  };
}

// 头像设计模板
export const AVATAR_TEMPLATES: DesignTemplate[] = [
  {
    id: 'avatar-minimal-1',
    name: '简约几何头像',
    category: 'avatar',
    width: 640,
    height: 640,
    thumbnail: '/templates/avatar-minimal-1.jpg',
    description: '简约几何风格，适合专业场合',
    colors: ['#6366f1', '#8b5cf6', '#f3f4f6'],
    fonts: ['Inter', 'Roboto'],
    tags: ['简约', '几何', '专业'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 640,
        height: 640,
        gradient: {
          type: 'linear',
          colors: ['#6366f1', '#8b5cf6'],
          angle: 45
        }
      },
      {
        type: 'shape',
        id: 'shape-1',
        left: 160,
        top: 160,
        width: 320,
        height: 320,
        shapeType: 'circle',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderColor: '#ffffff',
        borderWidth: 4
      },
      {
        type: 'text',
        id: 'text-1',
        left: 320,
        top: 320,
        text: 'A',
        fontSize: 120,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#ffffff',
        textAlign: 'center'
      }
    ]
  },
  {
    id: 'avatar-cute-1',
    name: '可爱卡通头像',
    category: 'avatar',
    width: 640,
    height: 640,
    thumbnail: '/templates/avatar-cute-1.jpg',
    description: '可爱卡通风格，适合社交媒体',
    colors: ['#fbbf24', '#f59e0b', '#fef3c7'],
    fonts: ['Fredoka One', 'Nunito'],
    tags: ['可爱', '卡通', '社交'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 640,
        height: 640,
        gradient: {
          type: 'radial',
          colors: ['#fef3c7', '#fbbf24']
        }
      },
      {
        type: 'shape',
        id: 'shape-1',
        left: 120,
        top: 120,
        width: 400,
        height: 400,
        shapeType: 'circle',
        backgroundColor: '#f59e0b'
      },
      {
        type: 'text',
        id: 'text-1',
        left: 320,
        top: 280,
        text: '😊',
        fontSize: 150,
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'text-2',
        left: 320,
        top: 450,
        text: 'Hello',
        fontSize: 32,
        fontFamily: 'Fredoka One',
        fill: '#ffffff',
        textAlign: 'center'
      }
    ]
  }
];

// 读书卡片模板
export const READING_TEMPLATES: DesignTemplate[] = [
  {
    id: 'reading-note-1',
    name: '读书笔记卡片',
    category: 'reading',
    width: 1080,
    height: 1350,
    thumbnail: '/templates/reading-note-1.jpg',
    description: '优雅的读书笔记分享卡片',
    colors: ['#1f2937', '#f9fafb', '#6366f1'],
    fonts: ['Lora', 'Inter'],
    tags: ['读书', '笔记', '分享'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 1080,
        height: 1350,
        backgroundColor: '#f9fafb'
      },
      {
        type: 'shape',
        id: 'header-bg',
        left: 0,
        top: 0,
        width: 1080,
        height: 200,
        shapeType: 'rect',
        backgroundColor: '#1f2937'
      },
      {
        type: 'text',
        id: 'title',
        left: 60,
        top: 80,
        text: '📚 读书笔记',
        fontSize: 36,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#ffffff'
      },
      {
        type: 'text',
        id: 'book-title',
        left: 60,
        top: 280,
        text: '《人类简史》',
        fontSize: 48,
        fontFamily: 'Lora',
        fontWeight: 'bold',
        fill: '#1f2937'
      },
      {
        type: 'text',
        id: 'author',
        left: 60,
        top: 360,
        text: '作者：尤瓦尔·赫拉利',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#6b7280'
      },
      {
        type: 'shape',
        id: 'quote-bg',
        left: 60,
        top: 450,
        width: 960,
        height: 300,
        shapeType: 'rect',
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
        borderWidth: 0
      },
      {
        type: 'text',
        id: 'quote',
        left: 120,
        top: 520,
        text: '"认知革命让智人能够\n讲述虚构的故事，\n这是人类合作的基础。"',
        fontSize: 32,
        fontFamily: 'Lora',
        fill: '#ffffff',
        textAlign: 'left'
      },
      {
        type: 'text',
        id: 'note',
        left: 60,
        top: 820,
        text: '💭 我的思考\n\n这本书让我重新思考了人类文明的发展历程。作者从生物学、历史学、哲学等多个角度分析人类的演化，特别是认知革命、农业革命和科学革命对人类社会的深远影响。',
        fontSize: 28,
        fontFamily: 'Inter',
        fill: '#374151'
      },
      {
        type: 'text',
        id: 'rating',
        left: 60,
        top: 1200,
        text: '⭐⭐⭐⭐⭐ 推荐指数：5/5',
        fontSize: 24,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#6366f1'
      }
    ]
  },
  {
    id: 'book-quote-1',
    name: '书摘金句卡片',
    category: 'reading',
    width: 1080,
    height: 1080,
    thumbnail: '/templates/book-quote-1.jpg',
    description: '精美的书摘金句分享',
    colors: ['#f59e0b', '#fef3c7', '#1f2937'],
    fonts: ['Playfair Display', 'Inter'],
    tags: ['书摘', '金句', '分享'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 1080,
        height: 1080,
        gradient: {
          type: 'linear',
          colors: ['#fef3c7', '#f59e0b'],
          angle: 135
        }
      },
      {
        type: 'shape',
        id: 'quote-bg',
        left: 80,
        top: 200,
        width: 920,
        height: 500,
        shapeType: 'rect',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderColor: '#f59e0b',
        borderWidth: 3
      },
      {
        type: 'text',
        id: 'quote-mark',
        left: 120,
        top: 240,
        text: '"',
        fontSize: 120,
        fontFamily: 'Playfair Display',
        fill: '#f59e0b'
      },
      {
        type: 'text',
        id: 'quote-text',
        left: 540,
        top: 400,
        text: '读书不是为了雄辩和驳斥，\n也不是为了轻信和盲从，\n而是为了思考和权衡。',
        fontSize: 36,
        fontFamily: 'Playfair Display',
        fill: '#1f2937',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'author-info',
        left: 540,
        top: 800,
        text: '—— 弗朗西斯·培根《论读书》',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#6b7280',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'date',
        left: 540,
        top: 950,
        text: '2024.01.15 阅读分享',
        fontSize: 20,
        fontFamily: 'Inter',
        fill: '#9ca3af',
        textAlign: 'center'
      }
    ]
  }
];

// 学习教育模板
export const EDUCATION_TEMPLATES: DesignTemplate[] = [
  {
    id: 'knowledge-card-1',
    name: '知识点卡片',
    category: 'education',
    width: 1080,
    height: 1080,
    thumbnail: '/templates/knowledge-card-1.jpg',
    description: '清晰的知识点总结卡片',
    colors: ['#3b82f6', '#dbeafe', '#1e40af'],
    fonts: ['Inter', 'JetBrains Mono'],
    tags: ['知识点', '学习', '总结'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 1080,
        height: 1080,
        backgroundColor: '#dbeafe'
      },
      {
        type: 'shape',
        id: 'header',
        left: 0,
        top: 0,
        width: 1080,
        height: 150,
        shapeType: 'rect',
        backgroundColor: '#3b82f6'
      },
      {
        type: 'text',
        id: 'subject',
        left: 60,
        top: 60,
        text: '🧮 数学 · 微积分',
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#ffffff'
      },
      {
        type: 'text',
        id: 'title',
        left: 60,
        top: 220,
        text: '导数的定义与性质',
        fontSize: 42,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#1e40af'
      },
      {
        type: 'shape',
        id: 'content-bg',
        left: 60,
        top: 320,
        width: 960,
        height: 400,
        shapeType: 'rect',
        backgroundColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 2
      },
      {
        type: 'text',
        id: 'definition',
        left: 100,
        top: 360,
        text: '📝 定义\n\n函数 f(x) 在点 x₀ 处的导数定义为：\n\nf\'(x₀) = lim[h→0] [f(x₀+h) - f(x₀)] / h',
        fontSize: 24,
        fontFamily: 'JetBrains Mono',
        fill: '#374151'
      },
      {
        type: 'text',
        id: 'properties',
        left: 100,
        top: 550,
        text: '⚡ 重要性质\n\n• 可导必连续\n• 导数的几何意义：切线斜率\n• 导数的物理意义：瞬时变化率',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#374151'
      },
      {
        type: 'text',
        id: 'footer',
        left: 60,
        top: 800,
        text: '💡 记忆技巧：导数就是函数的"变化速度"',
        fontSize: 28,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#1e40af'
      }
    ]
  }
];

// 生活记录模板
export const LIFESTYLE_TEMPLATES: DesignTemplate[] = [
  {
    id: 'daily-diary-1',
    name: '日常日记卡片',
    category: 'lifestyle',
    width: 1080,
    height: 1350,
    thumbnail: '/templates/daily-diary-1.jpg',
    description: '温馨的日常生活记录',
    colors: ['#f472b6', '#fce7f3', '#be185d'],
    fonts: ['Dancing Script', 'Inter'],
    tags: ['日记', '生活', '记录'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 1080,
        height: 1350,
        gradient: {
          type: 'linear',
          colors: ['#fce7f3', '#f472b6'],
          angle: 180
        }
      },
      {
        type: 'text',
        id: 'date',
        left: 60,
        top: 80,
        text: '2024年1月15日 星期一',
        fontSize: 28,
        fontFamily: 'Inter',
        fill: '#be185d'
      },
      {
        type: 'text',
        id: 'weather',
        left: 60,
        top: 140,
        text: '☀️ 晴朗 · 心情指数：😊😊😊😊😊',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#be185d'
      },
      {
        type: 'shape',
        id: 'content-bg',
        left: 60,
        top: 220,
        width: 960,
        height: 800,
        shapeType: 'rect',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderColor: '#f472b6',
        borderWidth: 2
      },
      {
        type: 'text',
        id: 'title',
        left: 100,
        top: 280,
        text: 'Today\'s Highlights',
        fontSize: 48,
        fontFamily: 'Dancing Script',
        fill: '#be185d'
      },
      {
        type: 'text',
        id: 'content',
        left: 100,
        top: 380,
        text: '🌅 早晨\n在阳台上喝咖啡，看着朝阳慢慢升起，\n新的一天充满希望。\n\n📚 上午\n读完了《小王子》的最后一章，\n被那句"只有用心才能看得清"深深打动。\n\n🍜 午餐\n和朋友一起去了那家新开的拉面店，\n味道超级棒！\n\n🎨 下午\n学习了水彩画，虽然画得不太好，\n但过程很享受。\n\n⭐ 晚上\n和家人视频通话，听妈妈说家里的花开了。',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#374151'
      },
      {
        type: 'text',
        id: 'gratitude',
        left: 100,
        top: 900,
        text: '💝 今日感恩\n感谢这个美好的一天，感谢身边的人和事。',
        fontSize: 24,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#be185d'
      }
    ]
  }
];

// 商业设计模板
export const BUSINESS_TEMPLATES: DesignTemplate[] = [
  {
    id: 'brand-card-1',
    name: '品牌介绍卡片',
    category: 'business',
    width: 1080,
    height: 1080,
    thumbnail: '/templates/brand-card-1.jpg',
    description: '专业的品牌展示卡片',
    colors: ['#1f2937', '#f59e0b', '#ffffff'],
    fonts: ['Montserrat', 'Inter'],
    tags: ['品牌', '商业', '专业'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 1080,
        height: 1080,
        backgroundColor: '#1f2937'
      },
      {
        type: 'shape',
        id: 'accent',
        left: 0,
        top: 0,
        width: 1080,
        height: 8,
        shapeType: 'rect',
        backgroundColor: '#f59e0b'
      },
      {
        type: 'text',
        id: 'logo',
        left: 540,
        top: 200,
        text: 'BRAND',
        fontSize: 72,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fill: '#f59e0b',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'tagline',
        left: 540,
        top: 300,
        text: 'Innovation · Excellence · Trust',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#ffffff',
        textAlign: 'center'
      },
      {
        type: 'shape',
        id: 'divider',
        left: 440,
        top: 380,
        width: 200,
        height: 2,
        shapeType: 'rect',
        backgroundColor: '#f59e0b'
      },
      {
        type: 'text',
        id: 'description',
        left: 540,
        top: 450,
        text: '我们致力于为客户提供\n最优质的产品和服务\n\n专业 · 创新 · 可靠',
        fontSize: 32,
        fontFamily: 'Inter',
        fill: '#ffffff',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'contact',
        left: 540,
        top: 700,
        text: '📧 hello@brand.com\n📱 +86 138 0000 0000\n🌐 www.brand.com',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#9ca3af',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'footer',
        left: 540,
        top: 950,
        text: '让我们一起创造美好未来',
        fontSize: 28,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#f59e0b',
        textAlign: 'center'
      }
    ]
  }
];

// 所有模板集合
export const ALL_DESIGN_TEMPLATES = {
  avatar: AVATAR_TEMPLATES,
  reading: READING_TEMPLATES,
  education: EDUCATION_TEMPLATES,
  lifestyle: LIFESTYLE_TEMPLATES,
  business: BUSINESS_TEMPLATES
};

// 根据分类获取模板
export const getTemplatesByCategory = (category: string): DesignTemplate[] => {
  return ALL_DESIGN_TEMPLATES[category as keyof typeof ALL_DESIGN_TEMPLATES] || [];
};

// 获取所有模板
export const getAllTemplates = (): DesignTemplate[] => {
  return Object.values(ALL_DESIGN_TEMPLATES).flat();
};

// 搜索模板
export const searchTemplates = (query: string): DesignTemplate[] => {
  const allTemplates = getAllTemplates();
  const lowerQuery = query.toLowerCase();
  
  return allTemplates.filter(template => 
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

// 更多头像设计模板
AVATAR_TEMPLATES.push(
  {
    id: 'avatar-professional-1',
    name: '专业商务头像',
    category: 'avatar',
    width: 640,
    height: 640,
    thumbnail: '/templates/avatar-professional-1.jpg',
    description: '专业商务风格，适合LinkedIn等职场平台',
    colors: ['#1f2937', '#f59e0b', '#ffffff'],
    fonts: ['Montserrat', 'Inter'],
    tags: ['专业', '商务', '职场'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 640,
        height: 640,
        backgroundColor: '#1f2937'
      },
      {
        type: 'shape',
        id: 'frame',
        left: 80,
        top: 80,
        width: 480,
        height: 480,
        shapeType: 'rect',
        backgroundColor: '#f59e0b',
        borderColor: '#ffffff',
        borderWidth: 4
      },
      {
        type: 'text',
        id: 'initial',
        left: 320,
        top: 280,
        text: 'JD',
        fontSize: 80,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fill: '#1f2937',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'name',
        left: 320,
        top: 380,
        text: 'John Doe',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#1f2937',
        textAlign: 'center'
      }
    ]
  },
  {
    id: 'avatar-artistic-1',
    name: '艺术创意头像',
    category: 'avatar',
    width: 640,
    height: 640,
    thumbnail: '/templates/avatar-artistic-1.jpg',
    description: '艺术创意风格，个性鲜明',
    colors: ['#ec4899', '#8b5cf6', '#06b6d4'],
    fonts: ['Dancing Script', 'Inter'],
    tags: ['艺术', '创意', '个性'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 640,
        height: 640,
        gradient: {
          type: 'radial',
          colors: ['#ec4899', '#8b5cf6', '#06b6d4']
        }
      },
      {
        type: 'shape',
        id: 'circle-1',
        left: 160,
        top: 100,
        width: 120,
        height: 120,
        shapeType: 'circle',
        backgroundColor: 'rgba(255,255,255,0.3)'
      },
      {
        type: 'shape',
        id: 'circle-2',
        left: 360,
        top: 200,
        width: 80,
        height: 80,
        shapeType: 'circle',
        backgroundColor: 'rgba(255,255,255,0.2)'
      },
      {
        type: 'text',
        id: 'main-text',
        left: 320,
        top: 320,
        text: 'Creative',
        fontSize: 48,
        fontFamily: 'Dancing Script',
        fill: '#ffffff',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'sub-text',
        left: 320,
        top: 400,
        text: 'Designer',
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#ffffff',
        textAlign: 'center'
      }
    ]
  }
);

// 更多读书卡片模板
READING_TEMPLATES.push(
  {
    id: 'book-list-1',
    name: '读书清单卡片',
    category: 'reading',
    width: 1080,
    height: 1920,
    thumbnail: '/templates/book-list-1.jpg',
    description: '精美的读书清单分享',
    colors: ['#059669', '#d1fae5', '#065f46'],
    fonts: ['Lora', 'Inter'],
    tags: ['书单', '推荐', '清单'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        gradient: {
          type: 'linear',
          colors: ['#d1fae5', '#059669'],
          angle: 180
        }
      },
      {
        type: 'text',
        id: 'title',
        left: 540,
        top: 150,
        text: '📚 2024年必读书单',
        fontSize: 48,
        fontFamily: 'Lora',
        fontWeight: 'bold',
        fill: '#065f46',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'subtitle',
        left: 540,
        top: 230,
        text: '10本改变思维的好书',
        fontSize: 28,
        fontFamily: 'Inter',
        fill: '#059669',
        textAlign: 'center'
      },
      {
        type: 'shape',
        id: 'list-bg',
        left: 80,
        top: 350,
        width: 920,
        height: 1200,
        shapeType: 'rect',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderColor: '#059669',
        borderWidth: 2
      },
      {
        type: 'text',
        id: 'book-list',
        left: 140,
        top: 420,
        text: '1. 《人类简史》- 尤瓦尔·赫拉利\n   重新认识人类文明发展史\n\n2. 《思考，快与慢》- 丹尼尔·卡尼曼\n   了解大脑的思维机制\n\n3. 《原则》- 瑞·达利欧\n   人生和工作的原则\n\n4. 《穷查理宝典》- 查理·芒格\n   投资和人生智慧\n\n5. 《刻意练习》- 安德斯·艾利克森\n   掌握任何技能的秘诀',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#374151'
      },
      {
        type: 'text',
        id: 'more-books',
        left: 140,
        top: 1000,
        text: '6. 《非暴力沟通》- 马歇尔·卢森堡\n7. 《心流》- 米哈里·契克森米哈赖\n8. 《影响力》- 罗伯特·西奥迪尼\n9. 《黑天鹅》- 纳西姆·塔勒布\n10. 《终身成长》- 卡罗尔·德韦克',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#374151'
      },
      {
        type: 'text',
        id: 'footer',
        left: 540,
        top: 1700,
        text: '📖 开始你的阅读之旅吧！',
        fontSize: 32,
        fontFamily: 'Lora',
        fontWeight: 'bold',
        fill: '#065f46',
        textAlign: 'center'
      }
    ]
  },
  {
    id: 'reading-progress-1',
    name: '阅读进度卡片',
    category: 'reading',
    width: 1080,
    height: 1440,
    thumbnail: '/templates/reading-progress-1.jpg',
    description: '阅读进度展示和打卡',
    colors: ['#7c3aed', '#ede9fe', '#5b21b6'],
    fonts: ['Inter', 'Roboto'],
    tags: ['进度', '打卡', '统计'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 1080,
        height: 1440,
        backgroundColor: '#ede9fe'
      },
      {
        type: 'shape',
        id: 'header-bg',
        left: 0,
        top: 0,
        width: 1080,
        height: 200,
        shapeType: 'rect',
        backgroundColor: '#7c3aed'
      },
      {
        type: 'text',
        id: 'title',
        left: 540,
        top: 100,
        text: '📊 我的阅读进度',
        fontSize: 42,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#ffffff',
        textAlign: 'center'
      },
      {
        type: 'shape',
        id: 'stats-bg',
        left: 80,
        top: 280,
        width: 920,
        height: 300,
        shapeType: 'rect',
        backgroundColor: '#ffffff',
        borderColor: '#7c3aed',
        borderWidth: 2
      },
      {
        type: 'text',
        id: 'current-book',
        left: 540,
        top: 320,
        text: '📖 正在阅读',
        fontSize: 28,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#7c3aed',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'book-info',
        left: 540,
        top: 380,
        text: '《原则》\n瑞·达利欧 著\n\n进度：68% (272/400页)',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#374151',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'stats-title',
        left: 540,
        top: 650,
        text: '📈 2024年阅读统计',
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#5b21b6',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'stats',
        left: 540,
        top: 720,
        text: '📚 已读完：15本\n⏱️ 阅读时长：128小时\n🎯 年度目标：50本 (30%)\n⭐ 平均评分：4.2/5',
        fontSize: 28,
        fontFamily: 'Inter',
        fill: '#374151',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'motivation',
        left: 540,
        top: 1200,
        text: '💪 继续加油！\n距离年度目标还有35本',
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#7c3aed',
        textAlign: 'center'
      }
    ]
  }
);

// 更多学习教育模板
EDUCATION_TEMPLATES.push(
  {
    id: 'study-plan-1',
    name: '学习计划表',
    category: 'education',
    width: 1080,
    height: 1440,
    thumbnail: '/templates/study-plan-1.jpg',
    description: '详细的学习计划安排',
    colors: ['#0ea5e9', '#e0f2fe', '#0369a1'],
    fonts: ['Inter', 'Roboto'],
    tags: ['计划', '学习', '安排'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 1080,
        height: 1440,
        backgroundColor: '#e0f2fe'
      },
      {
        type: 'shape',
        id: 'header',
        left: 0,
        top: 0,
        width: 1080,
        height: 180,
        shapeType: 'rect',
        backgroundColor: '#0ea5e9'
      },
      {
        type: 'text',
        id: 'title',
        left: 540,
        top: 90,
        text: '📅 本周学习计划',
        fontSize: 42,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#ffffff',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'week',
        left: 540,
        top: 250,
        text: '2024年第3周 (1月15日 - 1月21日)',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#0369a1',
        textAlign: 'center'
      },
      {
        type: 'shape',
        id: 'plan-bg',
        left: 60,
        top: 320,
        width: 960,
        height: 900,
        shapeType: 'rect',
        backgroundColor: '#ffffff',
        borderColor: '#0ea5e9',
        borderWidth: 2
      },
      {
        type: 'text',
        id: 'schedule',
        left: 100,
        top: 380,
        text: '📚 英语学习\n• 周一、三、五：单词记忆 (30分钟)\n• 周二、四：语法练习 (45分钟)\n• 周六：口语练习 (1小时)\n• 周日：复习总结 (30分钟)\n\n💻 编程学习\n• 每日：算法题 1道 (30分钟)\n• 周三、六：项目实践 (2小时)\n• 周日：技术文章阅读 (1小时)\n\n📖 专业书籍\n• 《深入理解计算机系统》\n• 目标：每天阅读20页\n• 本周目标：完成第3章\n\n🎯 本周目标\n• 完成英语单词200个\n• 解决算法题7道\n• 完成项目模块开发\n• 阅读专业书籍140页',
        fontSize: 22,
        fontFamily: 'Inter',
        fill: '#374151'
      }
    ]
  }
);

// 更多生活记录模板
LIFESTYLE_TEMPLATES.push(
  {
    id: 'food-diary-1',
    name: '美食记录卡片',
    category: 'lifestyle',
    width: 1080,
    height: 1350,
    thumbnail: '/templates/food-diary-1.jpg',
    description: '精美的美食分享记录',
    colors: ['#f97316', '#fed7aa', '#ea580c'],
    fonts: ['Pacifico', 'Inter'],
    tags: ['美食', '记录', '分享'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 1080,
        height: 1350,
        gradient: {
          type: 'linear',
          colors: ['#fed7aa', '#f97316'],
          angle: 45
        }
      },
      {
        type: 'text',
        id: 'title',
        left: 540,
        top: 100,
        text: 'Food Diary',
        fontSize: 56,
        fontFamily: 'Pacifico',
        fill: '#ea580c',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'date',
        left: 540,
        top: 180,
        text: '2024.01.15 周一',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#ea580c',
        textAlign: 'center'
      },
      {
        type: 'shape',
        id: 'content-bg',
        left: 80,
        top: 280,
        width: 920,
        height: 800,
        shapeType: 'rect',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderColor: '#f97316',
        borderWidth: 3
      },
      {
        type: 'text',
        id: 'restaurant',
        left: 540,
        top: 340,
        text: '🍜 午餐 · 兰州拉面馆',
        fontSize: 36,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#ea580c',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'description',
        left: 540,
        top: 420,
        text: '今天和朋友一起去了市中心新开的\n兰州拉面馆。汤头清香，面条劲道，\n牛肉软烂入味。\n\n点了招牌牛肉拉面和小菜，\n价格实惠，分量十足。\n老板是地道的兰州人，\n手艺很正宗！',
        fontSize: 28,
        fontFamily: 'Inter',
        fill: '#374151',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'rating',
        left: 540,
        top: 750,
        text: '⭐ 美味指数：5/5\n💰 性价比：5/5\n🏪 环境：4/5\n🚗 交通：4/5',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#059669',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'recommendation',
        left: 540,
        top: 950,
        text: '💡 推荐理由\n\n正宗的兰州拉面，汤清面白萝卜红，\n一碗面就是一份温暖的回忆。\n强烈推荐给喜欢面食的朋友！',
        fontSize: 26,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#ea580c',
        textAlign: 'center'
      }
    ]
  },
  {
    id: 'fitness-record-1',
    name: '健身打卡卡片',
    category: 'lifestyle',
    width: 1080,
    height: 1080,
    thumbnail: '/templates/fitness-record-1.jpg',
    description: '健身记录和成果展示',
    colors: ['#dc2626', '#fecaca', '#991b1b'],
    fonts: ['Oswald', 'Inter'],
    tags: ['健身', '打卡', '运动'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 1080,
        height: 1080,
        gradient: {
          type: 'linear',
          colors: ['#fecaca', '#dc2626'],
          angle: 135
        }
      },
      {
        type: 'text',
        id: 'title',
        left: 540,
        top: 120,
        text: 'FITNESS',
        fontSize: 64,
        fontFamily: 'Oswald',
        fontWeight: 'bold',
        fill: '#991b1b',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'subtitle',
        left: 540,
        top: 200,
        text: 'DAILY WORKOUT',
        fontSize: 28,
        fontFamily: 'Oswald',
        fill: '#991b1b',
        textAlign: 'center'
      },
      {
        type: 'shape',
        id: 'workout-bg',
        left: 80,
        top: 300,
        width: 920,
        height: 500,
        shapeType: 'rect',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderColor: '#dc2626',
        borderWidth: 3
      },
      {
        type: 'text',
        id: 'workout-info',
        left: 540,
        top: 380,
        text: '💪 今日训练\n\n🏃‍♂️ 跑步：5公里 (25分钟)\n🏋️‍♂️ 力量训练：45分钟\n🧘‍♂️ 拉伸放松：15分钟\n\n🔥 消耗卡路里：450卡\n💧 饮水量：2.5升\n⏰ 训练时长：85分钟',
        fontSize: 26,
        fontFamily: 'Inter',
        fill: '#374151',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'motivation',
        left: 540,
        top: 880,
        text: '🎯 坚持就是胜利！\n第15天打卡成功 ✅',
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#dc2626',
        textAlign: 'center'
      }
    ]
  }
);

// 更多商业设计模板
BUSINESS_TEMPLATES.push(
  {
    id: 'product-intro-1',
    name: '产品介绍卡片',
    category: 'business',
    width: 1080,
    height: 1350,
    thumbnail: '/templates/product-intro-1.jpg',
    description: '专业的产品介绍展示',
    colors: ['#6366f1', '#e0e7ff', '#4338ca'],
    fonts: ['Montserrat', 'Inter'],
    tags: ['产品', '介绍', '展示'],
    elements: [
      {
        type: 'background',
        id: 'bg-1',
        left: 0,
        top: 0,
        width: 1080,
        height: 1350,
        backgroundColor: '#e0e7ff'
      },
      {
        type: 'shape',
        id: 'header',
        left: 0,
        top: 0,
        width: 1080,
        height: 250,
        shapeType: 'rect',
        backgroundColor: '#6366f1'
      },
      {
        type: 'text',
        id: 'product-name',
        left: 540,
        top: 120,
        text: 'SmartWatch Pro',
        fontSize: 48,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fill: '#ffffff',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'tagline',
        left: 540,
        top: 180,
        text: '智能生活，从腕间开始',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#e0e7ff',
        textAlign: 'center'
      },
      {
        type: 'shape',
        id: 'features-bg',
        left: 80,
        top: 320,
        width: 920,
        height: 600,
        shapeType: 'rect',
        backgroundColor: '#ffffff',
        borderColor: '#6366f1',
        borderWidth: 2
      },
      {
        type: 'text',
        id: 'features-title',
        left: 540,
        top: 360,
        text: '✨ 核心功能',
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#4338ca',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'features',
        left: 540,
        top: 430,
        text: '❤️ 24小时心率监测\n🏃‍♂️ 50+运动模式\n💧 5ATM防水等级\n🔋 7天超长续航\n📱 智能消息提醒\n🎵 音乐控制\n🌙 睡眠质量分析\n📊 健康数据同步',
        fontSize: 24,
        fontFamily: 'Inter',
        fill: '#374151',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'price',
        left: 540,
        top: 1000,
        text: '💰 特惠价格\n¥1,299\n原价 ¥1,599',
        fontSize: 36,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fill: '#dc2626',
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'cta',
        left: 540,
        top: 1200,
        text: '🛒 立即购买，享受智能生活！',
        fontSize: 28,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#6366f1',
        textAlign: 'center'
      }
    ]
  }
);