import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Search, Plus, Upload, FolderPlus, X, Package, Palette } from 'lucide-react';
import { standardAssets, searchAssets, AssetItem, AssetCategory } from '@/data/standardAssets';
import { useEditorStore } from '@/stores/editorStore';
import { fabric } from 'fabric';
import * as LucideIcons from 'lucide-react';
import { ExcalidrawAssetPanel } from './ExcalidrawAssetPanel';
import { Tooltip } from '../UI/Tooltip';

interface StandardAssetPanelProps {
  className?: string;
}

export const StandardAssetPanel: React.FC<StandardAssetPanelProps> = ({ className = '' }) => {
  const { canvas } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'standard' | 'excalidraw' | 'custom'>('standard');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['basic-shapes']));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AssetItem[]>([]);
  const [customCategories, setCustomCategories] = useState<AssetCategory[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const standardResults = searchAssets(query);
      const customResults = customCategories.flatMap(cat => 
        cat.assets.filter(asset => 
          asset.name.toLowerCase().includes(query.toLowerCase()) ||
          asset.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
      );
      setSearchResults([...standardResults, ...customResults]);
    } else {
      setSearchResults([]);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (files: FileList, categoryId?: string) => {
    if (!files || files.length === 0) return;

    const targetCategoryId = categoryId || 'custom';
    let targetCategory = customCategories.find(cat => cat.id === targetCategoryId);
    
    if (!targetCategory) {
      targetCategory = {
        id: targetCategoryId,
        name: '自定义素材',
        icon: 'Package',
        assets: []
      };
      setCustomCategories(prev => [...prev, targetCategory!]);
    }

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const newAsset: AssetItem = {
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            icon: 'Image',
            category: targetCategoryId,
            tags: ['自定义', '上传'],
            imageUrl
          };

          setCustomCategories(prev => 
            prev.map(cat => 
              cat.id === targetCategoryId 
                ? { ...cat, assets: [...cat.assets, newAsset] }
                : cat
            )
          );
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  };

  // 创建新分类
  const createNewCategory = (name: string, icon: string) => {
    const newCategory: AssetCategory = {
      id: `custom-${Date.now()}`,
      name,
      icon,
      assets: []
    };
    setCustomCategories(prev => [...prev, newCategory]);
    setExpandedCategories(prev => new Set([...prev, newCategory.id]));
  };

  // 添加自定义图片素材到画布
  const addCustomImageToCanvas = async (asset: AssetItem) => {
    if (!canvas || !asset.imageUrl) return;

    try {
      fabric.Image.fromURL(asset.imageUrl, (img) => {
        const maxSize = 200;
        const scale = Math.min(
          maxSize / (img.width || 1),
          maxSize / (img.height || 1)
        );
        
        img.set({
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' });
    } catch (error) {
      console.error('Failed to add custom image:', error);
    }
  };

  // 添加素材到画布
  const addAssetToCanvas = async (asset: AssetItem) => {
    if (!canvas) return;

    try {
      // 如果是自定义图片素材
      if (asset.imageUrl) {
        await addCustomImageToCanvas(asset);
        return;
      }

      let fabricObject;

      if (asset.category === 'basic-shapes') {
        fabricObject = createBasicShape(asset);
      } else if (asset.category === 'hand-drawn') {
        fabricObject = createHandDrawnShape(asset);
      } else if (asset.icon && (LucideIcons as any)[asset.icon]) {
        // 创建SVG图标
        fabricObject = await createSVGIcon(asset);
      } else {
        // 备用方案：创建文本
        fabricObject = createTextFallback(asset);
      }

      if (fabricObject) {
        (fabricObject as any).set({
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          originX: 'center',
          originY: 'center',
        });

        canvas.add(fabricObject);
        canvas.setActiveObject(fabricObject);
        canvas.renderAll();
        
        console.log(`Added ${asset.name} to canvas`);
      }
    } catch (error) {
      console.error('Failed to add asset to canvas:', error);
      // 备用方案
      const fallback = createTextFallback(asset);
      if (fallback) {
        fallback.set({
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          originX: 'center',
          originY: 'center',
        });
        canvas.add(fallback);
        canvas.setActiveObject(fallback);
        canvas.renderAll();
      }
    }
  };

  // 创建基础形状
  const createBasicShape = (asset: AssetItem) => {
    const commonProps = {
      fill: '#3B82F6',
      stroke: '#1E40AF',
      strokeWidth: 2,
      width: 80,
      height: 80,
    };

    switch (asset.id) {
      case 'circle':
        return new fabric.Circle({
          ...commonProps,
          radius: 40,
        });
      case 'square':
        return new fabric.Rect({
          ...commonProps,
          rx: 8,
          ry: 8,
        });
      case 'triangle':
        return new fabric.Triangle({
          ...commonProps,
        });
      case 'star':
        // 创建星形路径
        const starPath = 'M 50,5 L 61,35 L 95,35 L 68,57 L 79,91 L 50,70 L 21,91 L 32,57 L 5,35 L 39,35 Z';
        return new fabric.Path(starPath, {
          fill: '#3B82F6',
          stroke: '#1E40AF',
          strokeWidth: 2,
          scaleX: 0.8,
          scaleY: 0.8,
        });
      case 'heart':
        // 创建心形路径
        const heartPath = 'M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z';
        return new fabric.Path(heartPath, {
          fill: '#EF4444',
          stroke: '#DC2626',
          strokeWidth: 1,
          scaleX: 3,
          scaleY: 3,
        });
      default:
        return new fabric.Rect({
          ...commonProps,
          rx: 8,
          ry: 8,
        });
    }
  };

  // 创建SVG图标
  const createSVGIcon = async (asset: AssetItem): Promise<fabric.Object | null> => {
    return new Promise((resolve) => {
      try {
        // 获取SVG路径数据
        const svgPath = getSVGPathForIcon(asset.icon);
        if (!svgPath) {
          resolve(null);
          return;
        }

        const svgString = `
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${svgPath}
          </svg>
        `;

        fabric.loadSVGFromString(svgString, (objects, options) => {
          const svgObject = fabric.util.groupSVGElements(objects, options);
          if (svgObject) {
            svgObject.set({
              scaleX: 3,
              scaleY: 3,
              fill: '#3B82F6',
              stroke: '#1E40AF',
            });
            resolve(svgObject);
          } else {
            resolve(null);
          }
        });
      } catch (error) {
        console.error('Error creating SVG icon:', error);
        resolve(null);
      }
    });
  };

  // 创建手绘风格形状
  const createHandDrawnShape = (asset: AssetItem) => {
    const roughStyle = {
      fill: 'transparent',
      stroke: '#374151',
      strokeWidth: 2,
      strokeDashArray: [5, 5], // 虚线效果模拟手绘
    };

    switch (asset.id) {
      case 'hand-arrow':
        // 手绘箭头路径
        const arrowPath = 'M 10 50 L 80 50 M 70 40 L 80 50 L 70 60';
        return new fabric.Path(arrowPath, {
          ...roughStyle,
          strokeWidth: 3,
        });
      
      case 'hand-circle':
        return new fabric.Circle({
          radius: 40,
          ...roughStyle,
          strokeDashArray: [3, 2],
        });
      
      case 'hand-rect':
        return new fabric.Rect({
          width: 80,
          height: 60,
          ...roughStyle,
          strokeDashArray: [4, 3],
          rx: 5,
          ry: 5,
        });
      
      case 'hand-line':
        const linePath = 'M 10 50 L 90 50';
        return new fabric.Path(linePath, {
          ...roughStyle,
          strokeDashArray: [6, 4],
        });
      
      case 'hand-star':
        const starPath = 'M 50,10 L 61,35 L 90,35 L 68,57 L 79,85 L 50,70 L 21,85 L 32,57 L 10,35 L 39,35 Z';
        return new fabric.Path(starPath, {
          ...roughStyle,
          strokeDashArray: [2, 2],
        });
      
      case 'hand-cloud':
        const cloudPath = 'M 20,60 Q 10,40 30,40 Q 25,20 50,25 Q 75,15 80,40 Q 95,35 90,55 Q 95,70 75,65 L 25,65 Q 10,70 20,60 Z';
        return new fabric.Path(cloudPath, {
          ...roughStyle,
          strokeDashArray: [3, 2],
        });
      
      case 'hand-speech':
        const speechPath = 'M 10,20 Q 10,10 20,10 L 80,10 Q 90,10 90,20 L 90,50 Q 90,60 80,60 L 30,60 L 20,70 L 25,60 L 20,60 Q 10,60 10,50 Z';
        return new fabric.Path(speechPath, {
          ...roughStyle,
          strokeDashArray: [4, 2],
        });
      
      case 'hand-highlight':
        const highlightPath = 'M 10,45 L 90,45 L 90,55 L 10,55 Z';
        return new fabric.Path(highlightPath, {
          fill: '#FEF08A',
          stroke: '#F59E0B',
          strokeWidth: 1,
          opacity: 0.7,
        });
      
      default:
        return new fabric.Rect({
          width: 80,
          height: 60,
          ...roughStyle,
        });
    }
  };

  // 创建文本备用方案
  const createTextFallback = (asset: AssetItem) => {
    return new fabric.Text(asset.name, {
      fontSize: 24,
      fill: '#3B82F6',
      fontFamily: 'Arial',
      textAlign: 'center',
    });
  };

  // 获取图标的SVG路径
  const getSVGPathForIcon = (iconName: string): string => {
    const iconPaths: { [key: string]: string } = {
      // 基础形状
      'Circle': '<circle cx="12" cy="12" r="10"/>',
      'Square': '<rect width="18" height="18" x="3" y="3" rx="2"/>',
      'Triangle': '<path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.73-2Z"/>',
      'Diamond': '<path d="M6 3h12l4 6-8 12L6 9l4-6z"/>',
      'Hexagon': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
      'Star': '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>',
      'Heart': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>',
      
      // 箭头
      'ArrowUp': '<path d="m3 16 4-4 4 4"/><path d="m11 12 4-4 4 4"/>',
      'ArrowDown': '<path d="m3 8 4 4 4-4"/><path d="m11 12 4 4 4-4"/>',
      'ArrowLeft': '<path d="m12 19-7-7 7-7"/><path d="m19 12-7 7-7-7"/>',
      'ArrowRight': '<path d="m9 18 6-6-6-6"/>',
      'ArrowUpRight': '<path d="M7 7h10v10"/><path d="m7 17 10-10"/>',
      'ArrowDownRight': '<path d="M7 17h10V7"/><path d="m7 7 10 10"/>',
      'ChevronUp': '<path d="m18 15-6-6-6 6"/>',
      'ChevronDown': '<path d="m6 9 6 6 6-6"/>',
      
      // 商务办公
      'Briefcase': '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
      'Building': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h4"/><path d="M6 16h4"/><path d="M16 12h2"/><path d="M16 16h2"/>',
      'BarChart3': '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
      'LineChart': '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
      'PieChart': '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="m22 12-10-10v10z"/>',
      'Target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
      'Trophy': '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55.47.98.97 1.21C12.04 18.75 14 20 14 20s1.96-1.25 3.03-1.79c.5-.23.97-.66.97-1.21v-2.34c0-.59-.49-1.06-1.06-1.06H11.06c-.57 0-1.06.47-1.06 1.06Z"/><path d="M10 14.66V17c0 .55.47.98.97 1.21C12.04 18.75 14 20 14 20s1.96-1.25 3.03-1.79c.5-.23.97-.66.97-1.21v-2.34c0-.59-.49-1.06-1.06-1.06H11.06c-.57 0-1.06.47-1.06 1.06Z"/>',
      'Handshake': '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8.28a2 2 0 0 1 1.42.59l.47.28a5.79 5.79 0 0 0 7.06-.87L21 3"/>',
      
      // 通讯交流
      'MessageCircle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
      'Mail': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
      'Phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
      'Video': '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
      'Megaphone': '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
      'Bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
      'Wifi': '<path d="m12 20 3-3H9l3 3Z"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-5.17-2.69"/>',
      'Signal': '<path d="m2 17 10-10"/><path d="m9 10 3 3"/><path d="m12 7 5 5"/><path d="m22 2-5 5"/>',
      
      // 其他常用图标...
    };
    
    return iconPaths[iconName] || '';
  };

  // 渲染素材项
  const renderAssetItem = (asset: AssetItem) => {
    const IconComponent = (LucideIcons as any)[asset.icon];
    
    return (
      <div
        key={asset.id}
        className="asset-item group cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => addAssetToCanvas(asset)}
        title={`添加 ${asset.name}`}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 flex items-center justify-center text-gray-600 group-hover:text-primary-600 transition-colors overflow-hidden rounded">
            {asset.imageUrl ? (
              <img 
                src={asset.imageUrl} 
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            ) : IconComponent ? (
              <IconComponent size={20} />
            ) : (
              <div className="w-4 h-4 bg-gray-300 rounded" />
            )}
          </div>
          <span className="text-xs text-gray-700 text-center leading-tight truncate w-full">{asset.name}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`standard-asset-panel h-full flex flex-col ${className}`}>
      {/* 标签页导航 */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="flex tab-nav">
          <Tooltip content="标准素材">
            <button
              onClick={() => setActiveTab('standard')}
              className={`flex items-center justify-center w-12 h-12 border-b-2 transition-all duration-200 ${
                activeTab === 'standard'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5" />
            </button>
          </Tooltip>
          
          <Tooltip content="手绘风格">
            <button
              onClick={() => setActiveTab('excalidraw')}
              className={`flex items-center justify-center w-12 h-12 border-b-2 transition-all duration-200 ${
                activeTab === 'excalidraw'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Palette className="w-5 h-5" />
            </button>
          </Tooltip>
          
          <Tooltip content="自定义素材">
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex items-center justify-center w-12 h-12 border-b-2 transition-all duration-200 ${
                activeTab === 'custom'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FolderPlus className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 标准素材面板 */}
      {activeTab === 'standard' && (
        <>
          {/* 头部工具栏 */}
          <div className="p-3 border-b border-gray-200">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="搜索素材..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto">
        {searchQuery ? (
          // 搜索结果
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              搜索结果 ({searchResults.length})
            </h3>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {searchResults.map(renderAssetItem)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">未找到相关素材</p>
              </div>
            )}
          </div>
        ) : (
          // 分类列表
          <div className="p-3 space-y-2">
            {/* 标准分类 */}
            {standardAssets.map((category) => {
              const CategoryIcon = (LucideIcons as any)[category.icon];
              const isExpanded = expandedCategories.has(category.id);
              
              return (
                <div key={category.id} className="category-group">
                  {/* 分类标题 */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-500" />
                    )}
                    {CategoryIcon && <CategoryIcon size={16} className="text-gray-600" />}
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">({category.assets.length})</span>
                  </button>
                  
                  {/* 分类内容 */}
                  {isExpanded && (
                    <div className="ml-6 mt-2 mb-3">
                      <div className="grid grid-cols-3 gap-2">
                        {category.assets.map(renderAssetItem)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* 自定义分类 */}
            {customCategories.map((category) => {
              const CategoryIcon = (LucideIcons as any)[category.icon];
              const isExpanded = expandedCategories.has(category.id);
              
              return (
                <div key={category.id} className="category-group">
                  {/* 分类标题 */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-500" />
                    )}
                    {CategoryIcon && <CategoryIcon size={16} className="text-blue-600" />}
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-xs text-blue-500 ml-auto">({category.assets.length})</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="ml-1 p-1 hover:bg-gray-200 rounded"
                      title="添加素材到此分类"
                    >
                      <Plus size={12} className="text-gray-500" />
                    </button>
                  </button>
                  
                  {/* 分类内容 */}
                  {isExpanded && (
                    <div className="ml-6 mt-2 mb-3">
                      <div className="grid grid-cols-3 gap-2">
                        {category.assets.map(renderAssetItem)}
                        {/* 添加素材按钮 */}
                        <div
                          className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.multiple = true;
                            input.onchange = (e) => {
                              const files = (e.target as HTMLInputElement).files;
                              if (files) handleFileUpload(files, category.id);
                            };
                            input.click();
                          }}
                        >
                          <Plus size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
          </div>

          {/* 底部提示 */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Plus size={12} />
              <span>点击素材添加到画布</span>
            </div>
          </div>
        </>
      )}

      {/* Excalidraw素材面板 */}
      {activeTab === 'excalidraw' && (
        <ExcalidrawAssetPanel />
      )}

      {/* 自定义素材面板 */}
      {activeTab === 'custom' && (
        <>
          {/* 头部工具栏 */}
          <div className="p-3 border-b border-gray-200 space-y-3">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="搜索自定义素材..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Upload size={14} />
                上传素材
              </button>
              <button
                onClick={() => setShowNewCategoryModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FolderPlus size={14} />
                新建分类
              </button>
            </div>
          </div>

          {/* 自定义分类内容 */}
          <div className="flex-1 overflow-y-auto">
            {customCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <FolderPlus size={32} className="mb-2 opacity-50" />
                <p className="text-sm">还没有自定义分类</p>
                <button
                  onClick={() => setShowNewCategoryModal(true)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  创建第一个分类
                </button>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {customCategories.map((category) => {
                  const CategoryIcon = (LucideIcons as any)[category.icon];
                  const isExpanded = expandedCategories.has(category.id);
                  
                  return (
                    <div key={category.id} className="category-group">
                      {/* 分类标题 */}
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} className="text-gray-500" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-500" />
                        )}
                        {CategoryIcon && <CategoryIcon size={16} className="text-blue-600" />}
                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                        <span className="text-xs text-blue-500 ml-auto">({category.assets.length})</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.multiple = true;
                            input.onchange = (e) => {
                              const files = (e.target as HTMLInputElement).files;
                              if (files) handleFileUpload(files, category.id);
                            };
                            input.click();
                          }}
                          className="ml-1 p-1 hover:bg-gray-200 rounded"
                          title="添加素材到此分类"
                        >
                          <Plus size={12} className="text-gray-500" />
                        </button>
                      </button>
                      
                      {/* 分类内容 */}
                      {isExpanded && (
                        <div className="ml-6 mt-2 mb-3">
                          <div className="grid grid-cols-3 gap-2">
                            {category.assets.map(renderAssetItem)}
                            {/* 添加素材按钮 */}
                            <div
                              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.multiple = true;
                                input.onchange = (e) => {
                                  const files = (e.target as HTMLInputElement).files;
                                  if (files) handleFileUpload(files, category.id);
                                };
                                input.click();
                              }}
                            >
                              <Plus size={16} className="text-gray-400" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 底部提示 */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Upload size={12} />
              <span>上传图片创建自定义素材</span>
            </div>
          </div>
        </>
      )}



      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFileUpload(e.target.files);
          }
        }}
      />

      {/* 上传模态框 */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={(files, categoryId) => {
            handleFileUpload(files, categoryId);
            setShowUploadModal(false);
          }}
          categories={customCategories}
        />
      )}

      {/* 新建分类模态框 */}
      {showNewCategoryModal && (
        <NewCategoryModal
          onClose={() => setShowNewCategoryModal(false)}
          onCreate={(name, icon) => {
            createNewCategory(name, icon);
            setShowNewCategoryModal(false);
          }}
        />
      )}
    </div>
  );
};

// 上传模态框组件
interface UploadModalProps {
  onClose: () => void;
  onUpload: (files: FileList, categoryId?: string) => void;
  categories: AssetCategory[];
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files, selectedCategory || undefined);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files, selectedCategory || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">上传素材</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* 分类选择 */}
        {categories.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择分类（可选）
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">默认分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* 拖拽上传区域 */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">拖拽文件到此处或</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            选择文件
          </button>
          <p className="text-xs text-gray-500 mt-2">
            支持 JPG、PNG、GIF、SVG 格式
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

// 新建分类模态框组件
interface NewCategoryModalProps {
  onClose: () => void;
  onCreate: (name: string, icon: string) => void;
}

const NewCategoryModal: React.FC<NewCategoryModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Package');

  const iconOptions = [
    'Package', 'Folder', 'Image', 'Palette', 'Shapes', 'Star', 'Heart', 'Bookmark'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), selectedIcon);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">新建分类</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入分类名称"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择图标
            </label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((iconName) => {
                const IconComponent = (LucideIcons as any)[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedIcon === iconName
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {IconComponent && <IconComponent size={20} className="mx-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};