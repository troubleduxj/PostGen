/**
 * 印刷品模板数据
 * 包含传单、名片、海报、宣传册、邀请函、证书等印刷品模板
 */

import { DesignTemplate, TemplateCategory, TemplateStyle } from '@/types/template';

// A4传单模板
export const flyerTemplates: DesignTemplate[] = [
  {
    id: 'flyer-restaurant-1',
    name: '餐厅宣传传单',
    description: '适合餐厅和美食行业的宣传传单模板',
    category: TemplateCategory.PRINT,
    subcategory: 'flyer-a4',
    
    canvas: {
      width: 2480, // A4 300DPI
      height: 3508,
      backgroundColor: '#ffffff'
    },
    
    objects: [
      {
        id: 'header-background',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 2480,
          height: 800,
          fill: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          top: 0,
          left: 0,
          selectable: false
        },
        editable: {
          content: false,
          style: true,
          position: false,
          size: false
        }
      },
      {
        id: 'restaurant-title',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '美味餐厅',
          fontSize: 120,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          top: 300,
          left: 1240,
          originX: 'center',
          originY: 'center',
          fontWeight: 'bold',
          textAlign: 'center',
          shadow: {
            color: 'rgba(0,0,0,0.3)',
            blur: 10,
            offsetX: 3,
            offsetY: 3
          }
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '美味餐厅',
          suggestions: ['精品餐厅', '特色美食', '家常菜馆', '西式餐厅']
        }
      },
      {
        id: 'restaurant-subtitle',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '正宗美味 · 用心烹饪',
          fontSize: 48,
          fontFamily: 'Arial',
          fill: '#ffffff',
          top: 500,
          left: 1240,
          originX: 'center',
          originY: 'center',
          textAlign: 'center'
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '正宗美味 · 用心烹饪',
          suggestions: ['新鲜食材 · 健康美味', '传统工艺 · 现代口味', '精选食材 · 匠心制作']
        }
      },
      {
        id: 'main-content',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '🍽️ 特色菜品推荐\n\n• 招牌红烧肉 - ¥38\n• 麻婆豆腐 - ¥22\n• 宫保鸡丁 - ¥28\n• 糖醋里脊 - ¥32\n• 清蒸鲈鱼 - ¥45\n\n🎉 开业优惠\n全场菜品8.8折\n满100元送精美小菜一份',
          fontSize: 42,
          fontFamily: 'Arial',
          fill: '#2c3e50',
          top: 1200,
          left: 200,
          textAlign: 'left',
          lineHeight: 1.5
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '特色菜品推荐',
          suggestions: ['今日特价菜品', '主厨推荐菜单', '季节限定美食']
        }
      },
      {
        id: 'contact-info',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '📍 地址：市中心美食街88号\n📞 电话：400-123-4567\n🕐 营业时间：10:00-22:00\n💳 支持微信/支付宝支付',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#34495e',
          top: 2800,
          left: 200,
          textAlign: 'left',
          lineHeight: 1.4
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '联系方式和地址',
          suggestions: ['餐厅地址和电话', '营业时间说明', '预订和外卖信息']
        }
      },
      {
        id: 'food-image-placeholder',
        type: 'image',
        fabricObject: {
          type: 'rect',
          width: 800,
          height: 600,
          fill: '#f8f9fa',
          stroke: '#dee2e6',
          strokeWidth: 4,
          strokeDashArray: [15, 15],
          top: 1800,
          left: 1400,
          originX: 'center',
          originY: 'center',
          rx: 20,
          ry: 20
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'image',
          defaultContent: '美食图片',
          suggestions: ['招牌菜照片', '餐厅环境', '精美菜品', '厨师照片']
        }
      },
      {
        id: 'decorative-border',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 2400,
          height: 3428,
          fill: 'transparent',
          stroke: '#e74c3c',
          strokeWidth: 8,
          top: 40,
          left: 40,
          rx: 20,
          ry: 20,
          selectable: false
        },
        editable: {
          content: false,
          style: true,
          position: false,
          size: false
        }
      }
    ],
    
    metadata: {
      tags: ['餐厅', '美食', '传单', '宣传', '印刷'],
      style: TemplateStyle.PROFESSIONAL,
      industry: ['餐饮', '美食', '服务业'],
      difficulty: 'beginner',
      colors: ['#ff6b6b', '#ee5a24', '#ffffff', '#2c3e50', '#e74c3c'],
      fonts: ['Arial Black', 'Arial'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'Design Team',
      version: '1.0'
    },
    
    preview: {
      thumbnail: '/templates/thumbnails/flyer-restaurant-1.jpg',
      fullPreview: '/templates/previews/flyer-restaurant-1.jpg',
      description: '专为餐厅设计的宣传传单，包含菜品推荐、优惠信息和联系方式，适合印刷使用'
    },
    
    customizable: {
      colors: true,
      fonts: true,
      images: true,
      text: true
    }
  }
];

// 名片模板
export const businessCardTemplates: DesignTemplate[] = [
  {
    id: 'business-card-modern-1',
    name: '现代商务名片',
    description: '简洁现代的商务名片设计，适合各行业专业人士',
    category: TemplateCategory.PRINT,
    subcategory: 'business-card',
    
    canvas: {
      width: 1050, // 名片标准尺寸 300DPI
      height: 600,
      backgroundColor: '#ffffff'
    },
    
    objects: [
      {
        id: 'left-accent',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 200,
          height: 600,
          fill: '#3498db',
          top: 0,
          left: 0,
          selectable: false
        },
        editable: {
          content: false,
          style: true,
          position: false,
          size: false
        }
      },
      {
        id: 'name-text',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '张三',
          fontSize: 48,
          fontFamily: 'Arial Black',
          fill: '#2c3e50',
          top: 150,
          left: 300,
          fontWeight: 'bold'
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '张三',
          suggestions: ['您的姓名', '联系人姓名']
        }
      },
      {
        id: 'title-text',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '市场总监',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#7f8c8d',
          top: 220,
          left: 300
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '市场总监',
          suggestions: ['销售经理', '项目经理', '技术总监', '客户经理']
        }
      },
      {
        id: 'company-text',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '科技有限公司',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#34495e',
          top: 270,
          left: 300
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '科技有限公司',
          suggestions: ['您的公司名称', '企业名称']
        }
      },
      {
        id: 'contact-info',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '📱 138-0000-0000\n📧 zhangsan@company.com\n🌐 www.company.com',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#7f8c8d',
          top: 380,
          left: 300,
          lineHeight: 1.5
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '联系方式',
          suggestions: ['手机和邮箱', '电话和网址', '联系信息']
        }
      },
      {
        id: 'logo-placeholder',
        type: 'image',
        fabricObject: {
          type: 'rect',
          width: 120,
          height: 120,
          fill: '#ecf0f1',
          stroke: '#bdc3c7',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          top: 100,
          left: 100,
          originX: 'center',
          originY: 'center',
          rx: 10,
          ry: 10
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'logo',
          defaultContent: '公司Logo',
          suggestions: ['企业标志', '个人头像', '品牌标识']
        }
      }
    ],
    
    metadata: {
      tags: ['名片', '商务', '专业', '现代', '印刷'],
      style: TemplateStyle.MODERN,
      industry: ['商务', '企业', '服务', '咨询'],
      difficulty: 'beginner',
      colors: ['#3498db', '#ffffff', '#2c3e50', '#7f8c8d', '#34495e'],
      fonts: ['Arial Black', 'Arial'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'Design Team',
      version: '1.0'
    },
    
    preview: {
      thumbnail: '/templates/thumbnails/business-card-modern-1.jpg',
      fullPreview: '/templates/previews/business-card-modern-1.jpg',
      description: '现代简洁的商务名片设计，包含姓名、职位、公司和联系方式，适合专业人士使用'
    },
    
    customizable: {
      colors: true,
      fonts: true,
      images: true,
      text: true
    }
  }
];

// 海报模板
export const posterTemplates: DesignTemplate[] = [
  {
    id: 'poster-event-1',
    name: '活动宣传海报',
    description: '适合各类活动宣传的海报模板，设计醒目吸引人',
    category: TemplateCategory.PRINT,
    subcategory: 'poster-a3',
    
    canvas: {
      width: 3508, // A3 300DPI
      height: 4961,
      backgroundColor: '#1a1a1a'
    },
    
    objects: [
      {
        id: 'background-gradient',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 3508,
          height: 4961,
          fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #1a1a1a 100%)',
          top: 0,
          left: 0,
          selectable: false
        },
        editable: {
          content: false,
          style: true,
          position: false,
          size: false
        }
      },
      {
        id: 'event-title',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '音乐节\n2024',
          fontSize: 180,
          fontFamily: 'Impact',
          fill: '#ffffff',
          top: 800,
          left: 1754,
          originX: 'center',
          originY: 'center',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: 0.9,
          shadow: {
            color: 'rgba(0,0,0,0.5)',
            blur: 20,
            offsetX: 5,
            offsetY: 5
          }
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '音乐节\n2024',
          suggestions: ['艺术展\n2024', '科技大会\n2024', '创业峰会\n2024']
        }
      },
      {
        id: 'event-subtitle',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: 'MUSIC FESTIVAL',
          fontSize: 48,
          fontFamily: 'Arial',
          fill: '#f39c12',
          top: 1200,
          left: 1754,
          originX: 'center',
          originY: 'center',
          textAlign: 'center',
          letterSpacing: 8
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: 'MUSIC FESTIVAL',
          suggestions: ['ART EXHIBITION', 'TECH CONFERENCE', 'STARTUP SUMMIT']
        }
      },
      {
        id: 'event-details',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '📅 2024年6月15-16日\n📍 城市音乐广场\n🎫 早鸟票 ¥199起\n\n🎵 顶级音乐人阵容\n🎪 精彩互动体验\n🍔 美食嘉年华',
          fontSize: 54,
          fontFamily: 'Arial',
          fill: '#ffffff',
          top: 2000,
          left: 1754,
          originX: 'center',
          originY: 'center',
          textAlign: 'center',
          lineHeight: 1.4
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '活动详情信息',
          suggestions: ['时间地点票价', '活动亮点介绍', '参与方式说明']
        }
      },
      {
        id: 'qr-code-placeholder',
        type: 'image',
        fabricObject: {
          type: 'rect',
          width: 300,
          height: 300,
          fill: '#ffffff',
          stroke: '#f39c12',
          strokeWidth: 8,
          top: 3800,
          left: 1754,
          originX: 'center',
          originY: 'center',
          rx: 20,
          ry: 20
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'image',
          defaultContent: '二维码',
          suggestions: ['购票二维码', '报名二维码', '详情二维码']
        }
      },
      {
        id: 'scan-text',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '扫码购票',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#f39c12',
          top: 4200,
          left: 1754,
          originX: 'center',
          originY: 'center',
          textAlign: 'center'
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '扫码购票',
          suggestions: ['扫码报名', '扫码了解', '扫码参与']
        }
      },
      {
        id: 'decorative-elements',
        type: 'group',
        fabricObject: {
          type: 'group',
          objects: [
            {
              type: 'circle',
              radius: 100,
              fill: 'rgba(243, 156, 18, 0.3)',
              top: 500,
              left: 500
            },
            {
              type: 'triangle',
              width: 150,
              height: 150,
              fill: 'rgba(255, 255, 255, 0.2)',
              top: 4000,
              left: 3000,
              angle: 45
            },
            {
              type: 'rect',
              width: 80,
              height: 80,
              fill: 'rgba(243, 156, 18, 0.4)',
              top: 1500,
              left: 200,
              angle: 30
            }
          ],
          top: 0,
          left: 0,
          selectable: false
        },
        editable: {
          content: false,
          style: true,
          position: false,
          size: false
        }
      }
    ],
    
    metadata: {
      tags: ['海报', '活动', '宣传', '音乐', '印刷'],
      style: TemplateStyle.BOLD,
      industry: ['娱乐', '活动', '文化', '艺术'],
      difficulty: 'intermediate',
      colors: ['#1a1a1a', '#667eea', '#764ba2', '#ffffff', '#f39c12'],
      fonts: ['Impact', 'Arial'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'Design Team',
      version: '1.0'
    },
    
    preview: {
      thumbnail: '/templates/thumbnails/poster-event-1.jpg',
      fullPreview: '/templates/previews/poster-event-1.jpg',
      description: '醒目的活动宣传海报，适合音乐节、艺术展等各类活动宣传使用'
    },
    
    customizable: {
      colors: true,
      fonts: true,
      images: true,
      text: true
    }
  }
];

// 导出所有印刷品模板
export const printTemplates: DesignTemplate[] = [
  ...flyerTemplates,
  ...businessCardTemplates,
  ...posterTemplates
];