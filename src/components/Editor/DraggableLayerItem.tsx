import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LayerItem } from './LayerItem';
import { Layer } from '@/stores/layerManagerStore';

interface DraggableLayerItemProps {
  layer: Layer;
  isSelected: boolean;
  isActive: boolean;
  isEditing?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  onFinishEditing?: () => void;
}

export const DraggableLayerItem: React.FC<DraggableLayerItemProps> = ({
  layer,
  isSelected,
  isActive,
  isEditing = false,
  onContextMenu,
  onFinishEditing,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: layer.id,
    disabled: layer.locked, // 锁定的图层不能拖拽
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        ${isDragging ? 'z-50' : ''}
        ${layer.locked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
      `}
    >
      <LayerItem
        layer={layer}
        isSelected={isSelected}
        isActive={isActive}
        isEditing={isEditing}
        onContextMenu={onContextMenu}
        onFinishEditing={onFinishEditing}
        className={isDragging ? 'shadow-lg' : ''}
      />
    </div>
  );
};