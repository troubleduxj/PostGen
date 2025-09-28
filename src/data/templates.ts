import { Template, TemplateCategory } from '@/types';

// 模板分类
export const templateCategories: TemplateCategory[] = [
  {
    id: 'business',
    name: '商务海报',
    description: '专业商务场景海报模板',
    icon: '💼',
    count: 3
  },
  {
    id: 'social',
    name: '社交媒体',
    description: '适合社交平台的海报模板',
    icon: '📱',
    count: 2
  },
  {
    id: 'event',
    name: '活动宣传',
    description: '活动、会议、展览海报模板',
    icon: '🎉',
    count: 1
  },
  {
    id: 'education',
    name: '教育培训',
    description: '教育、培训、课程海报模板',
    icon: '📚',
    count: 2
  },
  {
    id: 'creative',
    name: '创意设计',
    description: '艺术、创意、个性化海报模板',
    icon: '🎨',
    count: 2
  },
  {
    id: 'holiday',
    name: '节日庆典',
    description: '节日、庆典、纪念日海报模板',
    icon: '🎊',
    count: 1
  }
];

// 简单测试模板
const testTemplate: Template = {
  id: 'test-simple',
  name: '简单测试模板',
  description: '包含矩形和文本的简单测试模板，用于验证模板应用功能是否正常工作',
  category: 'business',
  tags: ['测试', '简单', '矩形', '文本'],
  thumbnail: '/templates/test.jpg',
  width: 800,
  height: 600,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isPublic: true,
  author: 'System',
  objects: {
    type: 'canvas',
    version: '5.3.0',
    objects: [
      {
        type: 'rect',
        left: 100,
        top: 100,
        width: 200,
        height: 150,
        fill: '#3B82F6',
        stroke: '#1E40AF',
        strokeWidth: 2,
        rx: 10,
        ry: 10
      },
      {
        type: 'text',
        left: 200,
        top: 300,
        text: '测试文本',
        fontSize: 32,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#1F2937',
        originX: 'center',
        originY: 'center'
      },
      {
        type: 'circle',
        left: 500,
        top: 150,
        radius: 60,
        fill: '#EF4444',
        stroke: '#DC2626',
        strokeWidth: 3
      }
    ]
  }
};

