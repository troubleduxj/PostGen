// 导出所有属性面板组件
export { BasePropertyPanel, BasePropertyPanelFunc, usePropertyPanel, propertyStyles } from './BasePropertyPanel';
export { TextPropertyPanel } from './TextPropertyPanel';
export { ShapePropertyPanel } from './ShapePropertyPanel';
export { ImagePropertyPanel } from './ImagePropertyPanel';

// 属性面板工厂函数
import React from 'react';
import { fabric } from 'fabric';
import { TextPropertyPanel } from './TextPropertyPanel';
import { ShapePropertyPanel } from './ShapePropertyPanel';
import { ImagePropertyPanel } from './ImagePropertyPanel';

export interface PropertyPanelFactoryProps {
  object: fabric.Object;
  canvas: fabric.Canvas;
  onUpdate?: (object: fabric.Object) => void;
}

// 根据对象类型创建对应的属性面板
export const createPropertyPanel = (props: PropertyPanelFactoryProps): React.ReactElement | null => {
  const { object } = props;

  switch (object.type) {
    case 'i-text':
    case 'text':
      return React.createElement(TextPropertyPanel, {
        ...props,
        object: object as fabric.IText,
      });
    
    case 'rect':
    case 'circle':
    case 'triangle':
    case 'polygon':
    case 'line':
      return React.createElement(ShapePropertyPanel, props);
    
    case 'image':
      return React.createElement(ImagePropertyPanel, {
        ...props,
        object: object as fabric.Image,
      });
    
    default:
      // 对于未知类型，返回基础属性面板
      return null;
  }
};

// 属性面板注册表
export class PropertyPanelRegistry {
  private panels: Map<string, React.ComponentType<PropertyPanelFactoryProps>> = new Map();

  // 注册属性面板
  register(objectType: string, panelComponent: React.ComponentType<PropertyPanelFactoryProps>): void {
    this.panels.set(objectType, panelComponent);
  }

  // 获取属性面板
  getPanel(objectType: string): React.ComponentType<PropertyPanelFactoryProps> | undefined {
    return this.panels.get(objectType);
  }

  // 创建属性面板
  createPanel(props: PropertyPanelFactoryProps): React.ReactElement | null {
    const PanelComponent = this.panels.get(props.object.type);
    if (PanelComponent) {
      return React.createElement(PanelComponent, props);
    }
    
    // 回退到默认工厂函数
    return createPropertyPanel(props);
  }
}

// 全局属性面板注册表
export const propertyPanelRegistry = new PropertyPanelRegistry();

// 注册默认属性面板
propertyPanelRegistry.register('i-text', TextPropertyPanel);
propertyPanelRegistry.register('text', TextPropertyPanel);
propertyPanelRegistry.register('rect', ShapePropertyPanel);
propertyPanelRegistry.register('circle', ShapePropertyPanel);
propertyPanelRegistry.register('triangle', ShapePropertyPanel);
propertyPanelRegistry.register('polygon', ShapePropertyPanel);
propertyPanelRegistry.register('line', ShapePropertyPanel);
propertyPanelRegistry.register('image', ImagePropertyPanel);