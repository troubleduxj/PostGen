import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fabric } from 'fabric';

// 裁剪区域接口
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: number; // 可选的固定宽高比
}

// 图片滤镜接口
export interface ImageFilters {
  brightness: number; // -1 to 1
  contrast: number; // -1 to 1
  saturation: number; // -1 to 1
  blur: number; // 0 to 20
  sepia: boolean;
  grayscale: boolean;
  invert: boolean;
  vintage: boolean;
  noise: number; // 0 to 1000
  pixelate: number; // 2 to 20
}

// 图片调整接口
export interface ImageAdjustments {
  rotation: number; // 角度
  flipX: boolean;
  flipY: boolean;
  opacity: number; // 0 to 1
  hue: number; // -180 to 180
  gamma: number; // 0.01 to 2.2
}

// 裁剪预设
export interface CropPreset {
  name: string;
  aspectRatio: number;
  icon: string;
}

// 滤镜预设
export interface FilterPreset {
  name: string;
  filters: Partial<ImageFilters>;
  adjustments?: Partial<ImageAdjustments>;
  thumbnail?: string;
}

// 图片编辑历史记录
export interface ImageEditHistory {
  id: string;
  timestamp: number;
  action: string;
  originalState: string; // 序列化的图片状态
  newState: string;
  thumbnail?: string;
}

// 图片处理器状态接口
export interface ImageProcessorState {
  // 当前编辑的图片
  currentImage: fabric.Image | null;
  originalImageData: string | null; // 原始图片数据URL
  
  // 编辑模式
  isEditing: boolean;
  editMode: 'none' | 'crop' | 'filter' | 'adjust';
  
  // 裁剪相关
  cropMode: boolean;
  cropRect: CropRect;
  cropPresets: CropPreset[];
  
  // 滤镜和调整
  filters: ImageFilters;
  adjustments: ImageAdjustments;
  
  // 预设
  filterPresets: FilterPreset[];
  
  // 历史记录
  editHistory: ImageEditHistory[];
  historyIndex: number;
  
  // 处理状态
  isProcessing: boolean;
  processingProgress: number;
}

// 图片处理器操作接口
interface ImageProcessorActions {
  // 编辑模式控制
  enterEditMode: (image: fabric.Image, mode: 'crop' | 'filter' | 'adjust') => void;
  exitEditMode: () => void;
  setEditMode: (mode: 'none' | 'crop' | 'filter' | 'adjust') => void;
  
  // 裁剪操作
  setCropMode: (enabled: boolean) => void;
  setCropRect: (rect: Partial<CropRect>) => void;
  applyCrop: () => void;
  resetCrop: () => void;
  setCropPreset: (preset: CropPreset) => void;
  
  // 滤镜操作
  setFilter: (filterName: keyof ImageFilters, value: number | boolean) => void;
  applyFilterPreset: (preset: FilterPreset) => void;
  resetFilters: () => void;
  
  // 调整操作
  setAdjustment: (adjustmentName: keyof ImageAdjustments, value: number | boolean) => void;
  resetAdjustments: () => void;
  
  // 图片变换
  rotateImage: (angle: number) => void;
  flipImage: (direction: 'horizontal' | 'vertical') => void;
  
  // 历史记录
  saveEditState: (action: string) => void;
  undoEdit: () => void;
  redoEdit: () => void;
  clearEditHistory: () => void;
  
  // 应用和重置
  applyAllChanges: () => void;
  resetToOriginal: () => void;
  
  // 预设管理
  saveAsPreset: (name: string) => void;
  deletePreset: (presetId: string) => void;
  
  // 导出处理后的图片
  exportProcessedImage: (format?: 'png' | 'jpg', quality?: number) => Promise<string>;
  
  // 辅助方法
  applyFiltersToImage: () => void;
  applyAdjustmentsToImage: () => void;
}

type ImageProcessorStore = ImageProcessorState & ImageProcessorActions;

// 默认滤镜设置
const defaultFilters: ImageFilters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  sepia: false,
  grayscale: false,
  invert: false,
  vintage: false,
  noise: 0,
  pixelate: 0,
};

// 默认调整设置
const defaultAdjustments: ImageAdjustments = {
  rotation: 0,
  flipX: false,
  flipY: false,
  opacity: 1,
  hue: 0,
  gamma: 1,
};

// 默认裁剪区域
const defaultCropRect: CropRect = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};

