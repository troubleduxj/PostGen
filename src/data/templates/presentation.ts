/**
 * 演示文稿模板数据
 * 包含PPT、Keynote、Google Slides等演示文稿模板
 */

import { DesignTemplate, TemplateCategory, TemplateStyle } from '@/types/template';

// PPT标准尺寸模板
export const pptStandardTemplates: DesignTemplate[] = [
  {
    id: 'ppt-business-presentation-1',
    name: '商务演示PPT',
    description: '专业的商务演示PPT模板，适合企业汇报和项目展示',
    category: TemplateCategory.PRESENTATION,
    subcategory: 'ppt-standard',
    
    canvas: {
      width: 1024,
      height: 768,
      backgroundColor: '#ffffff'
    },
    
    objects: [
      {
        id: 'header-section',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 1024,
          height: 120,
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
        id: 'presentation-title',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '项目汇报',
          fontSize: 48,
          fontFamily: 'Arial Black',
          fill: '#2c3e50',
          top: 200,
          left: 512,
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
          defaultContent: '项目汇报',
          suggestions: ['季度总结', '产品发布', '市场分析', '年度规划']
        }
      },
      {
        id: 'presentation-subtitle',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '2024年第一季度业绩回顾',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#7f8c8d',
          top: 280,
          left: 512,
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
          defaultContent: '副标题描述',
          suggestions: ['项目进展汇报', '市场表现分析', '团队成果展示']
        }
      },
      {
        id: 'main-content',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '• 核心业务指标达成情况\n• 重点项目进展状况\n• 市场拓展成果\n• 团队建设与发展\n• 下季度工作计划',
          fontSize: 28,
          fontFamily: 'Arial',
          fill: '#34495e',
          top: 400,
          left: 100,
          textAlign: 'left',
          lineHeight: 1.6
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '主要内容要点',
          suggestions: ['议程安排', '关键数据', '重要结论', '行动计划']
        }
      },
      {
        id: 'company-logo-placeholder',
        type: 'image',
        fabricObject: {
          type: 'rect',
          width: 80,
          height: 80,
          fill: '#ecf0f1',
          stroke: '#bdc3c7',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          top: 60,
          left: 60,
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
          suggestions: ['企业标志', '部门标识', '项目Logo']
        }
      },
      {
        id: 'presenter-info',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '汇报人：张经理\n部门：市场部\n日期：2024年4月',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#ffffff',
          top: 60,
          left: 800,
          textAlign: 'right',
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
          defaultContent: '汇报人信息',
          suggestions: ['演讲者姓名', '部门职位', '联系方式']
        }
      },
      {
        id: 'accent-line',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 800,
          height: 6,
          fill: '#3498db',
          top: 340,
          left: 112,
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
      tags: ['PPT', '商务', '演示', '汇报', '专业'],
      style: TemplateStyle.PROFESSIONAL,
      industry: ['商务', '企业', '咨询', '管理'],
      difficulty: 'beginner',
      colors: ['#2c3e50', '#ffffff', '#7f8c8d', '#34495e', '#3498db'],
      fonts: ['Arial Black', 'Arial'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'Design Team',
      version: '1.0'
    },
    
    preview: {
      thumbnail: '/templates/thumbnails/ppt-business-presentation-1.jpg',
      fullPreview: '/templates/previews/ppt-business-presentation-1.jpg',
      description: '专业的商务演示模板，适合企业汇报、项目展示和会议演讲使用'
    },
    
    customizable: {
      colors: true,
      fonts: true,
      images: true,
      text: true
    }
  }
];

