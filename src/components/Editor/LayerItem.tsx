import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Type,
  Image,
  Square,
  Circle,
  Triangle,
  Group,
  Layers,
  MoreHorizontal,
  Edit3,
  Copy,
  Trash2,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { useLayerManagerStore } from '@/stores/layerManagerStore';
import { Layer, LayerType } from '@/stores/layerManagerStore';

interface LayerItemProps {
  layer: Layer;
  isSelected: boolean;
  isActive: boolean;
  isEditing?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  onFinishEditing?: () => void;
  className?: string;
}

// 图层类型图标映射
const layerTypeIcons: Record<LayerType, React.ComponentType<any>> = {
  text: Type,
  image: Image,
  shape: Square,
  group: Group,
  background: Layers,
};

// 获取图层类型的颜色
const getLayerTypeColor = (type: LayerType): string => {
  const colors = {
    text: 'text-blue-600',
    image: 'text-green-600',
    shape: 'text-purple-600',
    group: 'text-orange-600',
    background: 'text-gray-600',
  };
  return colors[type] || 'text-gray-600';
};

// 获取形状类型的具体图标
const getShapeIcon = (fabricObject: any) => {
  if (!fabricObject) return Square;
  
  switch (fabricObject.type) {
    case 'circle':
      return Circle;
    case 'triangle':
      return Triangle;
    case 'rect':
    case 'rectangle':
      return Square;
    default:
      return Square;
  }
};

