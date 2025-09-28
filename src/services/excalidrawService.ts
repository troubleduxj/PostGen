import { fabric } from 'fabric';
import { getLocalLibrary } from '@/data/excalidrawLibraries';

// Excalidraw素材库服务
export interface ExcalidrawLibraryItem {
  id: string;
  name: string;
  elements: any[];
  preview?: string;
  tags?: string[];
}

export interface ExcalidrawLibrary {
  type: 'excalidrawlib';
  version: number;
  source: string;
  libraryItems: ExcalidrawLibraryItem[];
}

class ExcalidrawService {
  // 本地Excalidraw素材库（避免CORS问题）
  private readonly EXCALIDRAW_LIBRARIES = [
    {
      name: '基础图形',
      url: 'basic-shapes',
      tags: ['基础', '形状', '几何']
    },
    {
      name: '箭头指示', 
      url: 'arrows',
      tags: ['箭头', '指向', '流程']
    },
    {
      name: '流程图',
      url: 'flowchart', 
      tags: ['流程图', '图表', '逻辑']
    },
    {
      name: 'UI元素',
      url: 'ui-elements',
      tags: ['UI', '界面', '组件']
    },
    {
      name: '图标集合',
      url: 'icons',
      tags: ['图标', 'icon', '符号']
    },
    {
      name: '手绘插图',
      url: 'illustrations',
      tags: ['插图', '手绘', '装饰']
    },
    {
      name: '网络图标',
      url: 'networking-icons',
      tags: ['网络', '技术', '图标']
    },
    {
      name: 'AWS架构',
      url: 'aws-architecture-icons',
      tags: ['AWS', '云', '架构']
    }
  ];

