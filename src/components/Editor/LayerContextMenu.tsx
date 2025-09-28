import React, { useEffect, useRef } from 'react';
import {
  Copy,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoveUp,
  MoveDown,
  Group,
  Ungroup,
  ArrowUp,
  ArrowDown,
  Layers,
  Palette,
  RotateCw,
  FlipHorizontal,
  FlipVertical
} from 'lucide-react';
import { useLayerManagerStore } from '@/stores/layerManagerStore';
import { Layer } from '@/stores/layerManagerStore';

interface LayerContextMenuProps {
  x: number;
  y: number;
  layer: Layer;
  selectedLayers: Layer[];
  onClose: () => void;
  onRename?: () => void;
}

export const LayerContextMenu: React.FC<LayerContextMenuProps> = ({
  x,
  y,
  layer,
  selectedLayers,
  onClose,
  onRename,
}) => {
  const {
    duplicateLayer,
    duplicateLayers,
    removeLayer,
    removeLayers,
    setLayerVisibility,
    setLayersVisibility,
    setLayerLock,
    setLayersLock,
    moveLayerUp,
    moveLayerDown,
    moveLayerToTop,
    moveLayerToBottom,
    groupLayers,
    ungroupLayer,
    selectLayer,
    clearSelection,
  } = useLayerManagerStore();

  const menuRef = useRef<HTMLDivElement>(null);
  const isMultipleSelection = selectedLayers.length > 1;
  const isGroupLayer = layer.type === 'group';
  const canGroup = selectedLayers.length >= 2;

  // 处理菜单项点击
  const handleMenuAction = (action: string) => {
    onClose();

    switch (action) {
      case 'rename':
        onRename?.();
        break;

      case 'duplicate':
        if (isMultipleSelection) {
          duplicateLayers(selectedLayers.map(l => l.id));
        } else {
          duplicateLayer(layer.id);
        }
        break;

      case 'delete':
        const layerCount = isMultipleSelection ? selectedLayers.length : 1;
        const confirmMessage = `确定要删除${layerCount > 1 ? `这 ${layerCount} 个图层` : '这个图层'}吗？`;
        
        if (window.confirm(confirmMessage)) {
          if (isMultipleSelection) {
            removeLayers(selectedLayers.map(l => l.id));
          } else {
            removeLayer(layer.id);
          }
        }
        break;

      case 'toggleVisibility':
        if (isMultipleSelection) {
          const allVisible = selectedLayers.every(l => l.visible);
          setLayersVisibility(selectedLayers.map(l => l.id), !allVisible);
        } else {
          setLayerVisibility(layer.id, !layer.visible);
        }
        break;

      case 'toggleLock':
        if (isMultipleSelection) {
          const allLocked = selectedLayers.every(l => l.locked);
          setLayersLock(selectedLayers.map(l => l.id), !allLocked);
        } else {
          setLayerLock(layer.id, !layer.locked);
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

      case 'group':
        if (canGroup) {
          const groupName = prompt('请输入组合名称:', '图层组合');
          if (groupName !== null) {
            groupLayers(selectedLayers.map(l => l.id), groupName);
          }
        }
        break;

      case 'ungroup':
        if (isGroupLayer) {
          ungroupLayer(layer.id);
        }
        break;

      case 'selectOnly':
        selectLayer(layer.id, false);
        break;

      case 'clearSelection':
        clearSelection();
        break;

      case 'selectSimilar':
        // 选择相同类型的图层
        // 这个功能需要在 store 中实现
        console.log('Select similar layers:', layer.type);
        break;

      default:
        console.log('Unknown action:', action);
    }
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  // 调整菜单位置以防止超出屏幕
  const adjustedPosition = React.useMemo(() => {
    const menuWidth = 200;
    const menuHeight = 400; // 估算高度
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > viewportWidth) {
      adjustedX = x - menuWidth;
    }

    if (y + menuHeight > viewportHeight) {
      adjustedY = y - menuHeight;
    }

    return { x: Math.max(0, adjustedX), y: Math.max(0, adjustedY) };
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-48"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {/* 图层信息 */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="text-sm font-medium text-gray-900 truncate">
          {isMultipleSelection ? `${selectedLayers.length} 个图层` : layer.name}
        </div>
        <div className="text-xs text-gray-500">
          {isMultipleSelection ? '多选操作' : `${layer.type} 图层`}
        </div>
      </div>

      {/* 基础操作 */}
      <div className="py-1">
        {!isMultipleSelection && (
          <button
            onClick={() => handleMenuAction('rename')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
          >
            <Edit3 size={14} />
            重命名
          </button>
        )}

        <button
          onClick={() => handleMenuAction('duplicate')}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
        >
          <Copy size={14} />
          {isMultipleSelection ? '复制选中图层' : '复制图层'}
        </button>

        <button
          onClick={() => handleMenuAction('delete')}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-3"
        >
          <Trash2 size={14} />
          {isMultipleSelection ? '删除选中图层' : '删除图层'}
        </button>
      </div>

      <hr className="my-1" />

      {/* 显示和锁定 */}
      <div className="py-1">
        <button
          onClick={() => handleMenuAction('toggleVisibility')}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
        >
          {isMultipleSelection ? (
            selectedLayers.every(l => l.visible) ? (
              <>
                <EyeOff size={14} />
                隐藏选中图层
              </>
            ) : (
              <>
                <Eye size={14} />
                显示选中图层
              </>
            )
          ) : layer.visible ? (
            <>
              <EyeOff size={14} />
              隐藏图层
            </>
          ) : (
            <>
              <Eye size={14} />
              显示图层
            </>
          )}
        </button>

        <button
          onClick={() => handleMenuAction('toggleLock')}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
        >
          {isMultipleSelection ? (
            selectedLayers.every(l => l.locked) ? (
              <>
                <Unlock size={14} />
                解锁选中图层
              </>
            ) : (
              <>
                <Lock size={14} />
                锁定选中图层
              </>
            )
          ) : layer.locked ? (
            <>
              <Unlock size={14} />
              解锁图层
            </>
          ) : (
            <>
              <Lock size={14} />
              锁定图层
            </>
          )}
        </button>
      </div>

      <hr className="my-1" />

      {/* 层级操作 */}
      {!isMultipleSelection && (
        <div className="py-1">
          <button
            onClick={() => handleMenuAction('moveToTop')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
          >
            <ArrowUp size={14} />
            移到顶层
          </button>

          <button
            onClick={() => handleMenuAction('moveUp')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
          >
            <MoveUp size={14} />
            上移一层
          </button>

          <button
            onClick={() => handleMenuAction('moveDown')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
          >
            <MoveDown size={14} />
            下移一层
          </button>

          <button
            onClick={() => handleMenuAction('moveToBottom')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
          >
            <ArrowDown size={14} />
            移到底层
          </button>
        </div>
      )}

      <hr className="my-1" />

      {/* 组合操作 */}
      <div className="py-1">
        {canGroup && (
          <button
            onClick={() => handleMenuAction('group')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
          >
            <Group size={14} />
            组合图层
          </button>
        )}

        {isGroupLayer && !isMultipleSelection && (
          <button
            onClick={() => handleMenuAction('ungroup')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
          >
            <Ungroup size={14} />
            取消组合
          </button>
        )}
      </div>

      <hr className="my-1" />

      {/* 选择操作 */}
      <div className="py-1">
        {isMultipleSelection && (
          <button
            onClick={() => handleMenuAction('selectOnly')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
          >
            <Layers size={14} />
            仅选择此图层
          </button>
        )}

        {!isMultipleSelection && (
          <button
            onClick={() => handleMenuAction('selectSimilar')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
          >
            <Layers size={14} />
            选择相似图层
          </button>
        )}

        {isMultipleSelection && (
          <button
            onClick={() => handleMenuAction('clearSelection')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
          >
            <Layers size={14} />
            取消选择
          </button>
        )}
      </div>
    </div>
  );
};