// PPT宽屏模板
export const pptWidescreenTemplates: DesignTemplate[] = [
  {
    id: 'ppt-tech-presentation-1',
    name: '科技主题PPT',
    description: '现代科技风格的宽屏PPT模板，适合技术分享和产品发布',
    category: TemplateCategory.PRESENTATION,
    subcategory: 'ppt-widescreen',
    
    canvas: {
      width: 1920,
      height: 1080,
      backgroundColor: '#0f1419'
    },
    
    objects: [
      {
        id: 'tech-background',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 1920,
          height: 1080,
          fill: 'linear-gradient(135deg, #0f1419 0%, #1e3a8a 50%, #3b82f6 100%)',
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
        id: 'tech-title',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '人工智能的未来',
          fontSize: 72,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          top: 300,
          left: 960,
          originX: 'center',
          originY: 'center',
          fontWeight: 'bold',
          textAlign: 'center',
          shadow: {
            color: 'rgba(59, 130, 246, 0.5)',
            blur: 20,
            offsetX: 0,
            offsetY: 0
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
          defaultContent: '人工智能的未来',
          suggestions: ['区块链技术', '云计算解决方案', '大数据分析', '物联网应用']
        }
      },
      {
        id: 'tech-subtitle',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: 'AI TECHNOLOGY TRENDS 2024',
          fontSize: 32,
          fontFamily: 'Arial',
          fill: '#60a5fa',
          top: 420,
          left: 960,
          originX: 'center',
          originY: 'center',
          textAlign: 'center',
          letterSpacing: 4
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: 'AI TECHNOLOGY TRENDS 2024',
          suggestions: ['BLOCKCHAIN INNOVATION', 'CLOUD COMPUTING FUTURE', 'BIG DATA INSIGHTS']
        }
      },
      {
        id: 'tech-content',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '🤖 机器学习算法优化\n🧠 深度学习模型创新\n🔮 预测分析能力提升\n🚀 自动化流程改进\n💡 智能决策支持系统',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#e2e8f0',
          top: 600,
          left: 200,
          textAlign: 'left',
          lineHeight: 1.8
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '技术要点列表',
          suggestions: ['核心功能特性', '技术优势分析', '应用场景介绍']
        }
      },
      {
        id: 'tech-visual-placeholder',
        type: 'image',
        fabricObject: {
          type: 'rect',
          width: 600,
          height: 400,
          fill: 'rgba(59, 130, 246, 0.1)',
          stroke: '#3b82f6',
          strokeWidth: 3,
          strokeDashArray: [10, 10],
          top: 500,
          left: 1100,
          originX: 'center',
          originY: 'center',
          rx: 15,
          ry: 15
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'image',
          defaultContent: '技术图表',
          suggestions: ['架构图', '流程图', '数据图表', '产品截图']
        }
      },
      {
        id: 'speaker-info',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '主讲人：李博士 | CTO\n科技创新实验室',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#94a3b8',
          top: 950,
          left: 100,
          textAlign: 'left',
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
          defaultContent: '演讲者信息',
          suggestions: ['技术专家介绍', '团队负责人', '产品经理']
        }
      },
      {
        id: 'tech-decorations',
        type: 'group',
        fabricObject: {
          type: 'group',
          objects: [
            {
              type: 'circle',
              radius: 3,
              fill: '#60a5fa',
              top: 200,
              left: 300
            },
            {
              type: 'circle',
              radius: 5,
              fill: '#3b82f6',
              top: 180,
              left: 1500
            },
            {
              type: 'circle',
              radius: 2,
              fill: '#93c5fd',
              top: 850,
              left: 800
            },
            {
              type: 'circle',
              radius: 4,
              fill: '#60a5fa',
              top: 100,
              left: 1200
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
      tags: ['PPT', '科技', '宽屏', '现代', '技术'],
      style: TemplateStyle.MODERN,
      industry: ['科技', 'IT', '人工智能', '创新'],
      difficulty: 'intermediate',
      colors: ['#0f1419', '#1e3a8a', '#3b82f6', '#60a5fa', '#ffffff'],
      fonts: ['Arial Black', 'Arial'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'Design Team',
      version: '1.0'
    },
    
    preview: {
      thumbnail: '/templates/thumbnails/ppt-tech-presentation-1.jpg',
      fullPreview: '/templates/previews/ppt-tech-presentation-1.jpg',
      description: '现代科技风格的宽屏演示模板，适合技术分享、产品发布和创新展示'
    },
    
    customizable: {
      colors: true,
      fonts: true,
      images: true,
      text: true
    }
  }
];

// Keynote模板
export const keynoteTemplates: DesignTemplate[] = [
  {
    id: 'keynote-creative-1',
    name: '创意Keynote演示',
    description: '富有创意和视觉冲击力的Keynote演示模板',
    category: TemplateCategory.PRESENTATION,
    subcategory: 'keynote',
    
    canvas: {
      width: 1920,
      height: 1080,
      backgroundColor: '#ffffff'
    },
    
    objects: [
      {
        id: 'creative-background',
        type: 'shape',
        fabricObject: {
          type: 'rect',
          width: 1920,
          height: 1080,
          fill: 'linear-gradient(45deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)',
          top: 0,
          left: 0,
          selectable: false,
          opacity: 0.1
        },
        editable: {
          content: false,
          style: true,
          position: false,
          size: false
        }
      },
      {
        id: 'creative-title',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '创意无界限',
          fontSize: 96,
          fontFamily: 'Impact',
          fill: '#2c3e50',
          top: 350,
          left: 960,
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
          defaultContent: '创意无界限',
          suggestions: ['设计思维', '创新理念', '艺术表达', '想象空间']
        }
      },
      {
        id: 'creative-subtitle',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: 'UNLEASH YOUR CREATIVE POTENTIAL',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#7f8c8d',
          top: 480,
          left: 960,
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
          defaultContent: 'UNLEASH YOUR CREATIVE POTENTIAL',
          suggestions: ['DESIGN WITH PASSION', 'INNOVATE BEYOND LIMITS', 'CREATE AMAZING EXPERIENCES']
        }
      },
      {
        id: 'creative-content',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '✨ 突破传统思维模式\n🎨 探索全新设计语言\n🚀 实现创意商业价值\n💡 激发团队创新活力',
          fontSize: 42,
          fontFamily: 'Arial',
          fill: '#34495e',
          top: 650,
          left: 960,
          originX: 'center',
          originY: 'center',
          textAlign: 'center',
          lineHeight: 1.6
        },
        editable: {
          content: true,
          style: true,
          position: true,
          size: true
        },
        placeholder: {
          type: 'text',
          defaultContent: '创意要点展示',
          suggestions: ['核心理念阐述', '方法论介绍', '成功案例分享']
        }
      },
      {
        id: 'geometric-decorations',
        type: 'group',
        fabricObject: {
          type: 'group',
          objects: [
            {
              type: 'triangle',
              width: 120,
              height: 120,
              fill: '#ff6b6b',
              top: 150,
              left: 200,
              angle: 30,
              opacity: 0.7
            },
            {
              type: 'circle',
              radius: 80,
              fill: '#feca57',
              top: 200,
              left: 1600,
              opacity: 0.6
            },
            {
              type: 'rect',
              width: 100,
              height: 100,
              fill: '#48dbfb',
              top: 800,
              left: 300,
              angle: 45,
              opacity: 0.5
            },
            {
              type: 'polygon',
              points: [
                { x: 0, y: -50 },
                { x: 43, y: 25 },
                { x: -43, y: 25 }
              ],
              fill: '#ff9ff3',
              top: 850,
              left: 1500,
              opacity: 0.6
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
        id: 'presenter-badge',
        type: 'text',
        fabricObject: {
          type: 'text',
          text: '创意总监 | 王设计师',
          fontSize: 28,
          fontFamily: 'Arial',
          fill: '#ffffff',
          top: 950,
          left: 960,
          originX: 'center',
          originY: 'center',
          textAlign: 'center',
          backgroundColor: '#e74c3c',
          padding: 15,
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
          type: 'text',
          defaultContent: '演讲者信息',
          suggestions: ['设计师介绍', '创意总监', '艺术指导']
        }
      }
    ],
    
    metadata: {
      tags: ['Keynote', '创意', '设计', '艺术', '视觉'],
      style: TemplateStyle.CREATIVE,
      industry: ['设计', '创意', '艺术', '广告'],
      difficulty: 'advanced',
      colors: ['#ffffff', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#2c3e50'],
      fonts: ['Impact', 'Arial'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'Design Team',
      version: '1.0'
    },
    
    preview: {
      thumbnail: '/templates/thumbnails/keynote-creative-1.jpg',
      fullPreview: '/templates/previews/keynote-creative-1.jpg',
      description: '富有创意和视觉冲击力的演示模板，适合设计分享、创意展示和艺术演讲'
    },
    
    customizable: {
      colors: true,
      fonts: true,
      images: false,
      text: true
    }
  }
];

// 导出所有演示文稿模板
export const presentationTemplates: DesignTemplate[] = [
  ...pptStandardTemplates,
  ...pptWidescreenTemplates,
  ...keynoteTemplates
];