  // 本地备用素材库（如果在线库不可用）
  private readonly LOCAL_EXCALIDRAW_LIBRARIES = [
    {
      name: '基础图形',
      id: 'basic-shapes',
      tags: ['基础', '形状', '几何'],
      items: [
        {
          id: 'rough-rectangle',
          name: '手绘矩形',
          elements: [{
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 100,
            height: 80,
            strokeColor: '#1e1e1e',
            backgroundColor: 'transparent',
            strokeWidth: 2,
            roughness: 1
          }],
          tags: ['矩形', '方形']
        },
        {
          id: 'rough-circle',
          name: '手绘圆形',
          elements: [{
            type: 'ellipse',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            strokeColor: '#1e1e1e',
            backgroundColor: 'transparent',
            strokeWidth: 2,
            roughness: 1
          }],
          tags: ['圆形', '椭圆']
        },
        {
          id: 'rough-diamond',
          name: '手绘菱形',
          elements: [{
            type: 'diamond',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            strokeColor: '#1e1e1e',
            backgroundColor: 'transparent',
            strokeWidth: 2,
            roughness: 1
          }],
          tags: ['菱形', '钻石']
        }
      ]
    },
    {
      name: '箭头指示',
      id: 'arrows',
      tags: ['箭头', '指向', '流程'],
      items: [
        {
          id: 'rough-arrow-right',
          name: '右箭头',
          elements: [{
            type: 'arrow',
            x: 0,
            y: 50,
            width: 100,
            height: 0,
            strokeColor: '#1e1e1e',
            backgroundColor: 'transparent',
            strokeWidth: 2,
            roughness: 1,
            startArrowhead: null,
            endArrowhead: 'arrow'
          }],
          tags: ['箭头', '右', '指向']
        },
        {
          id: 'rough-arrow-left',
          name: '左箭头',
          elements: [{
            type: 'arrow',
            x: 100,
            y: 50,
            width: -100,
            height: 0,
            strokeColor: '#1e1e1e',
            backgroundColor: 'transparent',
            strokeWidth: 2,
            roughness: 1,
            startArrowhead: 'arrow',
            endArrowhead: null
          }],
          tags: ['箭头', '左', '指向']
        },
        {
          id: 'rough-arrow-up',
          name: '上箭头',
          elements: [{
            type: 'arrow',
            x: 50,
            y: 100,
            width: 0,
            height: -100,
            strokeColor: '#1e1e1e',
            backgroundColor: 'transparent',
            strokeWidth: 2,
            roughness: 1,
            startArrowhead: 'arrow',
            endArrowhead: null
          }],
          tags: ['箭头', '上', '指向']
        },
        {
          id: 'rough-arrow-down',
          name: '下箭头',
          elements: [{
            type: 'arrow',
            x: 50,
            y: 0,
            width: 0,
            height: 100,
            strokeColor: '#1e1e1e',
            backgroundColor: 'transparent',
            strokeWidth: 2,
            roughness: 1,
            startArrowhead: null,
            endArrowhead: 'arrow'
          }],
          tags: ['箭头', '下', '指向']
        }
      ]
    },
    {
      name: '流程图',
      id: 'flowchart',
      tags: ['流程图', '图表', '逻辑'],
      items: [
        {
          id: 'process-box',
          name: '处理框',
          elements: [{
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 120,
            height: 60,
            strokeColor: '#1e1e1e',
            backgroundColor: '#e7f3ff',
            strokeWidth: 2,
            roughness: 1
          }],
          tags: ['处理', '流程', '步骤']
        },
        {
          id: 'decision-diamond',
          name: '决策框',
          elements: [{
            type: 'diamond',
            x: 0,
            y: 0,
            width: 100,
            height: 80,
            strokeColor: '#1e1e1e',
            backgroundColor: '#fff2cc',
            strokeWidth: 2,
            roughness: 1
          }],
          tags: ['决策', '判断', '选择']
        },
        {
          id: 'start-end-oval',
          name: '开始/结束',
          elements: [{
            type: 'ellipse',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            strokeColor: '#1e1e1e',
            backgroundColor: '#d5e8d4',
            strokeWidth: 2,
            roughness: 1
          }],
          tags: ['开始', '结束', '终点']
        }
      ]
    },
    {
      name: '手绘装饰',
      id: 'decorations',
      tags: ['装饰', '手绘', '元素'],
      items: [
        {
          id: 'rough-star',
          name: '手绘星星',
          elements: [{
            type: 'draw',
            x: 0,
            y: 0,
            width: 60,
            height: 60,
            strokeColor: '#e67e22',
            backgroundColor: 'transparent',
            strokeWidth: 3,
            roughness: 2,
            points: [[30, 5], [35, 20], [50, 20], [40, 30], [45, 45], [30, 35], [15, 45], [20, 30], [10, 20], [25, 20]]
          }],
          tags: ['星星', '装饰', '重点']
        },
        {
          id: 'rough-cloud',
          name: '手绘云朵',
          elements: [{
            type: 'draw',
            x: 0,
            y: 0,
            width: 80,
            height: 50,
            strokeColor: '#3498db',
            backgroundColor: 'transparent',
            strokeWidth: 2,
            roughness: 2,
            points: [[15, 35], [10, 25], [15, 15], [25, 10], [35, 12], [45, 8], [55, 12], [65, 15], [70, 25], [65, 35], [55, 40], [45, 38], [35, 40], [25, 38]]
          }],
          tags: ['云朵', '天气', '思考']
        },
        {
          id: 'rough-heart',
          name: '手绘爱心',
          elements: [{
            type: 'draw',
            x: 0,
            y: 0,
            width: 60,
            height: 55,
            strokeColor: '#e74c3c',
            backgroundColor: 'transparent',
            strokeWidth: 2,
            roughness: 1,
            points: [[30, 50], [20, 35], [15, 25], [15, 18], [20, 12], [28, 15], [30, 20], [32, 15], [40, 12], [45, 18], [45, 25], [40, 35]]
          }],
          tags: ['爱心', '喜欢', '情感']
        }
      ]
    }
  ];

  // 获取所有可用的库
  async getAvailableLibraries() {
    return this.EXCALIDRAW_LIBRARIES;
  }

  // 缓存已加载的库
  private libraryCache = new Map<string, ExcalidrawLibrary>();

  // 加载指定的库（直接从本地加载）
  async loadLibrary(url: string): Promise<ExcalidrawLibrary | null> {
    try {
      // 检查缓存
      if (this.libraryCache.has(url)) {
        console.log('Loading library from cache:', url);
        return this.libraryCache.get(url)!;
      }

      console.log(`Loading local Excalidraw library: ${url}`);
      
      // 直接从本地库加载
      const libraryData = await this.loadLocalLibrary(url);
      
      if (libraryData) {
        // 缓存结果
        this.libraryCache.set(url, libraryData);
        console.log('Successfully loaded local library:', libraryData);
      }
      
      return libraryData;
    } catch (error) {
      console.error('Error loading Excalidraw library:', error);
      return null;
    }
  }

