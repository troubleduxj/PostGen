import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fabric } from 'fabric';
import { googleFontsService } from '@/services/googleFonts';

// 文字特效接口
export interface TextStroke {
  enabled: boolean;
  color: string;
  width: number;
}

export interface TextShadow {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface GradientColor {
  color: string;
  offset: number; // 0-1
}

export interface TextGradient {
  enabled: boolean;
  type: 'linear' | 'radial';
  colors: GradientColor[];
  angle: number; // 角度，仅用于线性渐变
}

export interface TextEffects {
  stroke: TextStroke;
  shadow: TextShadow;
  gradient: TextGradient;
}

// 文本编辑器状态接口
export interface TextEditorState {
  // 编辑模式状态
  isEditing: boolean;
  currentTextObject: fabric.IText | null;
  
  // 基础文本样式
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  color: string;
  
  // 文本对齐和间距
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  textIndent: number; // 文本缩进（像素）
  textDirection: 'horizontal' | 'vertical'; // 文本方向
  
  // 文字特效
  effects: TextEffects;
  
  // 可用字体列表
  availableFonts: string[];
  webFonts: string[];
  
  // 最近使用的样式
  recentColors: string[];
  recentFonts: string[];
}

// 文本编辑器操作接口
interface TextEditorActions {
  // 编辑模式控制
  enterEditMode: (textObject: fabric.IText) => void;
  exitEditMode: () => void;
  
  // 基础样式设置
  setFontFamily: (fontFamily: string) => void;
  setFontSize: (fontSize: number) => void;
  setFontWeight: (fontWeight: string | number) => void;
  setFontStyle: (fontStyle: 'normal' | 'italic') => void;
  setTextDecoration: (decoration: 'none' | 'underline' | 'line-through') => void;
  setColor: (color: string) => void;
  
  // 对齐和间距设置
  setTextAlign: (align: 'left' | 'center' | 'right' | 'justify') => void;
  setLineHeight: (lineHeight: number) => void;
  setLetterSpacing: (letterSpacing: number) => void;
  setTextIndent: (indent: number) => void;
  setTextDirection: (direction: 'horizontal' | 'vertical') => void;
  increaseIndent: () => void;
  decreaseIndent: () => void;
  
  // 特效设置
  setStroke: (stroke: Partial<TextStroke>) => void;
  setShadow: (shadow: Partial<TextShadow>) => void;
  setGradient: (gradient: Partial<TextGradient>) => void;
  
  // 样式应用
  applyStylesToCurrentText: () => void;
  resetTextStyles: () => void;
  
  // 字体管理
  loadWebFont: (fontFamily: string) => Promise<void>;
  addToRecentFonts: (fontFamily: string) => void;
  addToRecentColors: (color: string) => void;
  
  // Google Fonts 集成
  searchGoogleFonts: (query: string) => Promise<any[]>;
  loadGoogleFont: (fontFamily: string) => Promise<boolean>;
  getGoogleFontCategories: () => Promise<any[]>;
  
  // 预设样式
  applyPresetStyle: (preset: Partial<TextEditorState>) => void;
  
  // 辅助方法
  createGradientFill: () => string | fabric.Gradient;
}

type TextEditorStore = TextEditorState & TextEditorActions;

// 默认文字特效
const defaultTextEffects: TextEffects = {
  stroke: {
    enabled: false,
    color: '#000000',
    width: 1,
  },
  shadow: {
    enabled: false,
    color: '#000000',
    blur: 4,
    offsetX: 2,
    offsetY: 2,
  },
  gradient: {
    enabled: false,
    type: 'linear',
    colors: [
      { color: '#000000', offset: 0 },
      { color: '#ffffff', offset: 1 },
    ],
    angle: 0,
  },
};

// 默认可用字体
const defaultFonts = [
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
];

export const useTextEditorStore = create<TextEditorStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      isEditing: false,
      currentTextObject: null,
      
      // 默认文本样式
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#000000',
      
      // 默认对齐和间距
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      textIndent: 0,
      textDirection: 'horizontal',
      
      // 默认特效
      effects: defaultTextEffects,
      
      // 字体列表
      availableFonts: defaultFonts,
      webFonts: [],
      
      // 最近使用
      recentColors: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'],
      recentFonts: ['Arial', 'Helvetica', 'Times New Roman'],

