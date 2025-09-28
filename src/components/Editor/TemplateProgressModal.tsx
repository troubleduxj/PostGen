import React from 'react';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { TemplateApplicationProgress } from '@/services/templateService';

interface TemplateProgressModalProps {
  isOpen: boolean;
  progress: TemplateApplicationProgress | null;
  onClose: () => void;
}

export const TemplateProgressModal: React.FC<TemplateProgressModalProps> = ({
  isOpen,
  progress,
  onClose
}) => {
  if (!isOpen || !progress) return null;

  const getStageIcon = () => {
    switch (progress.stage) {
      case 'complete':
        return progress.error ? (
          <AlertCircle className="w-8 h-8 text-red-500" />
        ) : (
          <CheckCircle className="w-8 h-8 text-green-500" />
        );
      default:
        return <Loader className="w-8 h-8 text-blue-500 animate-spin" />;
    }
  };

  const getStageText = () => {
    switch (progress.stage) {
      case 'parsing':
        return '解析中';
      case 'loading':
        return '加载中';
      case 'applying':
        return '应用中';
      case 'complete':
        return progress.error ? '失败' : '完成';
      default:
        return '处理中';
    }
  };

  const canClose = progress.stage === 'complete' || progress.error;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            应用模板
          </h3>
          {canClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 内容 */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            {getStageIcon()}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {getStageText()}
                </span>
                <span className="text-sm text-gray-500">
                  {progress.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress.error
                      ? 'bg-red-500'
                      : progress.stage === 'complete'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* 消息 */}
          <div className="text-center">
            <p className={`text-sm ${
              progress.error ? 'text-red-600' : 'text-gray-600'
            }`}>
              {progress.error || progress.message}
            </p>
          </div>

          {/* 错误详情 */}
          {progress.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                {progress.error}
              </p>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        {canClose && (
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                progress.error
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {progress.error ? '关闭' : '完成'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateProgressModal;