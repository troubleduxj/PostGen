import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { Image, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';
import { BasePropertyPanelFunc, usePropertyPanel, propertyStyles } from './BasePropertyPanel';

interface ImagePropertyPanelProps {
  object: fabric.Image;
  canvas: fabric.Canvas;
  onUpdate?: (object: fabric.Object) => void;
}

export const ImagePropertyPanel: React.FC<ImagePropertyPanelProps> = (props) => {
  return (
    <BasePropertyPanelFunc {...props}>
      <ImageProperties />
    </BasePropertyPanelFunc>
  );
};

const ImageProperties: React.FC = () => {
  const { object, updateProperty } = usePropertyPanel();
  const imageObject = object as fabric.Image;
  
  const [imageProperties, setImageProperties] = useState({
    opacity: (imageObject.opacity || 1) * 100,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    flipX: imageObject.flipX || false,
    flipY: imageObject.flipY || false,
  });

  // 同步对象属性到本地状态
  useEffect(() => {
    setImageProperties({
      opacity: (imageObject.opacity || 1) * 100,
      brightness: 0, // 这些滤镜值需要从对象的滤镜中获取
      contrast: 0,
      saturation: 0,
      blur: 0,
      flipX: imageObject.flipX || false,
      flipY: imageObject.flipY || false,
    });
  }, [imageObject]);

  const handlePropertyChange = (key: string, value: any) => {
    if (key === 'opacity') {
      const opacityValue = value / 100;
      setImageProperties(prev => ({ ...prev, [key]: value }));
      updateProperty('opacity', opacityValue);
    } else if (key === 'flipX' || key === 'flipY') {
      setImageProperties(prev => ({ ...prev, [key]: value }));
      updateProperty(key, value);
    } else {
      // 处理滤镜属性
      setImageProperties(prev => ({ ...prev, [key]: value }));
      applyFilter(key, value);
    }
  };

  // 应用滤镜（简化版本，实际实现需要更复杂的滤镜系统）
  const applyFilter = (filterType: string, value: number) => {
    // 这里是滤镜应用的占位符
    // 实际实现需要使用 Fabric.js 的滤镜系统
    console.log(`Applying ${filterType} filter with value ${value}`);
    
    // 示例：应用亮度滤镜
    if (filterType === 'brightness') {
      const filter = new fabric.Image.filters.Brightness({
        brightness: value / 100
      });
      
      imageObject.filters = imageObject.filters || [];
      // 移除现有的亮度滤镜
      imageObject.filters = imageObject.filters.filter(f => f.type !== 'Brightness');
      // 添加新的亮度滤镜
      if (value !== 0) {
        imageObject.filters.push(filter);
      }
      
      imageObject.applyFilters();
    }
  };

  const rotateImage = (angle: number) => {
    const currentAngle = imageObject.angle || 0;
    updateProperty('angle', currentAngle + angle);
  };

  const resetFilters = () => {
    imageObject.filters = [];
    imageObject.applyFilters();
    setImageProperties(prev => ({
      ...prev,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
    }));
  };

  return (
    <div className="p-4 space-y-6">
      {/* 图片信息 */}
      <div className={propertyStyles.group}>
        <h3 className={`${propertyStyles.label} flex items-center`}>
          <Image size={16} className="mr-2" />
          图片属性
        </h3>
        <div className="text-xs text-gray-600">
          <div>尺寸: {Math.round((imageObject.width || 0) * (imageObject.scaleX || 1))} × {Math.round((imageObject.height || 0) * (imageObject.scaleY || 1))}</div>
          <div>原始尺寸: {imageObject.width} × {imageObject.height}</div>
        </div>
      </div>

      {/* 变换操作 */}
      <div className={propertyStyles.group}>
        <h3 className={propertyStyles.label}>变换操作</h3>
        <div className="space-y-3">
          {/* 旋转按钮 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">旋转</label>
            <div className={propertyStyles.flexRow}>
              <button
                onClick={() => rotateImage(-90)}
                className={propertyStyles.button}
                title="逆时针旋转90°"
              >
                <RotateCw size={16} className="transform scale-x-[-1]" />
                -90°
              </button>
              <button
                onClick={() => rotateImage(90)}
                className={propertyStyles.button}
                title="顺时针旋转90°"
              >
                <RotateCw size={16} />
                +90°
              </button>
            </div>
          </div>

          {/* 翻转按钮 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">翻转</label>
            <div className={propertyStyles.flexRow}>
              <button
                onClick={() => handlePropertyChange('flipX', !imageProperties.flipX)}
                className={`${propertyStyles.button} ${imageProperties.flipX ? 'bg-blue-100 border-blue-300' : ''}`}
                title="水平翻转"
              >
                <FlipHorizontal size={16} />
              </button>
              <button
                onClick={() => handlePropertyChange('flipY', !imageProperties.flipY)}
                className={`${propertyStyles.button} ${imageProperties.flipY ? 'bg-blue-100 border-blue-300' : ''}`}
                title="垂直翻转"
              >
                <FlipVertical size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 透明度 */}
      <div className={propertyStyles.group}>
        <h3 className={propertyStyles.label}>透明度</h3>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            透明度: {imageProperties.opacity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={imageProperties.opacity}
            onChange={(e) => handlePropertyChange('opacity', Number(e.target.value))}
            className={propertyStyles.slider}
          />
        </div>
      </div>

      {/* 图片调整 */}
      <div className={propertyStyles.group}>
        <h3 className={propertyStyles.label}>图片调整</h3>
        <div className="space-y-3">
          {/* 亮度 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              亮度: {imageProperties.brightness > 0 ? '+' : ''}{imageProperties.brightness}
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={imageProperties.brightness}
              onChange={(e) => handlePropertyChange('brightness', Number(e.target.value))}
              className={propertyStyles.slider}
            />
          </div>

          {/* 对比度 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              对比度: {imageProperties.contrast > 0 ? '+' : ''}{imageProperties.contrast}
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={imageProperties.contrast}
              onChange={(e) => handlePropertyChange('contrast', Number(e.target.value))}
              className={propertyStyles.slider}
            />
          </div>

          {/* 饱和度 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              饱和度: {imageProperties.saturation > 0 ? '+' : ''}{imageProperties.saturation}
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={imageProperties.saturation}
              onChange={(e) => handlePropertyChange('saturation', Number(e.target.value))}
              className={propertyStyles.slider}
            />
          </div>

          {/* 模糊 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              模糊: {imageProperties.blur}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={imageProperties.blur}
              onChange={(e) => handlePropertyChange('blur', Number(e.target.value))}
              className={propertyStyles.slider}
            />
          </div>

          {/* 重置按钮 */}
          <div className="pt-2">
            <button
              onClick={resetFilters}
              className={`${propertyStyles.button} w-full`}
            >
              重置所有调整
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};