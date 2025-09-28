import React, { useState, useEffect } from 'react';
import {
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  Palette,
  Plus,
  Minus,
  MoreHorizontal,
  RotateCw,
  Indent,
  Outdent,
  FlipHorizontal,
  FlipVertical,
  Library,
  Download
} from 'lucide-react';
import { useTextEditorStore } from '@/stores/textEditorStore';
import { HexColorPicker } from 'react-colorful';
import { FontLibrary } from './FontLibrary';
import { googleFontsService } from '@/services/googleFonts';

interface TextToolbarProps {
  className?: string;
}

// 常用字体列表
const COMMON_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
  'Tahoma',
  'Palatino',
  'Garamond',
  'Bookman',
  'Avant Garde'
];

// 常用字体大小
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96];

export const TextToolbar: React.FC<TextToolbarProps> = ({ className = '' }) => {
  const {
    isEditing,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    textDecoration,
    color,
    textAlign,
    lineHeight,
    letterSpacing,
    textIndent,
    textDirection,
    recentFonts,
    recentColors,
    setFontFamily,
    setFontSize,
    setFontWeight,
    setFontStyle,
    setTextDecoration,
    setColor,
    setTextAlign,
    setLineHeight,
    setLetterSpacing,
    setTextIndent,
    setTextDirection,
    increaseIndent,
    decreaseIndent,
    loadWebFont
  } = useTextEditorStore();

  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showFontLibrary, setShowFontLibrary] = useState(false);
  const [customFontSize, setCustomFontSize] = useState(fontSize.toString());

  // 同步字体大小输入框
  useEffect(() => {
    setCustomFontSize(fontSize.toString());
  }, [fontSize]);

  // 如果不在编辑模式，不显示工具栏
  if (!isEditing) {
    return null;
  }

  // 处理字体选择
  const handleFontSelect = async (font: string) => {
    setFontFamily(font);
    setShowFontDropdown(false);
    
    // 如果是非系统字体，尝试加载
    if (!COMMON_FONTS.includes(font)) {
      await loadWebFont(font);
    }
  };

  // 处理字体大小选择
  const handleFontSizeSelect = (size: number) => {
    setFontSize(size);
    setShowSizeDropdown(false);
  };

  // 处理自定义字体大小输入
  const handleCustomFontSizeChange = (value: string) => {
    setCustomFontSize(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 500) {
      setFontSize(numValue);
    }
  };

  // 增加/减少字体大小
  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(8, Math.min(500, fontSize + delta));
    setFontSize(newSize);
  };

  // 切换字体样式
  const toggleBold = () => {
    setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold');
  };

  const toggleItalic = () => {
    setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic');
  };

  const toggleUnderline = () => {
    setTextDecoration(textDecoration === 'underline' ? 'none' : 'underline');
  };

  // 设置文本对齐
  const handleTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    setTextAlign(align);
  };

  // 处理颜色选择
  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    setShowColorPicker(false);
  };

  // 处理字体库字体选择
  const handleFontLibrarySelect = (fontFamily: string) => {
    setFontFamily(fontFamily);
    setShowFontLibrary(false);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-2 ${className}`}>
      {/* 字体选择器 */}
      <div className="relative flex items-center gap-1">
        <button
          onClick={() => setShowFontDropdown(!showFontDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 min-w-[120px]"
        >
          <Type size={14} />
          <span className="truncate">{fontFamily}</span>
          <ChevronDown size={12} />
        </button>
        
        {/* 字体库按钮 */}
        <button
          onClick={() => setShowFontLibrary(true)}
          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="打开字体库"
        >
          <Library size={14} />
        </button>
        
        {showFontDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {/* 最近使用的字体 */}
            {recentFonts.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                  最近使用
                </div>
                {recentFonts.map((font) => (
                  <button
                    key={`recent-${font}`}
                    onClick={() => handleFontSelect(font)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 font-family-preview"
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
                <div className="border-b border-gray-100" />
              </>
            )}
            
            {/* 系统字体 */}
            <div className="px-3 py-2 text-xs text-gray-500 flex items-center justify-between">
              <span>系统字体</span>
              <button
                onClick={() => {
                  setShowFontDropdown(false);
                  setShowFontLibrary(true);
                }}
                className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
              >
                <Library size={12} />
                更多字体
              </button>
            </div>
            {COMMON_FONTS.map((font) => (
              <button
                key={font}
                onClick={() => handleFontSelect(font)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 font-family-preview ${
                  fontFamily === font ? 'bg-blue-50 text-blue-600' : ''
                }`}
                style={{ fontFamily: font }}
              >
                {font}
                {googleFontsService.isFontLoaded(font) && (
                  <Download className="inline ml-2 text-green-500" size={12} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 字体大小控制 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => adjustFontSize(-2)}
          className="p-1 hover:bg-gray-100 rounded"
          title="减小字体"
        >
          <Minus size={14} />
        </button>
        
        <div className="relative">
          <input
            type="text"
            value={customFontSize}
            onChange={(e) => handleCustomFontSizeChange(e.target.value)}
            onBlur={() => setCustomFontSize(fontSize.toString())}
            className="w-12 px-2 py-1 text-sm text-center border border-gray-300 rounded"
          />
          <button
            onClick={() => setShowSizeDropdown(!showSizeDropdown)}
            className="absolute right-0 top-0 h-full px-1 hover:bg-gray-100 rounded-r"
          >
            <ChevronDown size={10} />
          </button>
          
          {showSizeDropdown && (
            <div className="absolute top-full left-0 mt-1 w-16 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeSelect(size)}
                  className={`w-full text-center px-2 py-1 text-sm hover:bg-gray-50 ${
                    fontSize === size ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={() => adjustFontSize(2)}
          className="p-1 hover:bg-gray-100 rounded"
          title="增大字体"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300" />

      {/* 字体样式按钮 */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleBold}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="粗体 (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        
        <button
          onClick={toggleItalic}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="斜体 (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        
        <button
          onClick={toggleUnderline}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            textDecoration === 'underline' ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="下划线 (Ctrl+U)"
        >
          <Underline size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300" />

      {/* 文本对齐按钮 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleTextAlign('left')}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            textAlign === 'left' ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="左对齐"
        >
          <AlignLeft size={16} />
        </button>
        
        <button
          onClick={() => handleTextAlign('center')}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            textAlign === 'center' ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="居中对齐"
        >
          <AlignCenter size={16} />
        </button>
        
        <button
          onClick={() => handleTextAlign('right')}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            textAlign === 'right' ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="右对齐"
        >
          <AlignRight size={16} />
        </button>
        
        <button
          onClick={() => handleTextAlign('justify')}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            textAlign === 'justify' ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="两端对齐"
        >
          <AlignJustify size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300" />

      {/* 文本颜色 */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100"
          title="文本颜色"
        >
          <Palette size={16} />
          <div
            className="w-4 h-4 rounded border border-gray-300"
            style={{ backgroundColor: color }}
          />
        </button>
        
        {showColorPicker && (
          <div className="absolute top-full right-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="mb-3">
              <HexColorPicker
                color={color}
                onChange={setColor}
              />
            </div>
            
            {/* 最近使用的颜色 */}
            {recentColors.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">最近使用</div>
                <div className="flex gap-1">
                  {recentColors.map((recentColor, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorSelect(recentColor)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: recentColor }}
                      title={recentColor}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 高级格式化选项 */}
      <div className="relative">
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="p-1.5 rounded hover:bg-gray-100"
          title="更多格式选项"
        >
          <MoreHorizontal size={16} />
        </button>
        
        {showAdvancedOptions && (
          <div className="absolute top-full right-0 mt-1 w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="space-y-4">
              {/* 行距控制 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  行距: {lineHeight.toFixed(1)}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* 字符间距控制 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  字符间距: {letterSpacing}px
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-5"
                    max="20"
                    step="0.5"
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="-5"
                    max="20"
                    step="0.5"
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* 文本缩进控制 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  文本缩进: {textIndent}px
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={textIndent}
                    onChange={(e) => setTextIndent(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={textIndent}
                    onChange={(e) => setTextIndent(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* 文本方向控制 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  文本方向
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTextDirection('horizontal')}
                    className={`p-1.5 rounded hover:bg-gray-100 ${
                      textDirection === 'horizontal' ? 'bg-blue-100 text-blue-600' : ''
                    }`}
                    title="水平文本"
                  >
                    <FlipHorizontal size={14} />
                  </button>
                  
                  <button
                    onClick={() => setTextDirection('vertical')}
                    className={`p-1.5 rounded hover:bg-gray-100 ${
                      textDirection === 'vertical' ? 'bg-blue-100 text-blue-600' : ''
                    }`}
                    title="垂直文本"
                  >
                    <FlipVertical size={14} />
                  </button>
                </div>
              </div>

              {/* 文本缩进按钮 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  文本缩进
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={increaseIndent}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="增加缩进"
                  >
                    <Indent size={14} />
                  </button>
                  
                  <button
                    onClick={decreaseIndent}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="减少缩进"
                  >
                    <Outdent size={14} />
                  </button>
                </div>
              </div>

              {/* 快速样式预设 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  快速样式
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setLineHeight(1.0);
                      setLetterSpacing(0);
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    紧凑
                  </button>
                  <button
                    onClick={() => {
                      setLineHeight(1.5);
                      setLetterSpacing(1);
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    舒适
                  </button>
                  <button
                    onClick={() => {
                      setLineHeight(2.0);
                      setLetterSpacing(2);
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    宽松
                  </button>
                  <button
                    onClick={() => {
                      setLineHeight(1.2);
                      setLetterSpacing(0);
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    默认
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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