  // 加载本地库
  private async loadLocalLibrary(libraryKey: string): Promise<ExcalidrawLibrary | null> {
    try {
      console.log('Loading local library for:', libraryKey);
      
      // 使用本地库数据
      const localLib = getLocalLibrary(libraryKey);
      
      if (!localLib) {
        console.warn(`Local library not found for: ${libraryKey}`);
        
        // 如果找不到对应的本地库，使用旧的简化版本
        const fallbackLib = this.LOCAL_EXCALIDRAW_LIBRARIES.find(lib => 
          lib.id.includes(libraryKey) || lib.name.toLowerCase().includes(libraryKey)
        );
        
        if (fallbackLib) {
          return {
            type: 'excalidrawlib',
            version: 2,
            source: 'local-fallback-simple',
            libraryItems: fallbackLib.items.map(item => ({
              id: item.id,
              name: item.name,
              elements: item.elements,
              tags: item.tags
            }))
          };
        }
        
        return null;
      }

      console.log('Found local library:', localLib);
      return localLib as ExcalidrawLibrary;
    } catch (error) {
      console.error('Error loading local library:', error);
      return null;
    }
  }

  // 搜索库中的素材
  searchLibraryItems(library: ExcalidrawLibrary, query: string): ExcalidrawLibraryItem[] {
    if (!query.trim()) return library.libraryItems;
    
    const lowercaseQuery = query.toLowerCase();
    return library.libraryItems.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
  }

  // 将Excalidraw元素转换为Fabric.js对象
  async convertToFabricObject(libraryItem: ExcalidrawLibraryItem): Promise<fabric.Object | null> {
    try {
      console.log('Converting Excalidraw item to Fabric:', libraryItem);
      
      if (!libraryItem.elements || libraryItem.elements.length === 0) {
        console.warn('No elements found in library item');
        return null;
      }

      const elements = libraryItem.elements;
      const fabricObjects: fabric.Object[] = [];

      for (const element of elements) {
        const fabricObj = await this.convertElementToFabric(element);
        if (fabricObj) {
          fabricObjects.push(fabricObj);
        }
      }

      console.log(`Converted ${fabricObjects.length} elements to Fabric objects`);

      // 如果只有一个对象，直接返回
      if (fabricObjects.length === 1) {
        return fabricObjects[0];
      }

      // 如果有多个对象，创建一个组
      if (fabricObjects.length > 1) {
        // 计算边界框来正确定位组
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        fabricObjects.forEach(obj => {
          const bounds = obj.getBoundingRect();
          minX = Math.min(minX, bounds.left);
          minY = Math.min(minY, bounds.top);
          maxX = Math.max(maxX, bounds.left + bounds.width);
          maxY = Math.max(maxY, bounds.top + bounds.height);
        });

        return new fabric.Group(fabricObjects, {
          selectable: true,
          left: minX,
          top: minY,
        });
      }

      return null;
    } catch (error) {
      console.error('Error converting Excalidraw item to Fabric:', error);
      return null;
    }
  }

