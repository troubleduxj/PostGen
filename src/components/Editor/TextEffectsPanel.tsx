import React, { useState, useEffect } from 'react';
import {
  Palette,
  Eye,
  EyeOff,
  RotateCw,
  Sliders,
  Droplets,
  Zap,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';
import { useTextEditorStore, TextStroke, TextShadow, TextGradient, GradientColor } from '@/stores/textEditorStore';
import { HexColorPicker } from 'react-colorful';

interface TextEffectsPanelProps {
  className?: string;
}

export const TextEffectsPanel: React.FC<TextEffectsPanelProps> = ({ className = '' }) => {
  const {
    isEditing,
    effects,
    setStroke,
    setShadow,
    setGradient,
  } = useTextEditorStore();

  const [activeSection, setActiveSection] = useState<'stroke' | 'shadow' | 'gradient' | null>('stroke');
  const [showColorPickers, setShowColorPickers] = useState<{
    stroke: boolean;
    shadow: boolean;
    gradient: number | null;
  }>({
    stroke: false,
    shadow: false,
    gradient: null,
  });

  // 如果不在编辑模式，不显示面板
  if (!isEditing) {
    return null;
  }

  const toggleColorPicker = (type: 'stroke' | 'shadow', show?: boolean) => {
    setShowColorPickers(prev => ({
      ...prev,
      [type]: show !== undefined ? show : !prev[type],
      // 关闭其他颜色选择器
      ...(type === 'stroke' ? { shadow: false, gradient: null } : {}),
      ...(type === 'shadow' ? { stroke: false, gradient: null } : {}),
    }));
  };

  const toggleGradientColorPicker = (index: number | null) => {
    setShowColorPickers(prev => ({
      ...prev,
      gradient: prev.gradient === index ? null : index,
      stroke: false,
      shadow: false,
    }));
  };

  const toggleSection = (section: 'stroke' | 'shadow' | 'gradient') => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <Zap size={16} className="mr-2" />
          文字特效
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* 描边效果 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('stroke')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Palette size={16} className="mr-2" />
              <span className="text-sm font-medium">描边效果</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStroke({ enabled: !effects.stroke.enabled });
                }}
                className={`ml-2 p-1 rounded ${
                  effects.stroke.enabled ? 'text-blue-600' : 'text-gray-400'
                }`}
                title={effects.stroke.enabled ? '禁用描边' : '启用描边'}
              >
                {effects.stroke.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
            {activeSection === 'stroke' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {activeSection === 'stroke' && (
            <div className="px-3 pb-3 space-y-3 border-t border-gray-100">
              {/* 描边颜色 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">描边颜色</label>
                <div className="relative">
                  <button
                    onClick={() => toggleColorPicker('stroke')}
                    className="flex items-center gap-2 p-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: effects.stroke.color }}
                    />
                    <span className="text-sm">{effects.stroke.color}</span>
                  </button>
                  
                  {showColorPickers.stroke && (
                    <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <HexColorPicker
                        color={effects.stroke.color}
                        onChange={(color) => setStroke({ color })}
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => toggleColorPicker('stroke', false)}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          确定
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 描边宽度 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  描边宽度: {effects.stroke.width}px
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={effects.stroke.width}
                    onChange={(e) => setStroke({ width: Number(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={effects.stroke.width}
                    onChange={(e) => setStroke({ width: Number(e.target.value) })}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* 描边预设 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">快速设置</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setStroke({ width: 1, color: '#000000' })}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    细描边
                  </button>
                  <button
                    onClick={() => setStroke({ width: 3, color: '#ffffff' })}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    白色描边
                  </button>
                  <button
                    onClick={() => setStroke({ width: 5, color: '#000000' })}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    粗描边
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 阴影效果 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('shadow')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Droplets size={16} className="mr-2" />
              <span className="text-sm font-medium">阴影效果</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShadow({ enabled: !effects.shadow.enabled });
                }}
                className={`ml-2 p-1 rounded ${
                  effects.shadow.enabled ? 'text-blue-600' : 'text-gray-400'
                }`}
                title={effects.shadow.enabled ? '禁用阴影' : '启用阴影'}
              >
                {effects.shadow.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
            {activeSection === 'shadow' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {activeSection === 'shadow' && (
            <div className="px-3 pb-3 space-y-3 border-t border-gray-100">
              {/* 阴影颜色 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">阴影颜色</label>
                <div className="relative">
                  <button
                    onClick={() => toggleColorPicker('shadow')}
                    className="flex items-center gap-2 p-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: effects.shadow.color }}
                    />
                    <span className="text-sm">{effects.shadow.color}</span>
                  </button>
                  
                  {showColorPickers.shadow && (
                    <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <HexColorPicker
                        color={effects.shadow.color}
                        onChange={(color) => setShadow({ color })}
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => toggleColorPicker('shadow', false)}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          确定
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 阴影模糊 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  模糊程度: {effects.shadow.blur}px
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={effects.shadow.blur}
                    onChange={(e) => setShadow({ blur: Number(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="1"
                    value={effects.shadow.blur}
                    onChange={(e) => setShadow({ blur: Number(e.target.value) })}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* 阴影偏移X */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  水平偏移: {effects.shadow.offsetX}px
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="1"
                    value={effects.shadow.offsetX}
                    onChange={(e) => setShadow({ offsetX: Number(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="-20"
                    max="20"
                    step="1"
                    value={effects.shadow.offsetX}
                    onChange={(e) => setShadow({ offsetX: Number(e.target.value) })}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* 阴影偏移Y */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  垂直偏移: {effects.shadow.offsetY}px
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="1"
                    value={effects.shadow.offsetY}
                    onChange={(e) => setShadow({ offsetY: Number(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="-20"
                    max="20"
                    step="1"
                    value={effects.shadow.offsetY}
                    onChange={(e) => setShadow({ offsetY: Number(e.target.value) })}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* 阴影预设 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">快速设置</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShadow({ 
                      color: '#000000', 
                      blur: 4, 
                      offsetX: 2, 
                      offsetY: 2 
                    })}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    标准阴影
                  </button>
                  <button
                    onClick={() => setShadow({ 
                      color: '#ffffff', 
                      blur: 2, 
                      offsetX: 1, 
                      offsetY: 1 
                    })}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    白色阴影
                  </button>
                  <button
                    onClick={() => setShadow({ 
                      color: '#000000', 
                      blur: 8, 
                      offsetX: 4, 
                      offsetY: 4 
                    })}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    深度阴影
                  </button>
                  <button
                    onClick={() => setShadow({ 
                      color: '#ff0000', 
                      blur: 6, 
                      offsetX: 0, 
                      offsetY: 0 
                    })}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    发光效果
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 渐变填充 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('gradient')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Sliders size={16} className="mr-2" />
              <span className="text-sm font-medium">渐变填充</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setGradient({ enabled: !effects.gradient.enabled });
                }}
                className={`ml-2 p-1 rounded ${
                  effects.gradient.enabled ? 'text-blue-600' : 'text-gray-400'
                }`}
                title={effects.gradient.enabled ? '禁用渐变' : '启用渐变'}
              >
                {effects.gradient.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
            {activeSection === 'gradient' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {activeSection === 'gradient' && (
            <div className="px-3 pb-3 space-y-3 border-t border-gray-100">
              {/* 渐变类型 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">渐变类型</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGradient({ type: 'linear' })}
                    className={`flex-1 px-3 py-2 text-xs border rounded ${
                      effects.gradient.type === 'linear'
                        ? 'border-blue-300 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    线性渐变
                  </button>
                  <button
                    onClick={() => setGradient({ type: 'radial' })}
                    className={`flex-1 px-3 py-2 text-xs border rounded ${
                      effects.gradient.type === 'radial'
                        ? 'border-blue-300 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    径向渐变
                  </button>
                </div>
              </div>

              {/* 渐变角度（仅线性渐变） */}
              {effects.gradient.type === 'linear' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-2">
                    渐变角度: {effects.gradient.angle}°
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      value={effects.gradient.angle}
                      onChange={(e) => setGradient({ angle: Number(e.target.value) })}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="360"
                      step="15"
                      value={effects.gradient.angle}
                      onChange={(e) => setGradient({ angle: Number(e.target.value) })}
                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                    <button
                      onClick={() => setGradient({ angle: (effects.gradient.angle + 45) % 360 })}
                      className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                      title="旋转45°"
                    >
                      <RotateCw size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* 渐变颜色 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-600">渐变颜色</label>
                  <button
                    onClick={() => {
                      const newColors = [
                        ...effects.gradient.colors,
                        { color: '#ffffff', offset: 1 }
                      ];
                      setGradient({ colors: newColors });
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="添加颜色"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {effects.gradient.colors.map((gradientColor, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => toggleGradientColorPicker(index)}
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: gradientColor.color }}
                        />
                        
                        {showColorPickers.gradient === index && (
                          <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <HexColorPicker
                              color={gradientColor.color}
                              onChange={(color) => {
                                const newColors = [...effects.gradient.colors];
                                newColors[index] = { ...newColors[index], color };
                                setGradient({ colors: newColors });
                              }}
                            />
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => toggleGradientColorPicker(null)}
                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                              >
                                确定
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={gradientColor.offset}
                          onChange={(e) => {
                            const newColors = [...effects.gradient.colors];
                            newColors[index] = { ...newColors[index], offset: Number(e.target.value) };
                            setGradient({ colors: newColors });
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          位置: {Math.round(gradientColor.offset * 100)}%
                        </div>
                      </div>
                      
                      {effects.gradient.colors.length > 2 && (
                        <button
                          onClick={() => {
                            const newColors = effects.gradient.colors.filter((_, i) => i !== index);
                            setGradient({ colors: newColors });
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="删除颜色"
                        >
                          <Minus size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 渐变预设 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">快速设置</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGradient({
                      type: 'linear',
                      angle: 0,
                      colors: [
                        { color: '#ff0000', offset: 0 },
                        { color: '#ffff00', offset: 1 }
                      ]
                    })}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    红黄渐变
                  </button>
                  <button
                    onClick={() => setGradient({
                      type: 'linear',
                      angle: 90,
                      colors: [
                        { color: '#0000ff', offset: 0 },
                        { color: '#ffffff', offset: 1 }
                      ]
                    })}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    蓝白渐变
                  </button>
                  <button
                    onClick={() => setGradient({
                      type: 'radial',
                      angle: 0,
                      colors: [
                        { color: '#ffff00', offset: 0 },
                        { color: '#ff8800', offset: 0.5 },
                        { color: '#ff0000', offset: 1 }
                      ]
                    })}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    火焰渐变
                  </button>
                  <button
                    onClick={() => setGradient({
                      type: 'linear',
                      angle: 45,
                      colors: [
                        { color: '#000000', offset: 0 },
                        { color: '#ffffff', offset: 1 }
                      ]
                    })}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    黑白渐变
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 重置按钮 */}
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={() => {
              setStroke({ enabled: false, color: '#000000', width: 1 });
              setShadow({ enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2 });
              setGradient({ 
                enabled: false, 
                type: 'linear', 
                angle: 0,
                colors: [
                  { color: '#000000', offset: 0 },
                  { color: '#ffffff', offset: 1 }
                ]
              });
            }}
            className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            重置所有特效
          </button>
        </div>
      </div>
    </div>
  );
};