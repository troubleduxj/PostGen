/**
 * 缓存监控组件
 * 用于开发和调试时监控模板缓存性能
 */

import React, { useState, useEffect } from 'react';
import { useCacheStats } from '@/hooks/useTemplateCache';
import { templateCacheManager } from '@/utils/templateCacheManager';
import { cacheUtils } from '@/services/templateRenderCache';

interface CacheMonitorProps {
  isVisible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
}

export const CacheMonitor: React.FC<CacheMonitorProps> = ({
  isVisible = true,
  position = 'bottom-right',
  compact = false
}) => {
  const { stats, refreshStats, getFormattedStats } = useCacheStats();
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const formattedStats = getFormattedStats();

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshStats, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshStats]);

  // 清理所有缓存
  const handleClearAll = () => {
    if (confirm('确定要清理所有缓存吗？')) {
      cacheUtils.cleanupCache();
      refreshStats();
    }
  };

  // 执行智能清理
  const handleSmartCleanup = () => {
    templateCacheManager.smartCleanup();
    refreshStats();
  };

  if (!isVisible) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 bg-gray-900 text-white text-xs rounded-lg shadow-lg border border-gray-700 font-mono`}
      style={{ minWidth: compact ? '200px' : '300px' }}
    >
      {/* 标题栏 */}
      <div 
        className="flex items-center justify-between p-2 bg-gray-800 rounded-t-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-semibold">缓存监控</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAutoRefresh(!autoRefresh);
            }}
            className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400' : 'bg-gray-400'}`}
            title={autoRefresh ? '自动刷新开启' : '自动刷新关闭'}
          />
          <span className="text-gray-400">
            {isExpanded ? '−' : '+'}
          </span>
        </div>
      </div>

      {/* 内容区域 */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* 总体统计 */}
          <div className="space-y-1">
            <div className="text-gray-300 font-semibold">总体统计</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>大小: {formattedStats.totalSize}</div>
              <div>条目: {formattedStats.totalEntries}</div>
            </div>
          </div>

          {/* 命中率统计 */}
          <div className="space-y-1">
            <div className="text-gray-300 font-semibold">命中率</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>预览:</span>
                <span className={getHitRateColor(stats.preview.hitRate)}>
                  {formattedStats.hitRates.preview}
                </span>
              </div>
              <div className="flex justify-between">
                <span>渲染:</span>
                <span className={getHitRateColor(stats.render.hitRate)}>
                  {formattedStats.hitRates.render}
                </span>
              </div>
              <div className="flex justify-between">
                <span>缩略图:</span>
                <span className={getHitRateColor(stats.thumbnail.hitRate)}>
                  {formattedStats.hitRates.thumbnail}
                </span>
              </div>
            </div>
          </div>

          {/* 缓存条目数 */}
          <div className="space-y-1">
            <div className="text-gray-300 font-semibold">缓存条目</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>预览:</span>
                <span>{formattedStats.entryCounts.preview}</span>
              </div>
              <div className="flex justify-between">
                <span>渲染:</span>
                <span>{formattedStats.entryCounts.render}</span>
              </div>
              <div className="flex justify-between">
                <span>缩略图:</span>
                <span>{formattedStats.entryCounts.thumbnail}</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-2 pt-2 border-t border-gray-700">
            <button
              onClick={refreshStats}
              className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
            >
              刷新
            </button>
            <button
              onClick={handleSmartCleanup}
              className="flex-1 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs transition-colors"
            >
              清理
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
            >
              清空
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 根据命中率返回颜色类名
 */
function getHitRateColor(hitRate: number): string {
  if (hitRate >= 0.8) return 'text-green-400';
  if (hitRate >= 0.6) return 'text-yellow-400';
  if (hitRate >= 0.4) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * 缓存性能指标组件
 */
export const CachePerformanceIndicator: React.FC<{
  templateId?: string;
  showDetails?: boolean;
}> = ({ templateId, showDetails = false }) => {
  const { stats } = useCacheStats();
  const [templateStats, setTemplateStats] = useState<any>(null);

  useEffect(() => {
    if (templateId) {
      const info = templateCacheManager.getTemplateCacheInfo(templateId);
      setTemplateStats(info);
    }
  }, [templateId]);

  if (!showDetails) {
    // 简单的性能指示器
    const overallHitRate = (
      stats.preview.hitRate + 
      stats.render.hitRate + 
      stats.thumbnail.hitRate
    ) / 3;

    return (
      <div className="inline-flex items-center space-x-1 text-xs">
        <div 
          className={`w-2 h-2 rounded-full ${getHitRateColor(overallHitRate).replace('text-', 'bg-')}`}
          title={`缓存命中率: ${(overallHitRate * 100).toFixed(1)}%`}
        />
        <span className="text-gray-500">缓存</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded p-2 text-xs space-y-1">
      <div className="font-semibold text-gray-700">缓存状态</div>
      
      {templateId && templateStats && (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>预览:</span>
            <span className={templateStats.hasPreview ? 'text-green-600' : 'text-gray-400'}>
              {templateStats.hasPreview ? '已缓存' : '未缓存'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>缩略图:</span>
            <span className={templateStats.hasThumbnail ? 'text-green-600' : 'text-gray-400'}>
              {templateStats.hasThumbnail ? '已缓存' : '未缓存'}
            </span>
          </div>
        </div>
      )}
      
      <div className="pt-1 border-t border-gray-200">
        <div className="flex justify-between">
          <span>总命中率:</span>
          <span className={getHitRateColor((stats.preview.hitRate + stats.render.hitRate + stats.thumbnail.hitRate) / 3)}>
            {(((stats.preview.hitRate + stats.render.hitRate + stats.thumbnail.hitRate) / 3) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * 缓存使用情况图表组件
 */
export const CacheUsageChart: React.FC = () => {
  const { stats } = useCacheStats();

  const maxSize = 200 * 1024 * 1024; // 200MB 最大限制
  const usagePercentage = (stats.total.totalSize / maxSize) * 100;

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h3 className="text-lg font-semibold mb-3">缓存使用情况</h3>
      
      {/* 使用率条形图 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>存储使用率</span>
          <span>{usagePercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              usagePercentage > 80 ? 'bg-red-500' :
              usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.preview.entryCount}
          </div>
          <div className="text-gray-600">预览图</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.render.entryCount}
          </div>
          <div className="text-gray-600">渲染结果</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.thumbnail.entryCount}
          </div>
          <div className="text-gray-600">缩略图</div>
        </div>
      </div>
    </div>
  );
};