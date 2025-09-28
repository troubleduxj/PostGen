import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { 
  Sliders, 
  Sun, 
  Contrast, 
  Palette, 
  Blur, 
  RotateCcw,
  Eye,
  Sparkles,
  Camera,
  Zap
} from 'lucide-react';
import { useImageProcessorStore } from '@/stores/imageProcessorStore';

interface ImageFiltersPanelProps {
  canvas: fabric.Canvas;
  image: fabric.Image;
  onFiltersChange?: (filters: any) => void;
}

export const ImageFiltersPanel: React.FC<ImageFiltersPanelProps> = ({
  canvas,
  image,
  onFiltersChange
}) => {
  const {
    filters,
    filterPresets,
    isProcessing,
    setFilter,
    applyFilterPreset,
    resetFilters,
    saveAsPreset
  } = useImageProcessorStore();

  const [activePreset, setActivePreset] = useState<string>('原图');
  const [showCustomName, setShowCustomName] = useState(false);
  const [customPresetName, setCustomPresetName] = useState('');

  // 监听滤镜变化
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  // 处理滤镜值变化
  const handleFilterChange = (filterName: keyof typeof filters, value: number | boolean) => {
    setFilter(filterName, value);
    setActivePreset('自定义');
  };

  // 应用预设滤镜
  const handlePresetClick = (preset: any) => {
    applyFilterPreset(preset);
    setActivePreset(preset.name);
  };

  // 重置所有滤镜
  const handleReset = () => {
    resetFilters();
    setActivePreset('原图');
  };

  // 保存自定义预设
  const handleSavePreset = () => {
    if (customPresetName.trim()) {
      saveAsPreset(customPresetName.trim());
      setCustomPresetName('');
      setShowCustomName(false);
    }
  };

  // 滤镜控制组件
  const FilterSlider: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    icon?: React.ReactNode;
    onChange: (value: number) => void;
  }> = ({ label, value, min, max, step = 1, unit = '', icon, onChange }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center text-xs text-gray-600">
          {icon && <span className="mr-1">{icon}</span>}
          {label}
        </label>
        <span className="text-xs text-gray-500">
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  // 滤镜开关组件
  const FilterToggle: React.FC<{
    label: string;
    checked: boolean;
    icon?: React.ReactNode;
    onChange: (checked: boolean) => void;
  }> = ({ label, checked, icon, onChange }) => (
    <div className="flex items-center justify-between">
      <label className="flex items-center text-xs text-gray-600">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </label>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center">
          <Sliders size={16} className="mr-2" />
          图片滤镜
        </h3>
        <button
          onClick={handleReset}
          className="p-1 hover:bg-gray-100 rounded"
          title="重置所有滤镜"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* 滤镜预设 */}
      <div className="space-y-3">
        <label className="block text-xs text-gray-600">滤镜预设</label>
        <div className="grid grid-cols-2 gap-2">
          {filterPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetClick(preset)}
              className={`p-3 text-xs border rounded-lg hover:bg-gray-50 transition-colors ${
                activePreset === preset.name
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                {getPresetIcon(preset.name)}
              </div>
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 基础调整 */}
      <div className="space-y-4">
        <h4 className="text-xs font-medium text-gray-700">基础调整</h4>
        
        {/* 亮度 */}
        <FilterSlider
          label="亮度"
          value={Math.round(filters.brightness * 100)}
          min={-100}
          max={100}
          icon={<Sun size={12} />}
          onChange={(value) => handleFilterChange('brightness', value / 100)}
        />

        {/* 对比度 */}
        <FilterSlider
          label="对比度"
          value={Math.round(filters.contrast * 100)}
          min={-100}
          max={100}
          icon={<Contrast size={12} />}
          onChange={(value) => handleFilterChange('contrast', value / 100)}
        />

        {/* 饱和度 */}
        <FilterSlider
          label="饱和度"
          value={Math.round(filters.saturation * 100)}
          min={-100}
          max={100}
          icon={<Palette size={12} />}
          onChange={(value) => handleFilterChange('saturation', value / 100)}
        />

        {/* 模糊 */}
        <FilterSlider
          label="模糊"
          value={filters.blur}
          min={0}
          max={20}
          unit="px"
          icon={<Blur size={12} />}
          onChange={(value) => handleFilterChange('blur', value)}
        />

        {/* 噪点 */}
        <FilterSlider
          label="噪点"
          value={filters.noise}
          min={0}
          max={1000}
          step={10}
          icon={<Sparkles size={12} />}
          onChange={(value) => handleFilterChange('noise', value)}
        />

        {/* 像素化 */}
        <FilterSlider
          label="像素化"
          value={filters.pixelate}
          min={0}
          max={20}
          unit="px"
          icon={<Zap size={12} />}
          onChange={(value) => handleFilterChange('pixelate', value)}
        />
      </div>

      {/* 特效开关 */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-700">特效</h4>
        
        <FilterToggle
          label="黑白"
          checked={filters.grayscale}
          icon={<Eye size={12} />}
          onChange={(checked) => handleFilterChange('grayscale', checked)}
        />

        <FilterToggle
          label="棕褐色"
          checked={filters.sepia}
          icon={<Camera size={12} />}
          onChange={(checked) => handleFilterChange('sepia', checked)}
        />

        <FilterToggle
          label="反色"
          checked={filters.invert}
          onChange={(checked) => handleFilterChange('invert', checked)}
        />

        <FilterToggle
          label="复古"
          checked={filters.vintage}
          onChange={(checked) => handleFilterChange('vintage', checked)}
        />
      </div>

      {/* 保存预设 */}
      <div className="space-y-2">
        {!showCustomName ? (
          <button
            onClick={() => setShowCustomName(true)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            保存为预设
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={customPresetName}
              onChange={(e) => setCustomPresetName(e.target.value)}
              placeholder="输入预设名称"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSavePreset();
                } else if (e.key === 'Escape') {
                  setShowCustomName(false);
                  setCustomPresetName('');
                }
              }}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSavePreset}
                className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setShowCustomName(false);
                  setCustomPresetName('');
                }}
                className="flex-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 处理状态 */}
      {isProcessing && (
        <div className="text-xs text-blue-600 text-center">
          正在处理滤镜效果...
        </div>
      )}

      {/* 使用提示 */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>• 选择预设快速应用滤镜效果</div>
        <div>• 手动调整参数创建自定义效果</div>
        <div>• 可保存常用的滤镜组合为预设</div>
      </div>
    </div>
  );
};

// 获取预设图标
const getPresetIcon = (presetName: string) => {
  const iconProps = { size: 16 };
  
  switch (presetName) {
    case '原图':
      return <Eye {...iconProps} />;
    case '黑白':
      return <Camera {...iconProps} className="text-gray-600" />;
    case '复古':
      return <Camera {...iconProps} className="text-amber-600" />;
    case '鲜艳':
      return <Palette {...iconProps} className="text-pink-500" />;
    case '柔和':
      return <Sun {...iconProps} className="text-yellow-400" />;
    case '高对比':
      return <Contrast {...iconProps} className="text-gray-800" />;
    default:
      return <Sparkles {...iconProps} />;
  }
};