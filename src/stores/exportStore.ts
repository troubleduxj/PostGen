import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExportPreset {
  id: string;
  name: string;
  description: string;
  settings: AdvancedExportOptions;
  isDefault?: boolean;
  createdAt: string;
}

export interface AdvancedExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'svg';
  quality: number; // 0-1
  scale: number; // 导出缩放比例
  width?: number; // 自定义宽度
  height?: number; // 自定义高度
  dpi: number; // DPI设置
  backgroundColor?: string;
  transparent?: boolean; // PNG格式是否透明背景
  
  // PDF特定选项
  pdfOptions?: {
    orientation: 'portrait' | 'landscape';
    pageSize: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'custom';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    multiPage: boolean;
    compression: boolean;
  };
  
  // SVG特定选项
  svgOptions?: {
    embedImages: boolean;
    optimized: boolean;
    includeStyles: boolean;
    viewBox: boolean;
  };
}

interface ExportState {
  // 当前导出设置
  currentSettings: AdvancedExportOptions;
  
  // 导出预设
  presets: ExportPreset[];
  
  // 导出状态
  isExporting: boolean;
  exportProgress: number;
  exportError: string | null;
  
  // 批量导出
  batchExportSettings: AdvancedExportOptions[];
  isBatchExporting: boolean;
  
  // Actions
  updateSettings: (settings: Partial<AdvancedExportOptions>) => void;
  resetSettings: () => void;
  
  // 预设管理
  savePreset: (name: string, description: string) => void;
  deletePreset: (id: string) => void;
  loadPreset: (id: string) => void;
  
  // 导出状态管理
  setExporting: (isExporting: boolean) => void;
  setExportProgress: (progress: number) => void;
  setExportError: (error: string | null) => void;
  
  // 批量导出
  addBatchSetting: (settings: AdvancedExportOptions) => void;
  removeBatchSetting: (index: number) => void;
  clearBatchSettings: () => void;
  setBatchExporting: (isBatchExporting: boolean) => void;
}

const defaultSettings: AdvancedExportOptions = {
  format: 'png',
  quality: 1,
  scale: 1,
  dpi: 72,
  transparent: false,
  pdfOptions: {
    orientation: 'portrait',
    pageSize: 'A4',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    multiPage: false,
    compression: true,
  },
  svgOptions: {
    embedImages: true,
    optimized: true,
    includeStyles: true,
    viewBox: true,
  },
};

const defaultPresets: ExportPreset[] = [
  {
    id: 'web-optimized',
    name: 'Web优化',
    description: '适合网络使用的PNG格式，平衡质量和文件大小',
    settings: {
      ...defaultSettings,
      format: 'png',
      quality: 0.9,
      scale: 1,
      dpi: 72,
      transparent: true,
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'print-quality',
    name: '打印质量',
    description: '高质量JPG格式，适合打印',
    settings: {
      ...defaultSettings,
      format: 'jpg',
      quality: 1,
      scale: 3,
      dpi: 300,
      transparent: false,
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pdf-document',
    name: 'PDF文档',
    description: '标准PDF格式，适合文档分享',
    settings: {
      ...defaultSettings,
      format: 'pdf',
      quality: 1,
      scale: 1,
      dpi: 150,
      pdfOptions: {
        orientation: 'portrait',
        pageSize: 'A4',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        multiPage: false,
        compression: true,
      },
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vector-svg',
    name: '矢量SVG',
    description: '可缩放矢量格式，适合图标和简单图形',
    settings: {
      ...defaultSettings,
      format: 'svg',
      quality: 1,
      scale: 1,
      dpi: 72,
      svgOptions: {
        embedImages: true,
        optimized: true,
        includeStyles: true,
        viewBox: true,
      },
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
];

export const useExportStore = create<ExportState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentSettings: { ...defaultSettings },
      presets: [...defaultPresets],
      isExporting: false,
      exportProgress: 0,
      exportError: null,
      batchExportSettings: [],
      isBatchExporting: false,

      // 设置管理
      updateSettings: (settings) =>
        set((state) => ({
          currentSettings: { ...state.currentSettings, ...settings },
        })),

      resetSettings: () =>
        set({ currentSettings: { ...defaultSettings } }),

      // 预设管理
      savePreset: (name, description) =>
        set((state) => {
          const newPreset: ExportPreset = {
            id: `preset-${Date.now()}`,
            name,
            description,
            settings: { ...state.currentSettings },
            createdAt: new Date().toISOString(),
          };
          return {
            presets: [...state.presets, newPreset],
          };
        }),

      deletePreset: (id) =>
        set((state) => ({
          presets: state.presets.filter((preset) => preset.id !== id && !preset.isDefault),
        })),

      loadPreset: (id) =>
        set((state) => {
          const preset = state.presets.find((p) => p.id === id);
          if (preset) {
            return {
              currentSettings: { ...preset.settings },
            };
          }
          return state;
        }),

      // 导出状态管理
      setExporting: (isExporting) => set({ isExporting }),
      setExportProgress: (exportProgress) => set({ exportProgress }),
      setExportError: (exportError) => set({ exportError }),

      // 批量导出
      addBatchSetting: (settings) =>
        set((state) => ({
          batchExportSettings: [...state.batchExportSettings, settings],
        })),

      removeBatchSetting: (index) =>
        set((state) => ({
          batchExportSettings: state.batchExportSettings.filter((_, i) => i !== index),
        })),

      clearBatchSettings: () => set({ batchExportSettings: [] }),
      setBatchExporting: (isBatchExporting) => set({ isBatchExporting }),
    }),
    {
      name: 'export-store',
      partialize: (state) => ({
        presets: state.presets.filter(preset => !preset.isDefault),
        currentSettings: state.currentSettings,
      }),
    }
  )
);