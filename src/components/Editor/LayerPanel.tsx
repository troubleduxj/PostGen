import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Search,
  Plus,
  Copy,
  Trash2,
  Group,
  Ungroup,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoreHorizontal
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useLayerManagerStore } from '@/stores/layerManagerStore';
import { useEditorStore } from '@/stores/editorStore';
import { LayerItem } from './LayerItem';
import { DraggableLayerItem } from './DraggableLayerItem';
import { LayerContextMenu } from './LayerContextMenu';
import { fabric } from 'fabric';

interface LayerPanelProps {
  className?: string;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({ className = '' }) => {
  const { canvas } = useEditorStore();
  const {
    layers,
    selection,
    filter,
    isSyncing,
    getFilteredLayers,
    setSearchQuery,
    setTypeFilter,
    setVisibilityFilter,
    setLockFilter,
    clearFilters,
    selectLayer,
    selectAllLayers,
    clearSelection,
    deleteSelectedLayers,
    groupLayers,
    ungroupLayer,
    syncWithCanvas,
    addLayer,
    duplicateLayer,
    reorderLayers
  } = useLayerManagerStore();

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    layerId: string;
  } | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 同步画布对象到图层
  useEffect(() => {
    if (canvas) {
      console.log('LayerPanel: Syncing with canvas, objects count:', canvas.getObjects().length);
      syncWithCanvas(canvas);
      
      // 监听画布对象变化
      const handleObjectAdded = (e: fabric.IEvent) => {
        if (e.target) {
          console.log('LayerPanel: Object added event, layerId:', e.target.get('layerId'));
          if (!e.target.get('layerId')) {
            console.log('LayerPanel: Adding new layer for object:', e.target.type);
            addLayer(e.target);
          }
        }
      };

      const handleObjectRemoved = (e: fabric.IEvent) => {
        // 对象移除时会自动同步
      };

      const handleSelectionCreated = (e: fabric.IEvent) => {
        if (e.selected && e.selected.length > 0) {
          const layerIds = e.selected
            .map(obj => obj.get('layerId'))
            .filter(Boolean);
          if (layerIds.length > 0) {
            selectLayer(layerIds[0], layerIds.length > 1);
          }
        }
      };

      const handleSelectionUpdated = (e: fabric.IEvent) => {
        if (e.selected && e.selected.length > 0) {
          const layerIds = e.selected
            .map(obj => obj.get('layerId'))
            .filter(Boolean);
          if (layerIds.length > 0) {
            selectLayer(layerIds[0], layerIds.length > 1);
          }
        }
      };

      const handleSelectionCleared = () => {
        clearSelection();
      };

      canvas.on('object:added', handleObjectAdded);
      canvas.on('object:removed', handleObjectRemoved);
      canvas.on('selection:created', handleSelectionCreated);
      canvas.on('selection:updated', handleSelectionUpdated);
      canvas.on('selection:cleared', handleSelectionCleared);

      return () => {
        canvas.off('object:added', handleObjectAdded);
        canvas.off('object:removed', handleObjectRemoved);
        canvas.off('selection:created', handleSelectionCreated);
        canvas.off('selection:updated', handleSelectionUpdated);
        canvas.off('selection:cleared', handleSelectionCleared);
      };
    }
  }, [canvas, addLayer, selectLayer, clearSelection, syncWithCanvas]);

  // 获取过滤后的图层
  const filteredLayers = getFilteredLayers();
  
  // 调试信息
  console.log('LayerPanel render:', {
    totalLayers: layers.length,
    filteredLayers: filteredLayers.length,
    canvasObjects: canvas?.getObjects().length || 0,
    isSyncing
  });
  
