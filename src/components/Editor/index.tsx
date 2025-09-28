import React, { useEffect } from 'react';
import { Toolbar } from './Toolbar';
import { LeftPanel } from './LeftPanel';
import { Canvas } from './Canvas';
import { RightPanel } from './RightPanel';
import { CanvasStatusBar } from './CanvasStatusBar';
import { useEditorStore } from '@/stores/editorStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { fontInitializer } from '@/utils/fontInitializer';

export const Editor: React.FC = () => {
  const { isLoading, error } = useEditorStore();
  
  // 启用键盘快捷键
  useKeyboardShortcuts();

  // 初始化字体系统
  useEffect(() => {
    fontInitializer.initialize();
  }, []);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">编辑器加载失败</div>
          <div className="text-red-500 text-sm">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <Toolbar />
      
      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 */}
        <LeftPanel />
        
        {/* 中央画布区域 */}
        <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
          <div className="flex-1 relative" style={{ minHeight: 0 }}>
            <Canvas />
            
            {/* 加载遮罩 */}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="loading-spinner mb-3"></div>
                  <div className="text-sm text-gray-600">正在加载画布...</div>
                </div>
              </div>
            )}
          </div>
          
          {/* 底部状态栏 */}
          <div style={{ flexShrink: 0, height: '40px' }}>
            <CanvasStatusBar />
          </div>
        </div>
        
        {/* 右侧属性面板 */}
        <RightPanel />
      </div>
    </div>
  );
};