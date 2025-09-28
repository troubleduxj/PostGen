import React from 'react';
import { MousePointer, Layers, Group } from 'lucide-react';

interface SelectionIndicatorProps {
  selectedCount: number;
  hasGroup: boolean;
  className?: string;
}

export const SelectionIndicator: React.FC<SelectionIndicatorProps> = ({
  selectedCount,
  hasGroup,
  className = ''
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className={`fixed bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 flex items-center gap-2 z-40 ${className}`}>
      <div className="flex items-center gap-1">
        {selectedCount === 1 ? (
          <MousePointer size={16} className="text-blue-600" />
        ) : (
          <Layers size={16} className="text-blue-600" />
        )}
        
        <span className="text-sm font-medium text-gray-700">
          {selectedCount === 1 ? '1 个对象' : `${selectedCount} 个对象`}
        </span>
      </div>
      
      {hasGroup && (
        <>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1">
            <Group size={14} className="text-orange-600" />
            <span className="text-xs text-gray-500">包含组合</span>
          </div>
        </>
      )}
      
      {selectedCount > 1 && (
        <>
          <div className="w-px h-4 bg-gray-300" />
          <span className="text-xs text-gray-500">
            Ctrl+G 组合
          </span>
        </>
      )}
    </div>
  );
};