import React, { useState } from 'react';
import { 
  Layers, 
  Image, 
  Layout, 
  History,
  Type,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Paintbrush,
  Package,
  LayoutTemplate
} from 'lucide-react';
import { fabric } from 'fabric';
import { PanelType } from '@/types';
import { useEditorStore } from '@/stores/editorStore';
import { LayerPanel } from './LayerPanel';
import { TemplateTooltip } from '../UI/TemplateTooltip';
import { templates, templateCategories } from '../../data/templates';
import { AssetPanel } from './AssetPanel';
import { StandardAssetPanel } from './StandardAssetPanel';
import { HistoryPanel } from './HistoryPanel';
import { textCategories, getTextEffectsByCategory, TextEffect } from '@/data/textEffects';
import { drawingCategories, getDrawingToolsByCategory, DrawingTool, createFabricObject } from '@/data/drawingTools';

interface LeftPanelProps {
  className?: string;
}

interface PanelTab {
  id: PanelType;
  icon: React.ComponentType<any>;
  label: string;
}

const panelTabs: PanelTab[] = [
  { id: 'layers', icon: Layers, label: '图层' },
  { id: 'text', icon: Type, label: '文本' },
  { id: 'draw', icon: Paintbrush, label: '绘制' },
  { id: 'images', icon: ImageIcon, label: '图片' },
  { id: 'assets', icon: Package, label: '素材' },
  { id: 'templates', icon: LayoutTemplate, label: '模板' },
  { id: 'history', icon: History, label: '历史' },
];

