import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

interface SimpleCanvasProps {
  className?: string;
}

export const SimpleCanvas: React.FC<SimpleCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initCanvas = async () => {
      try {
        if (!canvasRef.current) {
          throw new Error('Canvas element not found');
        }

        // 等待一小段时间确保DOM完全加载
        await new Promise(resolve => setTimeout(resolve, 100));

        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
          width: 800,
          height: 600,
          backgroundColor: '#ffffff',
        });

        // 添加一个测试文本
        const text = new fabric.Text('海报制作工具', {
          left: 400,
          top: 300,
          fontSize: 32,
          fill: '#333333',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        });

        fabricCanvas.add(text);
        fabricCanvas.renderAll();

        setCanvas(fabricCanvas);
        setIsLoading(false);
        setError(null);

        console.log('Canvas initialized successfully');

      } catch (err) {
        console.error('Failed to initialize canvas:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    initCanvas();

    return () => {
      if (canvas) {
        try {
          canvas.dispose();
        } catch (err) {
          console.error('Error disposing canvas:', err);
        }
      }
    };
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-600 text-lg font-medium mb-2">画布初始化失败</div>
          <div className="text-red-500 text-sm mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-gray-600">正在初始化画布...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="block"
        />
      </div>
      
      {/* 画布信息 */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
        800 × 600 | 100%
      </div>
    </div>
  );
};