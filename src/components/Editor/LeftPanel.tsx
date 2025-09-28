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
  ChevronUp
} from 'lucide-react';
import { fabric } from 'fabric';
import { PanelType } from '@/types';
import { useEditorStore } from '@/stores/editorStore';
import { LayerPanel } from './LayerPanel';
import { AssetPanel } from './AssetPanel';
import { HistoryPanel } from './HistoryPanel';
import { textCategories, getTextEffectsByCategory, TextEffect } from '@/data/textEffects';

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
  { id: 'images', icon: ImageIcon, label: '图片' },
  { id: 'assets', icon: Image, label: '素材' },
  { id: 'templates', icon: Layout, label: '模板' },
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
              {activePanel === 'images' && <ImagesPanel />}
              {activePanel === 'assets' && <AssetPanel />}
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

  // 模板数据
  const mockTemplates = React.useMemo(() => [
    {
      id: 'template-1',
      name: '简约商务海报',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjRjhGQUZDIi8+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzk4MkY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+5ZWG5Yqh5rW35oqlPC90ZXh0Pgo8dGV4dCB4PSIyMCIgeT0iMTQwIiBmaWxsPSIjMzc0MTUxIiBmb250LXNpemU9IjEyIj7kuJvliqHlhoXlrrk8L3RleHQ+CjxyZWN0IHg9IjE1MCIgeT0iMTYwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiMzOTgyRjYiIG9wYWNpdHk9IjAuMyIvPgo8L3N2Zz4=',
      category: 'business',
      width: 800,
      height: 1200
    },
    {
      id: 'template-2',
      name: 'Instagram 故事',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmY5YTllO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZWNmZWY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyODAiIGZpbGw9InVybCgjZ3JhZCkiLz4KPHR5ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiPuS7iuaXpeWIhuS6qzwvdGV4dD4KPGNpcmNsZSBjeD0iNTAiIGN5PSIyMDAiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjIyMCIgcj0iMTAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjIiLz4KPC9zdmc+',
      category: 'social',
      width: 1080,
      height: 1920
    },
    {
      id: 'template-3',
      name: '音乐节海报',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjMUExQTFBIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRjZCNkIiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5NVVNJQyBGRVNUPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjkwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMiI+MjAyNC4wNy4xNTwvdGV4dD4KPGxpbmUgeDE9IjUwIiB5MT0iMTIwIiB4Mj0iMTUwIiB5Mj0iMTIwIiBzdHJva2U9IiNGRjZCNkIiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTAiPueJuemCgOiJuuS6ujwvdGV4dD4KPC9zdmc+',
      category: 'event',
      width: 800,
      height: 1200
    }
  ], []);

  const mockCategories = React.useMemo(() => [
    { id: 'all', name: '全部', icon: '📋', count: 3 },
    { id: 'business', name: '商务', icon: '💼', count: 1 },
    { id: 'social', name: '社交', icon: '📱', count: 1 },
    { id: 'event', name: '活动', icon: '🎉', count: 1 }
  ], []);

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

  // 应用模板
  const applyTemplate = async (template: any) => {
    if (!canvas) return;
    
    setLoading(true);
    
    try {
      // 清空画布
      canvas.clear();
      
      // 设置画布尺寸
      updateCanvasState({
        width: template.width,
        height: template.height
      });
      
      // 这里应该加载模板的实际对象数据
      // 暂时添加一些示例对象
      const text = new fabric.Text(template.name, {
        left: template.width / 2,
        top: 100,
        fontSize: 32,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#333333',
        textAlign: 'center',
        originX: 'center',
        originY: 'center'
      });
      
      canvas.add(text);
      canvas.renderAll();
      
    } catch (error) {
      console.error('Failed to apply template:', error);
    } finally {
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
              <div
                key={template.id}
                className="group cursor-pointer"
                onClick={() => applyTemplate(template)}
              >
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-2 group-hover:shadow-md transition-shadow">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="text-xs">
                  <div className="font-medium text-gray-900 truncate">{template.name}</div>
                  <div className="text-gray-500">{template.width} × {template.height}</div>
                </div>
              </div>
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

