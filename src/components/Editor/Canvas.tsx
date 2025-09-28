import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { CanvasConfigButton } from './CanvasConfigButton';
import { useEditorStore } from '@/stores/editorStore';

interface CanvasProps {
  className?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { setCanvas, canvasState, updateCanvasState } = useEditorStore();
  const [canvasSize, setCanvasSize] = useState({ 
    width: canvasState.width, 
    height: canvasState.height 
  });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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

    // 设置现代化的选择样式
    fabricCanvas.selectionColor = 'rgba(24, 144, 255, 0.08)';
    fabricCanvas.selectionBorderColor = '#1890ff';
    fabricCanvas.selectionLineWidth = 1;
    fabricCanvas.selectionDashArray = [4, 4];

    // 添加右键菜单支持
    fabricCanvas.on('mouse:down', (options) => {
      if (options.e.button === 2) { // 右键
        const pointer = fabricCanvas.getPointer(options.e);
        const target = fabricCanvas.findTarget(options.e, false);
        
        // 简单的右键菜单功能
        if (target) {
          // 选中对象时的右键菜单
          const action = window.confirm('删除这个对象吗？');
          if (action) {
            fabricCanvas.remove(target);
            fabricCanvas.renderAll();
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

    fabricCanvas.add(welcomeText, subText, decorRect);
    fabricCanvas.renderAll();

    // 清理函数
    return () => {
      fabricCanvas.dispose();
    };
  }, [canvasSize]);

  // 处理画布尺寸变化
  const handleSizeChange = (width: number, height: number) => {
    setCanvasSize({ width, height });
    updateCanvasState({ width, height });
    
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setDimensions({ width, height });
      fabricCanvasRef.current.renderAll();
    }
  };

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fabricCanvasRef.current) return;
      
      const canvas = fabricCanvasRef.current;
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
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        style={{
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid #e0e0e0'
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
      
      {/* 快速工具栏 */}
      <div 
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 16px',
          borderRadius: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        <button 
          style={{
            padding: '6px 12px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          onClick={() => {
            // 添加文本功能
            if (fabricCanvasRef.current) {
              const text = new fabric.Text('新文本', {
                left: Math.random() * (canvasSize.width - 200) + 100,
                top: Math.random() * (canvasSize.height - 100) + 50,
                fontSize: 24,
                fill: '#333333'
              });
              fabricCanvasRef.current.add(text);
              fabricCanvasRef.current.renderAll();
            }
          }}
        >
          📝 文本
        </button>
        
        <label 
          style={{
            padding: '6px 12px',
            backgroundColor: '#13c2c2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'inline-block'
          }}
        >
          🖼️ 图片
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && fabricCanvasRef.current) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const imgUrl = event.target?.result as string;
                  fabric.Image.fromURL(imgUrl, (img) => {
                    // 调整图片大小以适应画布
                    const maxWidth = canvasSize.width * 0.4;
                    const maxHeight = canvasSize.height * 0.4;
                    
                    if (img.width! > maxWidth || img.height! > maxHeight) {
                      const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
                      img.scale(scale);
                    }
                    
                    img.set({
                      left: Math.random() * (canvasSize.width - img.getScaledWidth()) + 50,
                      top: Math.random() * (canvasSize.height - img.getScaledHeight()) + 50,
                    });
                    
                    fabricCanvasRef.current!.add(img);
                    fabricCanvasRef.current!.renderAll();
                  });
                };
                reader.readAsDataURL(file);
              }
              // 重置文件输入
              e.target.value = '';
            }}
          />
        </label>
        
        <button 
          style={{
            padding: '6px 12px',
            backgroundColor: '#52c41a',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          onClick={() => {
            // 添加矩形功能
            if (fabricCanvasRef.current) {
              const rect = new fabric.Rect({
                left: Math.random() * (canvasSize.width - 200) + 100,
                top: Math.random() * (canvasSize.height - 200) + 100,
                width: 100,
                height: 80,
                fill: '#1890ff',
                rx: 8,
                ry: 8
              });
              fabricCanvasRef.current.add(rect);
              fabricCanvasRef.current.renderAll();
            }
          }}
        >
          ⬜ 矩形
        </button>
        
        <button 
          style={{
            padding: '6px 12px',
            backgroundColor: '#eb2f96',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          onClick={() => {
            // 添加圆形功能
            if (fabricCanvasRef.current) {
              const circle = new fabric.Circle({
                left: Math.random() * (canvasSize.width - 200) + 100,
                top: Math.random() * (canvasSize.height - 200) + 100,
                radius: 50,
                fill: '#eb2f96'
              });
              fabricCanvasRef.current.add(circle);
              fabricCanvasRef.current.renderAll();
            }
          }}
        >
          ⭕ 圆形
        </button>
        
        <button 
          style={{
            padding: '6px 12px',
            backgroundColor: '#f5222d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          onClick={() => {
            // 添加三角形功能
            if (fabricCanvasRef.current) {
              const triangle = new fabric.Triangle({
                left: Math.random() * (canvasSize.width - 200) + 100,
                top: Math.random() * (canvasSize.height - 200) + 100,
                width: 80,
                height: 80,
                fill: '#f5222d'
              });
              fabricCanvasRef.current.add(triangle);
              fabricCanvasRef.current.renderAll();
            }
          }}
        >
          🔺 三角形
        </button>
        
        <CanvasConfigButton
          currentWidth={canvasSize.width}
          currentHeight={canvasSize.height}
          onSizeChange={handleSizeChange}
        />
        
        {/* 颜色选择器 */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {['#1890ff', '#52c41a', '#fa8c16', '#f759ab', '#722ed1', '#ff4d4f'].map((color) => (
            <button
              key={color}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: color,
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              onClick={() => {
                // 改变选中对象的颜色
                if (fabricCanvasRef.current) {
                  const activeObject = fabricCanvasRef.current.getActiveObject();
                  if (activeObject) {
                    if (activeObject.type === 'text') {
                      activeObject.set('fill', color);
                    } else {
                      activeObject.set('fill', color);
                    }
                    fabricCanvasRef.current.renderAll();
                  }
                }
              }}
              title={`设置颜色: ${color}`}
            />
          ))}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>背景:</span>
          <input
            type="color"
            defaultValue="#ffffff"
            style={{
              width: '32px',
              height: '24px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onChange={(e) => {
              if (fabricCanvasRef.current) {
                fabricCanvasRef.current.setBackgroundColor(e.target.value, fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current));
              }
            }}
          />
        </div>
        
        <button 
          style={{
            padding: '6px 12px',
            backgroundColor: '#f759ab',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          onClick={() => {
            // 添加圆形功能
            if (fabricCanvasRef.current) {
              const circle = new fabric.Circle({
                left: Math.random() * (canvasSize.width - 100) + 50,
                top: Math.random() * (canvasSize.height - 100) + 50,
                radius: 50,
                fill: '#f759ab',
                stroke: '#ffffff',
                strokeWidth: 2
              });
              fabricCanvasRef.current.add(circle);
              fabricCanvasRef.current.renderAll();
            }
          }}
        >
          ⭕ 添加圆形
        </button>
        
        <button 
          style={{
            padding: '6px 12px',
            backgroundColor: '#fa8c16',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          onClick={() => {
            // 清空画布功能
            if (fabricCanvasRef.current) {
              if (window.confirm('确定要清空画布吗？此操作不可撤销。')) {
                fabricCanvasRef.current.clear();
                fabricCanvasRef.current.renderAll();
              }
            }
          }}
        >
          🗑️ 清空
        </button>
      </div>

      {/* 画布信息 */}
      <div 
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          color: '#666',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '300px'
        }}
      >
        <div>画布: {canvasSize.width} × {canvasSize.height} | 缩放: 100%</div>
        <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.8 }}>
          快捷键: Delete删除 | Ctrl+D复制 | 方向键移动 | 右键删除
        </div>
      </div>
      
      {/* 右上角帮助提示 */}
      <div 
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(76, 175, 80, 0.9)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        🎨 海报编辑器 v1.0
      </div>
    </div>
  );
};