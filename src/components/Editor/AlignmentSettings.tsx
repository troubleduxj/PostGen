import React, { useState } from 'react';
import {
  Settings,
  Grid3X3,
  Magnet,
  Eye,
  EyeOff,

} from 'lucide-react';
import { useAlignmentStore } from '@/stores/alignmentStore';

interface AlignmentSettingsProps {
  className?: string;
}

export const AlignmentSettings: React.FC<AlignmentSettingsProps> = ({ className = '' }) => {
  const {
    grid,
    guidesVisible,
    snapToGuides,
    guideSnapThreshold,
    updateGridConfig,
    toggleGuidesVisibility,
    setSnapToGuides,
  } = useAlignmentStore();

  const [isOpen, setIsOpen] = useState(false);

  // 更新网格大小
  const handleGridSizeChange = (size: number) => {
    updateGridConfig({ size });
  };

  // 更新网格颜色
  const handleGridColorChange = (color: string) => {
    updateGridConfig({ color });
  };

  // 更新网格透明度
  const handleGridOpacityChange = (opacity: number) => {
    updateGridConfig({ opacity });
  };

  // 更新吸附阈值
  const handleSnapThresholdChange = (threshold: number) => {
    updateGridConfig({ snapThreshold: threshold });
  };

  // 更新参考线吸附阈值
  const handleGuideSnapThresholdChange = (threshold: number) => {
    useAlignmentStore.setState({ guideSnapThreshold: threshold });
  };

  return (
    <div className={`relative ${className}`}>
      {/* 设置按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`toolbar-btn ${isOpen ? 'active' : ''}`}
        title="对齐设置"
      >
        <Settings size={16} />
      </button>

      {/* 设置面板 */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            {/* 网格设置 */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Grid3X3 size={16} />
                网格设置
              </h3>
              
              <div className="space-y-3">
                {/* 网格大小 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    网格大小: {grid.size}px
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={grid.size}
                    onChange={(e) => handleGridSizeChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5px</span>
                    <span>50px</span>
                  </div>
                </div>

                {/* 网格颜色 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    网格颜色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={grid.color}
                      onChange={(e) => handleGridColorChange(e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={grid.color}
                      onChange={(e) => handleGridColorChange(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="#e5e7eb"
                    />
                  </div>
                </div>

                {/* 网格透明度 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    透明度: {Math.round(grid.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={grid.opacity}
                    onChange={(e) => handleGridOpacityChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* 网格吸附阈值 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    吸附阈值: {grid.snapThreshold}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={grid.snapThreshold}
                    onChange={(e) => handleSnapThresholdChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              {/* 参考线设置 */}
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Eye size={16} />
                参考线设置
              </h3>
              
              <div className="space-y-3">
                {/* 参考线显示 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">显示参考线</span>
                  <button
                    onClick={toggleGuidesVisibility}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      guidesVisible 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {guidesVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                    {guidesVisible ? '显示' : '隐藏'}
                  </button>
                </div>

                {/* 参考线吸附 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">参考线吸附</span>
                  <button
                    onClick={() => setSnapToGuides(!snapToGuides)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      snapToGuides 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Magnet size={12} />
                    {snapToGuides ? '开启' : '关闭'}
                  </button>
                </div>

                {/* 参考线吸附阈值 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    吸附阈值: {guideSnapThreshold}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={guideSnapThreshold}
                    onChange={(e) => handleGuideSnapThresholdChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 预设配置 */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                快速配置
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    updateGridConfig({ size: 20, color: '#e5e7eb', opacity: 0.5 });
                    setSnapToGuides(true);
                  }}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  默认设置
                </button>
                <button
                  onClick={() => {
                    updateGridConfig({ size: 10, color: '#3b82f6', opacity: 0.3 });
                    setSnapToGuides(true);
                  }}
                  className="px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                >
                  精细网格
                </button>
                <button
                  onClick={() => {
                    updateGridConfig({ size: 40, color: '#10b981', opacity: 0.4 });
                    setSnapToGuides(false);
                  }}
                  className="px-3 py-2 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                >
                  粗糙网格
                </button>
                <button
                  onClick={() => {
                    updateGridConfig({ visible: false, snapEnabled: false });
                    setSnapToGuides(false);
                  }}
                  className="px-3 py-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                >
                  关闭辅助
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 点击外部关闭面板 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};