  // 转换单个Excalidraw元素为Fabric对象
  private async convertElementToFabric(element: any): Promise<fabric.Object | null> {
    try {
      console.log('Converting element:', element);
      
      const { 
        type, 
        x, 
        y, 
        width, 
        height, 
        strokeColor, 
        backgroundColor, 
        strokeWidth, 
        roughness,
        points,
        text,
        fontSize,
        fontFamily,
        fillStyle,
        opacity
      } = element;

      const commonProps = {
        left: x || 0,
        top: y || 0,
        stroke: strokeColor || '#1e1e1e',
        fill: backgroundColor === 'transparent' ? 'transparent' : (backgroundColor || 'transparent'),
        strokeWidth: strokeWidth || 2,
        opacity: (opacity || 100) / 100, // Excalidraw使用0-100，Fabric使用0-1
        // 添加手绘风格效果
        strokeDashArray: (roughness && roughness > 1) ? [3, 2] : undefined,
        strokeLineCap: 'round' as const,
        strokeLineJoin: 'round' as const,
      };

      switch (type) {
        case 'rectangle':
          return new fabric.Rect({
            ...commonProps,
            width: width || 100,
            height: height || 80,
            rx: 5, // 轻微圆角
            ry: 5,
          });

        case 'ellipse':
          return new fabric.Ellipse({
            ...commonProps,
            rx: (width || 100) / 2,
            ry: (height || 100) / 2,
          });

        case 'diamond':
          const diamondPath = `M ${(width || 100)/2} 0 L ${width || 100} ${(height || 100)/2} L ${(width || 100)/2} ${height || 100} L 0 ${(height || 100)/2} Z`;
          return new fabric.Path(diamondPath, {
            ...commonProps,
          });

        case 'arrow':
          // Excalidraw箭头使用points数组
          if (points && points.length >= 2) {
            const startPoint = points[0];
            const endPoint = points[points.length - 1];
            
            return new fabric.Line([
              startPoint[0], startPoint[1], 
              endPoint[0], endPoint[1]
            ], {
              ...commonProps,
              strokeLineCap: 'round',
              // 简化箭头头部，实际应该根据startArrowhead和endArrowhead属性
            });
          } else {
            // 备用方案：使用width/height创建简单箭头
            const arrowWidth = Math.abs(width || 100);
            const arrowHeight = Math.abs(height || 0);
            
            if (Math.abs(arrowHeight) < Math.abs(arrowWidth)) {
              // 水平箭头
              const direction = (width || 100) > 0 ? 1 : -1;
              const arrowPath = direction > 0 
                ? `M 0 0 L ${arrowWidth - 15} 0 M ${arrowWidth - 20} -8 L ${arrowWidth} 0 L ${arrowWidth - 20} 8`
                : `M ${arrowWidth} 0 L 15 0 M 20 -8 L 0 0 L 20 8`;
              
              return new fabric.Path(arrowPath, {
                ...commonProps,
                fill: 'transparent',
              });
            } else {
              // 垂直箭头
              const direction = (height || 100) > 0 ? 1 : -1;
              const arrowPath = direction > 0 
                ? `M 0 0 L 0 ${arrowHeight - 15} M -8 ${arrowHeight - 20} L 0 ${arrowHeight} L 8 ${arrowHeight - 20}`
                : `M 0 ${arrowHeight} L 0 15 M -8 20 L 0 0 L 8 20`;
              
              return new fabric.Path(arrowPath, {
                ...commonProps,
                fill: 'transparent',
              });
            }
          }

        case 'line':
          return new fabric.Line([0, 0, width || 100, height || 0], {
            ...commonProps,
            strokeLineCap: 'round',
          });

        case 'draw':
        case 'freedraw':
          // 自由绘制路径
          if (points && points.length > 0) {
            const pathString = this.pointsToPath(points, x || 0, y || 0);
            return new fabric.Path(pathString, {
              ...commonProps,
              fill: 'transparent', // 自由绘制通常不填充
              left: 0, // 路径已经包含了绝对坐标
              top: 0,
            });
          }
          break;

        case 'text':
          return new fabric.Text(text || 'Text', {
            left: x || 0,
            top: y || 0,
            fontSize: fontSize || 16,
            fontFamily: fontFamily || 'Virgil, Segoe UI Emoji', // Excalidraw默认字体
            fill: strokeColor || '#1e1e1e',
          });

        default:
          console.warn(`Unsupported Excalidraw element type: ${type}`);
          return null;
      }

      return null;
    } catch (error) {
      console.error('Error converting element:', error);
      return null;
    }
  }

  // 将点数组转换为SVG路径
  private pointsToPath(points: number[][], offsetX: number = 0, offsetY: number = 0): string {
    if (points.length === 0) return '';
    
    // Excalidraw的点可能是相对坐标，需要加上元素的偏移
    const firstPoint = points[0];
    let path = `M ${firstPoint[0] + offsetX} ${firstPoint[1] + offsetY}`;
    
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      path += ` L ${point[0] + offsetX} ${point[1] + offsetY}`;
    }
    
    return path;
  }

  // 生成预览图
  async generatePreview(libraryItem: ExcalidrawLibraryItem): Promise<string> {
    try {
      // 创建临时canvas来生成预览
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return '';

      // 简单的预览生成逻辑
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#6c757d';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      
      ctx.fillStyle = '#495057';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(libraryItem.name, canvas.width / 2, canvas.height / 2);

      return canvas.toDataURL();
    } catch (error) {
      console.error('Error generating preview:', error);
      return '';
    }
  }
}

export const excalidrawService = new ExcalidrawService();