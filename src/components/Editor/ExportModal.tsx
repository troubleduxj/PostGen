import React, { useState, useEffect } from 'react';
import { 
  X, Download, Settings, Image, FileText, Palette, Save, Trash2, 
  Plus, Copy, Monitor, Printer, Globe, Layers, Sliders, Grid3X3,
  AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useExportStore, AdvancedExportOptions, ExportPreset } from '@/stores/exportStore';
import { ExportService } from '@/services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { canvas, canvasState } = useEditorStore();
  const {
    currentSettings,
    presets,
    isExporting,
    exportProgress,
    exportError,
    batchExportSettings,
    isBatchExporting,
    updateSettings,
    resetSettings,
    savePreset,
    deletePreset,
    loadPreset,
    setExporting,
    setExportProgress,
    setExportError,
    addBatchSetting,
    removeBatchSetting,
    clearBatchSettings,
    setBatchExporting,
  } = useExportStore();

  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'presets'>('single');
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  // 重置状态当模态框打开时
  useEffect(() => {
    if (isOpen) {
      setExportError(null);
      setExportProgress(0);
    }
  }, [isOpen, setExportError, setExportProgress]);

  if (!isOpen) return null;

  const handleSingleExport = async () => {
    if (!canvas) return;

    setExporting(true);
    setExportError(null);
    setExportProgress(0);
    
    try {
      const exportService = new ExportService(canvas);
      const blob = await exportService.exportCanvas(
        currentSettings,
        (progress) => setExportProgress(progress)
      );
      
      // 生成文件名并下载
      const filename = ExportService.generateFileName(currentSettings.format);
      ExportService.downloadBlob(blob, filename);
      
      // 关闭弹窗
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : '导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const handleBatchExport = async () => {
    if (!canvas || batchExportSettings.length === 0) return;

    setBatchExporting(true);
    setExportError(null);
    setExportProgress(0);
    
    try {
      const exportService = new ExportService(canvas);
      const blobs = await exportService.batchExport(
        batchExportSettings,
        (progress) => setExportProgress(progress)
      );
      
      // 下载所有文件
      blobs.forEach((blob, index) => {
        const settings = batchExportSettings[index];
        const filename = ExportService.generateFileName(settings.format, `poster-batch-${index + 1}`);
        ExportService.downloadBlob(blob, filename);
      });
      
      // 关闭弹窗
      onClose();
    } catch (error) {
      console.error('Batch export failed:', error);
      setExportError(error instanceof Error ? error.message : '批量导出失败，请重试');
    } finally {
      setBatchExporting(false);
    }
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim(), presetDescription.trim());
      setPresetName('');
      setPresetDescription('');
      setShowPresetDialog(false);
    }
  };

  const handleAddToBatch = () => {
    addBatchSetting({ ...currentSettings });
  };

  const formatOptions = [
    { 
      value: 'png', 
      label: 'PNG', 
      description: '支持透明背景，适合网络使用',
      icon: Globe,
      recommended: '网络分享'
    },
    { 
      value: 'jpg', 
      label: 'JPG', 
      description: '文件较小，适合打印和分享',
      icon: Printer,
      recommended: '打印输出'
    },
    { 
      value: 'pdf', 
      label: 'PDF', 
      description: '文档格式，适合打印和存档',
      icon: FileText,
      recommended: '文档分享'
    },
    { 
      value: 'svg', 
      label: 'SVG', 
      description: '矢量格式，可无限缩放',
      icon: Layers,
      recommended: '矢量图形'
    }
  ];

  const scaleOptions = [
    { value: 0.5, label: '0.5x', description: '小尺寸，快速预览' },
    { value: 1, label: '1x', description: '原始尺寸' },
    { value: 2, label: '2x', description: '高清显示' },
    { value: 3, label: '3x', description: '超高清' },
    { value: 4, label: '4x', description: '打印质量' }
  ];

  const qualityOptions = [
    { value: 0.6, label: '60%', description: '小文件，快速加载' },
    { value: 0.8, label: '80%', description: '平衡质量与大小' },
    { value: 0.9, label: '90%', description: '高质量' },
    { value: 1, label: '100%', description: '最高质量' }
  ];

  const dpiOptions = [
    { value: 72, label: '72 DPI', description: '屏幕显示' },
    { value: 150, label: '150 DPI', description: '普通打印' },
    { value: 300, label: '300 DPI', description: '高质量打印' },
    { value: 600, label: '600 DPI', description: '专业打印' }
  ];

  const pdfPageSizes = [
    { value: 'A4', label: 'A4 (210×297mm)' },
    { value: 'A3', label: 'A3 (297×420mm)' },
    { value: 'A5', label: 'A5 (148×210mm)' },
    { value: 'Letter', label: 'Letter (216×279mm)' },
    { value: 'Legal', label: 'Legal (216×356mm)' },
    { value: 'custom', label: '自定义尺寸' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">高级导出</h2>
              <p className="text-sm text-gray-500">专业级导出设置，支持多种格式和批量导出</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'single'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              单个导出
            </div>
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'batch'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              批量导出
              {batchExportSettings.length > 0 && (
                <span className="bg-primary-100 text-primary-600 text-xs px-2 py-0.5 rounded-full">
                  {batchExportSettings.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              预设管理
            </div>
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 预览信息 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">当前画布</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500">尺寸:</span>
                <span className="ml-1 font-medium">{canvasState.width} × {canvasState.height}px</span>
              </div>
              <div>
                <span className="text-gray-500">导出尺寸:</span>
                <span className="ml-1 font-medium">
                  {Math.round(canvasState.width * currentSettings.scale)} × {Math.round(canvasState.height * currentSettings.scale)}px
                </span>
              </div>
              <div>
                <span className="text-gray-500">文件大小:</span>
                <span className="ml-1 font-medium">约 {Math.round(canvasState.width * canvasState.height * currentSettings.scale * currentSettings.scale * 3 / 1024)}KB</span>
              </div>
            </div>
          </div>

          {/* 格式选择 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">导出格式</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {formatOptions.map((format) => (
                <label
                  key={format.value}
                  className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                    currentSettings.format === format.value
                      ? 'border-primary-200 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={currentSettings.format === format.value}
                    onChange={(e) => updateSettings({ format: e.target.value as any })}
                    className="text-primary-600"
                  />
                  <div className="text-sm font-medium text-gray-900">{format.label}</div>
                </label>
              ))}
            </div>
          </div>

          {/* 质量设置 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">质量设置</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 缩放比例 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">缩放比例</label>
                <select
                  value={currentSettings.scale}
                  onChange={(e) => updateSettings({ scale: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  {scaleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* 图片质量 (仅JPG格式) */}
              {currentSettings.format === 'jpg' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">图片质量</label>
                  <select
                    value={currentSettings.quality}
                    onChange={(e) => updateSettings({ quality: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {qualityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 透明背景 (仅PNG格式) */}
              {currentSettings.format === 'png' && (
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentSettings.transparent}
                      onChange={(e) => updateSettings({ transparent: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">透明背景</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">移除背景色，保持透明效果</p>
                </div>
              )}
            </div>
          </div>

          {/* 背景色设置 */}
          {!currentSettings.transparent && currentSettings.format !== 'svg' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">背景设置</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">背景颜色</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentSettings.backgroundColor || canvasState.backgroundColor}
                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={currentSettings.backgroundColor || canvasState.backgroundColor}
                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DPI设置 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">DPI设置</h3>
            </div>
            <select
              value={currentSettings.dpi}
              onChange={(e) => updateSettings({ dpi: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {dpiOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* 自定义尺寸 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">自定义尺寸</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">宽度 (px)</label>
                <input
                  type="number"
                  value={currentSettings.width || canvasState.width}
                  onChange={(e) => updateSettings({ width: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">高度 (px)</label>
                <input
                  type="number"
                  value={currentSettings.height || canvasState.height}
                  onChange={(e) => updateSettings({ height: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* PDF特定设置 */}
          {currentSettings.format === 'pdf' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">PDF设置</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">页面方向</label>
                    <select
                      value={currentSettings.pdfOptions?.orientation || 'portrait'}
                      onChange={(e) => updateSettings({ 
                        pdfOptions: { 
                          orientation: e.target.value as 'portrait' | 'landscape',
                          pageSize: currentSettings.pdfOptions?.pageSize || 'A4',
                          margins: currentSettings.pdfOptions?.margins || { top: 20, right: 20, bottom: 20, left: 20 },
                          multiPage: currentSettings.pdfOptions?.multiPage || false,
                          compression: currentSettings.pdfOptions?.compression || true,
                        } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="portrait">纵向</option>
                      <option value="landscape">横向</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">页面大小</label>
                    <select
                      value={currentSettings.pdfOptions?.pageSize || 'A4'}
                      onChange={(e) => updateSettings({ 
                        pdfOptions: { 
                          orientation: currentSettings.pdfOptions?.orientation || 'portrait',
                          pageSize: e.target.value as any,
                          margins: currentSettings.pdfOptions?.margins || { top: 20, right: 20, bottom: 20, left: 20 },
                          multiPage: currentSettings.pdfOptions?.multiPage || false,
                          compression: currentSettings.pdfOptions?.compression || true,
                        } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {pdfPageSizes.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentSettings.pdfOptions?.compression || true}
                      onChange={(e) => updateSettings({ 
                        pdfOptions: { 
                          orientation: currentSettings.pdfOptions?.orientation || 'portrait',
                          pageSize: currentSettings.pdfOptions?.pageSize || 'A4',
                          margins: currentSettings.pdfOptions?.margins || { top: 20, right: 20, bottom: 20, left: 20 },
                          multiPage: currentSettings.pdfOptions?.multiPage || false,
                          compression: e.target.checked,
                        } 
                      })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">启用压缩</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">减小PDF文件大小</p>
                </div>
              </div>
            </div>
          )}

          {/* SVG特定设置 */}
          {currentSettings.format === 'svg' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">SVG设置</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentSettings.svgOptions?.embedImages || true}
                    onChange={(e) => updateSettings({ 
                      svgOptions: { 
                        embedImages: e.target.checked,
                        optimized: currentSettings.svgOptions?.optimized || true,
                        includeStyles: currentSettings.svgOptions?.includeStyles || true,
                        viewBox: currentSettings.svgOptions?.viewBox || true,
                      } 
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">嵌入图片</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentSettings.svgOptions?.optimized || true}
                    onChange={(e) => updateSettings({ 
                      svgOptions: { 
                        embedImages: currentSettings.svgOptions?.embedImages || true,
                        optimized: e.target.checked,
                        includeStyles: currentSettings.svgOptions?.includeStyles || true,
                        viewBox: currentSettings.svgOptions?.viewBox || true,
                      } 
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">优化代码</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentSettings.svgOptions?.includeStyles || true}
                    onChange={(e) => updateSettings({ 
                      svgOptions: { 
                        embedImages: currentSettings.svgOptions?.embedImages || true,
                        optimized: currentSettings.svgOptions?.optimized || true,
                        includeStyles: e.target.checked,
                        viewBox: currentSettings.svgOptions?.viewBox || true,
                      } 
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">包含样式</span>
                </label>
              </div>
            </div>
          )}

          {/* 错误显示 */}
          {exportError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-medium text-red-900">导出失败</h3>
              </div>
              <p className="text-sm text-red-700 mt-1">{exportError}</p>
            </div>
          )}

          {/* 进度显示 */}
          {(isExporting || isBatchExporting) && exportProgress > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <h3 className="font-medium text-blue-900">
                  {isBatchExporting ? '批量导出中...' : '导出中...'}
                </h3>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-700 mt-1">{Math.round(exportProgress)}% 完成</p>
            </div>
          )}

          {/* 快捷操作 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPresetDialog(true)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存预设
              </button>
              <button
                onClick={handleAddToBatch}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加到批量
              </button>
            </div>
            <button
              onClick={resetSettings}
              className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              重置设置
            </button>
          </div>
        </div>

        {/* 保存预设对话框 */}
        {showPresetDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">保存导出预设</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">预设名称</label>
                    <input
                      type="text"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="输入预设名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">描述 (可选)</label>
                    <textarea
                      value={presetDescription}
                      onChange={(e) => setPresetDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      placeholder="描述这个预设的用途"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowPresetDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSavePreset}
                    disabled={!presetName.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部操作 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {activeTab === 'single' && '导出后的文件将自动下载到您的设备'}
            {activeTab === 'batch' && `批量导出 ${batchExportSettings.length} 个设置`}
            {activeTab === 'presets' && `管理您的 ${presets.length} 个导出预设`}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            
            {activeTab === 'single' && (
              <button
                onClick={handleSingleExport}
                disabled={isExporting}
                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    导出中...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    导出海报
                  </>
                )}
              </button>
            )}

            {activeTab === 'batch' && (
              <button
                onClick={handleBatchExport}
                disabled={isBatchExporting || batchExportSettings.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isBatchExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    批量导出中...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    开始批量导出
                  </>
                )}
              </button>
            )}

            {activeTab === 'presets' && (
              <button
                onClick={() => setShowPresetDialog(true)}
                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新建预设
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};