export const LayerItem: React.FC<LayerItemProps> = ({
  layer,
  isSelected,
  isActive,
  isEditing: externalIsEditing = false,
  onContextMenu,
  onFinishEditing,
  className = ''
}) => {
  const {
    selectLayer,
    setLayerVisibility,
    setLayerLock,
    renameLayer,
    removeLayer,
    duplicateLayer,
    moveLayerUp,
    moveLayerDown,
    moveLayerToTop,
    moveLayerToBottom
  } = useLayerManagerStore();

  const [isEditing, setIsEditing] = useState(externalIsEditing);
  const [editingName, setEditingName] = useState(layer.name);
  const [showMenu, setShowMenu] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 获取图层类型图标
  const getLayerIcon = () => {
    if (layer.type === 'shape') {
      return getShapeIcon(layer.fabricObject);
    }
    return layerTypeIcons[layer.type] || Square;
  };

  const LayerIcon = getLayerIcon();
  const iconColor = getLayerTypeColor(layer.type);

  // 处理图层点击选择
  const handleLayerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      // 多选模式
      selectLayer(layer.id, true);
    } else if (e.shiftKey) {
      // 范围选择（这里简化为多选）
      selectLayer(layer.id, true);
    } else {
      // 单选模式
      selectLayer(layer.id, false);
    }
  };

  // 处理双击编辑
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startEditing();
  };

  // 开始编辑名称
  const startEditing = () => {
    setIsEditing(true);
    setEditingName(layer.name);
  };

  // 完成编辑
  const finishEditing = () => {
    if (editingName.trim() && editingName !== layer.name) {
      renameLayer(layer.id, editingName.trim());
    } else {
      setEditingName(layer.name);
    }
    setIsEditing(false);
    onFinishEditing?.();
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingName(layer.name);
    setIsEditing(false);
    onFinishEditing?.();
  };

  // 处理编辑输入框的键盘事件
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // 处理可见性切换
  const handleVisibilityToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLayerVisibility(layer.id, !layer.visible);
  };

  // 处理锁定切换
  const handleLockToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLayerLock(layer.id, !layer.locked);
  };

  // 处理菜单切换
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // 处理菜单项点击
  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    
    switch (action) {
      case 'rename':
        startEditing();
        break;
      case 'duplicate':
        duplicateLayer(layer.id);
        break;
      case 'delete':
        if (window.confirm('确定要删除这个图层吗？')) {
          removeLayer(layer.id);
        }
        break;
      case 'moveUp':
        moveLayerUp(layer.id);
        break;
      case 'moveDown':
        moveLayerDown(layer.id);
        break;
      case 'moveToTop':
        moveLayerToTop(layer.id);
        break;
      case 'moveToBottom':
        moveLayerToBottom(layer.id);
        break;
    }
  };

  // 同步外部编辑状态
  useEffect(() => {
    setIsEditing(externalIsEditing);
    if (externalIsEditing) {
      setEditingName(layer.name);
    }
  }, [externalIsEditing, layer.name]);

  // 编辑模式下自动聚焦
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div
      className={`
        relative group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors
        ${isSelected 
          ? isActive 
            ? 'bg-primary-100 border border-primary-300' 
            : 'bg-primary-50 border border-primary-200'
          : 'hover:bg-gray-50 border border-transparent'
        }
        ${layer.locked ? 'opacity-75' : ''}
        ${className}
      `}
      onClick={handleLayerClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={onContextMenu}
    >
      {/* 图层缩略图 */}
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded border overflow-hidden">
        {layer.thumbnail ? (
          <img
            src={layer.thumbnail}
            alt={layer.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LayerIcon size={14} className={iconColor} />
          </div>
        )}
      </div>

      {/* 图层信息 */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={finishEditing}
            onKeyDown={handleEditKeyDown}
            className="w-full px-1 py-0.5 text-sm bg-white border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-gray-900 truncate">
              {layer.name}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="capitalize">{layer.type}</span>
              {layer.opacity < 1 && (
                <span>{Math.round(layer.opacity * 100)}%</span>
              )}
              {layer.fabricObject && (
                <span>
                  {Math.round(layer.fabricObject.width || 0)} × {Math.round(layer.fabricObject.height || 0)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {/* 可见性按钮 */}
        <button
          onClick={handleVisibilityToggle}
          className={`
            p-1 rounded hover:bg-gray-200 transition-colors
            ${layer.visible ? 'text-gray-600' : 'text-gray-400'}
          `}
          title={layer.visible ? '隐藏图层' : '显示图层'}
        >
          {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>

        {/* 锁定按钮 */}
        <button
          onClick={handleLockToggle}
          className={`
            p-1 rounded hover:bg-gray-200 transition-colors
            ${layer.locked ? 'text-orange-600' : 'text-gray-400'}
          `}
          title={layer.locked ? '解锁图层' : '锁定图层'}
        >
          {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>

        {/* 更多操作按钮 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuToggle}
            className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-400 opacity-0 group-hover:opacity-100"
            title="更多操作"
          >
            <MoreHorizontal size={14} />
          </button>

          {/* 下拉菜单 */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-32">
              <button
                onClick={() => handleMenuAction('rename')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit3 size={12} />
                重命名
              </button>
              <button
                onClick={() => handleMenuAction('duplicate')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Copy size={12} />
                复制
              </button>
              <hr className="my-1" />
              <button
                onClick={() => handleMenuAction('moveToTop')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <MoveUp size={12} />
                移到顶层
              </button>
              <button
                onClick={() => handleMenuAction('moveUp')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <MoveUp size={12} />
                上移一层
              </button>
              <button
                onClick={() => handleMenuAction('moveDown')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <MoveDown size={12} />
                下移一层
              </button>
              <button
                onClick={() => handleMenuAction('moveToBottom')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <MoveDown size={12} />
                移到底层
              </button>
              <hr className="my-1" />
              <button
                onClick={() => handleMenuAction('delete')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 size={12} />
                删除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 选中状态指示器 */}
      {isSelected && (
        <div className={`
          absolute left-0 top-0 bottom-0 w-1 rounded-l-md
          ${isActive ? 'bg-primary-500' : 'bg-primary-300'}
        `} />
      )}

      {/* 拖拽指示器（为后续拖拽功能预留） */}
      <div className="absolute left-0 right-0 h-0.5 bg-primary-500 opacity-0 transition-opacity" />
    </div>
  );
};