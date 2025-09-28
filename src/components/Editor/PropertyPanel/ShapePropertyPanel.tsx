import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { Square } from 'lucide-react';
import { BasePropertyPanelFunc, usePropertyPanel, propertyStyles } from './BasePropertyPanel';
import { HexColorPicker } from 'react-colorful';

interface ShapePropertyPanelProps {
  object: fabric.Object;
  canvas: fabric.Canvas;
  onUpdate?: (object: fabric.Object) => void;
}

export const ShapePropertyPanel: React.FC<ShapePropertyPanelProps> = (props) => {
  return (
    <BasePropertyPanelFunc {...props}>
      <ShapeProperties />
    </BasePropertyPanelFunc>
  );
};

const ShapeProperties: React.FC = () => {
  const { object, updateProperty } = usePropertyPanel();
  
  const [showFillPicker, setShowFillPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const [shapeProperties, setShapeProperties] = useState({
    fill: object.fill as string || '#3b82f6',
    stroke: object.stroke as string || '#1d4ed8',
    strokeWidth: object.strokeWidth || 2,
    opacity: (object.opacity || 1) * 100,
  });

  // 同步对象属性到本地状态
  useEffect(() => {
    setShapeProperties({
      fill: object.fill as string || '#3b82f6',
      stroke: object.stroke as string || '#1d4ed8',
      strokeWidth: object.strokeWidth || 2,
      opacity: (object.opacity || 1) * 100,
    });
  }, [object]);

  const handlePropertyChange = (key: string, value: any) => {
    if (key === 'opacity') {
      // 透明度需要转换为 0-1 范围
      const opacityValue = value / 100;
      setShapeProperties(prev => ({ ...prev, [key]: value }));
      updateProperty('opacity', opacityValue);
    } else {
      setShapeProperties(prev => ({ ...prev, [key]: value }));
      updateProperty(key, value);
    }
  };

  // 获取形状类型显示名称
  const getShapeTypeName = () => {
    switch (object.type) {
      case 'rect': return '矩形';
      case 'circle': return '圆形';
      case 'triangle': return '三角形';
      case 'line': return '直线';
      case 'polygon': return '多边形';
      default: return '形状';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* 形状信息 */}
      <div className={propertyStyles.group}>
        <h3 className={`${propertyStyles.label} flex items-center`}>
          <Square size={16} className="mr-2" />
          {getShapeTypeName()}属性
        </h3>
      </div>

      {/* 填充颜色 */}
      <div className={propertyStyles.group}>
        <h3 className={propertyStyles.label}>填充颜色</h3>
        <div>
          <div
            className={propertyStyles.colorSwatch}
            style={{ backgroundColor: shapeProperties.fill }}
            onClick={() => setShowFillPicker(!showFillPicker)}
          />
          {showFillPicker && (
            <div className="mt-2">
              <HexColorPicker
                color={shapeProperties.fill}
                onChange={(color) => handlePropertyChange('fill', color)}
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => setShowFillPicker(false)}
                  className={propertyStyles.button}
                >
                  确定
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 边框设置 */}
      <div className={propertyStyles.group}>
        <h3 className={propertyStyles.label}>边框设置</h3>
        <div className="space-y-3">
          {/* 边框颜色 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">边框颜色</label>
            <div
              className={propertyStyles.colorSwatch}
              style={{ backgroundColor: shapeProperties.stroke }}
              onClick={() => setShowStrokePicker(!showStrokePicker)}
            />
            {showStrokePicker && (
              <div className="mt-2">
                <HexColorPicker
                  color={shapeProperties.stroke}
                  onChange={(color) => handlePropertyChange('stroke', color)}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => setShowStrokePicker(false)}
                    className={propertyStyles.button}
                  >
                    确定
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 边框宽度 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              边框宽度: {shapeProperties.strokeWidth}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={shapeProperties.strokeWidth}
              onChange={(e) => handlePropertyChange('strokeWidth', Number(e.target.value))}
              className={propertyStyles.slider}
            />
            <input
              type="number"
              min="0"
              max="20"
              value={shapeProperties.strokeWidth}
              onChange={(e) => handlePropertyChange('strokeWidth', Number(e.target.value))}
              className={`${propertyStyles.input} mt-2`}
            />
          </div>
        </div>
      </div>

      {/* 透明度 */}
      <div className={propertyStyles.group}>
        <h3 className={propertyStyles.label}>透明度</h3>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            透明度: {shapeProperties.opacity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={shapeProperties.opacity}
            onChange={(e) => handlePropertyChange('opacity', Number(e.target.value))}
            className={propertyStyles.slider}
          />
        </div>
      </div>

      {/* 特殊属性（根据形状类型） */}
      {object.type === 'rect' && <RectangleSpecificProperties />}
      {object.type === 'circle' && <CircleSpecificProperties />}
    </div>
  );
};

// 矩形特有属性
const RectangleSpecificProperties: React.FC = () => {
  const { object, updateProperty } = usePropertyPanel();
  const rect = object as fabric.Rect;
  
  const [cornerRadius, setCornerRadius] = useState((rect as any).rx || 0);

  const handleCornerRadiusChange = (value: number) => {
    setCornerRadius(value);
    updateProperty('rx', value);
    updateProperty('ry', value);
  };

  return (
    <div className={propertyStyles.group}>
      <h3 className={propertyStyles.label}>矩形属性</h3>
      <div>
        <label className="block text-xs text-gray-600 mb-1">
          圆角半径: {cornerRadius}px
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={cornerRadius}
          onChange={(e) => handleCornerRadiusChange(Number(e.target.value))}
          className={propertyStyles.slider}
        />
      </div>
    </div>
  );
};

// 圆形特有属性
const CircleSpecificProperties: React.FC = () => {
  const { object, updateProperty } = usePropertyPanel();
  const circle = object as fabric.Circle;
  
  const [radius, setRadius] = useState(circle.radius || 50);

  const handleRadiusChange = (value: number) => {
    setRadius(value);
    updateProperty('radius', value);
  };

  return (
    <div className={propertyStyles.group}>
      <h3 className={propertyStyles.label}>圆形属性</h3>
      <div>
        <label className="block text-xs text-gray-600 mb-1">
          半径: {radius}px
        </label>
        <input
          type="range"
          min="5"
          max="200"
          value={radius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          className={propertyStyles.slider}
        />
        <input
          type="number"
          min="5"
          max="200"
          value={radius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          className={`${propertyStyles.input} mt-2`}
        />
      </div>
    </div>
  );
};