      // 编辑模式控制
      enterEditMode: (textObject) => {
        set({ 
          isEditing: true, 
          currentTextObject: textObject,
          // 从当前文本对象读取样式
          fontFamily: textObject.fontFamily || 'Arial',
          fontSize: textObject.fontSize || 16,
          fontWeight: textObject.fontWeight || 'normal',
          fontStyle: textObject.fontStyle || 'normal',
          color: (textObject.fill as string) || '#000000',
          textAlign: textObject.textAlign || 'left',
        });
      },

      exitEditMode: () => {
        set({ 
          isEditing: false, 
          currentTextObject: null 
        });
      },

      // 基础样式设置
      setFontFamily: (fontFamily) => {
        set({ fontFamily });
        get().applyStylesToCurrentText();
        get().addToRecentFonts(fontFamily);
      },

      setFontSize: (fontSize) => {
        set({ fontSize });
        get().applyStylesToCurrentText();
      },

      setFontWeight: (fontWeight) => {
        set({ fontWeight });
        get().applyStylesToCurrentText();
      },

      setFontStyle: (fontStyle) => {
        set({ fontStyle });
        get().applyStylesToCurrentText();
      },

      setTextDecoration: (textDecoration) => {
        set({ textDecoration });
        get().applyStylesToCurrentText();
      },

      setColor: (color) => {
        set({ color });
        get().applyStylesToCurrentText();
        get().addToRecentColors(color);
      },

      // 对齐和间距设置
      setTextAlign: (textAlign) => {
        set({ textAlign });
        get().applyStylesToCurrentText();
      },

      setLineHeight: (lineHeight) => {
        set({ lineHeight });
        get().applyStylesToCurrentText();
      },

      setLetterSpacing: (letterSpacing) => {
        set({ letterSpacing });
        get().applyStylesToCurrentText();
      },

      setTextIndent: (textIndent) => {
        set({ textIndent });
        get().applyStylesToCurrentText();
      },

      setTextDirection: (textDirection) => {
        set({ textDirection });
        get().applyStylesToCurrentText();
      },

      increaseIndent: () => {
        const { textIndent } = get();
        const newIndent = textIndent + 20; // 每次增加20px
        set({ textIndent: newIndent });
        get().applyStylesToCurrentText();
      },

      decreaseIndent: () => {
        const { textIndent } = get();
        const newIndent = Math.max(0, textIndent - 20); // 最小为0
        set({ textIndent: newIndent });
        get().applyStylesToCurrentText();
      },

      // 特效设置
      setStroke: (stroke) => {
        const { effects } = get();
        const newEffects = {
          ...effects,
          stroke: { ...effects.stroke, ...stroke }
        };
        set({ effects: newEffects });
        get().applyStylesToCurrentText();
      },

      setShadow: (shadow) => {
        const { effects } = get();
        const newEffects = {
          ...effects,
          shadow: { ...effects.shadow, ...shadow }
        };
        set({ effects: newEffects });
        get().applyStylesToCurrentText();
      },

      setGradient: (gradient) => {
        const { effects } = get();
        const newEffects = {
          ...effects,
          gradient: { ...effects.gradient, ...gradient }
        };
        set({ effects: newEffects });
        get().applyStylesToCurrentText();
      },

      // 样式应用
      applyStylesToCurrentText: () => {
        const { 
          currentTextObject, 
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
          effects 
        } = get();
        
        if (!currentTextObject) return;

        // 应用基础样式
        currentTextObject.set({
          fontFamily,
          fontSize,
          fontWeight,
          fontStyle,
          textDecoration,
          fill: effects.gradient.enabled ? get().createGradientFill() : color,
          textAlign,
          lineHeight,
          charSpacing: letterSpacing * 1000, // Fabric.js uses different units
        });

        // 应用文本方向
        if (textDirection === 'vertical') {
          // 垂直文本：旋转90度并调整位置
          currentTextObject.set({
            angle: 90,
            originX: 'center',
            originY: 'center',
          });
        } else {
          // 水平文本：重置旋转
          currentTextObject.set({
            angle: 0,
            originX: 'left',
            originY: 'top',
          });
        }

        // 应用文本缩进（通过调整left位置实现）
        if (textIndent > 0 && textAlign === 'left' && textDirection === 'horizontal') {
          const originalLeft = currentTextObject.left || 0;
          currentTextObject.set({
            left: originalLeft + textIndent
          });
        }

        // 应用描边效果
        if (effects.stroke.enabled) {
          currentTextObject.set({
            stroke: effects.stroke.color,
            strokeWidth: effects.stroke.width,
          });
        } else {
          currentTextObject.set({
            stroke: '',
            strokeWidth: 0,
          });
        }

        // 应用阴影效果
        if (effects.shadow.enabled) {
          currentTextObject.set({
            shadow: new fabric.Shadow({
              color: effects.shadow.color,
              blur: effects.shadow.blur,
              offsetX: effects.shadow.offsetX,
              offsetY: effects.shadow.offsetY,
            }),
          });
        } else {
          currentTextObject.set({ shadow: null });
        }

        // 重新渲染画布
        currentTextObject.canvas?.renderAll();
      },

      resetTextStyles: () => {
        set({
          fontFamily: 'Arial',
          fontSize: 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#000000',
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 0,
          textIndent: 0,
          textDirection: 'horizontal',
          effects: defaultTextEffects,
        });
        get().applyStylesToCurrentText();
      },

      // 字体管理
      loadWebFont: async (fontFamily) => {
        try {
          // 使用 Google Fonts 服务加载字体
          const success = await googleFontsService.loadFont(fontFamily);
          
          if (success) {
            const { webFonts } = get();
            if (!webFonts.includes(fontFamily)) {
              set({ webFonts: [...webFonts, fontFamily] });
            }
          }
        } catch (error) {
          console.error('Failed to load web font:', error);
        }
      },

      addToRecentFonts: (fontFamily) => {
        const { recentFonts } = get();
        const newRecentFonts = [fontFamily, ...recentFonts.filter(f => f !== fontFamily)].slice(0, 10);
        set({ recentFonts: newRecentFonts });
      },

      addToRecentColors: (color) => {
        const { recentColors } = get();
        const newRecentColors = [color, ...recentColors.filter(c => c !== color)].slice(0, 10);
        set({ recentColors: newRecentColors });
      },

      // 预设样式
      applyPresetStyle: (preset) => {
        set(preset);
        get().applyStylesToCurrentText();
      },

      // Google Fonts 集成
      searchGoogleFonts: async (query) => {
        try {
          return await googleFontsService.searchFonts(query);
        } catch (error) {
          console.error('Failed to search Google Fonts:', error);
          return [];
        }
      },

      loadGoogleFont: async (fontFamily) => {
        try {
          const success = await googleFontsService.loadFont(fontFamily);
          if (success) {
            const { webFonts } = get();
            if (!webFonts.includes(fontFamily)) {
              set({ webFonts: [...webFonts, fontFamily] });
            }
            get().addToRecentFonts(fontFamily);
          }
          return success;
        } catch (error) {
          console.error('Failed to load Google Font:', error);
          return false;
        }
      },

      getGoogleFontCategories: async () => {
        try {
          const fonts = await googleFontsService.getFontList();
          const categories = [...new Set(fonts.map(font => font.category))];
          return categories.map(category => ({
            id: category,
            name: category,
            value: category
          }));
        } catch (error) {
          console.error('Failed to get Google Font categories:', error);
          return [];
        }
      },

      // 辅助方法：创建渐变填充
      createGradientFill: () => {
        const { effects, currentTextObject } = get();
        if (!currentTextObject || !effects.gradient.enabled) return '#000000';

        const gradient = effects.gradient;
        const coords = gradient.type === 'linear' 
          ? {
              x1: 0,
              y1: 0,
              x2: Math.cos(gradient.angle * Math.PI / 180) * 100,
              y2: Math.sin(gradient.angle * Math.PI / 180) * 100,
            }
          : {
              x1: 50,
              y1: 50,
              x2: 50,
              y2: 50,
              r1: 0,
              r2: 50,
            };

        const fabricGradient = new fabric.Gradient({
          type: gradient.type,
          coords,
          colorStops: gradient.colors.map(c => ({
            color: c.color,
            offset: c.offset,
          })),
        });

        return fabricGradient;
      },
    }),
    {
      name: 'text-editor-store',
    }
  )
);