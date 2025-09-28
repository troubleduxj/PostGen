import React, { useState, useCallback } from 'react';
import { X, Save, Tag, Folder, Image } from 'lucide-react';
import { templateCategories } from '@/data/templates';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateInfo: {
    name: string;
    description: string;
    category: string;
    tags: string[];
  }) => Promise<void>;
  isLoading?: boolean;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 重置表单
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      category: 'custom',
      tags: []
    });
    setTagInput('');
    setErrors({});
  }, []);

  // 处理关闭
  const handleClose = useCallback(() => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  }, [isLoading, resetForm, onClose]);

  // 验证表单
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '模板名称不能为空';
    } else if (formData.name.length > 50) {
      newErrors.name = '模板名称不能超过50个字符';
    }

    if (!formData.description.trim()) {
      newErrors.description = '模板描述不能为空';
    } else if (formData.description.length > 200) {
      newErrors.description = '模板描述不能超过200个字符';
    }

    if (!formData.category) {
      newErrors.category = '请选择模板分类';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 处理保存
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    try {
      await onSave(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  }, [formData, validateForm, onSave, resetForm, onClose]);

  // 处理输入变化
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // 添加标签
  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  // 删除标签
  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // 处理标签输入键盘事件
  const handleTagKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Save className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              保存为模板
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* 模板名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              模板名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="请输入模板名称"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* 模板描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              模板描述 *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="请输入模板描述"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* 模板分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Folder className="w-4 h-4 inline mr-1" />
              模板分类 *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="custom">自定义模板</option>
              {templateCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              标签 (最多10个)
            </label>
            
            {/* 标签输入 */}
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="输入标签后按回车添加"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || formData.tags.length >= 10}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || formData.tags.length >= 10 || isLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>

            {/* 标签列表 */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      disabled={isLoading}
                      className="ml-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Image className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">保存说明：</p>
                <ul className="space-y-1 text-xs">
                  <li>• 模板将保存当前画布的所有内容</li>
                  <li>• 自动生成模板缩略图</li>
                  <li>• 保存后可在"我的模板"中查看</li>
                  <li>• 支持编辑和删除自定义模板</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !formData.name.trim() || !formData.description.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isLoading ? '保存中...' : '保存模板'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveTemplateModal;