/**
 * 社交媒体模板数据
 * 包含 Instagram、Facebook、Twitter、LinkedIn、YouTube 等平台的模板
 */

import { DesignTemplate, TemplateCategory, TemplateStyle } from '@/types/template';

// Instagram Post 模板
export const instagramPostTemplates: DesignTemplate[] = [
  {
    id: 'instagram-post-modern-1',
    name: '现代简约Instagram帖子',
    description: '适合品牌推广的现代简约风格Instagram帖子模板',
    category: TemplateCategory.SOCIAL_MEDIA,
    subcategory: 'instagram-post',
    
    canvas: {
      width: 1080,
      height: 1080,
      backgroundColor: '#ffffff'
    },
    
    objects: [
      {
        id: 'background-gradient',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 1080,
          height: 540,
          fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        id: 'main-title',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '您的标题文字',
          fontSize: 48,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          top: 200,
          left: 540,
          originX: 'center',
          originY: 'center',
          fontWeight: 'bold',
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
          defaultContent: '您的标题文字',
          suggestions: ['新品发布', '限时优惠', '品牌故事', '产品介绍']
        }
      },
      {
        id: 'subtitle',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '副标题或描述文字',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#ffffff',
          top: 280,
          left: 540,
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
          defaultContent: '副标题或描述文字',
          suggestions: ['了解更多详情', '立即购买', '关注我们']
        }
      },
      {
        id: 'bottom-section',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 1080,
          height: 540,
          fill: '#ffffff',
          top: 540,
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
        id: 'content-text',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '在这里添加您的主要内容\n可以是产品介绍、活动信息\n或者其他重要信息',
          fontSize: 32,
          fontFamily: 'Arial',
          fill: '#333333',
          top: 720,
          left: 540,
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
          defaultContent: '在这里添加您的主要内容',
          suggestions: ['产品特色介绍', '活动详情说明', '品牌价值观']
        }
      },
      {
        id: 'logo-placeholder',
        type: 'image',
        fabricObject: {
          type: 'rect',
          width: 120,
          height: 120,
          fill: '#f0f0f0',
          stroke: '#cccccc',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          top: 920,
          left: 540,
          originX: 'center',
          originY: 'center'
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'logo',
          defaultContent: '品牌Logo',
          suggestions: ['公司标志', '产品图标', '品牌标识']
        }
      }
    ],
    
    metadata: {
      tags: ['现代', '简约', '品牌', 'Instagram', '社交媒体'],
      style: TemplateStyle.MODERN,
      industry: ['科技', '时尚', '生活方式', '商务'],
      difficulty: 'beginner',
      colors: ['#667eea', '#764ba2', '#ffffff', '#333333'],
      fonts: ['Arial Black', 'Arial'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'Design Team',
      version: '1.0'
    },
    
    preview: {
      thumbnail: '/templates/thumbnails/instagram-post-modern-1.jpg',
      fullPreview: '/templates/previews/instagram-post-modern-1.jpg',
      description: '现代简约风格，适合科技和时尚品牌使用，包含标题、副标题、内容区域和Logo位置'
    },
    
    customizable: {
      colors: true,
      fonts: true,
      images: true,
      text: true
    }
  },
  
  {
    id: 'instagram-post-creative-1',
    name: '创意艺术Instagram帖子',
    description: '充满创意和艺术感的Instagram帖子模板，适合创意行业',
    category: TemplateCategory.SOCIAL_MEDIA,
    subcategory: 'instagram-post',
    
    canvas: {
      width: 1080,
      height: 1080,
      backgroundColor: '#1a1a1a'
    },
    
    objects: [
      {
        id: 'artistic-background',
        type: 'shape',
        fabricObject: {
          type: 'circle',
          radius: 400,
          fill: 'radial-gradient(circle, #ff6b6b 0%, #ee5a24 50%, #1a1a1a 100%)',
          top: 540,
          left: 540,
          originX: 'center',
          originY: 'center',
          selectable: false
        },
        editable: {
          content: false,
          style: true,
          position: false,
          size: true
        }
      },
      {
        id: 'creative-title',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '创意无限',
          fontSize: 64,
          fontFamily: 'Impact',
          fill: '#ffffff',
          top: 400,
          left: 540,
          originX: 'center',
          originY: 'center',
          fontWeight: 'bold',
          textAlign: 'center',
          shadow: {
            color: 'rgba(0,0,0,0.5)',
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
          defaultContent: '创意无限',
          suggestions: ['艺术创作', '设计灵感', '创新思维', '想象力']
        }
      },
      {
        id: 'creative-subtitle',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: 'UNLEASH YOUR CREATIVITY',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#ffffff',
          top: 480,
          left: 540,
          originX: 'center',
          originY: 'center',
          textAlign: 'center',
          letterSpacing: 3
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: 'UNLEASH YOUR CREATIVITY',
          suggestions: ['DESIGN WITH PASSION', 'CREATE AMAZING THINGS', 'ART IS LIFE']
        }
      },
      {
        id: 'decorative-elements',
        type: 'group',
        fabricObject: {
          type: 'group',
          objects: [
            {
              type: 'triangle',
              width: 60,
              height: 60,
              fill: '#feca57',
              top: 200,
              left: 200,
              angle: 45
            },
            {
              type: 'rect',
              width: 40,
              height: 40,
              fill: '#48dbfb',
              top: 800,
              left: 800,
              angle: 30
            },
            {
              type: 'circle',
              radius: 25,
              fill: '#ff9ff3',
              top: 150,
              left: 850
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
      },
      {
        id: 'bottom-text',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '探索更多创意内容\n关注我们获取灵感',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#ffffff',
          top: 680,
          left: 540,
          originX: 'center',
          originY: 'center',
          textAlign: 'center',
          lineHeight: 1.3
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '探索更多创意内容',
          suggestions: ['发现设计灵感', '加入创意社区', '分享你的作品']
        }
      }
    ],
    
    metadata: {
      tags: ['创意', '艺术', '设计', 'Instagram', '视觉'],
      style: TemplateStyle.CREATIVE,
      industry: ['设计', '艺术', '创意', '媒体'],
      difficulty: 'intermediate',
      colors: ['#1a1a1a', '#ff6b6b', '#ee5a24', '#feca57', '#48dbfb', '#ff9ff3'],
      fonts: ['Impact', 'Arial'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'Design Team',
      version: '1.0'
    },
    
    preview: {
      thumbnail: '/templates/thumbnails/instagram-post-creative-1.jpg',
      fullPreview: '/templates/previews/instagram-post-creative-1.jpg',
      description: '充满创意和艺术感的设计，适合设计师、艺术家和创意工作者使用'
    },
    
    customizable: {
      colors: true,
      fonts: true,
      images: false,
      text: true
    }
  }
];

// Instagram Story 模板
export const instagramStoryTemplates: DesignTemplate[] = [
  {
    id: 'instagram-story-minimal-1',
    name: '简约Instagram故事',
    description: '简洁优雅的Instagram故事模板，适合日常分享',
    category: TemplateCategory.SOCIAL_MEDIA,
    subcategory: 'instagram-story',
    
    canvas: {
      width: 1080,
      height: 1920,
      backgroundColor: '#f8f9fa'
    },
    
    objects: [
      {
        id: 'header-section',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 1080,
          height: 400,
          fill: '#ffffff',
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
        id: 'story-title',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '今日分享',
          fontSize: 48,
          fontFamily: 'Arial',
          fill: '#2c3e50',
          top: 200,
          left: 540,
          originX: 'center',
          originY: 'center',
          fontWeight: 'bold',
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
          defaultContent: '今日分享',
          suggestions: ['每日心情', '生活记录', '工作日常', '美食分享']
        }
      },
      {
        id: 'main-image-placeholder',
        type: 'image',
        fabricObject: {
          type: 'rect',
          width: 900,
          height: 600,
          fill: '#e9ecef',
          stroke: '#dee2e6',
          strokeWidth: 2,
          strokeDashArray: [10, 10],
          top: 660,
          left: 540,
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
          defaultContent: '添加图片',
          suggestions: ['产品照片', '生活照片', '风景图片', '人物照片']
        }
      },
      {
        id: 'description-text',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '在这里添加描述文字\n分享您的想法和感受',
          fontSize: 32,
          fontFamily: 'Arial',
          fill: '#495057',
          top: 1400,
          left: 540,
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
          defaultContent: '在这里添加描述文字',
          suggestions: ['分享今天的心情', '记录美好时刻', '感谢大家的支持']
        }
      },
      {
        id: 'bottom-decoration',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 200,
          height: 6,
          fill: '#3498db',
          top: 1600,
          left: 540,
          originX: 'center',
          originY: 'center',
          rx: 3,
          ry: 3,
          selectable: false
        },
        editable: {
          content: false,
          style: true,
          position: false,
          size: true
        }
      }
    ],
    
    metadata: {
      tags: ['简约', '故事', 'Instagram', '日常', '分享'],
      style: TemplateStyle.MINIMAL,
      industry: ['生活方式', '个人', '博客', '社交'],
      difficulty: 'beginner',
      colors: ['#f8f9fa', '#ffffff', '#2c3e50', '#495057', '#3498db'],
      fonts: ['Arial'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'Design Team',
      version: '1.0'
    },
    
    preview: {
      thumbnail: '/templates/thumbnails/instagram-story-minimal-1.jpg',
      fullPreview: '/templates/previews/instagram-story-minimal-1.jpg',
      description: '简洁优雅的故事模板，适合日常生活分享和个人博客使用'
    },
    
    customizable: {
      colors: true,
      fonts: true,
      images: true,
      text: true
    }
  }
];

