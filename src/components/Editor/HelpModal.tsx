import React from 'react';
import { X, Keyboard, Mouse, Zap, Info } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { shortcuts } = useKeyboardShortcuts();

  if (!isOpen) return null;

  const toolShortcuts = shortcuts.filter(s => 
    ['选择工具', '文本工具', '矩形工具', '圆形工具', '直线工具', '画笔工具', '橡皮擦工具', '移动工具'].includes(s.description)
  );

  const editShortcuts = shortcuts.filter(s => 
    ['撤销', '重做', '删除选中对象', '复制选中对象', '全选', '取消选择'].includes(s.description)
  );

  const viewShortcuts = shortcuts.filter(s => 
    ['放大', '缩小', '重置缩放', '适应窗口'].includes(s.description)
  );

  const mouseOperations = [
    { action: '选择对象', description: '单击对象' },
    { action: '移动对象', description: '拖拽对象' },
    { action: '调整大小', description: '拖拽控制点' },
    { action: '旋转对象', description: '拖拽旋转控制点' },
    { action: '多选对象', description: 'Ctrl + 单击' },
    { action: '框选对象', description: '拖拽空白区域' },
    { action: '缩放画布', description: 'Ctrl + 滚轮' },
    { action: '平移画布', description: '空格 + 拖拽' }
  ];

  const tips = [
    '使用 Shift 键可以等比例缩放对象',
    '双击文本对象可以直接编辑文字',
    '按住 Alt 键拖拽可以复制对象',
    '使用右键菜单可以快速访问常用功能',
    '可以通过拖拽改变图层顺序',
    '使用网格对齐功能可以精确定位对象'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">使用帮助</h2>
              <p className="text-sm text-gray-500">快捷键和操作指南</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 键盘快捷键 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Keyboard className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">键盘快捷键</h3>
              </div>

              {/* 工具快捷键 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">工具切换</h4>
                <div className="space-y-2">
                  {toolShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* 编辑快捷键 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">编辑操作</h4>
                <div className="space-y-2">
                  {editShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* 视图快捷键 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">视图控制</h4>
                <div className="space-y-2">
                  {viewShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 鼠标操作 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mouse className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">鼠标操作</h3>
              </div>

              <div className="mb-6">
                <div className="space-y-2">
                  {mouseOperations.map((operation, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600">{operation.action}</span>
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {operation.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 使用技巧 */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">使用技巧</h3>
                </div>
                <div className="space-y-3">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">需要更多帮助？</h4>
              <p className="text-sm text-blue-700">
                如果您在使用过程中遇到问题，可以通过以下方式获取帮助：
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• 查看在线文档和教程</li>
                <li>• 联系技术支持团队</li>
                <li>• 加入用户交流群</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};