import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useHistoryManager } from '@/hooks/useHistoryManager';
import { Tool } from '@/types';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = () => {
  const { 
    setActiveTool, 
    canvas, 
    removeObject, 
    duplicateObject,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToFit
  } = useEditorStore();
  
  const { undo, redo } = useHistoryManager();

  useEffect(() => {
    const shortcuts: KeyboardShortcut[] = [
      // 撤销重做
      {
        key: 'z',
        ctrlKey: true,
        action: undo,
        description: '撤销'
      },
      {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        action: redo,
        description: '重做'
      },
      {
        key: 'y',
        ctrlKey: true,
        action: redo,
        description: '重做'
      },
      
      // 工具切换
      {
        key: 'v',
        action: () => setActiveTool('select'),
        description: '选择工具'
      },
      {
        key: 't',
        action: () => setActiveTool('text'),
        description: '文本工具'
      },
      {
        key: 'r',
        action: () => setActiveTool('rectangle'),
        description: '矩形工具'
      },
      {
        key: 'o',
        action: () => setActiveTool('circle'),
        description: '圆形工具'
      },
      {
        key: 'l',
        action: () => setActiveTool('line'),
        description: '直线工具'
      },
      {
        key: 'p',
        action: () => setActiveTool('pen'),
        description: '画笔工具'
      },
      {
        key: 'e',
        action: () => setActiveTool('eraser'),
        description: '橡皮擦工具'
      },
      {
        key: 'h',
        action: () => setActiveTool('hand'),
        description: '移动工具'
      },
      
      // 对象操作
      {
        key: 'Delete',
        action: () => {
          const activeObject = canvas?.getActiveObject();
          if (activeObject) {
            removeObject(activeObject);
          }
        },
        description: '删除选中对象'
      },
      {
        key: 'Backspace',
        action: () => {
          const activeObject = canvas?.getActiveObject();
          if (activeObject) {
            removeObject(activeObject);
          }
        },
        description: '删除选中对象'
      },
      {
        key: 'd',
        ctrlKey: true,
        action: () => {
          const activeObject = canvas?.getActiveObject();
          if (activeObject) {
            duplicateObject(activeObject);
          }
        },
        description: '复制选中对象'
      },
      
      // 全选
      {
        key: 'a',
        ctrlKey: true,
        action: () => {
          if (canvas) {
            const objects = canvas.getObjects();
            if (objects.length > 0) {
              const selection = new fabric.ActiveSelection(objects, {
                canvas: canvas,
              });
              canvas.setActiveObject(selection);
              canvas.renderAll();
            }
          }
        },
        description: '全选'
      },
      
      // 缩放操作
      {
        key: '=',
        ctrlKey: true,
        action: zoomIn,
        description: '放大'
      },
      {
        key: '+',
        ctrlKey: true,
        action: zoomIn,
        description: '放大'
      },
      {
        key: '-',
        ctrlKey: true,
        action: zoomOut,
        description: '缩小'
      },
      {
        key: '0',
        ctrlKey: true,
        action: resetZoom,
        description: '重置缩放'
      },
      {
        key: '1',
        ctrlKey: true,
        action: zoomToFit,
        description: '适应窗口'
      },
      
      // ESC 取消选择
      {
        key: 'Escape',
        action: () => {
          if (canvas) {
            canvas.discardActiveObject();
            canvas.renderAll();
          }
        },
        description: '取消选择'
      }
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      // 防止在输入框中触发快捷键
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true'
      ) {
        return;
      }

      // 查找匹配的快捷键
      const matchedShortcut = shortcuts.find(shortcut => {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrlKey === (event.ctrlKey || event.metaKey);
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
        const altMatch = !!shortcut.altKey === event.altKey;
        
        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (matchedShortcut) {
        event.preventDefault();
        matchedShortcut.action();
      }
    };

    // 绑定事件
    document.addEventListener('keydown', handleKeyDown);

    // 清理事件
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    undo, 
    redo, 
    setActiveTool, 
    canvas, 
    removeObject, 
    duplicateObject,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToFit
  ]);

  // 返回快捷键列表供其他组件使用
  return {
    shortcuts: [
      { key: 'Ctrl+Z', description: '撤销' },
      { key: 'Ctrl+Shift+Z', description: '重做' },
      { key: 'V', description: '选择工具' },
      { key: 'T', description: '文本工具' },
      { key: 'R', description: '矩形工具' },
      { key: 'O', description: '圆形工具' },
      { key: 'L', description: '直线工具' },
      { key: 'P', description: '画笔工具' },
      { key: 'E', description: '橡皮擦工具' },
      { key: 'H', description: '移动工具' },
      { key: 'Delete', description: '删除选中对象' },
      { key: 'Ctrl+D', description: '复制选中对象' },
      { key: 'Ctrl+A', description: '全选' },
      { key: 'Ctrl++', description: '放大' },
      { key: 'Ctrl+-', description: '缩小' },
      { key: 'Ctrl+0', description: '重置缩放' },
      { key: 'Ctrl+1', description: '适应窗口' },
      { key: 'Esc', description: '取消选择' }
    ]
  };
};