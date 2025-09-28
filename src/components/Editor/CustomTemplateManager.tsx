import React, { useState, useCallback } from 'react';
import { Edit, Trash2, Eye, Download, MoreHorizontal, Calendar, Tag } from 'lucide-react';
import { Template } from '@/types';
import { useTemplateStore } from '@/stores/templateStore';

interface CustomTemplateManagerProps {
  templates: Template[];
  onEdit?: (template: Template) => void;
  onPreview?: (template: Template) => void;
  onApply?: (template: Template) => void;
  className?: string;
}

interface TemplateActionsProps {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onPreview: (template: Template) => void;
  onApply: (template: Template) => void;
}

const TemplateActions: React.FC<TemplateActionsProps> = ({
  template,
  onEdit,
  onDelete,
  onPreview,
  onApply
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          
          {/* 菜单 */}
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
            <button
              onClick={() => {
                onPreview(template);
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>预览</span>
            </button>
            
            <button
              onClick={() => {
                onApply(template);
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>应用</span>
            </button>
            
            <button
              onClick={() => {
                onEdit(template);
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>编辑</span>
            </button>
            
            <div className="border-t border-gray-100" />
            
            <button
              onClick={() => {
                onDelete(template);
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>删除</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export const CustomTemplateManager: React.FC<CustomTemplateManagerProps> = ({
  templates,
  onEdit,
  onPreview,
  onApply,
  className = ''
}) => {
  const { deleteCustomTemplate } = useTemplateStore();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 处理删除确认
  const handleDeleteConfirm = useCallback((templateId: string) => {
    deleteCustomTemplate(templateId);
    setDeleteConfirm(null);
  }, [deleteCustomTemplate]);

  // 处理删除取消
  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (templates.length === 0) {
    return (
      <div className={`custom-template-manager ${className}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            还没有自定义模板
          </h3>
          <p className="text-gray-500">
            创建设计后，可以保存为模板以便重复使用
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`custom-template-manager ${className}`}>
      <div className="space-y-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              {/* 缩略图 */}
              <div className="flex-shrink-0 w-16 h-20 bg-gray-100 rounded overflow-hidden">
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        无预览
                      </div>
                    `;
                  }}
                />
              </div>

              {/* 模板信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  
                  {/* 操作按钮 */}
                  <TemplateActions
                    template={template}
                    onEdit={onEdit || (() => {})}
                    onDelete={(template) => setDeleteConfirm(template.id)}
                    onPreview={onPreview || (() => {})}
                    onApply={onApply || (() => {})}
                  />
                </div>

                {/* 标签 */}
                {template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* 底部信息 */}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>{template.width} × {template.height}</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(template.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 删除确认对话框 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                确认删除
              </h3>
              <p className="text-gray-600 mb-4">
                确定要删除这个模板吗？此操作无法撤销。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDeleteConfirm(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTemplateManager;