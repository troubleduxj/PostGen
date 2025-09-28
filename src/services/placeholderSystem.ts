/**
 * 占位符系统
 * 负责占位符的识别、处理、智能替换和用户引导
 */

import { fabric } from 'fabric';
import { TemplatePlaceholder, PlaceholderType } from '@/types/template';

// 占位符建议接口
export interface PlaceholderSuggestion {
  id: string;
  type: PlaceholderType;
  content: string;
  preview?: string;
  category?: string;
  tags?: string[];
  popularity?: number;
}

// 占位符替换选项
export interface PlaceholderReplaceOptions {
  content: string;
  preserveStyle?: boolean;
  animateTransition?: boolean;
  validateContent?: boolean;
}

// 占位符状态
export interface PlaceholderState {
  isActive: boolean;
  isEditing: boolean;
  hasContent: boolean;
  suggestions: PlaceholderSuggestion[];
  lastModified: number;
}

// 占位符事件类型
export type PlaceholderEventType = 
  | 'placeholder:activated'
  | 'placeholder:deactivated'
  | 'placeholder:content:changed'
  | 'placeholder:suggestions:requested'
  | 'placeholder:replaced'
  | 'placeholder:tooltip:show'
  | 'placeholder:tooltip:hide';

// 占位符事件数据
export interface PlaceholderEventData {
  target: fabric.Object;
  placeholder: TemplatePlaceholder;
  state?: PlaceholderState;
  content?: string;
  suggestions?: PlaceholderSuggestion[];
  position?: { x: number; y: number };
}

/**
 * 占位符系统核心类
 */
export class PlaceholderSystem {
  private canvas: fabric.Canvas;
  private placeholders: Map<string, fabric.Object> = new Map();
  private placeholderStates: Map<string, PlaceholderState> = new Map();
  private suggestionProviders: Map<PlaceholderType, (placeholder: TemplatePlaceholder) => Promise<PlaceholderSuggestion[]>> = new Map();
  private eventListeners: Map<PlaceholderEventType, ((data: PlaceholderEventData) => void)[]> = new Map();
  private tooltipElement: HTMLElement | null = null;
  private activeTooltipTarget: fabric.Object | null = null;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.initializeEventListeners();
    this.initializeDefaultSuggestionProviders();
    this.createTooltipElement();
  }

  /**
   * 注册占位符对象
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  registerPlaceholder(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    const placeholderId = this.getPlaceholderId(obj);
    
    // 存储占位符对象
    this.placeholders.set(placeholderId, obj);
    
    // 初始化占位符状态
    this.placeholderStates.set(placeholderId, {
      isActive: false,
      isEditing: false,
      hasContent: this.hasValidContent(obj, placeholder),
      suggestions: [],
      lastModified: Date.now(),
    });

    // 设置占位符属性
    (obj as any).isPlaceholder = true;
    (obj as any).placeholderInfo = placeholder;
    (obj as any).placeholderId = placeholderId;

    // 应用占位符样式
    this.applyPlaceholderStyle(obj, placeholder);
    
    // 绑定事件处理器
    this.bindPlaceholderEvents(obj, placeholder);

    // 如果没有有效内容，显示占位符提示
    if (!this.hasValidContent(obj, placeholder)) {
      this.showPlaceholderHint(obj, placeholder);
    }
  }

  /**
   * 取消注册占位符对象
   * @param obj Fabric.js 对象
   */
  unregisterPlaceholder(obj: fabric.Object): void {
    const placeholderId = this.getPlaceholderId(obj);
    
    // 移除存储的引用
    this.placeholders.delete(placeholderId);
    this.placeholderStates.delete(placeholderId);
    
    // 清理对象属性
    delete (obj as any).isPlaceholder;
    delete (obj as any).placeholderInfo;
    delete (obj as any).placeholderId;
    
    // 移除事件监听器
    this.unbindPlaceholderEvents(obj);
    
    // 隐藏提示框
    if (this.activeTooltipTarget === obj) {
      this.hideTooltip();
    }
  }

  /**
   * 激活占位符
   * @param obj Fabric.js 对象
   */
  activatePlaceholder(obj: fabric.Object): void {
    const placeholderId = this.getPlaceholderId(obj);
    const placeholder = (obj as any).placeholderInfo as TemplatePlaceholder;
    const state = this.placeholderStates.get(placeholderId);
    
    if (!placeholder || !state) return;

    // 更新状态
    state.isActive = true;
    state.lastModified = Date.now();
    
    // 应用激活样式
    this.applyActiveStyle(obj, placeholder);
    
    // 显示提示框
    this.showTooltip(obj, placeholder);
    
    // 获取建议
    this.loadSuggestions(obj, placeholder);
    
    // 触发事件
    this.emitEvent('placeholder:activated', {
      target: obj,
      placeholder,
      state: { ...state }
    });
  }

  /**
   * 取消激活占位符
   * @param obj Fabric.js 对象
   */
  deactivatePlaceholder(obj: fabric.Object): void {
    const placeholderId = this.getPlaceholderId(obj);
    const placeholder = (obj as any).placeholderInfo as TemplatePlaceholder;
    const state = this.placeholderStates.get(placeholderId);
    
    if (!placeholder || !state) return;

    // 更新状态
    state.isActive = false;
    state.lastModified = Date.now();
    
    // 恢复普通样式
    this.applyPlaceholderStyle(obj, placeholder);
    
    // 隐藏提示框
    if (this.activeTooltipTarget === obj) {
      this.hideTooltip();
    }
    
    // 触发事件
    this.emitEvent('placeholder:deactivated', {
      target: obj,
      placeholder,
      state: { ...state }
    });
  }

  /**
   * 替换占位符内容
   * @param obj Fabric.js 对象
   * @param options 替换选项
   */
  async replacePlaceholderContent(
    obj: fabric.Object, 
    options: PlaceholderReplaceOptions
  ): Promise<void> {
    const placeholder = (obj as any).placeholderInfo as TemplatePlaceholder;
    const placeholderId = this.getPlaceholderId(obj);
    const state = this.placeholderStates.get(placeholderId);
    
    if (!placeholder || !state) return;

    // 验证内容
    if (options.validateContent && !this.validateContent(options.content, placeholder)) {
      throw new Error(`Invalid content for ${placeholder.type} placeholder`);
    }

    try {
      // 执行替换
      await this.performContentReplacement(obj, placeholder, options);
      
      // 更新状态
      state.hasContent = true;
      state.lastModified = Date.now();
      
      // 移除占位符样式
      this.removePlaceholderStyle(obj);
      
      // 触发事件
      this.emitEvent('placeholder:replaced', {
        target: obj,
        placeholder,
        content: options.content,
        state: { ...state }
      });
      
    } catch (error) {
      console.error('Failed to replace placeholder content:', error);
      throw error;
    }
  }

  /**
   * 获取占位符建议
   * @param obj Fabric.js 对象
   */
  async getSuggestions(obj: fabric.Object): Promise<PlaceholderSuggestion[]> {
    const placeholder = (obj as any).placeholderInfo as TemplatePlaceholder;
    const placeholderId = this.getPlaceholderId(obj);
    const state = this.placeholderStates.get(placeholderId);
    
    if (!placeholder || !state) return [];

    // 检查缓存
    if (state.suggestions.length > 0) {
      return state.suggestions;
    }

    // 获取建议
    const suggestions = await this.loadSuggestions(obj, placeholder);
    
    // 更新状态
    state.suggestions = suggestions;
    
    return suggestions;
  }

  /**
   * 注册建议提供者
   * @param type 占位符类型
   * @param provider 建议提供者函数
   */
  registerSuggestionProvider(
    type: PlaceholderType,
    provider: (placeholder: TemplatePlaceholder) => Promise<PlaceholderSuggestion[]>
  ): void {
    this.suggestionProviders.set(type, provider);
  }

  /**
   * 添加事件监听器
   * @param eventType 事件类型
   * @param listener 监听器函数
   */
  addEventListener(
    eventType: PlaceholderEventType,
    listener: (data: PlaceholderEventData) => void
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * 移除事件监听器
   * @param eventType 事件类型
   * @param listener 监听器函数
   */
  removeEventListener(
    eventType: PlaceholderEventType,
    listener: (data: PlaceholderEventData) => void
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 获取所有占位符对象
   */
  getAllPlaceholders(): Map<string, fabric.Object> {
    return new Map(this.placeholders);
  }

  /**
   * 获取占位符状态
   * @param obj Fabric.js 对象
   */
  getPlaceholderState(obj: fabric.Object): PlaceholderState | null {
    const placeholderId = this.getPlaceholderId(obj);
    return this.placeholderStates.get(placeholderId) || null;
  }

  /**
   * 清理所有占位符
   */
  cleanup(): void {
    // 清理所有占位符
    for (const obj of this.placeholders.values()) {
      this.unregisterPlaceholder(obj);
    }
    
    // 清理提示框
    this.hideTooltip();
    if (this.tooltipElement && this.tooltipElement.parentNode) {
      this.tooltipElement.parentNode.removeChild(this.tooltipElement);
    }
    
    // 清理事件监听器
    this.eventListeners.clear();
  }

  // 私有方法

  /**
   * 获取占位符ID
   * @param obj Fabric.js 对象
   */
  private getPlaceholderId(obj: fabric.Object): string {
    return (obj as any).placeholderId || 
           (obj as any).templateId || 
           `placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    // 画布选择事件
    this.canvas.on('selection:created', (e) => {
      const objects = e.selected || [];
      objects.forEach(obj => {
        if ((obj as any).isPlaceholder) {
          this.activatePlaceholder(obj);
        }
      });
    });

    this.canvas.on('selection:updated', (e) => {
      const objects = e.selected || [];
      objects.forEach(obj => {
        if ((obj as any).isPlaceholder) {
          this.activatePlaceholder(obj);
        }
      });
    });

    this.canvas.on('selection:cleared', () => {
      // 取消激活所有占位符
      for (const obj of this.placeholders.values()) {
        this.deactivatePlaceholder(obj);
      }
    });
  }

  /**
   * 绑定占位符事件
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private bindPlaceholderEvents(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    // 双击事件
    obj.on('mousedblclick', () => {
      this.handlePlaceholderDoubleClick(obj, placeholder);
    });

    // 鼠标悬停事件
    obj.on('mouseover', () => {
      if (!this.getPlaceholderState(obj)?.isActive) {
        this.showTooltip(obj, placeholder);
      }
    });

    obj.on('mouseout', () => {
      if (!this.getPlaceholderState(obj)?.isActive) {
        this.hideTooltip();
      }
    });

    // 文本编辑事件（仅对文本对象）
    if (obj instanceof fabric.IText) {
      obj.on('editing:entered', () => {
        const state = this.getPlaceholderState(obj);
        if (state) {
          state.isEditing = true;
          this.handleTextEditingStarted(obj, placeholder);
        }
      });

      obj.on('editing:exited', () => {
        const state = this.getPlaceholderState(obj);
        if (state) {
          state.isEditing = false;
          this.handleTextEditingEnded(obj, placeholder);
        }
      });

      obj.on('changed', () => {
        this.handleTextContentChanged(obj, placeholder);
      });
    }
  }

  /**
   * 解绑占位符事件
   * @param obj Fabric.js 对象
   */
  private unbindPlaceholderEvents(obj: fabric.Object): void {
    obj.off('mousedblclick');
    obj.off('mouseover');
    obj.off('mouseout');
    
    if (obj instanceof fabric.IText) {
      obj.off('editing:entered');
      obj.off('editing:exited');
      obj.off('changed');
    }
  }

  /**
   * 应用占位符样式
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private applyPlaceholderStyle(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    obj.set({
      borderColor: '#007bff',
      borderDashArray: [5, 5],
      cornerColor: '#007bff',
      cornerStyle: 'circle',
      transparentCorners: false,
      borderOpacityWhenMoving: 0.8,
    });

    // 文本占位符特殊样式
    if ((obj instanceof fabric.IText || obj instanceof fabric.Text) && 
        obj.text === placeholder.defaultContent) {
      obj.set({
        fill: '#999',
        fontStyle: 'italic',
      });
    }
  }

  /**
   * 应用激活样式
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private applyActiveStyle(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    obj.set({
      borderColor: '#28a745',
      borderDashArray: [3, 3],
      cornerColor: '#28a745',
      borderOpacityWhenMoving: 1,
    });
  }

  /**
   * 移除占位符样式
   * @param obj Fabric.js 对象
   */
  private removePlaceholderStyle(obj: fabric.Object): void {
    obj.set({
      borderColor: 'rgba(102,153,255,0.75)',
      borderDashArray: null,
      cornerColor: 'rgba(102,153,255,0.75)',
      cornerStyle: 'rect',
      transparentCorners: true,
      borderOpacityWhenMoving: 0.4,
    });
  }

  /**
   * 显示占位符提示
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private showPlaceholderHint(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    // 为文本占位符设置提示文本
    if (obj instanceof fabric.IText || obj instanceof fabric.Text) {
      if (!obj.text || obj.text.trim() === '') {
        obj.set('text', placeholder.defaultContent);
        obj.set('fill', '#999');
        obj.set('fontStyle', 'italic');
      }
    }
  }

  /**
   * 处理占位符双击事件
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private handlePlaceholderDoubleClick(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    switch (placeholder.type) {
      case 'text':
        if (obj instanceof fabric.IText) {
          obj.enterEditing();
          if (obj.text === placeholder.defaultContent) {
            obj.selectAll();
          }
        }
        break;
        
      case 'image':
      case 'logo':
      case 'icon':
        this.emitEvent('placeholder:suggestions:requested', {
          target: obj,
          placeholder,
          suggestions: this.getPlaceholderState(obj)?.suggestions || []
        });
        break;
    }
  }

  /**
   * 处理文本编辑开始
   * @param obj 文本对象
   * @param placeholder 占位符信息
   */
  private handleTextEditingStarted(obj: fabric.IText, placeholder: TemplatePlaceholder): void {
    if (obj.text === placeholder.defaultContent) {
      obj.set('text', '');
      obj.set('fill', '#000');
      obj.set('fontStyle', 'normal');
    }
  }

  /**
   * 处理文本编辑结束
   * @param obj 文本对象
   * @param placeholder 占位符信息
   */
  private handleTextEditingEnded(obj: fabric.IText, placeholder: TemplatePlaceholder): void {
    const state = this.getPlaceholderState(obj);
    if (!state) return;

    if (!obj.text || obj.text.trim() === '') {
      // 恢复占位符文本
      obj.set('text', placeholder.defaultContent);
      obj.set('fill', '#999');
      obj.set('fontStyle', 'italic');
      state.hasContent = false;
    } else {
      // 内容有效，移除占位符样式
      state.hasContent = true;
      this.removePlaceholderStyle(obj);
    }
    
    state.lastModified = Date.now();
  }

  /**
   * 处理文本内容变化
   * @param obj 文本对象
   * @param placeholder 占位符信息
   */
  private handleTextContentChanged(obj: fabric.IText, placeholder: TemplatePlaceholder): void {
    const state = this.getPlaceholderState(obj);
    if (!state) return;

    const hasValidContent = this.hasValidContent(obj, placeholder);
    
    if (hasValidContent !== state.hasContent) {
      state.hasContent = hasValidContent;
      state.lastModified = Date.now();
      
      this.emitEvent('placeholder:content:changed', {
        target: obj,
        placeholder,
        content: obj.text,
        state: { ...state }
      });
    }
  }

  /**
   * 检查是否有有效内容
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private hasValidContent(obj: fabric.Object, placeholder: TemplatePlaceholder): boolean {
    switch (placeholder.type) {
      case 'text':
        if (obj instanceof fabric.IText || obj instanceof fabric.Text) {
          return obj.text !== placeholder.defaultContent && 
                 obj.text !== '' && 
                 obj.text?.trim() !== '';
        }
        break;
        
      case 'image':
      case 'logo':
      case 'icon':
        if (obj instanceof fabric.Image) {
          const src = (obj as any).getSrc?.() || (obj as any)._element?.src;
          return src && !src.startsWith('data:image/svg+xml'); // 排除占位符SVG
        }
        break;
    }
    
    return false;
  }

  /**
   * 执行内容替换
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   * @param options 替换选项
   */
  private async performContentReplacement(
    obj: fabric.Object,
    placeholder: TemplatePlaceholder,
    options: PlaceholderReplaceOptions
  ): Promise<void> {
    switch (placeholder.type) {
      case 'text':
        if (obj instanceof fabric.IText || obj instanceof fabric.Text) {
          const oldStyle = options.preserveStyle ? {
            fill: obj.fill,
            fontFamily: obj.fontFamily,
            fontSize: obj.fontSize,
            fontWeight: obj.fontWeight,
            fontStyle: obj.fontStyle,
          } : {};
          
          obj.set({
            text: options.content,
            fill: '#000',
            fontStyle: 'normal',
            ...oldStyle
          });
        }
        break;
        
      case 'image':
      case 'logo':
      case 'icon':
        if (obj instanceof fabric.Image) {
          await new Promise<void>((resolve, reject) => {
            fabric.Image.fromURL(options.content, (newImg) => {
              if (!newImg) {
                reject(new Error('Failed to load image'));
                return;
              }
              
              // 保持原有的位置和尺寸
              const oldProps = {
                left: obj.left,
                top: obj.top,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
                angle: obj.angle,
              };
              
              // 替换图片
              newImg.set(oldProps);
              
              // 在画布中替换对象
              const canvas = obj.canvas;
              if (canvas) {
                canvas.remove(obj);
                canvas.add(newImg);
                canvas.setActiveObject(newImg);
                
                // 更新占位符引用
                const placeholderId = this.getPlaceholderId(obj);
                this.placeholders.set(placeholderId, newImg);
                (newImg as any).placeholderId = placeholderId;
              }
              
              resolve();
            });
          });
        }
        break;
    }
    
    this.canvas.renderAll();
  }

  /**
   * 验证内容
   * @param content 内容
   * @param placeholder 占位符信息
   */
  private validateContent(content: string, placeholder: TemplatePlaceholder): boolean {
    switch (placeholder.type) {
      case 'text':
        return content.trim().length > 0;
        
      case 'image':
      case 'logo':
      case 'icon':
        // 简单的URL验证
        try {
          new URL(content);
          return true;
        } catch {
          return content.startsWith('data:image/') || content.startsWith('/') || content.startsWith('./');
        }
        
      default:
        return true;
    }
  }

  /**
   * 加载建议
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private async loadSuggestions(obj: fabric.Object, placeholder: TemplatePlaceholder): Promise<PlaceholderSuggestion[]> {
    const provider = this.suggestionProviders.get(placeholder.type);
    
    if (provider) {
      try {
        return await provider(placeholder);
      } catch (error) {
        console.warn('Failed to load suggestions:', error);
      }
    }
    
    // 返回默认建议
    return placeholder.suggestions.map((suggestion, index) => ({
      id: `default_${index}`,
      type: placeholder.type,
      content: suggestion,
      category: 'default'
    }));
  }

  /**
   * 初始化默认建议提供者
   */
  private initializeDefaultSuggestionProviders(): void {
    // 文本建议提供者
    this.registerSuggestionProvider('text', async (placeholder) => {
      const suggestions = placeholder.suggestions || [];
      return suggestions.map((suggestion, index) => ({
        id: `text_${index}`,
        type: 'text',
        content: suggestion,
        category: 'default'
      }));
    });

    // 图片建议提供者
    this.registerSuggestionProvider('image', async (placeholder) => {
      // 这里可以集成图片库API
      return [];
    });

    // Logo建议提供者
    this.registerSuggestionProvider('logo', async (placeholder) => {
      // 这里可以集成Logo库API
      return [];
    });

    // 图标建议提供者
    this.registerSuggestionProvider('icon', async (placeholder) => {
      // 这里可以集成图标库API
      return [];
    });
  }

  /**
   * 创建提示框元素
   */
  private createTooltipElement(): void {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'placeholder-tooltip';
    this.tooltipElement.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.2s ease;
      max-width: 200px;
      word-wrap: break-word;
    `;
    document.body.appendChild(this.tooltipElement);
  }

  /**
   * 显示提示框
   * @param obj Fabric.js 对象
   * @param placeholder 占位符信息
   */
  private showTooltip(obj: fabric.Object, placeholder: TemplatePlaceholder): void {
    if (!this.tooltipElement) return;

    const suggestions = placeholder.suggestions.slice(0, 3).join(', ');
    const message = `双击编辑${this.getPlaceholderTypeText(placeholder.type)}${suggestions ? `，建议: ${suggestions}` : ''}`;
    
    this.tooltipElement.textContent = message;
    this.tooltipElement.style.opacity = '1';
    
    // 计算位置
    const canvasElement = this.canvas.getElement();
    const canvasRect = canvasElement.getBoundingClientRect();
    const objBounds = obj.getBoundingRect();
    
    const x = canvasRect.left + objBounds.left + objBounds.width / 2;
    const y = canvasRect.top + objBounds.top - 10;
    
    this.tooltipElement.style.left = `${x}px`;
    this.tooltipElement.style.top = `${y}px`;
    this.tooltipElement.style.transform = 'translate(-50%, -100%)';
    
    this.activeTooltipTarget = obj;
    
    // 自动隐藏
    setTimeout(() => {
      if (this.activeTooltipTarget === obj) {
        this.hideTooltip();
      }
    }, 3000);
  }

  /**
   * 隐藏提示框
   */
  private hideTooltip(): void {
    if (this.tooltipElement) {
      this.tooltipElement.style.opacity = '0';
    }
    this.activeTooltipTarget = null;
  }

  /**
   * 获取占位符类型文本
   * @param type 占位符类型
   */
  private getPlaceholderTypeText(type: PlaceholderType): string {
    switch (type) {
      case 'text': return '文本';
      case 'image': return '图片';
      case 'logo': return 'Logo';
      case 'icon': return '图标';
      default: return '内容';
    }
  }

  /**
   * 触发事件
   * @param eventType 事件类型
   * @param data 事件数据
   */
  private emitEvent(eventType: PlaceholderEventType, data: PlaceholderEventData): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in placeholder event listener:`, error);
        }
      });
    }
  }
}

// 导出便捷函数
export function createPlaceholderSystem(canvas: fabric.Canvas): PlaceholderSystem {
  return new PlaceholderSystem(canvas);
}