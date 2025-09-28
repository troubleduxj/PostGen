import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  File, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Plus,
  FolderPlus
} from 'lucide-react';
import { useAssetLibraryStore } from '@/stores/assetLibraryStore';

interface AssetUploadProps {
  className?: string;
  onUploadComplete?: () => void;
}

export const AssetUpload: React.FC<AssetUploadProps> = ({ 
  className = '',
  onUploadComplete 
}) => {
  const {
    startUpload,
    uploadProgress,
    removeUpload,
    setError
  } = useAssetLibraryStore();

  const [isDragOver, setIsDragOver] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 验证文件
  const validateFile = (file: File): string | null => {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      return '只支持图片文件';
    }

    // 检查文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return '文件大小不能超过 10MB';
    }

    // 检查文件格式
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return '不支持的文件格式';
    }

    return null;
  };

  // 处理文件上传
  const handleFileUpload = useCallback(async (files: FileList) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    // 验证所有文件
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    // 显示验证错误
    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    // 上传有效文件
    const uploadPromises = validFiles.map(file => startUpload(file));
    
    try {
      await Promise.all(uploadPromises);
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [startUpload, setError, onUploadComplete]);

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // 重置 input 值，允许重复选择同一文件
    e.target.value = '';
  };

  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // 打开文件选择器
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上传按钮 */}
      {!showUploadArea && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowUploadArea(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>添加素材</span>
          </button>
          
          <button
            onClick={openFileSelector}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>快速上传</span>
          </button>
        </div>
      )}

      {/* 上传区域 */}
      {showUploadArea && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">上传素材</h4>
            <button
              onClick={() => setShowUploadArea(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 拖拽上传区域 */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className={`p-3 rounded-full ${
                  isDragOver ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Upload className={`w-8 h-8 ${
                    isDragOver ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </div>
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  {isDragOver ? '释放文件以上传' : '拖拽文件到此处'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  或者 
                  <button
                    onClick={openFileSelector}
                    className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                  >
                    点击选择文件
                  </button>
                </p>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>支持格式：JPG、PNG、GIF、SVG、WebP</p>
                <p>最大文件大小：10MB</p>
                <p>支持批量上传</p>
              </div>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FolderPlus className="w-4 h-4" />
              <span>支持文件夹拖拽</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={openFileSelector}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                选择文件
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 上传进度列表 */}
      {uploadProgress.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">上传进度</h4>
          <div className="space-y-2">
            {uploadProgress.map((upload) => (
              <UploadProgressItem
                key={upload.id}
                upload={upload}
                onRemove={() => removeUpload(upload.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

// 上传进度项组件
interface UploadProgressItemProps {
  upload: any;
  onRemove: () => void;
}

const UploadProgressItem: React.FC<UploadProgressItemProps> = ({ 
  upload, 
  onRemove 
}) => {
  const getStatusIcon = () => {
    switch (upload.status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (upload.status) {
      case 'uploading':
        return '上传中...';
      case 'processing':
        return '处理中...';
      case 'completed':
        return '上传完成';
      case 'error':
        return upload.error || '上传失败';
      default:
        return '等待中...';
    }
  };

  const getProgressBarColor = () => {
    switch (upload.status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {/* 文件图标 */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-white rounded border flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* 文件信息和进度 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {upload.name}
          </p>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            {upload.status !== 'completed' && upload.status !== 'error' && (
              <span className="text-xs text-gray-500">{upload.progress}%</span>
            )}
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
            style={{ width: `${upload.progress}%` }}
          />
        </div>

        {/* 状态文本 */}
        <p className={`text-xs ${
          upload.status === 'error' ? 'text-red-600' : 'text-gray-500'
        }`}>
          {getStatusText()}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex-shrink-0">
        {(upload.status === 'completed' || upload.status === 'error') && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-gray-600"
            title="移除"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AssetUpload;