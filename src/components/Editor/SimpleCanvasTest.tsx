import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

export const SimpleCanvasTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    // 添加测试文本
    const text = new fabric.Text('画布测试', {
      left: 400,
      top: 300,
      fontSize: 32,
      fill: '#333333',
      originX: 'center',
      originY: 'center'
    });

    canvas.add(text);
    canvas.renderAll();

    return () => {
      canvas.dispose();
    };
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f0f0'
    }}>
      <canvas 
        ref={canvasRef}
        style={{
          border: '2px solid #333',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );
};