  // 排序图层
  const sortedLayers = [...filteredLayers].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.zIndex - b.zIndex;
    } else {
      return b.zIndex - a.zIndex;
    }
  });

  // 处理搜索
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  // 处理新建图层
  const handleCreateLayer = () => {
    if (!canvas) return;
    
    // 创建一个默认的矩形图层
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2
    });
    
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  // 处理复制选中图层
  const handleDuplicateSelected = async () => {
    if (selection.selectedLayerIds.length === 0) return;
    
    for (const layerId of selection.selectedLayerIds) {
      await duplicateLayer(layerId);
    }
  };

  // 处理删除选中图层
  const handleDeleteSelected = () => {
    if (selection.selectedLayerIds.length === 0) return;
    
    if (window.confirm(`确定要删除选中的 ${selection.selectedLayerIds.length} 个图层吗？`)) {
      deleteSelectedLayers();
    }
  };

  // 处理组合图层
  const handleGroupSelected = () => {
    if (selection.selectedLayerIds.length < 2) return;
    
    const groupName = prompt('请输入组合名称:', '图层组合');
    if (groupName !== null) {
      groupLayers(selection.selectedLayerIds, groupName);
    }
  };

  // 处理取消组合
  const handleUngroupSelected = () => {
    if (selection.selectedLayerIds.length !== 1) return;
    
    const layer = layers.find(l => l.id === selection.selectedLayerIds[0]);
    if (layer && layer.type === 'group') {
      ungroupLayer(layer.id);
    }
  };

  // 处理全选
  const handleSelectAll = () => {
    selectAllLayers();
  };

  // 处理清除选择
  const handleClearSelection = () => {
    clearSelection();
  };

  // 处理排序切换
  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // 处理拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sortedLayers.findIndex(layer => layer.id === active.id);
      const newIndex = sortedLayers.findIndex(layer => layer.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // 重新排序图层
        const newOrder = arrayMove(sortedLayers, oldIndex, newIndex);
        const layerIds = newOrder.map(layer => layer.id);
        
        // 更新图层顺序
        reorderLayers(layerIds);
      }
    }
    
    setActiveId(null);
  };

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent, layerId: string) => {
    e.preventDefault();
    
    // 如果右键的图层不在选中列表中，则选中它
    if (!selection.selectedLayerIds.includes(layerId)) {
      selectLayer(layerId, false);
    }
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      layerId
    });
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // 处理重命名
  const handleRename = (layerId: string) => {
    setEditingLayerId(layerId);
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-gray-600" />
            <span className="font-medium text-sm">图层管理</span>
            {isSyncing && (
              <div className="w-3 h-3 border border-primary-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleSortToggle}
              className="p-1 hover:bg-gray-100 rounded"
              title={`排序: ${sortOrder === 'asc' ? '从下到上' : '从上到下'}`}
            >
              {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1 hover:bg-gray-100 rounded ${showFilters ? 'bg-gray-100' : ''}`}
              title="过滤选项"
            >
              <Filter size={14} />
            </button>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索图层..."
            value={filter.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* 过滤选项 */}
        {showFilters && (
          <div className="space-y-2 p-2 bg-gray-50 rounded-md">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 w-12">类型:</label>
              <select
                value={filter.typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">全部</option>
                <option value="text">文本</option>
                <option value="image">图片</option>
                <option value="shape">形状</option>
                <option value="group">组合</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 w-12">显示:</label>
              <select
                value={filter.visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value as any)}
                className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">全部</option>
                <option value="visible">可见</option>
                <option value="hidden">隐藏</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 w-12">锁定:</label>
              <select
                value={filter.lockFilter}
                onChange={(e) => setLockFilter(e.target.value as any)}
                className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">全部</option>
                <option value="locked">已锁定</option>
                <option value="unlocked">未锁定</option>
              </select>
            </div>
            <button
              onClick={clearFilters}
              className="w-full text-xs text-primary-600 hover:text-primary-700 py-1"
            >
              清除过滤
            </button>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCreateLayer}
            className="flex items-center justify-center w-8 h-8 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition-colors"
            title="新建图层"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={handleDuplicateSelected}
            disabled={selection.selectedLayerIds.length === 0}
            className="flex items-center justify-center w-8 h-8 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="复制选中图层"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={selection.selectedLayerIds.length === 0}
            className="flex items-center justify-center w-8 h-8 bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="删除选中图层"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={handleGroupSelected}
            disabled={selection.selectedLayerIds.length < 2}
            className="flex items-center justify-center w-8 h-8 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="组合选中图层"
          >
            <Group size={14} />
          </button>
          <button
            onClick={handleUngroupSelected}
            disabled={
              selection.selectedLayerIds.length !== 1 ||
              !layers.find(l => l.id === selection.selectedLayerIds[0] && l.type === 'group')
            }
            className="flex items-center justify-center w-8 h-8 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="取消组合"
          >
            <Ungroup size={14} />
          </button>
          
          {/* 调试：手动同步按钮 */}
          <button
            onClick={() => canvas && syncWithCanvas(canvas)}
            className="flex items-center justify-center w-8 h-8 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors"
            title="手动同步图层"
          >
            🔄
          </button>
        </div>
      </div>

      {/* 图层列表 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {sortedLayers.length > 0 ? (
          <div className="p-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedLayers.map(layer => layer.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {sortedLayers.map((layer) => (
                    <DraggableLayerItem
                      key={layer.id}
                      layer={layer}
                      isSelected={selection.selectedLayerIds.includes(layer.id)}
                      isActive={selection.activeLayerId === layer.id}
                      isEditing={editingLayerId === layer.id}
                      onContextMenu={(e) => handleContextMenu(e, layer.id)}
                      onFinishEditing={() => setEditingLayerId(null)}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <LayerItem
                    layer={sortedLayers.find(layer => layer.id === activeId)!}
                    isSelected={selection.selectedLayerIds.includes(activeId)}
                    isActive={selection.activeLayerId === activeId}
                    className="shadow-lg rotate-3 opacity-90"
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Layers size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {filter.searchQuery || filter.typeFilter !== 'all' || filter.visibilityFilter !== 'all' || filter.lockFilter !== 'all'
                  ? '没有找到匹配的图层'
                  : '暂无图层'}
              </p>
              {!filter.searchQuery && filter.typeFilter === 'all' && filter.visibilityFilter === 'all' && filter.lockFilter === 'all' && (
                <p className="text-xs text-gray-400 mt-1">
                  添加一些对象到画布上开始设计
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部统计信息 */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            共 {layers.length} 个图层
            {filteredLayers.length !== layers.length && ` (显示 ${filteredLayers.length} 个)`}
          </span>
          {selection.selectedLayerIds.length > 0 && (
            <span>已选择 {selection.selectedLayerIds.length} 个</span>
          )}
        </div>
        {selection.selectedLayerIds.length > 1 && (
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleSelectAll}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              全选
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleClearSelection}
              className="text-xs text-gray-600 hover:text-gray-700"
            >
              取消选择
            </button>
          </div>
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <LayerContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          layer={layers.find(l => l.id === contextMenu.layerId)!}
          selectedLayers={layers.filter(l => selection.selectedLayerIds.includes(l.id))}
          onClose={closeContextMenu}
          onRename={() => handleRename(contextMenu.layerId)}
        />
      )}
    </div>
  );
};