// Facebook Post 模板
export const facebookPostTemplates: DesignTemplate[] = [
  {
    id: 'facebook-post-business-1',
    name: '商务Facebook帖子',
    description: '专业的商务风格Facebook帖子模板，适合企业宣传',
    category: TemplateCategory.SOCIAL_MEDIA,
    subcategory: 'facebook-post',
    
    canvas: {
      width: 1200,
      height: 630,
      backgroundColor: '#ffffff'
    },
    
    objects: [
      {
        id: 'left-section',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 600,
          height: 630,
          fill: '#2c3e50',
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
        id: 'business-title',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '专业服务\n值得信赖',
          fontSize: 42,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          top: 200,
          left: 300,
          originX: 'center',
          originY: 'center',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: 1.2
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '专业服务\n值得信赖',
          suggestions: ['优质产品\n超值体验', '创新解决方案\n引领未来', '专业团队\n贴心服务']
        }
      },
      {
        id: 'business-subtitle',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '了解更多详情',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#ecf0f1',
          top: 350,
          left: 300,
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
          defaultContent: '了解更多详情',
          suggestions: ['立即咨询', '联系我们', '获取报价']
        }
      },
      {
        id: 'right-content',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '我们致力于为客户提供\n最优质的产品和服务\n\n• 专业团队支持\n• 7x24小时服务\n• 满意度保证\n\n立即联系我们，开启\n合作之旅！',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#2c3e50',
          top: 315,
          left: 900,
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
          defaultContent: '我们致力于为客户提供最优质的产品和服务',
          suggestions: ['专业的解决方案提供商', '值得信赖的合作伙伴', '行业领先的服务商']
        }
      },
      {
        id: 'company-logo-placeholder',
        type: 'image',
        fabricObject: {
          type: 'rect',
          width: 80,
          height: 80,
          fill: '#f8f9fa',
          stroke: '#dee2e6',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          top: 450,
          left: 300,
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
          suggestions: ['企业标志', '品牌标识', '公司图标']
        }
      }
    ],
    
    metadata: {
      tags: ['商务', '专业', 'Facebook', '企业', '宣传'],
      style: TemplateStyle.PROFESSIONAL,
      industry: ['商务', '企业服务', '咨询', '金融'],
      difficulty: 'beginner',
      colors: ['#2c3e50', '#ffffff', '#ecf0f1', '#f8f9fa'],
      fonts: ['Arial Black', 'Arial'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'Design Team',
      version: '1.0'
    },
    
    preview: {
      thumbnail: '/templates/thumbnails/facebook-post-business-1.jpg',
      fullPreview: '/templates/previews/facebook-post-business-1.jpg',
      description: '专业的商务风格设计，适合企业宣传和服务推广使用'
    },
    
    customizable: {
      colors: true,
      fonts: true,
      images: true,
      text: true
    }
  }
];

// 导出所有社交媒体模板
export const socialMediaTemplates: DesignTemplate[] = [
  ...instagramPostTemplates,
  ...instagramStoryTemplates,
  ...facebookPostTemplates
];