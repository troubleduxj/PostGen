import React from 'react';
import { fabric } from 'fabric';

// 基础属性面板接口
export interface PropertyPanelProps {
  object: fabric.Object;
  canvas: fabric.Canvas;
  onUpdate?: (object: fabric.Object) => void;
}

// 基础属性面板组件
export abstract class BasePropertyPanel<T extends fabric.Object = fabric.Object> extends React.Component<PropertyPanelProps> {
  protected get object(): T {
    return this.props.object as T;
  }

  protected get canvas(): fabric.Canvas {
    return this.props.canvas;
  }

  // 更新对象属性
  protected updateProperty = (key: string, value: any) => {
    this.object.set(key, value);
    this.canvas.renderAll();
    this.props.onUpdate?.(this.object);
  };

  // 批量更新属性
  protected updateProperties = (properties: Record<string, any>) => {
    this.object.set(properties);
    this.canvas.renderAll();
    this.props.onUpdate?.(this.object);
  };

  // 子类需要实现的渲染方法
  abstract render(): React.ReactNode;
}

// 通用属性面板组件（函数式组件版本）
export interface BasePropertyPanelFuncProps extends PropertyPanelProps {
  children?: React.ReactNode;
}

export const BasePropertyPanelFunc: React.FC<BasePropertyPanelFuncProps> = ({
  object,
  canvas,
  onUpdate,
  children
}) => {
  // 更新对象属性的辅助函数
  const updateProperty = React.useCallback((key: string, value: any) => {
    object.set(key, value);
    canvas.renderAll();
    onUpdate?.(object);
  }, [object, canvas, onUpdate]);

  // 批量更新属性的辅助函数
  const updateProperties = React.useCallback((properties: Record<string, any>) => {
    object.set(properties);
    canvas.renderAll();
    onUpdate?.(object);
  }, [object, canvas, onUpdate]);

  // 通过 context 提供辅助函数
  const contextValue = React.useMemo(() => ({
    object,
    canvas,
    updateProperty,
    updateProperties,
  }), [object, canvas, updateProperty, updateProperties]);

  return (
    <PropertyPanelContext.Provider value={contextValue}>
      {children}
    </PropertyPanelContext.Provider>
  );
};

// Context 用于在子组件中访问属性面板功能
export interface PropertyPanelContextValue {
  object: fabric.Object;
  canvas: fabric.Canvas;
  updateProperty: (key: string, value: any) => void;
  updateProperties: (properties: Record<string, any>) => void;
}

export const PropertyPanelContext = React.createContext<PropertyPanelContextValue | null>(null);

// Hook 用于访问属性面板上下文
export const usePropertyPanel = () => {
  const context = React.useContext(PropertyPanelContext);
  if (!context) {
    throw new Error('usePropertyPanel must be used within a PropertyPanelProvider');
  }
  return context;
};

// 属性组件的通用样式类
export const propertyStyles = {
  group: 'property-group',
  label: 'property-label',
  input: 'w-full px-2 py-1 text-sm border border-gray-300 rounded',
  slider: 'w-full',
  checkbox: 'mr-2',
  button: 'px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50',
  colorSwatch: 'w-full h-8 border border-gray-300 rounded cursor-pointer',
  grid: 'grid grid-cols-2 gap-3',
  flexRow: 'flex items-center gap-2',
  flexCol: 'flex flex-col gap-2',
};