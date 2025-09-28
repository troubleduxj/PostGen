import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Image, 
  CheckCircle, 
  AlertCircle,
  X,
  Pause,
  Play
} from 'lucide-react';
import { progressManager } from '@/utils/imageProcessingOptimizer';

interface ProcessingTask {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'paused';
  error?: string;
  startTime?: number;
  endTime?: number;
}

interface ImageProcessingProgressProps {
  visible: boolean;
  onClose?: () => void;
  onCancel?: (taskId: string) => void;
  onPause?: (taskId: string) => void;
  onResume?: (taskId: string) => void;
}

export const ImageProcessingProgress: React.FC<ImageProcessingProgressProps> = ({
  visible,
  onClose,
  onCancel,
  onPause,
  onResume
}) => {
  const [tasks, setTasks] = useState<ProcessingTask[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  // 监听进度更新
  useEffect(() => {
    if (!visible) return;

    const updateInterval = setInterval(() => {
      // 这里应该从进度管理器获取实际的任务状态
      // 为了演示，我们使用模拟数据
      updateTasksFromProgressManager();
    }, 100);

    return () => clearInterval(updateInterval);
  }, [visible]);

  // 从进度管理器更新任务状态
  const updateTasksFromProgressManager = () => {
    // 实际实现中，这里应该从 progressManager 获取真实数据
    // 现在使用模拟数据进行演示
    const mockTasks: ProcessingTask[] = [
      {
        id: 'crop_001',
        name: '图片裁剪',
        progress: 100,
        status: 'completed',
        startTime: Date.now() - 2000,
        endTime: Date.now() - 500
      },
      {
        id: 'filter_001',
        name: '应用滤镜效果',
        progress: 65,
        status: 'processing',
        startTime: Date.now() - 1500
      },
      {
        id: 'resize_001',
        name: '图片尺寸优化',
        progress: 0,
        status: 'pending'
      }
    ];

    setTasks(mockTasks);
    
    // 计算总体进度
    const totalProgress = mockTasks.reduce((sum, task) => sum + task.progress, 0);
    setOverallProgress(totalProgress / mockTasks.length);
  };

  // 格式化时间
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
      return `${seconds}秒`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  // 获取任务状态图标
  const getTaskStatusIcon = (task: ProcessingTask) => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'processing':
        return <Loader2 size={16} className="text-blue-500 animate-spin" />;
      case 'paused':
        return <Pause size={16} className="text-yellow-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  // 获取任务操作按钮
  const getTaskActions = (task: ProcessingTask) => {
    const actions = [];

    if (task.status === 'processing') {
      actions.push(
        <button
          key="pause"
          onClick={() => onPause?.(task.id)}
          className="p-1 hover:bg-gray-100 rounded"
          title="暂停"
        >
          <Pause size={12} />
        </button>
      );
    }

    if (task.status === 'paused') {
      actions.push(
        <button
          key="resume"
          onClick={() => onResume?.(task.id)}
          className="p-1 hover:bg-gray-100 rounded"
          title="继续"
        >
          <Play size={12} />
        </button>
      );
    }

    if (task.status === 'processing' || task.status === 'paused' || task.status === 'pending') {
      actions.push(
        <button
          key="cancel"
          onClick={() => onCancel?.(task.id)}
          className="p-1 hover:bg-gray-100 rounded text-red-500"
          title="取消"
        >
          <X size={12} />
        </button>
      );
    }

    return actions;
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-96 overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium flex items-center">
            <Image size={20} className="mr-2" />
            图片处理进度
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* 总体进度 */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">总体进度</span>
            <span className="text-sm font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* 任务列表 */}
        <div className="max-h-64 overflow-y-auto">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 border-b last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getTaskStatusIcon(task)}
                  <span className="ml-2 text-sm font-medium">{task.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {getTaskActions(task)}
                </div>
              </div>

              {/* 任务进度条 */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    {task.status === 'completed' ? '已完成' :
                     task.status === 'error' ? '处理失败' :
                     task.status === 'paused' ? '已暂停' :
                     task.status === 'processing' ? '处理中' : '等待中'}
                  </span>
                  <span className="text-xs text-gray-500">{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'error' ? 'bg-red-500' :
                      task.status === 'paused' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              {/* 任务详情 */}
              <div className="text-xs text-gray-500">
                {task.status === 'completed' && task.startTime && task.endTime && (
                  <div>
                    耗时: {formatTime(task.endTime - task.startTime)}
                  </div>
                )}
                {task.status === 'processing' && task.startTime && (
                  <div>
                    已用时: {formatTime(Date.now() - task.startTime)}
                  </div>
                )}
                {task.status === 'error' && task.error && (
                  <div className="text-red-500">
                    错误: {task.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 底部操作栏 */}
        <div className="p-4 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {tasks.filter(t => t.status === 'completed').length} / {tasks.length} 已完成
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => tasks.forEach(task => onCancel?.(task.id))}
              className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
            >
              全部取消
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 简化的进度指示器组件
export const SimpleProgressIndicator: React.FC<{
  progress: number;
  message?: string;
  visible: boolean;
}> = ({ progress, message = '处理中...', visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border p-4 z-50 min-w-64">
      <div className="flex items-center mb-2">
        <Loader2 size={16} className="animate-spin mr-2 text-blue-500" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">进度</span>
        <span className="text-xs font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};