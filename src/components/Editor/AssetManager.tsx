import React, { useState, useRef } from 'react';
import { 
  Edit3, 
  Trash2, 
  Download, 
  Copy, 
  Tag, 
  FolderPlus,
  MoreHorizontal,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAssetLibraryStore, Asset, AssetCategory } from '@/stores/assetLibraryStore';

interface AssetManagerProps {
  selectedAssets: string[];
  onSelectionChange: (assetIds: string[]) => void;
  className?: string;
}

export const AssetManager: React.FC<AssetManagerProps> = ({
  selectedAssets,
  onSelectionChange,
  className = ''
}) => {
  const {
    assets,
    categories,
    removeAsset,
    updateAsset,
    addCategory,
    removeCategory,
    updateCategory
  } = useAssetLibraryStore();

  const [showBatchActions, setShowBatchActions] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // 批量操作
  const handleBatchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedAssets.length} 个素材吗？`)) {
      selectedAssets.forEach(assetId => removeAsset(assetId));
      onSelectionChange([]);
      setShowBatchActions(false);
    }
  };

  const handleBatchCategorize = (categoryId: string) => {
    selectedAssets.forEach(assetId => {
      updateAsset(assetId, { category: categoryId });
    });
    onSelectionChange([]);
    setShowBatchActions(false);
  };

  const handleBatchTag = (tags: string[]) => {
    selectedAssets.forEach(assetId => {
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        const newTags = [...new Set([...asset.tags, ...tags])];
        updateAsset(assetId, { tags: newTags });
      }
    });
    onSelectionChange([]);
    setShowBatchActions(false);
  };

  // 下载素材
  const handleDownloadAsset = async (asset: Asset) => {
    try {
      const response = await fetch(asset.url);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${asset.name}.${getFileExtension(asset.type)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // 复制素材
  const handleCopyAsset = (asset: Asset) => {
    const newAsset = {
      ...asset,
      name: `${asset.name} 副本`,
      isCustom: true
    };
    // 这里需要调用 addAsset，但需要去掉 id 和 createdAt
    const { id, createdAt, ...assetData } = newAsset;
    useAssetLibraryStore.getState().addAsset(assetData);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 批量操作栏 */}
      {selectedAssets.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              已选择 {selectedAssets.length} 个素材
            </span>
            <div className="flex items-center space-x-2">
              <BatchActionsDropdown
                onDelete={handleBatchDelete}
                onCategorize={handleBatchCategorize}
                onTag={handleBatchTag}
                categories={categories}
              />
              <button
                onClick={() => onSelectionChange([])}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分类管理 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">分类管理</h3>
          <button
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showCategoryManager ? '收起' : '管理'}
          </button>
        </div>

        {showCategoryManager && (
          <CategoryManager
            categories={categories}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onRemoveCategory={removeCategory}
            editingCategory={editingCategory}
            setEditingCategory={setEditingCategory}
          />
        )}
      </div>

      {/* 素材详情编辑 */}
      {editingAsset && (
        <AssetEditor
          asset={assets.find(a => a.id === editingAsset)!}
          onSave={(updates) => {
            updateAsset(editingAsset, updates);
            setEditingAsset(null);
          }}
          onCancel={() => setEditingAsset(null)}
        />
      )}
    </div>
  );
};

// 批量操作下拉菜单
interface BatchActionsDropdownProps {
  onDelete: () => void;
  onCategorize: (categoryId: string) => void;
  onTag: (tags: string[]) => void;
  categories: AssetCategory[];
}

const BatchActionsDropdown: React.FC<BatchActionsDropdownProps> = ({
  onDelete,
  onCategorize,
  onTag,
  categories
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleTagSubmit = () => {
    const tags = tagInput.split(',').map(tag => tag.trim()).filter(Boolean);
    if (tags.length > 0) {
      onTag(tags);
      setTagInput('');
      setShowTagInput(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <span>批量操作</span>
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => {
                setShowCategoryMenu(!showCategoryMenu);
                setShowTagInput(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span>移动到分类</span>
            </button>

            {showCategoryMenu && (
              <div className="border-t border-gray-100">
                {categories.filter(cat => cat.id !== 'all').map(category => (
                  <button
                    key={category.id}
                    onClick={() => onCategorize(category.id)}
                    className="w-full px-6 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setShowTagInput(!showTagInput);
                setShowCategoryMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
            >
              <Tag className="w-4 h-4" />
              <span>添加标签</span>
            </button>

            {showTagInput && (
              <div className="border-t border-gray-100 p-3">
                <input
                  type="text"
                  placeholder="输入标签，用逗号分隔"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  onKeyPress={(e) => e.key === 'Enter' && handleTagSubmit()}
                />
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={handleTagSubmit}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    确定
                  </button>
                  <button
                    onClick={() => setShowTagInput(false)}
                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100">
              <button
                onClick={onDelete}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 分类管理器
interface CategoryManagerProps {
  categories: AssetCategory[];
  onAddCategory: (category: Omit<AssetCategory, 'count'>) => void;
  onUpdateCategory: (categoryId: string, updates: Partial<AssetCategory>) => void;
  onRemoveCategory: (categoryId: string) => void;
  editingCategory: string | null;
  setEditingCategory: (categoryId: string | null) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
  editingCategory,
  setEditingCategory
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📁');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory({
        id: `custom-${Date.now()}`,
        name: newCategoryName.trim(),
        icon: newCategoryIcon
      });
      setNewCategoryName('');
      setNewCategoryIcon('📁');
    }
  };

  const customCategories = categories.filter(cat => 
    !['all', 'icons', 'shapes', 'illustrations', 'photos', 'patterns', 'backgrounds', 'custom'].includes(cat.id)
  );

  return (
    <div className="space-y-3">
      {/* 添加新分类 */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="分类名称"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="图标"
          value={newCategoryIcon}
          onChange={(e) => setNewCategoryIcon(e.target.value)}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
        />
        <button
          onClick={handleAddCategory}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
        >
          添加
        </button>
      </div>

      {/* 自定义分类列表 */}
      {customCategories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">自定义分类</h4>
          {customCategories.map(category => (
            <CategoryItem
              key={category.id}
              category={category}
              isEditing={editingCategory === category.id}
              onEdit={() => setEditingCategory(category.id)}
              onSave={(updates) => {
                onUpdateCategory(category.id, updates);
                setEditingCategory(null);
              }}
              onCancel={() => setEditingCategory(null)}
              onDelete={() => {
                if (confirm(`确定要删除分类"${category.name}"吗？`)) {
                  onRemoveCategory(category.id);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 分类项组件
interface CategoryItemProps {
  category: AssetCategory;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<AssetCategory>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete
}) => {
  const [name, setName] = useState(category.name);
  const [icon, setIcon] = useState(category.icon);

  const handleSave = () => {
    onSave({ name: name.trim(), icon: icon.trim() });
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
        <input
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-12 px-2 py-1 text-sm border border-gray-300 rounded text-center"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
        />
        <button
          onClick={handleSave}
          className="text-green-600 hover:text-green-800"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
      <div className="flex items-center space-x-2">
        <span>{category.icon}</span>
        <span className="text-sm">{category.name}</span>
        {category.count !== undefined && (
          <span className="text-xs text-gray-500">({category.count})</span>
        )}
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={onEdit}
          className="text-gray-600 hover:text-gray-800"
        >
          <Edit3 className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// 素材编辑器
interface AssetEditorProps {
  asset: Asset;
  onSave: (updates: Partial<Asset>) => void;
  onCancel: () => void;
}

const AssetEditor: React.FC<AssetEditorProps> = ({ asset, onSave, onCancel }) => {
  const [name, setName] = useState(asset.name);
  const [tags, setTags] = useState(asset.tags.join(', '));
  const [category, setCategory] = useState(asset.category);

  const { categories } = useAssetLibraryStore();

  const handleSave = () => {
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    onSave({
      name: name.trim(),
      tags: tagArray,
      category
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">编辑素材</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 素材预览 */}
          <div className="flex items-center space-x-3">
            <img
              src={asset.thumbnail}
              alt={asset.name}
              className="w-16 h-16 object-cover rounded border"
            />
            <div className="text-sm text-gray-500">
              <div>{asset.type}</div>
              {asset.dimensions && (
                <div>{asset.dimensions.width} × {asset.dimensions.height}</div>
              )}
            </div>
          </div>

          {/* 名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分类
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.filter(cat => cat.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标签
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="用逗号分隔多个标签"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              用逗号分隔多个标签，如：图标, 用户界面, 蓝色
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

// 工具函数
function getFileExtension(assetType: string): string {
  switch (assetType) {
    case 'icon':
      return 'svg';
    case 'image':
      return 'png';
    default:
      return 'png';
  }
}

export default AssetManager;