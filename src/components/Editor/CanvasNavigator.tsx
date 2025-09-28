import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '@/stores/editorStore';
import { X, Maximize2 } from 'lucide-react';

interface CanvasNavigatorProps {
  canvas: fabric.Canvas;
  visible?: boolean;
  onClose?: () => void;
}

export const CanvasNavigator: React.FC<CanvasNavigatorProps> = ({
  canvas,
  visible = true,
  onClose
}) => {
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const [miniCanvas, setMiniCanvas] = useState<fabric.Canvas | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { canvasState, updateCanvasState } = useEditorStore();

  const MINI_SIZE = 150; // 缩略图尺寸

  // 计算缩放比例
  const getScale = useCallback(() => {
    const scaleX = MINI_SIZE / canvasState.width;
    const scaleY = MINI_SIZE / canvasState.height;
    return Math.min(scaleX, scaleY);
  }, [canvasState.width, canvasState.height]);

  // 初始化迷你画布
  useEffect(() => {
    if (!miniCanvasRef.current || !visible) return;

    const scale = getScale();
    const miniWidth = canvasState.width * scale;
    const miniHeight = canvasState.height * scale;

    const mini = new fabric.Canvas(miniCanvasRef.current, {
      width: miniWidth,
      height: miniHeight,
      backgroundColor: canvasState.backgroundColor,
      selection: false,
      renderOnAddRemove: false,
    });

    // 禁用所有交互
    mini.forEachObject((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });

    setMiniCanvas(mini);

    return () => {
      mini.dispose();
    };
  }, [visible, canvasState.width, canvasState.height, canvasState.backgroundColor, getScale]);

  // 同步主画布内容到迷你画布
  const syncContent = useCallback(() => {
    if (!canvas || !miniCanvas) return;

    try {
      const scale = getScale();
      
      // 清空迷你画布
      miniCanvas.clear();
      miniCanvas.setBackgroundColor(canvasState.backgroundColor, () => {});

      // 复制主画布对象
      const objects = canvas.getObjects();
      objects.forEach((obj) => {
        obj.clone((cloned: fabric.Object) => {
          // 缩放对象
          cloned.scaleX = (cloned.scaleX || 1) * scale;
          cloned.scaleY = (cloned.scaleY || 1) * scale;
          cloned.left = (cloned.left || 0) * scale;
          cloned.top = (cloned.top || 0) * scale;
          
          // 禁用交互
          cloned.selectable = false;
          cloned.evented = false;
          
          miniCanvas.add(cloned);
        });
      });

      miniCanvas.renderAll();
    } catch (error) {
      console.error('Error syncing navigator content:', error);
    }
  }, [canvas, miniCanvas, canvasState.backgroundColor, getScale]);

  // 监听主画布变化
  useEffect(() => {
    if (!canvas) return;

    const handleCanvasChange = () => {
      syncContent();
    };

    // 延迟同步以避免频繁更新
    let syncTimeout: NodeJS.Timeout;
    const debouncedSync = () => {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(syncContent, 100);
    };

    canvas.on('after:render', debouncedSync);
    canvas.on('object:added', debouncedSync);
    canvas.on('object:removed', debouncedSync);
    canvas.on('object:modified', debouncedSync);

    // 初始同步
    syncContent();

    return () => {
      clearTimeout(syncTimeout);
      canvas.off('after:render', debouncedSync);
      canvas.off('object:added', debouncedSync);
      canvas.off('object:removed', debouncedSync);
      canvas.off('object:modified', debouncedSync);
    };
  }, [canvas, syncContent]);

  // 绘制视口指示器
  const drawViewport = useCallback(() => {
    if (!miniCanvas) return;

    const scale = getScale();
    const zoom = canvasState.zoom;
    
    // 计算视口在迷你画布中的位置和大小
    const viewportWidth = (miniCanvas.getWidth() / zoom) * scale;
    const viewportHeight = (miniCanvas.getHeight() / zoom) * scale;
    
    // 移除旧的视口指示器
    const existingViewport = miniCanvas.getObjects().find(obj => obj.name === 'viewport');
    if (existingViewport) {
      miniCanvas.remove(existingViewport);
    }

    // 创建新的视口指示器
    const viewport = new fabric.Rect({
      left: 0,
      top: 0,
      width: viewportWidth,
      height: viewportHeight,
      fill: 'transparent',
      stroke: '#1890ff',
      strokeWidth: 2,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      name: 'viewport',
    });

    miniCanvas.add(viewport);
    miniCanvas.bringToFront(viewport);
    miniCanvas.renderAll();
  }, [miniCanvas, canvasState.zoom, getScale]);

  // 监听缩放变化
  useEffect(() => {
    drawViewport();
  }, [drawViewport, canvasState.zoom]);

  // 处理迷你画布点击
  const handleMiniCanvasClick = useCallback((e: fabric.IEvent) => {
    if (!canvas || !miniCanvas) return;

    const pointer = miniCanvas.getPointer(e.e);
    const scale = getScale();
    
    // 将迷你画布坐标转换为主画布坐标
    const mainX = pointer.x / scale;
    const mainY = pointer.y / scale;
    
    // 计算新的视口中心
    const zoom = canvasState.zoom;
    const viewportWidth = canvas.getWidth() / zoom;
    const viewportHeight = canvas.getHeight() / zoom;
    
    const newVpX = mainX - viewportWidth / 2;
    const newVpY = mainY - viewportHeight / 2;
    
    // 设置画布视口
    canvas.absolutePan({ x: -newVpX * zoom, y: -newVpY * zoom });
    canvas.renderAll();
    
    drawViewport();
  }, [canvas, miniCanvas, canvasState.zoom, getScale, drawViewport]);

  // 绑定迷你画布事件
  useEffect(() => {
    if (!miniCanvas) return;

    miniCanvas.on('mouse:down', handleMiniCanvasClick);

    return () => {
      miniCanvas.off('mouse:down', handleMiniCanvasClick);
    };
  }, [miniCanvas, handleMiniCanvasClick]);

  if (!visible) return null;

  return (
    <div className="canvas-navigator">
      <div className="navigator-header">
        <span className="navigator-title">导航器</span>
        <div className="navigator-controls">
          <button
            onClick={() => {
              // 适应窗口
              const { zoomToFit } = useEditorStore.getState();
              zoomToFit();
            }}
            className="navigator-btn"
            title="适应窗口"
          >
            <Maximize2 size={12} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="navigator-btn"
              title="关闭导航器"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
      
      <div className="navigator-content">
        <canvas
          ref={miniCanvasRef}
          className="navigator-canvas"
        />
      </div>
      
      <div className="navigator-info">
        <span className="navigator-zoom">
          {Math.round(canvasState.zoom * 100)}%
        </span>
      </div>
    </div>
  );
};

export default CanvasNavigator;