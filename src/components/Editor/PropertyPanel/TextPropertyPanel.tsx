import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  FlipHorizontal,
  FlipVertical,
  Indent,
  Outdent
} from 'lucide-react';
import { BasePropertyPanelFunc, usePropertyPanel, propertyStyles } from './BasePropertyPanel';
import { HexColorPicker } from 'react-colorful';
import { FontLibrary } from '../FontLibrary';
import { fontLoaderService } from '@/services/fontLoader';
import { ALL_FONTS } from '@/data/fonts';
import { FontTester } from '@/utils/fontTester';

interface TextPropertyPanelProps {
  object: fabric.IText;
  canvas: fabric.Canvas;
  onUpdate?: (object: fabric.Object) => void;
}

export const TextPropertyPanel: React.FC<TextPropertyPanelProps> = (props) => {
  return (
    <BasePropertyPanelFunc {...props}>
      <TextProperties />
    </BasePropertyPanelFunc>
  );
};

const TextProperties: React.FC = () => {
  const { object, updateProperty } = usePropertyPanel();
  const textObject = object as fabric.IText;
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontLibrary, setShowFontLibrary] = useState(false);
  const [fontLoading, setFontLoading] = useState<string | null>(null);
  const [textProperties, setTextProperties] = useState({
    fontSize: textObject.fontSize || 16,
    fontFamily: textObject.fontFamily || 'Arial',
    fontWeight: textObject.fontWeight || 'normal',
    fontStyle: textObject.fontStyle || 'normal',
    underline: textObject.underline || false,
    textAlign: textObject.textAlign || 'left',
    fill: textObject.fill as string || '#000000',
    lineHeight: textObject.lineHeight || 1.2,
    charSpacing: textObject.charSpacing || 0,
    textIndent: (textObject as any).textIndent || 0,
    textDirection: (textObject.angle === 90) ? 'vertical' : 'horizontal',
  });

  // 同步对象属性到本地状态
  useEffect(() => {
    const currentFontFamily = textObject.fontFamily || 'Arial';

    setTextProperties({
      fontSize: textObject.fontSize || 16,
      fontFamily: currentFontFamily,
      fontWeight: textObject.fontWeight || 'normal',
      fontStyle: textObject.fontStyle || 'normal',
      underline: textObject.underline || false,
      textAlign: textObject.textAlign || 'left',
      fill: textObject.fill as string || '#000000',
      lineHeight: textObject.lineHeight || 1.2,
      charSpacing: textObject.charSpacing || 0,
      textIndent: (textObject as any).textIndent || 0,
      textDirection: (textObject.angle === 90) ? 'vertical' : 'horizontal',
    });
  }, [textObject]);

  const handlePropertyChange = (key: string, value: any) => {
    // 更新本地状态
    setTextProperties(prev => ({ ...prev, [key]: value }));
    
    // 使用updateProperty确保正确的更新流程
    updateProperty(key, value);
    
    // 对于字体相关属性，需要特殊处理
    if (key === 'fontFamily' || key === 'fontSize' || key === 'fontWeight' || key === 'fontStyle') {
      // 延迟执行，确保属性已经设置
      setTimeout(() => {
        textObject.initDimensions();
        textObject.setCoords();
        textObject.canvas?.renderAll();
      }, 50);
    }
  };

  const toggleFontWeight = () => {
    const newWeight = textProperties.fontWeight === 'bold' ? 'normal' : 'bold';
    handlePropertyChange('fontWeight', newWeight);
  };

  const toggleFontStyle = () => {
    const newStyle = textProperties.fontStyle === 'italic' ? 'normal' : 'italic';
    handlePropertyChange('fontStyle', newStyle);
  };

  const toggleUnderline = () => {
    const newUnderline = !textProperties.underline;
    handlePropertyChange('underline', newUnderline);
  };

  const setTextAlign = (align: string) => {
    handlePropertyChange('textAlign', align);
  };

  const setTextDirection = (direction: 'horizontal' | 'vertical') => {
    setTextProperties(prev => ({ ...prev, textDirection: direction }));
    
    if (direction === 'vertical') {
      updateProperty('angle', 90);
      updateProperty('originX', 'center');
      updateProperty('originY', 'center');
    } else {
      updateProperty('angle', 0);
      updateProperty('originX', 'left');
      updateProperty('originY', 'top');
    }
  };

  const adjustIndent = (delta: number) => {
    const newIndent = Math.max(0, textProperties.textIndent + delta);
    handlePropertyChange('textIndent', newIndent);
  };

  // 处理字体变化
  const handleFontChange = async (fontName: string) => {
    // 查找字体信息
    const fontInfo = ALL_FONTS.find(font => font.name === fontName);

    if (fontInfo && fontInfo.source === 'google') {
      // 如果是Google字体，需要先加载
      setFontLoading(fontName);
      
      try {
        // 动态加载Google字体CSS
        await loadGoogleFont(fontName);
      } catch (error) {
        console.error('Failed to load Google font:', error);
      } finally {
        setFontLoading(null);
      }
    }

    // 应用字体到Fabric.js对象
    handlePropertyChange('fontFamily', fontName);
  };

  // 加载Google字体
  const loadGoogleFont = async (fontName: string): Promise<void> => {
    return FontTester.loadAndTestGoogleFont(fontName).then(success => {
      if (!success) {
        throw new Error(`Failed to load font: ${fontName}`);
      }
    });
  };

  // 从字体库选择字体
  const handleFontLibrarySelect = (fontFamily: string) => {
    handleFontChange(fontFamily);
    setShowFontLibrary(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* 字体设置 */}
      <div className={propertyStyles.group}>
        <h3 className={`${propertyStyles.label} flex items-center`}>
          <Type size={16} className="mr-2" />
          字体设置
        </h3>
        <div className="space-y-3">
          {/* 字体族 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">字体</label>
            <div className="space-y-2">
              <select
                value={textProperties.fontFamily}
                onChange={(e) => handleFontChange(e.target.value)}
                className={propertyStyles.input}
              >
                <optgroup label="系统字体">
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Courier New">Courier New</option>
                </optgroup>
                
                <optgroup label="Google字体 - 无衬线">
                  <option value="Open Sans">Open Sans</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Inter">Inter</option>
                  <option value="Nunito">Nunito</option>
                  <option value="Work Sans">Work Sans</option>
                  <option value="Raleway">Raleway</option>
                </optgroup>
                
                <optgroup label="Google字体 - 衬线">
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Merriweather">Merriweather</option>
                  <option value="Lora">Lora</option>
                  <option value="Source Serif Pro">Source Serif Pro</option>
                  <option value="Crimson Text">Crimson Text</option>
                </optgroup>
                
                <optgroup label="Google字体 - 展示">
                  <option value="Oswald">Oswald</option>
                  <option value="Bebas Neue">Bebas Neue</option>
                  <option value="Anton">Anton</option>
                  <option value="Righteous">Righteous</option>
                  <option value="Fredoka One">Fredoka One</option>
                </optgroup>
                
                <optgroup label="Google字体 - 手写">
                  <option value="Dancing Script">Dancing Script</option>
                  <option value="Pacifico">Pacifico</option>
                  <option value="Satisfy">Satisfy</option>
                  <option value="Kalam">Kalam</option>
                </optgroup>
                
                <optgroup label="Google字体 - 等宽">
                  <option value="Roboto Mono">Roboto Mono</option>
                  <option value="Source Code Pro">Source Code Pro</option>
                  <option value="Fira Code">Fira Code</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                </optgroup>
                
                <optgroup label="中文字体">
                  <option value="Noto Sans SC">思源黑体 (Noto Sans SC)</option>
                  <option value="Noto Serif SC">思源宋体 (Noto Serif SC)</option>
                </optgroup>
              </select>
              
              <button
                onClick={() => setShowFontLibrary(true)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Type size={14} />
                浏览更多字体
              </button>
              
              {fontLoading && (
                <div className="text-xs text-blue-600 flex items-center gap-1">
                  <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  正在加载 {fontLoading}...
                </div>
              )}
            </div>
          </div>

          {/* 字体大小 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              字体大小: {textProperties.fontSize}px
            </label>
            <input
              type="range"
              min="8"
              max="120"
              value={textProperties.fontSize}
              onChange={(e) => handlePropertyChange('fontSize', Number(e.target.value))}
              className={propertyStyles.slider}
            />
            <input
              type="number"
              min="8"
              max="120"
              value={textProperties.fontSize}
              onChange={(e) => handlePropertyChange('fontSize', Number(e.target.value))}
              className={`${propertyStyles.input} mt-2`}
            />
          </div>

          {/* 字体样式按钮 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">字体样式</label>
            <div className={propertyStyles.flexRow}>
              <button
                onClick={toggleFontWeight}
                className={`${propertyStyles.button} ${textProperties.fontWeight === 'bold' ? 'bg-blue-100 border-blue-300' : ''}`}
                title="粗体"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={toggleFontStyle}
                className={`${propertyStyles.button} ${textProperties.fontStyle === 'italic' ? 'bg-blue-100 border-blue-300' : ''}`}
                title="斜体"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={toggleUnderline}
                className={`${propertyStyles.button} ${textProperties.underline ? 'bg-blue-100 border-blue-300' : ''}`}
                title="下划线"
              >
                <Underline size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 文本对齐 */}
      <div className={propertyStyles.group}>
        <h3 className={propertyStyles.label}>文本对齐</h3>
        <div className={propertyStyles.flexRow}>
          <button
            onClick={() => setTextAlign('left')}
            className={`${propertyStyles.button} ${textProperties.textAlign === 'left' ? 'bg-blue-100 border-blue-300' : ''}`}
            title="左对齐"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => setTextAlign('center')}
            className={`${propertyStyles.button} ${textProperties.textAlign === 'center' ? 'bg-blue-100 border-blue-300' : ''}`}
            title="居中对齐"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => setTextAlign('right')}
            className={`${propertyStyles.button} ${textProperties.textAlign === 'right' ? 'bg-blue-100 border-blue-300' : ''}`}
            title="右对齐"
          >
            <AlignRight size={16} />
          </button>
          <button
            onClick={() => setTextAlign('justify')}
            className={`${propertyStyles.button} ${textProperties.textAlign === 'justify' ? 'bg-blue-100 border-blue-300' : ''}`}
            title="两端对齐"
          >
            <AlignJustify size={16} />
          </button>
        </div>
      </div>

      {/* 文本方向 */}
      <div className={propertyStyles.group}>
        <h3 className={propertyStyles.label}>文本方向</h3>
        <div className={propertyStyles.flexRow}>
          <button
            onClick={() => setTextDirection('horizontal')}
            className={`${propertyStyles.button} ${textProperties.textDirection === 'horizontal' ? 'bg-blue-100 border-blue-300' : ''}`}
            title="水平文本"
          >
            <FlipHorizontal size={16} />
            <span className="ml-1 text-xs">水平</span>
          </button>
          <button
            onClick={() => setTextDirection('vertical')}
            className={`${propertyStyles.button} ${textProperties.textDirection === 'vertical' ? 'bg-blue-100 border-blue-300' : ''}`}
            title="垂直文本"
          >
            <FlipVertical size={16} />
            <span className="ml-1 text-xs">垂直</span>
          </button>
        </div>
      </div>

      {/* 文本颜色 */}
      <div className={propertyStyles.group}>
        <h3 className={propertyStyles.label}>文本颜色</h3>
        <div>
          <div
            className={propertyStyles.colorSwatch}
            style={{ backgroundColor: textProperties.fill }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          />
          {showColorPicker && (
            <div className="mt-2">
              <HexColorPicker
                color={textProperties.fill}
                onChange={(color) => handlePropertyChange('fill', color)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 格式化设置 */}
      <div className={propertyStyles.group}>
        <h3 className={propertyStyles.label}>格式化设置</h3>
        <div className="space-y-4">
          {/* 行高 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              行高: {textProperties.lineHeight.toFixed(1)}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={textProperties.lineHeight}
                onChange={(e) => handlePropertyChange('lineHeight', Number(e.target.value))}
                className={`${propertyStyles.slider} flex-1`}
              />
              <input
                type="number"
                min="0.5"
                max="3"
                step="0.1"
                value={textProperties.lineHeight}
                onChange={(e) => handlePropertyChange('lineHeight', Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* 字符间距 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              字符间距: {(textProperties.charSpacing / 1000).toFixed(1)}px
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="-50"
                max="200"
                value={textProperties.charSpacing}
                onChange={(e) => handlePropertyChange('charSpacing', Number(e.target.value))}
                className={`${propertyStyles.slider} flex-1`}
              />
              <input
                type="number"
                min="-5"
                max="20"
                step="0.5"
                value={(textProperties.charSpacing / 1000).toFixed(1)}
                onChange={(e) => handlePropertyChange('charSpacing', Number(e.target.value) * 1000)}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* 文本缩进 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              文本缩进: {textProperties.textIndent}px
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={textProperties.textIndent}
                onChange={(e) => handlePropertyChange('textIndent', Number(e.target.value))}
                className={`${propertyStyles.slider} flex-1`}
              />
              <input
                type="number"
                min="0"
                max="100"
                step="5"
                value={textProperties.textIndent}
                onChange={(e) => handlePropertyChange('textIndent', Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => adjustIndent(20)}
                className={`${propertyStyles.button} flex-1`}
                title="增加缩进"
              >
                <Indent size={14} />
                <span className="ml-1 text-xs">增加</span>
              </button>
              <button
                onClick={() => adjustIndent(-20)}
                className={`${propertyStyles.button} flex-1`}
                title="减少缩进"
              >
                <Outdent size={14} />
                <span className="ml-1 text-xs">减少</span>
              </button>
            </div>
          </div>

          {/* 快速格式化预设 */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">快速格式化</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  handlePropertyChange('lineHeight', 1.0);
                  handlePropertyChange('charSpacing', 0);
                  handlePropertyChange('textIndent', 0);
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                紧凑
              </button>
              <button
                onClick={() => {
                  handlePropertyChange('lineHeight', 1.5);
                  handlePropertyChange('charSpacing', 1000);
                  handlePropertyChange('textIndent', 0);
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                舒适
              </button>
              <button
                onClick={() => {
                  handlePropertyChange('lineHeight', 2.0);
                  handlePropertyChange('charSpacing', 2000);
                  handlePropertyChange('textIndent', 20);
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                宽松
              </button>
              <button
                onClick={() => {
                  handlePropertyChange('lineHeight', 1.2);
                  handlePropertyChange('charSpacing', 0);
                  handlePropertyChange('textIndent', 0);
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                默认
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 字体库弹窗 */}
      <FontLibrary
        isOpen={showFontLibrary}
        onClose={() => setShowFontLibrary(false)}
        onFontSelect={handleFontLibrarySelect}
      />
    </div>
  );
};