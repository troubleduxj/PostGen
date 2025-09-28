import { fabric } from 'fabric';
import { Type } from 'lucide-react';
import { EditorTool } from '@/types/tools';
import { useTextEditorStore } from '@/stores/textEditorStore';

export class TextTool implements EditorTool {
  id = 'text';
  name = '文本工具';
  icon = Type;
  category = 'text' as const;
  shortcut = 'T';
  tooltip = '添加文本 (T)';

  config = {
    cursor: 'text',
    allowSelection: true,
    allowDrawing: false,
  };

  private isAddingText = false;
  private textEditorStore = useTextEditorStore.getState();

  activate(canvas: fabric.Canvas): void {
    canvas.selection = true;
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'text';
    canvas.hoverCursor = 'text';
    
    this.isAddingText = true;
    
    // 添加点击事件监听器
    canvas.on('mouse:down', this.handleMouseDown);
  }

  deactivate(canvas: fabric.Canvas): void {
    this.isAddingText = false;
    
    // 移除事件监听器
    canvas.off('mouse:down', this.handleMouseDown);
    
    // 恢复默认光标
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
  }

  private handleMouseDown = (event: fabric.IEvent): void => {
    if (!this.isAddingText || !event.e) return;
    
    const canvas = event.target as unknown as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);
    
    // 检查是否点击在现有文本对象上
    const target = canvas.findTarget(event.e, false);
    if (target && target.type === 'i-text') {
      // 如果点击的是文本对象，进入编辑模式
      canvas.setActiveObject(target);
      const textObject = target as fabric.IText;
      textObject.enterEditing();
      
      // 通知文本编辑器 store 进入编辑模式
      this.textEditorStore.enterEditMode(textObject);
      return;
    }
    
    // 创建新的文本对象
    this.createTextObject(canvas, pointer.x, pointer.y);
  };

  private createTextObject(canvas: fabric.Canvas, x: number, y: number): void {
    // 获取当前文本编辑器的样式设置
    const store = this.textEditorStore;
    
    const text = new fabric.IText('双击编辑文本', {
      left: x,
      top: y,
      fontSize: store.fontSize,
      fontFamily: store.fontFamily,
      fill: store.color,
      textAlign: store.textAlign,
      fontWeight: store.fontWeight,
      fontStyle: store.fontStyle,
      lineHeight: store.lineHeight,
      charSpacing: store.letterSpacing * 1000, // Fabric.js uses different units
    });

    // 添加文本编辑事件监听
    text.on('editing:entered', () => {
      this.textEditorStore.enterEditMode(text);
    });

    text.on('editing:exited', () => {
      this.textEditorStore.exitEditMode();
    });

    // 添加到画布
    canvas.add(text);
    canvas.setActiveObject(text);
    
    // 立即进入编辑模式
    text.enterEditing();
    text.selectAll();
    
    // 通知文本编辑器 store 进入编辑模式
    this.textEditorStore.enterEditMode(text);
    
    canvas.renderAll();
  }

  onCanvasEvent(event: fabric.IEvent): void {
    // 文本工具的事件处理在 handleMouseDown 中完成
  }

  onKeyDown(event: KeyboardEvent): boolean {
    // 如果正在编辑文本，不拦截按键事件
    return false;
  }
}