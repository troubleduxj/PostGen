import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Palette, 
  Move, 
  RotateCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Monitor
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { fabric } from 'fabric';
import { propertyPanelRegistry } from './PropertyPanel';
import { CanvasPropertyPanel } from './CanvasPropertyPanel';

interface RightPanelProps {
  className?: string;
}

export const RightPanel: React.FC<RightPanelProps> = ({ className = '' }) => {
  const { activeObject, canvas, removeObject } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'properties' | 'style'>('properties');

  // 当没有选中对象时，显示画布属性面板
  if (!activeObject) {
    return (
      <div className={`w-80 bg-white border-l border-gray-200 flex flex-col ${className}`}>
        <div className="panel-header flex items-center">
          <Monitor size={16} className="mr-2" />
          画布属性
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <CanvasPropertyPanel />
        </div>
      </div>
    );
  }

  if (!canvas) {
    return (
      <div className={`w-80 bg-white border-l border-gray-200 flex flex-col ${className}`}>
        <div className="panel-header">属性面板</div>
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          画布未初始化
        </div>
      </div>
    );
  }

  // 处理对象更新
  const handleObjectUpdate = (object: fabric.Object) => {
    // 可以在这里添加额外的更新逻辑，比如保存到历史记录
    canvas.renderAll();
  };

  return (
    <div className={`w-80 bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* 标签页 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'properties'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings size={16} className="inline mr-2" />
          属性
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'style'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Palette size={16} className="inline mr-2" />
          样式
        </button>
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'properties' && (
          <PropertiesPanel 
            object={activeObject} 
            canvas={canvas}
            onUpdate={handleObjectUpdate}
          />
        )}
        {activeTab === 'style' && (
          <StylePanel 
            object={activeObject} 
            canvas={canvas}
            onUpdate={handleObjectUpdate}
          />
        )}
      </div>
    </div>
  );
};

// 属性面板
interface PropertiesPanelProps {
  object: fabric.Object;
  canvas: fabric.Canvas;
  onUpdate?: (object: fabric.Object) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ object, canvas, onUpdate }) => {
  const { removeObject } = useEditorStore();
  const [properties, setProperties] = useState({
    left: object.left || 0,
    top: object.top || 0,
    width: object.width || 0,
    height: object.height || 0,
    angle: object.angle || 0,
    opacity: (object.opacity || 1) * 100,
    visible: object.visible !== false,
    locked: object.lockMovementX || false,
  });

  useEffect(() => {
    setProperties({
      left: Math.round(object.left || 0),
      top: Math.round(object.top || 0),
      width: Math.round((object.width || 0) * (object.scaleX || 1)),
      height: Math.round((object.height || 0) * (object.scaleY || 1)),
      angle: Math.round(object.angle || 0),
      opacity: Math.round((object.opacity || 1) * 100),
      visible: object.visible !== false,
      locked: object.lockMovementX || false,
    });
  }, [object]);

  const updateProperty = (key: string, value: any) => {
    setProperties(prev => ({ ...prev, [key]: value }));
    
    switch (key) {
      case 'left':
      case 'top':
        object.set(key, value);
        break;
      case 'width':
        object.set('scaleX', value / (object.width || 1));
        break;
      case 'height':
        object.set('scaleY', value / (object.height || 1));
        break;
      case 'angle':
        object.set('angle', value);
        break;
      case 'opacity':
        object.set('opacity', value / 100);
        break;
      case 'visible':
        object.set('visible', value);
        break;
      case 'locked':
        object.set({
          lockMovementX: value,
          lockMovementY: value,
          lockRotation: value,
          lockScalingX: value,
          lockScalingY: value,
        });
        break;
    }
    
    canvas?.renderAll();
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这个对象吗？')) {
      removeObject(object);
    }
  };

  return (
    <div className="space-y-6">
      {/* 基本属性 */}
      <div className="p-4 border-b border-gray-200">
        <div className="property-group">
          <h3 className="property-label">基本信息</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">类型</label>
              <div className="text-sm font-medium capitalize">{object.type}</div>
            </div>
          </div>
        </div>

        {/* 位置和尺寸 */}
        <div className="property-group mt-4">
          <h3 className="property-label flex items-center">
            <Move size={16} className="mr-2" />
            位置和尺寸
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">X</label>
              <input
                type="number"
                value={properties.left}
                onChange={(e) => updateProperty('left', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Y</label>
              <input
                type="number"
                value={properties.top}
                onChange={(e) => updateProperty('top', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">宽度</label>
              <input
                type="number"
                value={properties.width}
                onChange={(e) => updateProperty('width', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">高度</label>
              <input
                type="number"
                value={properties.height}
                onChange={(e) => updateProperty('height', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* 变换 */}
        <div className="property-group mt-4">
          <h3 className="property-label flex items-center">
            <RotateCw size={16} className="mr-2" />
            变换
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">旋转角度</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={properties.angle}
                onChange={(e) => updateProperty('angle', Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{properties.angle}°</div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">透明度</label>
              <input
                type="range"
                min="0"
                max="100"
                value={properties.opacity}
                onChange={(e) => updateProperty('opacity', Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{properties.opacity}%</div>
            </div>
          </div>
        </div>

        {/* 显示和锁定 */}
        <div className="property-group mt-4">
          <h3 className="property-label">显示选项</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={properties.visible}
                onChange={(e) => updateProperty('visible', e.target.checked)}
                className="mr-2"
              />
              {properties.visible ? <Eye size={16} className="mr-2" /> : <EyeOff size={16} className="mr-2" />}
              <span className="text-sm">显示对象</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={properties.locked}
                onChange={(e) => updateProperty('locked', e.target.checked)}
                className="mr-2"
              />
              {properties.locked ? <Lock size={16} className="mr-2" /> : <Unlock size={16} className="mr-2" />}
              <span className="text-sm">锁定对象</span>
            </label>
          </div>
        </div>

        {/* 删除按钮 */}
        <div className="property-group mt-4">
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
            删除对象
          </button>
        </div>
      </div>
    </div>
  );
};

// 样式面板
interface StylePanelProps {
  object: fabric.Object;
  canvas: fabric.Canvas;
  onUpdate?: (object: fabric.Object) => void;
}

const StylePanel: React.FC<StylePanelProps> = ({ object, canvas, onUpdate }) => {
  // 使用新的属性面板系统
  const propertyPanel = propertyPanelRegistry.createPanel({
    object,
    canvas,
    onUpdate,
  });

  if (propertyPanel) {
    return <div>{propertyPanel}</div>;
  }

  // 如果没有找到对应的属性面板，显示默认消息
  return (
    <div className="p-4">
      <div className="text-center text-gray-500 text-sm py-8">
        该对象类型暂不支持样式编辑
      </div>
    </div>
  );
};