export const LeftPanel: React.FC<LeftPanelProps> = ({ className = '' }) => {
  const { activePanel, setActivePanel, canvas } = useEditorStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTabClick = (panelId: PanelType) => {
    if (activePanel === panelId) {
      setActivePanel(null);
    } else {
      setActivePanel(panelId);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setActivePanel(null);
    }
  };

  if (isCollapsed) {
    return (
      <div className={`w-12 bg-white border-r border-gray-200 flex flex-col ${className}`}>
        {/* 折叠状态的标签页 */}
        <div className="flex flex-col">
          {panelTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setIsCollapsed(false);
                  setActivePanel(tab.id);
                }}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 border-b border-gray-100"
                title={tab.label}
              >
                <Icon size={20} className="text-gray-600" />
              </button>
            );
          })}
        </div>
        
        {/* 展开按钮 */}
        <button
          onClick={toggleCollapse}
          className="mt-auto w-12 h-12 flex items-center justify-center hover:bg-gray-50 border-t border-gray-100"
          title="展开面板"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-white border-r border-gray-200 flex ${className}`}>
      {/* 标签页 */}
      <div className="w-12 bg-gray-50 border-r border-gray-200 flex flex-col">
        {panelTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePanel === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`w-12 h-12 flex items-center justify-center hover:bg-gray-100 border-b border-gray-200 ${
                isActive ? 'bg-white text-primary-600 border-r-2 border-r-primary-600' : 'text-gray-600'
              }`}
              title={tab.label}
            >
              <Icon size={20} />
            </button>
          );
        })}
        
        {/* 折叠按钮 */}
        <button
          onClick={toggleCollapse}
          className="mt-auto w-12 h-12 flex items-center justify-center hover:bg-gray-100 border-t border-gray-200 text-gray-600"
          title="折叠面板"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* 面板内容 */}
      <div className="flex-1 flex flex-col">
        {activePanel && (
          <>
            <div className="panel-header">
              {panelTabs.find(tab => tab.id === activePanel)?.label}
            </div>
            <div className="panel-content scrollbar-thin">
              {activePanel === 'layers' && <LayerPanel />}
              {activePanel === 'text' && <TextPanel />}
              {activePanel === 'draw' && <DrawPanel />}
              {activePanel === 'images' && <ImagesPanel />}
              {activePanel === 'assets' && <StandardAssetPanel />}
              {activePanel === 'templates' && <TemplatesPanel />}
              {activePanel === 'history' && <HistoryPanel />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};





// 文本面板
const TextPanel: React.FC = () => {
  const { canvas } = useEditorStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // 添加普通文本
  const addPlainText = () => {
    if (!canvas) {
      console.warn('Canvas not available for plain text');
      return;
    }

    try {
      const text = new fabric.Text('点击编辑文本', {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fill: '#333333',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      console.log('Plain text added successfully');
    } catch (error) {
      console.error('Error adding plain text:', error);
    }
  };

  // 添加富文本
  const addRichText = () => {
    if (!canvas) {
      console.warn('Canvas not available for rich text');
      return;
    }

    try {
      const text = new fabric.Text('富文本样式', {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        fontSize: 32,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#2563eb',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        shadow: '2px 2px 4px rgba(0,0,0,0.3)',
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      console.log('Rich text added successfully');
    } catch (error) {
      console.error('Error adding rich text:', error);
    }
  };

  // 添加特效文本
  const addEffectText = (effect: TextEffect) => {
    if (!canvas) {
      console.warn('Canvas not available');
      return;
    }

    try {
      // 基础文本选项
      const textOptions: any = {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        originX: 'center',
        originY: 'center',
        fontSize: effect.style.fontSize || 32,
        fontFamily: effect.style.fontFamily || 'Arial',
        fontWeight: effect.style.fontWeight || 'normal',
        fontStyle: effect.style.fontStyle || 'normal',
        textAlign: effect.style.textAlign || 'center',
        letterSpacing: effect.style.letterSpacing || 0,
        lineHeight: effect.style.lineHeight || 1.2,
      };

      // 处理文本变换
      let displayText = effect.preview;
      if (effect.style.textTransform === 'uppercase') {
        displayText = displayText.toUpperCase();
      } else if (effect.style.textTransform === 'lowercase') {
        displayText = displayText.toLowerCase();
      }

      // 处理渐变填充
      if (effect.style.gradient) {
        const gradient = new fabric.Gradient({
          type: effect.style.gradient.type,
          coords: effect.style.gradient.type === 'linear' 
            ? { x1: 0, y1: 0, x2: 100, y2: 100 }
            : { x1: 50, y1: 50, x2: 50, y2: 50, r1: 0, r2: 50 },
          colorStops: effect.style.gradient.colors.map((color, index) => ({
            offset: index / (effect.style.gradient!.colors.length - 1),
            color
          }))
        });
        textOptions.fill = gradient;
      } else {
        textOptions.fill = effect.style.fill || '#333333';
      }

      // 处理描边
      if (effect.style.stroke) {
        textOptions.stroke = effect.style.stroke;
        textOptions.strokeWidth = effect.style.strokeWidth || 1;
      }

      // 处理阴影
      if (effect.style.shadow) {
        textOptions.shadow = effect.style.shadow;
      }

      // 创建文本对象
      const text = new fabric.Text(displayText, textOptions);

      // 如果有背景色，创建带背景的组合
      if (effect.style.backgroundColor) {
        // 计算文本尺寸
        const textBounds = text.getBoundingRect();
        const padding = effect.style.padding || 10;
        
        const rect = new fabric.Rect({
          left: 0,
          top: 0,
          width: textBounds.width + padding * 2,
          height: textBounds.height + padding * 2,
          fill: effect.style.backgroundColor,
          rx: effect.style.borderRadius || 0,
          ry: effect.style.borderRadius || 0,
          originX: 'center',
          originY: 'center',
        });

        // 调整文本位置相对于背景
        text.set({
          left: 0,
          top: 0,
          originX: 'center',
          originY: 'center',
        });

        const group = new fabric.Group([rect, text], {
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          originX: 'center',
          originY: 'center',
        });

        canvas.add(group);
        canvas.setActiveObject(group);
      } else {
        canvas.add(text);
        canvas.setActiveObject(text);
      }

      canvas.renderAll();
      console.log('Text effect added successfully:', effect.name);
    } catch (error) {
      console.error('Error adding text effect:', error);
    }
  };

  // 切换分类展开状态
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 添加文本按钮 */}
      <div className="p-4 border-b border-gray-100 space-y-2">
        <button
          onClick={addPlainText}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + 普通文本
        </button>
        <button
          onClick={addRichText}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
        >
          + 富文本
        </button>
      </div>

      {/* 特效文本分类 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">特效文本</h4>
          <div className="space-y-2">
            {textCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              const effects = getTextEffectsByCategory(category.id);
              
              return (
                <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* 分类标题 */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </button>

                  {/* 分类内容 */}
                  {isExpanded && (
                    <div className="p-3 bg-white">
                      <div className="grid grid-cols-2 gap-2">
                        {effects.map((effect) => (
                          <button
                            key={effect.id}
                            onClick={() => addEffectText(effect)}
                            className="p-2 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors text-center group"
                          >
                            <div 
                              className="text-sm font-medium mb-1 truncate"
                              style={{
                                fontSize: Math.min(effect.style.fontSize || 16, 14),
                                fontFamily: effect.style.fontFamily,
                                fontWeight: effect.style.fontWeight,
                                color: typeof effect.style.fill === 'string' ? effect.style.fill : '#333',
                                textShadow: effect.style.shadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none'
                              }}
                            >
                              {effect.preview}
                            </div>
                            <div className="text-xs text-gray-500 group-hover:text-blue-600">
                              {effect.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// 图片面板
const ImagesPanel: React.FC = () => {
  const { canvas } = useEditorStore();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // 示例图片
  const sampleImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  ];

  // 添加图片到画布
  const addImageToCanvas = (imageUrl: string) => {
    if (!canvas) return;

    fabric.Image.fromURL(imageUrl, (img) => {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const maxSize = Math.min(canvasWidth, canvasHeight) * 0.5;
      
      const scale = Math.min(
        maxSize / (img.width || 1),
        maxSize / (img.height || 1)
      );
      
      img.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
      });
      
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };

  // 处理文件上传
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImages(prev => [...prev, imageUrl]);
        addImageToCanvas(imageUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 上传区域 */}
      <div className="p-4 border-b border-gray-100">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files);
            input.click();
          }}
        >
          <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">点击或拖拽上传图片</p>
          <p className="text-xs text-gray-500 mt-1">支持 JPG, PNG, GIF 格式</p>
        </div>
      </div>

      {/* 已上传的图片 */}
      {uploadedImages.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">已上传</h4>
          <div className="grid grid-cols-2 gap-2">
            {uploadedImages.map((imageUrl, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => addImageToCanvas(imageUrl)}
              >
                <img src={imageUrl} alt={`上传图片 ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 示例图片 */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">示例图片</h4>
        <div className="grid grid-cols-2 gap-2">
          {sampleImages.map((imageUrl, index) => (
            <div
              key={index}
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => addImageToCanvas(imageUrl)}
            >
              <img src={imageUrl} alt={`示例图片 ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 模板面板
const TemplatesPanel: React.FC = () => {
  const { canvas, updateCanvasState, setLoading } = useEditorStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);

  // 安全的Base64编码函数，支持中文字符
  const safeBase64Encode = (str: string) => {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      console.error('Base64 encoding failed:', e);
      return '';
    }
  };

  // 基于Canvas生成高质量预览图
  const generateCanvasThumbnail = (template: any): Promise<string> => {
    return new Promise((resolve) => {
      const aspectRatio = template.width / template.height;
      const thumbWidth = 400; // 提高分辨率
      const thumbHeight = Math.round(thumbWidth / aspectRatio);
      
      // 创建高分辨率临时canvas用于生成预览
      const highResWidth = thumbWidth;
      const highResHeight = thumbHeight;
      
      const tempCanvas = new fabric.Canvas(null, {
        width: highResWidth,
        height: highResHeight,
        backgroundColor: '#ffffff',
        enableRetinaScaling: true // 启用高DPI支持
      });
      
      const templateObjects = template.objects?.objects || [];
      const scaleX = highResWidth / template.width;
      const scaleY = highResHeight / template.height;
      
      const fabricObjects: fabric.Object[] = [];
      
      templateObjects.forEach((objData: any) => {
        try {
          let fabricObj: fabric.Object | null = null;
          
          switch (objData.type) {
            case 'rect':
              fabricObj = new fabric.Rect({
                left: (objData.left || 0) * scaleX,
                top: (objData.top || 0) * scaleY,
                width: (objData.width || 100) * scaleX,
                height: (objData.height || 100) * scaleY,
                fill: objData.fill || '#000000',
                stroke: objData.stroke || undefined,
                strokeWidth: (objData.strokeWidth || 0) * Math.min(scaleX, scaleY),
                rx: (objData.rx || 0) * scaleX,
                ry: (objData.ry || 0) * scaleY,
                selectable: false,
                evented: false
              });
              break;
              
            case 'circle':
              fabricObj = new fabric.Circle({
                left: (objData.left || 0) * scaleX,
                top: (objData.top || 0) * scaleY,
                radius: (objData.radius || 50) * Math.min(scaleX, scaleY),
                fill: objData.fill || '#000000',
                stroke: objData.stroke || undefined,
                strokeWidth: (objData.strokeWidth || 0) * Math.min(scaleX, scaleY),
                opacity: objData.opacity || 1,
                selectable: false,
                evented: false
              });
              break;
              
            case 'text':
              const text = objData.text || 'Text';
              const fontSize = Math.max(6, (objData.fontSize || 20) * Math.min(scaleX, scaleY));
              
              fabricObj = new fabric.Text(text, {
                left: (objData.left || 0) * scaleX,
                top: (objData.top || 0) * scaleY,
                fontSize: fontSize,
                fontFamily: objData.fontFamily || 'Arial',
                fontWeight: objData.fontWeight || 'normal',
                fill: objData.fill || '#000000',
                textAlign: objData.textAlign || 'left',
                lineHeight: objData.lineHeight || 1.2,
                charSpacing: (objData.charSpacing || 0) * scaleX,
                originX: objData.originX || 'left',
                originY: objData.originY || 'top',
                selectable: false,
                evented: false
              });
              break;
              
            case 'line':
              fabricObj = new fabric.Line([
                (objData.left || 0) + (objData.x1 || 0) * scaleX,
                (objData.top || 0) + (objData.y1 || 0) * scaleY,
                (objData.left || 0) + (objData.x2 || 100) * scaleX,
                (objData.top || 0) + (objData.y2 || 0) * scaleY
              ], {
                stroke: objData.stroke || '#000000',
                strokeWidth: (objData.strokeWidth || 1) * Math.min(scaleX, scaleY),
                selectable: false,
                evented: false
              });
              break;
              
            case 'triangle':
              fabricObj = new fabric.Triangle({
                left: (objData.left || 0) * scaleX,
                top: (objData.top || 0) * scaleY,
                width: (objData.width || 100) * scaleX,
                height: (objData.height || 100) * scaleY,
                fill: objData.fill || '#000000',
                angle: objData.angle || 0,
                selectable: false,
                evented: false
              });
              break;
          }
          
          if (fabricObj) {
            fabricObjects.push(fabricObj);
          }
        } catch (error) {
          console.warn('Error creating preview object:', objData.type, error);
        }
      });
      
      // 批量添加对象
      if (fabricObjects.length > 0) {
        fabricObjects.forEach(obj => tempCanvas.add(obj));
        tempCanvas.renderAll();
        
        // 生成高质量预览图
        setTimeout(() => {
          const dataURL = tempCanvas.toDataURL({
            format: 'png',
            quality: 1.0, // 提高质量
            multiplier: 1, // 使用1倍倍数，因为我们已经使用了高分辨率canvas
            enableRetinaScaling: true
          });
          
          // 清理临时canvas
          tempCanvas.dispose();
          resolve(dataURL);
        }, 30); // 减少延迟
      } else {
        // 如果没有对象，生成默认预览
        tempCanvas.dispose();
        resolve(`data:image/svg+xml;base64,${safeBase64Encode(`
          <svg width="${thumbWidth}" height="${thumbHeight}" viewBox="0 0 ${thumbWidth} ${thumbHeight}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${thumbWidth}" height="${thumbHeight}" fill="#f8fafc"/>
            <rect x="20" y="20" width="${thumbWidth-40}" height="${thumbHeight-40}" fill="none" stroke="#e5e7eb" stroke-width="2" stroke-dasharray="5,5"/>
            <text x="${thumbWidth/2}" y="${thumbHeight/2}" text-anchor="middle" fill="#6b7280" font-size="12">Template</text>
          </svg>
        `)}`);
      }
    });
  };

  // 模板预览图缓存
  const [thumbnailCache, setThumbnailCache] = React.useState<Record<string, string>>({});
  const [generatingThumbnails, setGeneratingThumbnails] = React.useState<Set<string>>(new Set());
  
  // 生成临时预览图
  const getTemporaryThumbnail = (template: any) => {
    const aspectRatio = template.width / template.height;
    const thumbWidth = 200;
    const thumbHeight = Math.round(thumbWidth / aspectRatio);
    // 返回临时的简化预览图，基于模板的主要特征
    const templateObjects = template.objects?.objects || [];
    const bgColor = templateObjects.find((obj: any) => obj.type === 'rect' && obj.left === 0 && obj.top === 0)?.fill || '#ffffff';
    return `data:image/svg+xml;base64,${safeBase64Encode(`
      <svg width="${thumbWidth}" height="${thumbHeight}" viewBox="0 0 ${thumbWidth} ${thumbHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${thumbWidth}" height="${thumbHeight}" fill="${bgColor}"/>
        <rect x="10" y="10" width="${thumbWidth-20}" height="${thumbHeight-20}" fill="none" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>
        <text x="${thumbWidth/2}" y="${thumbHeight/2}" text-anchor="middle" fill="#6b7280" font-size="10" font-family="Arial">${template.name}</text>
        <text x="${thumbWidth/2}" y="${thumbHeight/2 + 15}" text-anchor="middle" fill="#9ca3af" font-size="8" font-family="Arial">Loading...</text>
      </svg>
    `)}`;
  };
  
  // 生成模板预览图的函数
  const generateThumbnail = (template: any) => {
    // 如果已经有缓存的预览图，直接返回
    if (thumbnailCache[template.id]) {
      return thumbnailCache[template.id];
    }
    
    // 如果正在生成中，返回临时预览图
    if (generatingThumbnails.has(template.id)) {
      return getTemporaryThumbnail(template);
    }
    
    // 标记为生成中
    setGeneratingThumbnails(prev => new Set([...prev, template.id]));
    
    // 异步生成高质量预览图
    generateCanvasThumbnail(template).then(dataURL => {
      setThumbnailCache(prev => ({
        ...prev,
        [template.id]: dataURL
      }));
      setGeneratingThumbnails(prev => {
        const newSet = new Set(prev);
        newSet.delete(template.id);
        return newSet;
      });
    }).catch(error => {
      console.warn('Failed to generate canvas thumbnail:', error);
      setGeneratingThumbnails(prev => {
        const newSet = new Set(prev);
        newSet.delete(template.id);
        return newSet;
      });
    });
    
    return getTemporaryThumbnail(template);
  };

  // 预加载前几个模板的预览图
  React.useEffect(() => {
    const preloadThumbnails = async () => {
      // 预加载前6个模板的预览图
      const templatesToPreload = templates.slice(0, 6);
      for (const template of templatesToPreload) {
        if (!thumbnailCache[template.id] && !generatingThumbnails.has(template.id)) {
          generateThumbnail(template);
          // 添加小延迟避免阻塞UI
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    };
    preloadThumbnails();
  }, []);

  // 使用真实的模板数据
  const mockTemplates = React.useMemo(() => templates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    thumbnail: thumbnailCache[template.id] || generateThumbnail(template),
    category: template.category,
    tags: template.tags,
    width: template.width,
    height: template.height,
    objects: template.objects.objects || []
  })), [thumbnailCache, generatingThumbnails]);

  const mockCategories = React.useMemo(() => {
    const categoryCounts = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categories = [
      { id: 'all', name: '全部', icon: '📋', count: templates.length },
      ...templateCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        count: categoryCounts[cat.id] || 0
      }))
    ];

    return categories;
  }, []);

  const getTemplatesByCategory = React.useCallback((categoryId: string) => 
    categoryId === 'all' ? mockTemplates : mockTemplates.filter(t => t.category === categoryId),
    [mockTemplates]
  );

  const searchTemplates = React.useCallback((query: string) => 
    mockTemplates.filter(t => t.name.toLowerCase().includes(query.toLowerCase())),
    [mockTemplates]
  );

  // 过滤模板
  React.useEffect(() => {
    let filtered = mockTemplates;
    
    if (selectedCategory !== 'all') {
      filtered = getTemplatesByCategory(selectedCategory);
    }
    
    if (searchQuery) {
      filtered = searchTemplates(searchQuery);
    }
    
    setFilteredTemplates(filtered);
  }, [selectedCategory, searchQuery, mockTemplates, getTemplatesByCategory, searchTemplates]);

  // 应用模板到画布
  const applyTemplate = async (template: any) => {
    if (!canvas) {
      console.warn('Canvas not available');
      return;
    }

    try {
      setLoading(true);
      console.log('Applying template:', template.name);
      
      // 清空画布
      canvas.clear();
      
      // 设置画布尺寸
      canvas.setDimensions({
        width: template.width || 800,
        height: template.height || 600
      });
      
      const templateObjects = template.objects || [];
      
      // 使用Fabric.js的原生JSON加载功能，性能更好
      try {
        const templateData = {
          version: '5.3.0',
          objects: templateObjects
        };
        
        // 使用loadFromJSON进行高效加载
        canvas.loadFromJSON(templateData, () => {
          console.log('Template loaded successfully via JSON');
          canvas.renderAll();
          setLoading(false);
        }, (o: any, object: fabric.Object) => {
          // 确保对象可选择和可编辑
          if (object) {
            object.set({
              selectable: true,
              evented: true
            });
          }
        });
        
        return; // 使用JSON加载，直接返回
      } catch (jsonError) {
        console.warn('JSON loading failed, falling back to manual creation:', jsonError);
      }
      
      // 备用方案：手动创建对象
      const fabricObjects = [];
      
      for (const objData of templateObjects) {
        try {
          let fabricObj = null;
          
          switch (objData.type) {
            case 'rect':
              fabricObj = new fabric.Rect({
                left: objData.left || 0,
                top: objData.top || 0,
                width: objData.width || 100,
                height: objData.height || 100,
                fill: objData.fill || '#000000',
                stroke: objData.stroke || null,
                strokeWidth: objData.strokeWidth || 0,
                rx: objData.rx || 0,
                ry: objData.ry || 0,
                opacity: objData.opacity || 1,
                selectable: objData.selectable !== false,
                evented: objData.evented !== false
              });
              break;
              
            case 'circle':
              fabricObj = new fabric.Circle({
                left: objData.left || 0,
                top: objData.top || 0,
                radius: objData.radius || 50,
                fill: objData.fill || '#000000',
                stroke: objData.stroke || null,
                strokeWidth: objData.strokeWidth || 0,
                opacity: objData.opacity || 1,
                selectable: objData.selectable !== false,
                evented: objData.evented !== false
              });
              break;
              
            case 'text':
              fabricObj = new fabric.Text(objData.text || 'Text', {
                left: objData.left || 0,
                top: objData.top || 0,
                fontSize: objData.fontSize || 20,
                fontFamily: objData.fontFamily || 'Arial',
                fontWeight: objData.fontWeight || 'normal',
                fill: objData.fill || '#000000',
                originX: objData.originX || 'left',
                originY: objData.originY || 'top',
                textAlign: objData.textAlign || 'left',
                lineHeight: objData.lineHeight || 1.2,
                charSpacing: objData.charSpacing || 0,
                selectable: objData.selectable !== false,
                evented: objData.evented !== false
              });
              break;
              
            case 'line':
              fabricObj = new fabric.Line([
                objData.x1 || 0,
                objData.y1 || 0,
                objData.x2 || 100,
                objData.y2 || 0
              ], {
                left: objData.left || 0,
                top: objData.top || 0,
                stroke: objData.stroke || '#000000',
                strokeWidth: objData.strokeWidth || 1,
                selectable: objData.selectable !== false,
                evented: objData.evented !== false
              });
              break;
              
            case 'triangle':
              fabricObj = new fabric.Triangle({
                left: objData.left || 0,
                top: objData.top || 0,
                width: objData.width || 100,
                height: objData.height || 100,
                fill: objData.fill || '#000000',
                angle: objData.angle || 0,
                selectable: objData.selectable !== false,
                evented: objData.evented !== false
              });
              break;
              
            default:
              console.warn('Unknown object type:', objData.type);
              continue;
          }
          
          if (fabricObj) {
            fabricObjects.push(fabricObj);
          }
        } catch (objError) {
          console.error('Error creating object:', objData.type, objError);
        }
      }
      
      // 使用更高效的批量添加方式
      if (fabricObjects.length > 0) {
        // 禁用渲染以提高性能
        canvas.renderOnAddRemove = false;
        
        // 使用批量添加提高性能
        canvas.add(...fabricObjects);
        
        // 重新启用渲染并执行一次渲染
        canvas.renderOnAddRemove = true;
        canvas.renderAll(); // 使用同步渲染确保立即显示
      } else {
        // 重新启用渲染
        canvas.renderOnAddRemove = true;
      }
      
      console.log('Template applied successfully, total objects:', canvas.getObjects().length);
      
    } catch (error) {
      console.error('Failed to apply template:', error);
    } finally {
      // 隐藏加载状态
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 搜索框 */}
      <div className="p-4 border-b border-gray-100">
        <input
          type="text"
          placeholder="搜索模板..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* 分类标签 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {mockCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 模板列表 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredTemplates.map((template) => (
              <TemplateTooltip
                key={template.id}
                template={template}
                position="right"
              >
                <div
                  className="group cursor-pointer"
                  onClick={() => {
                    console.log('Template card clicked:', template.name);
                    applyTemplate(template);
                  }}
                >
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-2 group-hover:shadow-md transition-shadow">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                        style={{ imageRendering: 'crisp-edges' }}
                        onError={(e) => {
                          // 如果图片加载失败，显示默认图标
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-blue-50 to-purple-50">
                                <span class="text-3xl">📄</span>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-blue-50 to-purple-50">
                        <span className="text-3xl">📄</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs">
                    <div className="font-medium text-gray-900 truncate">{template.name}</div>
                    <div className="text-gray-500">{template.width} × {template.height}</div>
                  </div>
                </div>
              </TemplateTooltip>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">
              {searchQuery ? '未找到匹配的模板' : '该分类暂无模板'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 绘制面板
const DrawPanel: React.FC = () => {
  const { canvas } = useEditorStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedBrush, setSelectedBrush] = useState<DrawingTool | null>(null);

  // 添加绘制对象到画布
  const addDrawingObject = (tool: DrawingTool) => {
    if (!canvas) {
      console.warn('Canvas not available for drawing');
      return;
    }

    try {
      if (tool.config.type === 'brush') {
        // 启用自由绘制模式
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = tool.config.strokeWidth || 5;
        canvas.freeDrawingBrush.color = tool.config.stroke || '#000000';
        
        // 根据画笔类型设置不同的绘制效果
        switch (tool.config.brushType) {
          case 'pencil':
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            break;
          case 'pen':
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.width = tool.config.strokeWidth || 3;
            break;
          case 'marker':
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.width = tool.config.strokeWidth || 8;
            break;
          case 'brush':
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.width = tool.config.strokeWidth || 5;
            break;
          case 'spray':
            if ((fabric as any).SprayBrush) {
              canvas.freeDrawingBrush = new (fabric as any).SprayBrush(canvas);
              canvas.freeDrawingBrush.width = tool.config.strokeWidth || 10;
            }
            break;
          case 'chalk':
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.width = tool.config.strokeWidth || 6;
            break;
          case 'charcoal':
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.width = tool.config.strokeWidth || 4;
            break;
          case 'highlighter':
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.width = tool.config.strokeWidth || 12;
            break;
          default:
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        }
        
        canvas.freeDrawingBrush.color = tool.config.stroke || '#000000';
        setSelectedBrush(tool);
        console.log('Drawing mode enabled:', tool.name);
      } else {
        // 禁用绘制模式，添加形状或线条
        canvas.isDrawingMode = false;
        setSelectedBrush(null);
        
        const centerX = canvas.getWidth() / 2;
        const centerY = canvas.getHeight() / 2;
        
        const fabricObject = createFabricObject(tool, centerX, centerY);
        
        if (fabricObject) {
          canvas.add(fabricObject);
          canvas.setActiveObject(fabricObject);
          canvas.renderAll();
          console.log('Drawing object added:', tool.name);
        }
      }
    } catch (error) {
      console.error('Error adding drawing object:', error);
    }
  };

  // 停止绘制模式
  const stopDrawingMode = () => {
    if (canvas) {
      canvas.isDrawingMode = false;
      setSelectedBrush(null);
      canvas.renderAll();
    }
  };

  // 切换分类展开状态
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 绘制模式状态 */}
      {selectedBrush && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{selectedBrush.icon}</span>
              <div>
                <div className="text-sm font-medium text-blue-900">{selectedBrush.name}绘制中</div>
                <div className="text-xs text-blue-600">在画布上拖拽进行绘制</div>
              </div>
            </div>
            <button
              onClick={stopDrawingMode}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              停止绘制
            </button>
          </div>
        </div>
      )}

      {/* 绘制工具分类 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">绘制工具</h4>
          <div className="space-y-2">
            {drawingCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              const tools = getDrawingToolsByCategory(category.id);
              
              return (
                <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* 分类标题 */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </button>

                  {/* 分类内容 */}
                  {isExpanded && (
                    <div className="p-3 bg-white">
                      <div className="grid grid-cols-2 gap-2">
                        {tools.map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => addDrawingObject(tool)}
                            className={`p-2 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors text-center group ${
                              selectedBrush?.id === tool.id ? 'border-blue-500 bg-blue-100' : ''
                            }`}
                          >
                            <div className="text-lg mb-1">{tool.icon}</div>
                            <div className="text-xs font-medium text-gray-900 truncate mb-1">
                              {tool.name}
                            </div>
                            <div className="text-xs text-gray-500 group-hover:text-blue-600">
                              {tool.description}
                            </div>
                            {tool.config.type === 'brush' && selectedBrush?.id === tool.id && (
                              <div className="text-xs text-blue-600 mt-1 font-medium">
                                绘制中...
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 绘制设置 */}
      {selectedBrush && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h5 className="text-sm font-medium text-gray-700 mb-2">绘制设置</h5>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">画笔大小</label>
              <input
                type="range"
                min="1"
                max="50"
                value={selectedBrush.config.strokeWidth || 5}
                onChange={(e) => {
                  const width = Number(e.target.value);
                  if (canvas && canvas.freeDrawingBrush) {
                    canvas.freeDrawingBrush.width = width;
                  }
                  setSelectedBrush({
                    ...selectedBrush,
                    config: { ...selectedBrush.config, strokeWidth: width }
                  });
                }}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">
                {selectedBrush.config.strokeWidth || 5}px
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">颜色</label>
              <input
                type="color"
                value={selectedBrush.config.stroke || '#000000'}
                onChange={(e) => {
                  const color = e.target.value;
                  if (canvas && canvas.freeDrawingBrush) {
                    canvas.freeDrawingBrush.color = color;
                  }
                  setSelectedBrush({
                    ...selectedBrush,
                    config: { ...selectedBrush.config, stroke: color }
                  });
                }}
                className="w-full h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};