// 预设模板数据
export const templates: Template[] = [
  testTemplate,
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
          fill: '#667eea',
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
          fill: '#ff9a9e',
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
          originY: 'center'
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
  },

  // 教育培训模板 2
  {
    id: 'education-002',
    name: '编程培训海报',
    description: '适合编程和技术培训课程的宣传海报',
    category: 'education',
    thumbnail: '/templates/education-002-thumb.jpg',
    width: 800,
    height: 1200,
    tags: ['教育', '课程', '培训', '学习'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPublic: true,
    author: 'System',
    objects: {
      type: 'canvas',
      version: '5.3.0',
      objects: [
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 800,
          height: 1200,
          fill: '#f0f9ff'
        },
        {
          type: 'rect',
          left: 50,
          top: 50,
          width: 700,
          height: 200,
          fill: '#0ea5e9',
          rx: 20,
          ry: 20
        },
        {
          type: 'text',
          left: 400,
          top: 150,
          text: '在线编程课程',
          fontSize: 42,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#ffffff',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'text',
          left: 100,
          top: 350,
          text: '• 零基础入门\n• 实战项目练习\n• 专业导师指导\n• 终身学习支持',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#374151',
          lineHeight: 1.6
        },
        {
          type: 'rect',
          left: 600,
          top: 800,
          width: 150,
          height: 60,
          fill: '#10b981',
          rx: 30,
          ry: 30
        },
        {
          type: 'text',
          left: 675,
          top: 830,
          text: '立即报名',
          fontSize: 20,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#ffffff',
          originX: 'center',
          originY: 'center'
        }
      ]
    }
  },

  // 创意设计模板 2
  {
    id: 'creative-002',
    name: '现代艺术海报',
    description: '适合现代艺术展览和创意活动的设计海报',
    category: 'creative',
    thumbnail: '/templates/creative-002-thumb.jpg',
    width: 800,
    height: 1200,
    tags: ['艺术', '展览', '创意', '现代'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPublic: true,
    author: 'System',
    objects: {
      type: 'canvas',
      version: '5.3.0',
      objects: [
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 800,
          height: 1200,
          fill: '#1f2937'
        },
        {
          type: 'circle',
          left: 200,
          top: 200,
          radius: 100,
          fill: '#f59e0b',
          opacity: 0.8
        },
        {
          type: 'circle',
          left: 500,
          top: 300,
          radius: 80,
          fill: '#ef4444',
          opacity: 0.7
        },
        {
          type: 'circle',
          left: 350,
          top: 450,
          radius: 60,
          fill: '#8b5cf6',
          opacity: 0.9
        },
        {
          type: 'text',
          left: 400,
          top: 700,
          text: 'MODERN\nART EXPO',
          fontSize: 48,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#ffffff',
          originX: 'center',
          originY: 'center',
          textAlign: 'center',
          lineHeight: 1.2
        },
        {
          type: 'text',
          left: 400,
          top: 900,
          text: '2024.08.15 - 2024.09.15',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#d1d5db',
          originX: 'center',
          originY: 'center'
        }
      ]
    }
  },

  // 节日庆典模板
  {
    id: 'holiday-001',
    name: '春节祝福海报',
    description: '传统节日祝福海报，适合春节等重要节日',
    category: 'holiday',
    thumbnail: '/templates/holiday-001-thumb.jpg',
    width: 800,
    height: 1200,
    tags: ['春节', '节日', '祝福', '传统'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPublic: true,
    author: 'System',
    objects: {
      type: 'canvas',
      version: '5.3.0',
      objects: [
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 800,
          height: 1200,
          fill: '#dc2626'
        },
        {
          type: 'circle',
          left: 100,
          top: 100,
          radius: 40,
          fill: '#fbbf24',
          opacity: 0.8
        },
        {
          type: 'circle',
          left: 650,
          top: 150,
          radius: 30,
          fill: '#fbbf24',
          opacity: 0.6
        },
        {
          type: 'text',
          left: 400,
          top: 400,
          text: '新年快乐',
          fontSize: 72,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#fbbf24',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'text',
          left: 400,
          top: 500,
          text: 'HAPPY NEW YEAR',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#ffffff',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'text',
          left: 400,
          top: 800,
          text: '恭喜发财 · 万事如意',
          fontSize: 28,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          originX: 'center',
          originY: 'center'
        }
      ]
    }
  },

  // 社交媒体模板 2
  {
    id: 'social-002',
    name: '朋友圈分享',
    description: '适合微信朋友圈分享的方形海报模板',
    category: 'social',
    thumbnail: '/templates/social-002-thumb.jpg',
    width: 1080,
    height: 1080,
    tags: ['朋友圈', '分享', '社交', '方形'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPublic: true,
    author: 'System',
    objects: {
      type: 'canvas',
      version: '5.3.0',
      objects: [
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 1080,
          height: 1080,
          fill: '#667eea'
        },
        {
          type: 'rect',
          left: 90,
          top: 90,
          width: 900,
          height: 900,
          fill: '#ffffff',
          rx: 40,
          ry: 40,
          opacity: 0.95
        },
        {
          type: 'text',
          left: 540,
          top: 300,
          text: '今日分享',
          fontSize: 48,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#374151',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'text',
          left: 540,
          top: 540,
          text: '生活中的美好瞬间\n值得被记录和分享',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#6b7280',
          originX: 'center',
          originY: 'center',
          textAlign: 'center',
          lineHeight: 1.5
        },
        {
          type: 'circle',
          left: 200,
          top: 750,
          radius: 20,
          fill: '#f59e0b'
        },
        {
          type: 'circle',
          left: 540,
          top: 800,
          radius: 15,
          fill: '#ef4444'
        },
        {
          type: 'circle',
          left: 800,
          top: 720,
          radius: 25,
          fill: '#10b981'
        }
      ]
    }
  },

  // 企业会议模板
  {
    id: 'business-002',
    name: '企业会议邀请函',
    description: '蓝色科技风格的企业会议邀请函模板',
    category: 'business',
    thumbnail: '/templates/business-002-thumb.jpg',
    width: 800,
    height: 1200,
    tags: ['会议', '邀请函', '企业', '蓝色', '科技'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPublic: true,
    author: 'System',
    objects: {
      type: 'canvas',
      version: '5.3.0',
      objects: [
        // 背景 - 使用纯色替代渐变，因为Fabric.js渐变语法不同
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 800,
          height: 1200,
          fill: '#1e40af'
        },
        // 装饰圆形
        {
          type: 'circle',
          left: 150,
          top: 300,
          radius: 120,
          fill: 'rgba(59, 130, 246, 0.3)',
          stroke: 'rgba(147, 197, 253, 0.5)',
          strokeWidth: 2
        },
        {
          type: 'circle',
          left: 200,
          top: 350,
          radius: 80,
          fill: 'rgba(59, 130, 246, 0.2)',
          stroke: 'rgba(147, 197, 253, 0.3)',
          strokeWidth: 1
        },
        {
          type: 'circle',
          left: 100,
          top: 500,
          radius: 40,
          fill: 'rgba(59, 130, 246, 0.4)'
        },
        // Logo区域
        {
          type: 'circle',
          left: 80,
          top: 80,
          radius: 25,
          fill: '#ffffff',
          stroke: '#e5e7eb',
          strokeWidth: 2
        },
        {
          type: 'text',
          left: 130,
          top: 90,
          text: 'YOUR LOGO',
          fontSize: 18,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#ffffff'
        },
        // 主标题
        {
          type: 'text',
          left: 600,
          top: 200,
          text: '邀请函',
          fontSize: 80,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#ffffff',
          originX: 'center',
          originY: 'center'
        },
        // 会议信息
        {
          type: 'text',
          left: 600,
          top: 350,
          text: '2024第十一届\n互联网企业会议',
          fontSize: 24,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#ffffff',
          originX: 'center',
          originY: 'center',
          textAlign: 'center',
          lineHeight: 1.4
        },
        // 会议主题
        {
          type: 'text',
          left: 80,
          top: 600,
          text: '会议主题',
          fontSize: 20,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#ffffff'
        },
        {
          type: 'text',
          left: 80,
          top: 640,
          text: '互联网下的风险管理与企业运营',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#e5e7eb'
        },
        // 时间信息
        {
          type: 'text',
          left: 80,
          top: 720,
          text: '时间',
          fontSize: 20,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#ffffff'
        },
        {
          type: 'text',
          left: 80,
          top: 760,
          text: '2024年9月8日-9月10日',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#e5e7eb'
        },
        // 地址信息
        {
          type: 'text',
          left: 80,
          top: 840,
          text: '地址',
          fontSize: 20,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#ffffff'
        },
        {
          type: 'text',
          left: 80,
          top: 880,
          text: '迅排国际会议中心A座',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#e5e7eb'
        },
        // 二维码区域
        {
          type: 'rect',
          left: 600,
          top: 800,
          width: 80,
          height: 80,
          fill: '#ffffff',
          rx: 8,
          ry: 8
        },
        {
          type: 'text',
          left: 640,
          top: 840,
          text: 'QR',
          fontSize: 16,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#1e40af',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'text',
          left: 600,
          top: 900,
          text: '扫码了解详情',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#ffffff',
          originX: 'center'
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