// 裁剪预设
const defaultCropPresets: CropPreset[] = [
  { name: '自由', aspectRatio: 0, icon: 'crop-free' },
  { name: '1:1', aspectRatio: 1, icon: 'crop-square' },
  { name: '4:3', aspectRatio: 4/3, icon: 'crop-4-3' },
  { name: '3:4', aspectRatio: 3/4, icon: 'crop-3-4' },
  { name: '16:9', aspectRatio: 16/9, icon: 'crop-16-9' },
  { name: '9:16', aspectRatio: 9/16, icon: 'crop-9-16' },
  { name: '3:2', aspectRatio: 3/2, icon: 'crop-3-2' },
  { name: '2:3', aspectRatio: 2/3, icon: 'crop-2-3' },
];

// 滤镜预设
const defaultFilterPresets: FilterPreset[] = [
  {
    name: '原图',
    filters: defaultFilters,
    adjustments: defaultAdjustments,
  },
  {
    name: '黑白',
    filters: { ...defaultFilters, grayscale: true },
  },
  {
    name: '复古',
    filters: { 
      ...defaultFilters, 
      sepia: true, 
      contrast: 0.1, 
      brightness: -0.1 
    },
  },
  {
    name: '鲜艳',
    filters: { 
      ...defaultFilters, 
      saturation: 0.3, 
      contrast: 0.2 
    },
  },
  {
    name: '柔和',
    filters: { 
      ...defaultFilters, 
      brightness: 0.1, 
      blur: 1 
    },
  },
  {
    name: '高对比',
    filters: { 
      ...defaultFilters, 
      contrast: 0.4 
    },
  },
];

