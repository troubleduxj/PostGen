import { Template, TemplateCategory } from '@/types';

// 模板分类
export const templateCategories: TemplateCategory[] = [
  {
    id: 'business',
    name: '商务海报',
    description: '专业商务场景海报模板',
    icon: '💼',
    count: 12
  },
  {
    id: 'social',
    name: '社交媒体',
    description: '适合社交平台的海报模板',
    icon: '📱',
    count: 18
  },
  {
    id: 'event',
    name: '活动宣传',
    description: '活动、会议、展览海报模板',
    icon: '🎉',
    count: 15
  },
  {
    id: 'education',
    name: '教育培训',
    description: '教育、培训、课程海报模板',
    icon: '📚',
    count: 10
  },
  {
    id: 'creative',
    name: '创意设计',
    description: '艺术、创意、个性化海报模板',
    icon: '🎨',
    count: 20
  },
  {
    id: 'holiday',
    name: '节日庆典',
    description: '节日、庆典、纪念日海报模板',
    icon: '🎊',
    count: 8
  }
];

// 预设模板数据
export const templates: Template[] = [
  // 商务海报模板
  {
    id: 'business-001',
    name: '简约商务海报',
    description: '适合企业宣传的简约风格海报',
    category: 'business',
    thumbnail: '/templates/business-001-thumb.jpg',
    width: 800,
    height: 1200,
    tags: ['简约', '商务', '企业', '蓝色'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPublic: true,
    author: 'System',
    objects: {
      type: 'canvas',
      version: '5.3.0',
      objects: [
        // 背景
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 800,
          height: 1200,
          fill: '#f8fafc',
          selectable: false,
          evented: false
        },
        // 标题区域背景
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 800,
          height: 300,
          fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          selectable: false,
          evented: false
        },
        // 主标题
        {
          type: 'text',
          left: 400,
          top: 120,
          text: '企业年度报告',
          fontSize: 48,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#ffffff',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        // 副标题
        {
          type: 'text',
          left: 400,
          top: 180,
          text: '2024年度业绩总结',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#e2e8f0',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        // 内容区域
        {
          type: 'text',
          left: 80,
          top: 400,
          text: '• 营收增长 25%\n• 客户满意度 98%\n• 市场份额扩大 15%\n• 员工满意度 95%',
          fontSize: 28,
          fontFamily: 'Arial',
          fill: '#374151',
          lineHeight: 1.6
        },
        // 装饰元素
        {
          type: 'circle',
          left: 650,
          top: 450,
          radius: 80,
          fill: 'rgba(102, 126, 234, 0.1)',
          stroke: '#667eea',
          strokeWidth: 3
        }
      ]
    }
  },
  
  // 社交媒体模板
  {
    id: 'social-001',
    name: 'Instagram 故事模板',
    description: '适合 Instagram 故事的竖版海报',
    category: 'social',
    thumbnail: '/templates/social-001-thumb.jpg',
    width: 1080,
    height: 1920,
    tags: ['Instagram', '故事', '社交', '渐变'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPublic: true,
    author: 'System',
    objects: {
      type: 'canvas',
      version: '5.3.0',
      objects: [
        // 渐变背景
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          fill: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
          selectable: false,
          evented: false
        },
        // 主标题
        {
          type: 'text',
          left: 540,
          top: 400,
          text: '今日分享',
          fontSize: 72,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#ffffff',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          shadow: {
            color: 'rgba(0,0,0,0.3)',
            blur: 10,
            offsetX: 0,
            offsetY: 4
          }
        },
        // 内容文本
        {
          type: 'text',
          left: 540,
          top: 960,
          text: '分享生活中的美好时刻\n记录每一个精彩瞬间',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#ffffff',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          lineHeight: 1.4
        },
        // 装饰圆形
        {
          type: 'circle',
          left: 200,
          top: 1400,
          radius: 60,
          fill: 'rgba(255,255,255,0.3)'
        },
        {
          type: 'circle',
          left: 800,
          top: 1500,
          radius: 40,
          fill: 'rgba(255,255,255,0.2)'
        }
      ]
    }
  },

  // 活动宣传模板
  {
    id: 'event-001',
    name: '音乐节海报',
    description: '充满活力的音乐节宣传海报',
    category: 'event',
    thumbnail: '/templates/event-001-thumb.jpg',
    width: 800,
    height: 1200,
    tags: ['音乐节', '活动', '年轻', '活力'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPublic: true,
    author: 'System',
    objects: {
      type: 'canvas',
      version: '5.3.0',
      objects: [
        // 深色背景
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 800,
          height: 1200,
          fill: '#1a1a1a',
          selectable: false,
          evented: false
        },
        // 主标题
        {
          type: 'text',
          left: 400,
          top: 200,
          text: 'MUSIC FESTIVAL',
          fontSize: 56,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#ff6b6b',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          charSpacing: 200
        },
        // 日期
        {
          type: 'text',
          left: 400,
          top: 300,
          text: '2024.07.15 - 07.17',
          fontSize: 32,
          fontFamily: 'Arial',
          fill: '#ffffff',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        // 地点
        {
          type: 'text',
          left: 400,
          top: 350,
          text: '上海世博公园',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#cccccc',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        // 装饰线条
        {
          type: 'line',
          left: 200,
          top: 500,
          x1: 0,
          y1: 0,
          x2: 400,
          y2: 0,
          stroke: '#ff6b6b',
          strokeWidth: 4
        },
        // 艺人信息
        {
          type: 'text',
          left: 400,
          top: 600,
          text: '特邀艺人\n\n周杰伦 | 邓紫棋 | 薛之谦\n李荣浩 | 毛不易 | 华晨宇',
          fontSize: 28,
          fontFamily: 'Arial',
          fill: '#ffffff',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          lineHeight: 1.5
        }
      ]
    }
  },

  // 教育培训模板
  {
    id: 'education-001',
    name: '在线课程海报',
    description: '专业的在线教育课程宣传海报',
    category: 'education',
    thumbnail: '/templates/education-001-thumb.jpg',
    width: 800,
    height: 1000,
    tags: ['教育', '课程', '学习', '专业'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPublic: true,
    author: 'System',
    objects: {
      type: 'canvas',
      version: '5.3.0',
      objects: [
        // 白色背景
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 800,
          height: 1000,
          fill: '#ffffff',
          selectable: false,
          evented: false
        },
        // 顶部装饰
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 800,
          height: 8,
          fill: '#3b82f6',
          selectable: false,
          evented: false
        },
        // 主标题
        {
          type: 'text',
          left: 400,
          top: 100,
          text: 'Python 编程入门',
          fontSize: 48,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#1f2937',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        // 副标题
        {
          type: 'text',
          left: 400,
          top: 160,
          text: '零基础到实战项目',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#6b7280',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        // 课程特色
        {
          type: 'text',
          left: 80,
          top: 250,
          text: '✓ 30小时精品视频课程\n✓ 实战项目案例讲解\n✓ 一对一答疑服务\n✓ 结业证书认证\n✓ 终身免费更新',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#374151',
          lineHeight: 1.8
        },
        // 价格信息
        {
          type: 'rect',
          left: 80,
          top: 500,
          width: 640,
          height: 120,
          fill: '#eff6ff',
          stroke: '#3b82f6',
          strokeWidth: 2,
          rx: 8,
          ry: 8
        },
        {
          type: 'text',
          left: 400,
          top: 560,
          text: '限时优惠价：¥199（原价 ¥399）',
          fontSize: 32,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#dc2626',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        // 联系方式
        {
          type: 'text',
          left: 400,
          top: 700,
          text: '扫码咨询 | 微信：coding2024',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#6b7280',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        }
      ]
    }
  },

  // 创意设计模板
  {
    id: 'creative-001',
    name: '艺术展览海报',
    description: '现代艺术风格的展览宣传海报',
    category: 'creative',
    thumbnail: '/templates/creative-001-thumb.jpg',
    width: 600,
    height: 900,
    tags: ['艺术', '展览', '现代', '创意'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPublic: true,
    author: 'System',
    objects: {
      type: 'canvas',
      version: '5.3.0',
      objects: [
        // 米白色背景
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 600,
          height: 900,
          fill: '#faf7f0',
          selectable: false,
          evented: false
        },
        // 抽象几何图形
        {
          type: 'triangle',
          left: 100,
          top: 100,
          width: 120,
          height: 120,
          fill: '#ff6b6b',
          angle: 15
        },
        {
          type: 'circle',
          left: 400,
          top: 150,
          radius: 60,
          fill: '#4ecdc4',
          opacity: 0.8
        },
        {
          type: 'rect',
          left: 200,
          top: 200,
          width: 80,
          height: 80,
          fill: '#ffe66d',
          angle: -20
        },
        // 主标题
        {
          type: 'text',
          left: 300,
          top: 400,
          text: '现代艺术展',
          fontSize: 48,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#2c3e50',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        // 英文标题
        {
          type: 'text',
          left: 300,
          top: 460,
          text: 'MODERN ART EXHIBITION',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#7f8c8d',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          charSpacing: 100
        },
        // 展览信息
        {
          type: 'text',
          left: 300,
          top: 550,
          text: '2024.03.15 - 05.15\n上海当代艺术博物馆\n\n参展艺术家：\n张三 | 李四 | 王五',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#34495e',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          lineHeight: 1.6
        },
        // 底部装饰线
        {
          type: 'line',
          left: 100,
          top: 750,
          x1: 0,
          y1: 0,
          x2: 400,
          y2: 0,
          stroke: '#bdc3c7',
          strokeWidth: 2
        }
      ]
    }
  }
];

// 根据分类获取模板
export const getTemplatesByCategory = (categoryId: string): Template[] => {
  return templates.filter(template => template.category === categoryId);
};

// 搜索模板
export const searchTemplates = (query: string): Template[] => {
  const lowercaseQuery = query.toLowerCase();
  return templates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// 获取推荐模板
export const getRecommendedTemplates = (limit: number = 6): Template[] => {
  return templates.slice(0, limit);
};