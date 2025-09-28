import React from 'react';
import { fabric } from 'fabric';
import { MousePointer2 } from 'lucide-react';
import { EditorTool } from '@/types/tools';

export class SelectTool implements EditorTool {
  id = 'select';
  name = '选择工具';
  icon = MousePointer2;
  category = 'basic' as const;
  shortcut = 'V';
  tooltip = '选择和移动对象 (V)';

  config = {
    cursor: 'default',
    allowSelection: true,
    allowDrawing: false,
  };

  activate(canvas: fabric.Canvas): void {
    // 启用选择模式
    canvas.selection = true;
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
    
    // 恢复所有对象的可选择性
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });
    
    canvas.renderAll();
  }

  deactivate(canvas: fabric.Canvas): void {
    // 清除选择
    canvas.discardActiveObject();
    canvas.renderAll();
  }

  onCanvasEvent(event: fabric.IEvent): void {
    // 选择工具不需要特殊的画布事件处理
    // 所有的选择逻辑由 Fabric.js 内置处理
  }

  onKeyDown(event: KeyboardEvent): boolean {
    // 处理删除键
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // 这里应该调用编辑器的删除方法
      // 暂时返回 false，让上层处理
      return false;
    }
    
    return false;
  }
}