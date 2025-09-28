import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '@/stores/editorStore';
import { useLayerManagerStore } from '@/stores/layerManagerStore';
import { MultiSelectToolbar } from './MultiSelectToolbar';
import { SelectionIndicator } from './SelectionIndicator';
import { GridSystem } from './GridSystem';

interface CanvasProps {
  className?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { setCanvas, canvasState, updateCanvasState, preferences } = useEditorStore();
  const { addLayer, removeLayer, updateLayer, syncWithCanvas } = useLayerManagerStore();
  const [canvasSize, setCanvasSize] = useState({ 
    width: canvasState.width, 
    height: canvasState.height 
  });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canvasContainerRef, setCanvasContainerRef] = useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [showMultiSelectToolbar, setShowMultiSelectToolbar] = useState(false);
  const [hasGroupInSelection, setHasGroupInSelection] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // 创建Fabric.js画布
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = fabricCanvas;
    
    // 将canvas实例传递给store
    setCanvas(fabricCanvas);
    
    console.log('Canvas created and set to store');

    // 设置现代化的选择样式
    fabricCanvas.selectionColor = 'rgba(24, 144, 255, 0.2)'; // 更明显的选择框背景
    fabricCanvas.selectionBorderColor = '#1890ff';
    fabricCanvas.selectionLineWidth = 2;
    fabricCanvas.selectionDashArray = []; // 使用实线而不是虚线，更清晰
    
    // 确保选择框可见和功能正常
    fabricCanvas.selectionFullyContained = false; // 允许部分选择
    fabricCanvas.skipTargetFind = false; // 允许查找目标对象
    
    // 设置选择框的样式，确保在多选时可见
    fabricCanvas.on('before:selection:cleared', () => {
      console.log('Selection about to be cleared');
    });
    
    // 启用多选功能
    fabricCanvas.selection = true;
    fabricCanvas.preserveObjectStacking = true;
    
    // 确保多选功能正常工作
    console.log('Canvas multi-selection enabled:', fabricCanvas.selection);
    
    // 设置多选时的样式和工具栏显示
    const updateSelection = (selection: fabric.Object[]) => {
      setSelectedObjects(selection);
      const hasGroup = selection.some(obj => obj.type === 'group');
      setHasGroupInSelection(hasGroup);
      
      if (selection.length > 1) {
        setShowMultiSelectToolbar(true);
        console.log(`选中了 ${selection.length} 个对象`);
      } else {
        setShowMultiSelectToolbar(false);
      }
    };
    
    fabricCanvas.on('selection:created', (e) => {
      const selection = e.selected || [];
      updateSelection(selection);
    });
    
    fabricCanvas.on('selection:updated', (e) => {
      const selection = e.selected || [];
      updateSelection(selection);
    });
    
    fabricCanvas.on('selection:cleared', () => {
      setSelectedObjects([]);
      setShowMultiSelectToolbar(false);
      setHasGroupInSelection(false);
    });



    // 添加右键菜单支持
    fabricCanvas.on('mouse:down', (options) => {
      if (options.e.button === 2) { // 右键
        const pointer = fabricCanvas.getPointer(options.e);
        const target = fabricCanvas.findTarget(options.e, false);
        
        // 右键菜单功能
        if (target) {
          const activeSelection = fabricCanvas.getActiveObject();
          
          // 如果选中了多个对象
          if (activeSelection && activeSelection.type === 'activeSelection') {
            const objects = (activeSelection as fabric.ActiveSelection).getObjects();
            if (objects.length >= 2) {
              const action = window.confirm(`选中了 ${objects.length} 个对象。是否要组合它们？`);
              if (action) {
                // 这里可以调用组合功能
                console.log('用户选择组合对象');
                // 触发组合操作的事件
                window.dispatchEvent(new CustomEvent('canvas:group-objects', { 
                  detail: { objects } 
                }));
              }
            }
          } else if (target.type === 'group') {
            // 如果是组合对象
            const action = window.confirm('这是一个组合对象。是否要取消组合？');
            if (action) {
              console.log('用户选择取消组合');
              // 触发取消组合操作的事件
              window.dispatchEvent(new CustomEvent('canvas:ungroup-object', { 
                detail: { group: target } 
              }));
            }
          } else {
            // 单个对象的右键菜单
            const action = window.confirm('删除这个对象吗？');
            if (action) {
              fabricCanvas.remove(target);
              fabricCanvas.renderAll();
            }
          }
        }
        options.e.preventDefault();
      }
    });

    // 自定义控制点样式
    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: '#1890ff',
      cornerStyle: 'rect',
      cornerSize: 8,
      borderColor: '#1890ff',
      borderScaleFactor: 1,
      borderDashArray: [4, 4],
    });

    // 添加欢迎文本
    const welcomeText = new fabric.Text('点击开始创作您的海报', {
      left: canvasSize.width / 2,
      top: canvasSize.height / 2 - 50,
      fontSize: Math.min(canvasSize.width / 30, 28),
      fill: '#666666',
      fontFamily: 'Arial',
      originX: 'center',
      originY: 'center'
    });

    // 添加副标题
    const subText = new fabric.Text('拖拽、编辑、创造', {
      left: canvasSize.width / 2,
      top: canvasSize.height / 2,
      fontSize: Math.min(canvasSize.width / 50, 16),
      fill: '#999999',
      fontFamily: 'Arial',
      originX: 'center',
      originY: 'center'
    });

    // 添加装饰性矩形
    const decorRect = new fabric.Rect({
      left: canvasSize.width / 2 - 50,
      top: canvasSize.height / 2 + 20,
      width: 100,
      height: 4,
      fill: '#1890ff',
      rx: 2,
      ry: 2,
      selectable: false
    });

    // 先添加对象到画布
    fabricCanvas.add(welcomeText, subText, decorRect);
    
    // 确保选择工具处于激活状态
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = true;
    
    // 测试多选功能
    setTimeout(() => {
      console.log('Canvas selection status:', {
        selection: fabricCanvas.selection,
        isDrawingMode: fabricCanvas.isDrawingMode,
        objectsCount: fabricCanvas.getObjects().length
      });
    }, 1000);
    
    fabricCanvas.renderAll();

    // 清理函数
    return () => {
      console.log('Canvas disposing...');
      fabricCanvas.dispose();
    };
  }, []); // 移除canvasSize依赖，只在组件挂载时创建一次

  // 确保图层同步 - 延迟执行以确保LayerPanel已挂载
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const timer = setTimeout(() => {
        console.log('Canvas: Initial sync with layers, objects count:', canvas.getObjects().length);
        syncWithCanvas(canvas);
      }, 500); // 延迟500ms确保LayerPanel已挂载
      
      return () => clearTimeout(timer);
    }
  }, [syncWithCanvas]);

  // 单独处理canvas尺寸变化
  useEffect(() => {
    if (fabricCanvasRef.current) {
      console.log('Updating canvas size:', canvasSize);
      fabricCanvasRef.current.setDimensions({ 
        width: canvasSize.width, 
        height: canvasSize.height 
      });
      fabricCanvasRef.current.renderAll();
    }
  }, [canvasSize]);

  // 监听preferences变化，动态更新画布容器样式
  useEffect(() => {
    if (canvasContainerRef) {
      const showBorder = preferences?.showCanvasBorder ?? false;
      
      canvasContainerRef.style.padding = showBorder ? '20px' : '0px';
      canvasContainerRef.style.backgroundColor = showBorder ? '#ffffff' : 'transparent';
      canvasContainerRef.style.borderRadius = showBorder ? '12px' : '0px';
      canvasContainerRef.style.boxShadow = showBorder ? '0 8px 32px rgba(0,0,0,0.15)' : 'none';
      canvasContainerRef.style.border = showBorder ? '1px solid #e0e0e0' : 'none';
    }
  }, [preferences?.showCanvasBorder, canvasContainerRef]);

  // 处理画布尺寸变化
  const handleSizeChange = (width: number, height: number) => {
    setCanvasSize({ width, height });
    updateCanvasState({ width, height });
  };

  // 键盘快捷键和鼠标事件处理
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !canvas.getElement()) return;

    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeObject = canvas.getActiveObject();
      
      // 防止在输入框中触发
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Delete键删除对象
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeObject) {
          canvas.remove(activeObject);
          canvas.renderAll();
        }
        e.preventDefault();
      }
      
      // Ctrl+D 复制对象
      if (e.ctrlKey && e.key === 'd') {
        if (activeObject) {
          activeObject.clone((cloned: fabric.Object) => {
            cloned.set({
              left: (cloned.left || 0) + 20,
              top: (cloned.top || 0) + 20,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
          });
        }
        e.preventDefault();
      }

      // 缩放快捷键
      if (e.ctrlKey) {
        if (e.key === '=' || e.key === '+') {
          // 放大
          let zoom = canvas.getZoom();
          zoom = Math.min(zoom * 1.2, 5);
          canvas.setZoom(zoom);
          canvas.renderAll();
          updateCanvasState({ zoom });
          e.preventDefault();
        } else if (e.key === '-') {
          // 缩小
          let zoom = canvas.getZoom();
          zoom = Math.max(zoom / 1.2, 0.1);
          canvas.setZoom(zoom);
          canvas.renderAll();
          updateCanvasState({ zoom });
          e.preventDefault();
        } else if (e.key === '0') {
          // 适应屏幕
          const container = canvas.getElement().parentElement?.parentElement;
          if (container) {
            const containerWidth = container.clientWidth - 80;
            const containerHeight = container.clientHeight - 80;
            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();
            
            const scaleX = containerWidth / canvasWidth;
            const scaleY = containerHeight / canvasHeight;
            const scale = Math.min(scaleX, scaleY, 1);
            
            canvas.setZoom(scale);
            canvas.renderAll();
            updateCanvasState({ zoom: scale });
          }
          e.preventDefault();
        } else if (e.key === '1') {
          // 重置缩放
          canvas.setZoom(1);
          canvas.renderAll();
          updateCanvasState({ zoom: 1 });
          e.preventDefault();
        }
      }
      
      // 方向键移动对象
      if (activeObject && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const step = e.shiftKey ? 10 : 1;
        const currentLeft = activeObject.left || 0;
        const currentTop = activeObject.top || 0;
        
        switch (e.key) {
          case 'ArrowUp':
            activeObject.set('top', currentTop - step);
            break;
          case 'ArrowDown':
            activeObject.set('top', currentTop + step);
            break;
          case 'ArrowLeft':
            activeObject.set('left', currentLeft - step);
            break;
          case 'ArrowRight':
            activeObject.set('left', currentLeft + step);
            break;
        }
        
        canvas.renderAll();
        e.preventDefault();
      }

      // 空格键开始平移
      if (e.code === 'Space' && !isPanning) {
        isPanning = true;
        (canvas as any)._isPanning = true;
        canvas.selection = false;
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // 空格键结束平移
      if (e.code === 'Space' && isPanning) {
        isPanning = false;
        (canvas as any)._isPanning = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'move';
        e.preventDefault();
      }
    };

    // 鼠标滚轮缩放
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const delta = e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      
      if (zoom > 5) zoom = 5;
      if (zoom < 0.1) zoom = 0.1;
      
      const point = new fabric.Point(e.offsetX, e.offsetY);
      canvas.zoomToPoint(point, zoom);
      
      // 更新状态
      updateCanvasState({ zoom });
    };

    // 鼠标平移
    const handleMouseDown = (opt: fabric.IEvent) => {
      const evt = opt.e as MouseEvent;
      if (isPanning) {
        (canvas as any)._isDragging = true;
        canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        canvas.defaultCursor = 'grabbing';
        canvas.hoverCursor = 'grabbing';
      }
    };

    const handleMouseMove = (opt: fabric.IEvent) => {
      const evt = opt.e as MouseEvent;
      if ((canvas as any)._isDragging && isPanning) {
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += evt.clientX - lastPosX;
          vpt[5] += evt.clientY - lastPosY;
          canvas.requestRenderAll();
          lastPosX = evt.clientX;
          lastPosY = evt.clientY;
        }
      }
    };

    const handleMouseUp = () => {
      if (isPanning) {
        (canvas as any)._isDragging = false;
        canvas.selection = true;
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';
      }
    };

    // 添加事件监听器
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    const canvasElement = canvas.getElement();
    if (canvasElement) {
      canvasElement.addEventListener('wheel', handleWheel);
    }
    
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      
      // 安全地移除canvas事件监听器
      if (canvas) {
        try {
          const canvasElement = canvas.getElement();
          if (canvasElement) {
            canvasElement.removeEventListener('wheel', handleWheel);
          }
          canvas.off('mouse:down', handleMouseDown);
          canvas.off('mouse:move', handleMouseMove);
          canvas.off('mouse:up', handleMouseUp);
        } catch (error) {
          console.warn('Error removing canvas event listeners:', error);
        }
      }
    };
  }, [updateCanvasState]);

  return (
    <div 
      className={`poster-workspace ${className}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        position: 'relative'
      }}
    >
      {/* 画布容器 */}
      <div
        ref={setCanvasContainerRef}
        style={{
          padding: '0px', // 初始状态为无边框
          backgroundColor: 'transparent',
          borderRadius: '0px',
          boxShadow: 'none',
          border: 'none',
          position: 'relative'
        }}
      >
        <canvas 
          ref={canvasRef}
          style={{
            display: 'block',
            borderRadius: '8px',
          }}
        />
      </div>
      
      {/* 统一的多选工具栏 - 只在多选时显示 */}
      {selectedObjects.length > 1 && (
        <MultiSelectToolbar
          selectedObjects={selectedObjects}
          onClose={() => {
            // 清除选择
            fabricCanvasRef.current?.discardActiveObject();
            fabricCanvasRef.current?.renderAll();
          }}
        />
      )}
      
      {/* 选择指示器 - 只在单选时显示 */}
      {selectedObjects.length === 1 && (
        <SelectionIndicator
          selectedCount={selectedObjects.length}
          hasGroup={hasGroupInSelection}
        />
      )}
      
      {/* 网格系统 */}
      {fabricCanvasRef.current && (
        <GridSystem canvas={fabricCanvasRef.current} />
      )}

    </div>
  );
};