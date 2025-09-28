import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical,
  RefreshCw,
  Sliders,
  Palette,
  Sun,
  Zap,
  RotateCcw as ResetIcon
} from 'lucide-react';
import { useImageProcessorStore } from '@/stores/imageProcessorStore';

interface ImageAdjustmentToolsProps {
  canvas: fabric.Canvas;
  image: fabric.Image;
  onAdjustmentChange?: (adjustments: any) => void;
}

export const ImageAdjustmentTools: React.FC<ImageAdjustmentToolsProps> = ({
  canvas,
  image,
  onAdjustmentChange
}) => {
  const {
    adjustments,
    isProcessing,
    setAdjustment,
    rotateImage,
    flipImage,
    resetAdjustments,
    resetToOriginal
  } = useImageProcessorStore();

  const [customRotation, setCustomRotation] = useState(0);

  // 监听调整变化
  useEffect(() => {
    onAdjustmentChange?.(adjustments);
  }, [adjustments, onAdjustmentChange]);

  // 处理调整值变化
  const handleAdjustmentChange = (adjustmentName: keyof typeof adjustments, value: number | boolean) => {
    setAdjustment(adjustmentName, value);
  };

  // 处理自定义旋转
  const handleCustomRotation = (angle: number) => {
    setCustomRotation(angle);
    handleAdjustmentChange('rotation', angle);
  };

  // 快速旋转
  const handleQuickRotate = (angle: number) => {
    rotateImage(angle);
    setCustomRotation((adjustments.rotation + angle) % 360);
  };

  // 翻转操作
  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    flipImage(direction);
  };

  // 重置所有调整
  const handleResetAdjustments = () => {
    resetAdjustments();
    setCustomRotation(0);
  };

  // 重置到原始状态
  const handleResetToOriginal = () => {
    resetToOriginal();
    setCustomRotation(0);
  };

  // 调整滑块组件
  const AdjustmentSlider: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    icon?: React.ReactNode;
    onChange: (value: number) => void;
  }> = ({ label, value, min, max, step = 0.01, unit = '', icon, onChange }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center text-xs text-gray-600">
          {icon && <span className="mr-1">{icon}</span>}
          {label}
        </label>
        <span className="text-xs text-gray-500">
          {typeof value === 'number' ? (
            <>
              {value > 0 && value !== 1 ? '+' : ''}
              {unit === '%' ? Math.round(value * 100) : value.toFixed(2)}
              {unit}
            </>
          ) : (
            String(value)
          )}
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

  return (
    <div className="p-4 space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center">
          <Sliders size={16} className="mr-2" />
          图片调整
        </h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleResetAdjustments}
            className="p-1 hover:bg-gray-100 rounded"
            title="重置调整"
          >
            <ResetIcon size={16} />
          </button>
          <button
            onClick={handleResetToOriginal}
            className="p-1 hover:bg-gray-100 rounded"
            title="恢复原图"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 旋转工具 */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-700">旋转</h4>
        
        {/* 快速旋转按钮 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuickRotate(-90)}
            className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
            title="逆时针旋转90°"
          >
            <RotateCcw size={16} className="mr-1" />
            -90°
          </button>
          <button
            onClick={() => handleQuickRotate(90)}
            className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
            title="顺时针旋转90°"
          >
            <RotateCw size={16} className="mr-1" />
            +90°
          </button>
        </div>

        {/* 自定义旋转 */}
        <AdjustmentSlider
          label="自定义旋转"
          value={customRotation}
          min={-180}
          max={180}
          step={1}
          unit="°"
          icon={<RotateCw size={12} />}
          onChange={handleCustomRotation}
        />
      </div>

      {/* 翻转工具 */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-700">翻转</h4>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleFlip('horizontal')}
            className={`flex-1 flex items-center justify-center px-3 py-2 border rounded hover:bg-gray-50 ${
              adjustments.flipX ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300'
            }`}
            title="水平翻转"
          >
            <FlipHorizontal size={16} className="mr-1" />
            水平
          </button>
          <button
            onClick={() => handleFlip('vertical')}
            className={`flex-1 flex items-center justify-center px-3 py-2 border rounded hover:bg-gray-50 ${
              adjustments.flipY ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300'
            }`}
            title="垂直翻转"
          >
            <FlipVertical size={16} className="mr-1" />
            垂直
          </button>
        </div>
      </div>

      {/* 透明度调整 */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-700">透明度</h4>
        
        <AdjustmentSlider
          label="透明度"
          value={adjustments.opacity}
          min={0}
          max={1}
          step={0.01}
          unit="%"
          onChange={(value) => handleAdjustmentChange('opacity', value)}
        />
      </div>

      {/* 高级调整 */}
      <div className="space-y-4">
        <h4 className="text-xs font-medium text-gray-700">高级调整</h4>
        
        {/* 色相 */}
        <AdjustmentSlider
          label="色相"
          value={adjustments.hue}
          min={-180}
          max={180}
          step={1}
          unit="°"
          icon={<Palette size={12} />}
          onChange={(value) => handleAdjustmentChange('hue', value)}
        />

        {/* Gamma */}
        <AdjustmentSlider
          label="Gamma"
          value={adjustments.gamma}
          min={0.1}
          max={3}
          step={0.1}
          icon={<Sun size={12} />}
          onChange={(value) => handleAdjustmentChange('gamma', value)}
        />
      </div>

      {/* 当前调整信息 */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-700">当前调整</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>旋转:</span>
            <span>{adjustments.rotation}°</span>
          </div>
          <div className="flex justify-between">
            <span>翻转:</span>
            <span>
              {adjustments.flipX && adjustments.flipY ? '水平+垂直' :
               adjustments.flipX ? '水平' :
               adjustments.flipY ? '垂直' : '无'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>透明度:</span>
            <span>{Math.round(adjustments.opacity * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span>色相:</span>
            <span>{adjustments.hue}°</span>
          </div>
          <div className="flex justify-between">
            <span>Gamma:</span>
            <span>{adjustments.gamma.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* 处理状态 */}
      {isProcessing && (
        <div className="text-xs text-blue-600 text-center">
          正在处理图片调整...
        </div>
      )}

      {/* 使用提示 */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>• 使用快速按钮进行90度旋转</div>
        <div>• 拖拽滑块进行精确调整</div>
        <div>• 点击翻转按钮切换翻转状态</div>
        <div>• 重置按钮可恢复默认设置</div>
      </div>
    </div>
  );
};