export const useImageProcessorStore = create<ImageProcessorStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      currentImage: null,
      originalImageData: null,
      
      isEditing: false,
      editMode: 'none',
      
      cropMode: false,
      cropRect: defaultCropRect,
      cropPresets: defaultCropPresets,
      
      filters: defaultFilters,
      adjustments: defaultAdjustments,
      
      filterPresets: defaultFilterPresets,
      
      editHistory: [],
      historyIndex: -1,
      
      isProcessing: false,
      processingProgress: 0,

      // 编辑模式控制
      enterEditMode: (image, mode) => {
        // 保存原始图片数据
        const originalData = image.toDataURL({
          format: 'png',
          quality: 1
        });
        
        set({ 
          currentImage: image,
          originalImageData: originalData,
          isEditing: true,
          editMode: mode,
          // 重置所有设置
          filters: defaultFilters,
          adjustments: defaultAdjustments,
          cropRect: {
            x: 0,
            y: 0,
            width: image.width || 100,
            height: image.height || 100,
          },
          editHistory: [],
          historyIndex: -1,
        });
        
        get().saveEditState('enter_edit_mode');
      },

      exitEditMode: () => {
        set({ 
          currentImage: null,
          originalImageData: null,
          isEditing: false,
          editMode: 'none',
          cropMode: false,
        });
      },

      setEditMode: (mode) => {
        set({ editMode: mode });
        if (mode === 'crop') {
          set({ cropMode: true });
        } else {
          set({ cropMode: false });
        }
      },

      // 裁剪操作
      setCropMode: (enabled) => {
        set({ cropMode: enabled });
        if (enabled) {
          set({ editMode: 'crop' });
        }
      },

      setCropRect: (rect) => {
        const { cropRect } = get();
        set({ cropRect: { ...cropRect, ...rect } });
      },

      applyCrop: () => {
        const { currentImage, cropRect } = get();
        if (!currentImage) return;

        set({ isProcessing: true });
        
        try {
          // 使用 Fabric.js 的裁剪方法
          const canvas = currentImage.canvas;
          if (canvas) {
            // 创建裁剪后的图片
            const croppedDataURL = canvas.toDataURL({
              left: cropRect.x,
              top: cropRect.y,
              width: cropRect.width,
              height: cropRect.height,
              format: 'png'
            });
            
            // 加载裁剪后的图片
            fabric.Image.fromURL(croppedDataURL, (img) => {
              if (canvas && currentImage) {
                // 替换原图片
                canvas.remove(currentImage);
                img.set({
                  left: cropRect.x,
                  top: cropRect.y
                });
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
              }
            });
          }
          
          get().saveEditState('apply_crop');
          set({ cropMode: false, editMode: 'none' });
        } catch (error) {
          console.error('Failed to apply crop:', error);
        } finally {
          set({ isProcessing: false });
        }
      },

      resetCrop: () => {
        set({ cropRect: defaultCropRect });
      },

      setCropPreset: (preset) => {
        const { currentImage } = get();
        if (!currentImage) return;

        const imageWidth = currentImage.width || 100;
        const imageHeight = currentImage.height || 100;
        
        if (preset.aspectRatio === 0) {
          // 自由裁剪
          set({ 
            cropRect: { 
              x: 0, 
              y: 0, 
              width: imageWidth, 
              height: imageHeight 
            } 
          });
        } else {
          // 固定比例裁剪
          let width, height;
          if (imageWidth / imageHeight > preset.aspectRatio) {
            height = imageHeight;
            width = height * preset.aspectRatio;
          } else {
            width = imageWidth;
            height = width / preset.aspectRatio;
          }
          
          set({ 
            cropRect: { 
              x: (imageWidth - width) / 2, 
              y: (imageHeight - height) / 2, 
              width, 
              height,
              aspectRatio: preset.aspectRatio,
            } 
          });
        }
      },

      // 滤镜操作
      setFilter: (filterName, value) => {
        const { filters } = get();
        const newFilters = { ...filters, [filterName]: value };
        set({ filters: newFilters });
        get().applyFiltersToImage();
      },

      applyFilterPreset: (preset) => {
        set({ 
          filters: { ...defaultFilters, ...preset.filters },
          adjustments: { ...defaultAdjustments, ...preset.adjustments },
        });
        get().applyFiltersToImage();
        get().saveEditState(`apply_preset_${preset.name}`);
      },

      resetFilters: () => {
        set({ filters: defaultFilters });
        get().applyFiltersToImage();
      },

      // 调整操作
      setAdjustment: (adjustmentName, value) => {
        const { adjustments } = get();
        const newAdjustments = { ...adjustments, [adjustmentName]: value };
        set({ adjustments: newAdjustments });
        get().applyAdjustmentsToImage();
      },

      resetAdjustments: () => {
        set({ adjustments: defaultAdjustments });
        get().applyAdjustmentsToImage();
      },

      // 图片变换
      rotateImage: (angle) => {
        const { currentImage, adjustments } = get();
        if (!currentImage) return;

        const newRotation = (adjustments.rotation + angle) % 360;
        set({ 
          adjustments: { ...adjustments, rotation: newRotation }
        });
        
        currentImage.set({ angle: newRotation });
        currentImage.canvas?.renderAll();
        get().saveEditState(`rotate_${angle}`);
      },

      flipImage: (direction) => {
        const { currentImage, adjustments } = get();
        if (!currentImage) return;

        const newAdjustments = { ...adjustments };
        if (direction === 'horizontal') {
          newAdjustments.flipX = !newAdjustments.flipX;
        } else {
          newAdjustments.flipY = !newAdjustments.flipY;
        }
        
        set({ adjustments: newAdjustments });
        
        currentImage.set({
          flipX: newAdjustments.flipX,
          flipY: newAdjustments.flipY,
        });
        currentImage.canvas?.renderAll();
        get().saveEditState(`flip_${direction}`);
      },

      // 历史记录
      saveEditState: (action) => {
        const { currentImage, editHistory, historyIndex } = get();
        if (!currentImage) return;

        const state = {
          filters: get().filters,
          adjustments: get().adjustments,
          cropRect: get().cropRect,
        };

        const historyItem: ImageEditHistory = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          action,
          originalState: JSON.stringify(state),
          newState: JSON.stringify(state),
        };

        const newHistory = editHistory.slice(0, historyIndex + 1);
        newHistory.push(historyItem);

        // 限制历史记录数量
        const maxHistory = 20;
        if (newHistory.length > maxHistory) {
          newHistory.shift();
        }

        set({
          editHistory: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      undoEdit: () => {
        const { editHistory, historyIndex } = get();
        if (historyIndex <= 0) return;

        const newIndex = historyIndex - 1;
        const historyItem = editHistory[newIndex];
        const state = JSON.parse(historyItem.originalState);
        
        set({
          ...state,
          historyIndex: newIndex,
        });
        
        get().applyFiltersToImage();
        get().applyAdjustmentsToImage();
      },

      redoEdit: () => {
        const { editHistory, historyIndex } = get();
        if (historyIndex >= editHistory.length - 1) return;

        const newIndex = historyIndex + 1;
        const historyItem = editHistory[newIndex];
        const state = JSON.parse(historyItem.newState);
        
        set({
          ...state,
          historyIndex: newIndex,
        });
        
        get().applyFiltersToImage();
        get().applyAdjustmentsToImage();
      },

      clearEditHistory: () => {
        set({ editHistory: [], historyIndex: -1 });
      },

      // 应用和重置
      applyAllChanges: () => {
        get().applyFiltersToImage();
        get().applyAdjustmentsToImage();
        get().saveEditState('apply_all_changes');
      },

      resetToOriginal: () => {
        const { currentImage, originalImageData } = get();
        if (!currentImage || !originalImageData) return;

        // 重置所有设置
        set({
          filters: defaultFilters,
          adjustments: defaultAdjustments,
          cropRect: defaultCropRect,
        });

        // 重新加载原始图片
        fabric.Image.fromURL(originalImageData, (img) => {
          if (currentImage.canvas) {
            currentImage.canvas.remove(currentImage);
            currentImage.canvas.add(img);
            currentImage.canvas.setActiveObject(img);
            currentImage.canvas.renderAll();
          }
        });

        get().saveEditState('reset_to_original');
      },

      // 预设管理
      saveAsPreset: (name) => {
        const { filters, adjustments, filterPresets } = get();
        const newPreset: FilterPreset = {
          name,
          filters: { ...filters },
          adjustments: { ...adjustments },
        };
        
        set({ filterPresets: [...filterPresets, newPreset] });
      },

      deletePreset: (presetId) => {
        const { filterPresets } = get();
        set({ 
          filterPresets: filterPresets.filter(p => p.name !== presetId) 
        });
      },

      // 导出处理后的图片
      exportProcessedImage: async (format = 'png', quality = 1) => {
        const { currentImage } = get();
        if (!currentImage) throw new Error('No image to export');

        set({ isProcessing: true, processingProgress: 0 });

        try {
          const dataURL = currentImage.toDataURL({
            format,
            quality,
            multiplier: 1,
          });
          
          set({ processingProgress: 100 });
          return dataURL;
        } catch (error) {
          console.error('Failed to export image:', error);
          throw error;
        } finally {
          set({ isProcessing: false, processingProgress: 0 });
        }
      },

      // 辅助方法：应用滤镜到图片
      applyFiltersToImage: () => {
        const { currentImage, filters } = get();
        if (!currentImage) return;

        set({ isProcessing: true });

        try {
          const fabricFilters: fabric.IBaseFilter[] = [];

          // 亮度滤镜
          if (filters.brightness !== 0) {
            fabricFilters.push(new fabric.Image.filters.Brightness({
              brightness: filters.brightness,
            }));
          }

          // 对比度滤镜
          if (filters.contrast !== 0) {
            fabricFilters.push(new fabric.Image.filters.Contrast({
              contrast: filters.contrast,
            }));
          }

          // 饱和度滤镜
          if (filters.saturation !== 0) {
            fabricFilters.push(new fabric.Image.filters.Saturation({
              saturation: filters.saturation,
            }));
          }

          // 模糊滤镜
          if (filters.blur > 0) {
            fabricFilters.push(new fabric.Image.filters.Blur({
              blur: filters.blur / 100,
            }));
          }

          // 棕褐色滤镜
          if (filters.sepia) {
            fabricFilters.push(new fabric.Image.filters.Sepia());
          }

          // 灰度滤镜
          if (filters.grayscale) {
            fabricFilters.push(new fabric.Image.filters.Grayscale());
          }

          // 反色滤镜
          if (filters.invert) {
            fabricFilters.push(new fabric.Image.filters.Invert());
          }

          // 噪点滤镜
          if (filters.noise > 0) {
            fabricFilters.push(new fabric.Image.filters.Noise({
              noise: filters.noise,
            }));
          }

          // 像素化滤镜
          if (filters.pixelate > 0) {
            fabricFilters.push(new fabric.Image.filters.Pixelate({
              blocksize: filters.pixelate,
            }));
          }

          currentImage.filters = fabricFilters;
          currentImage.applyFilters();
          currentImage.canvas?.renderAll();
        } catch (error) {
          console.error('Failed to apply filters:', error);
        } finally {
          set({ isProcessing: false });
        }
      },

      // 辅助方法：应用调整到图片
      applyAdjustmentsToImage: () => {
        const { currentImage, adjustments } = get();
        if (!currentImage) return;

        currentImage.set({
          angle: adjustments.rotation,
          flipX: adjustments.flipX,
          flipY: adjustments.flipY,
          opacity: adjustments.opacity,
        });

        // 色相调整
        if (adjustments.hue !== 0) {
          const hueFilter = new fabric.Image.filters.HueRotation({
            rotation: adjustments.hue,
          });
          currentImage.filters = currentImage.filters || [];
          currentImage.filters.push(hueFilter);
        }

        // Gamma调整
        if (adjustments.gamma !== 1) {
          const gammaFilter = new fabric.Image.filters.Gamma({
            gamma: [adjustments.gamma, adjustments.gamma, adjustments.gamma],
          });
          currentImage.filters = currentImage.filters || [];
          currentImage.filters.push(gammaFilter);
        }

        currentImage.applyFilters();
        currentImage.canvas?.renderAll();
      },
    }),
    {
      name: 'image-processor-store',
    }
  )
);