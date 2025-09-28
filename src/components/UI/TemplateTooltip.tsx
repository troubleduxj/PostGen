import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  width: number;
  height: number;
  thumbnail?: string;
}

interface TemplateTooltipProps {
  template: Template;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const TemplateTooltip: React.FC<TemplateTooltipProps> = ({ 
  template, 
  children, 
  position = 'right',
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 320;
      
      let top = rect.top + window.scrollY;
      let left = rect.right + window.scrollX + 8;
      
      // 确保不超出视窗
      if (left + tooltipWidth > window.innerWidth) {
        left = rect.left + window.scrollX - tooltipWidth - 8;
      }
      
      if (top + 500 > window.innerHeight + window.scrollY) {
        top = window.innerHeight + window.scrollY - 500 - 16;
      }
      
      if (top < window.scrollY + 16) {
        top = window.scrollY + 16;
      }
      
      setTooltipPosition({ top, left });
    }
  }, [isVisible]);

  return (
    <>
      <div 
        ref={triggerRef}
        className={`relative ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div 
          className="fixed w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 pointer-events-none"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            zIndex: 999999,
            minHeight: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          
          {/* 模板预览图 */}
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-3 shadow-sm" style={{ height: '420px' }}>
            {template.thumbnail ? (
              <img 
                src={template.thumbnail} 
                alt={template.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                loading="lazy"
                style={{ imageRendering: 'crisp-edges' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-blue-50 to-purple-50">
                <span className="text-3xl">📄</span>
              </div>
            )}
          </div>
          
          {/* 模板信息 */}
          <div className="space-y-2">
            {/* 标题 */}
            <h3 className="font-semibold text-gray-900 text-sm">{template.name}</h3>
            
            {/* 描述 */}
            <p className="text-xs text-gray-600 leading-relaxed">{template.description}</p>
            
            {/* 尺寸和分类信息 */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-500 mb-1">尺寸</div>
                <div className="font-medium text-gray-700">{template.width} × {template.height}px</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-500 mb-1">分类</div>
                <div className="font-medium text-blue-600">{getCategoryName(template.category)}</div>
              </div>
            </div>
            
            {/* 标签 */}
            {template.tags && template.tags.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs text-gray-500">标签:</span>
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 4).map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 4 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      +{template.tags.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* 操作提示 */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 italic">点击应用此模板</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// 获取分类显示名称
function getCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    'business': '商务',
    'social': '社交',
    'education': '教育',
    'marketing': '营销',
    'event': '活动',
    'personal': '个人',
    'creative': '创意',
    'presentation': '演示'
  };
  
  return categoryNames[category] || category;
}