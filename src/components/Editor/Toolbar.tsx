import React, { useState, useEffect } from 'react';
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    Download,
    Save,
    FolderOpen,
    Grid3X3,
    History,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useAlignmentStore } from '@/stores/alignmentStore';
import { useToolManager, useToolRegistry } from '@/hooks/useToolManager';
import { registerDefaultTools } from '@/tools';
import { ExportModal } from './ExportModal';
import { HelpModal } from './HelpModal';
import { AlignmentSettings } from './AlignmentSettings';
import { SimpleUndoRedoButtons } from './UndoRedoButtons';
import { CanvasThemeSelector } from './CanvasThemeSelector';
import { ProjectManager } from './ProjectManager';
import { useProjectStore } from '@/stores/projectStore';

interface ToolbarProps {
    className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ className = '' }) => {
    const {
        canvas,
        zoomIn,
        zoomOut,
        zoomToFit,
        canvasState,
        updateCanvasState,
        activePanel,
        setActivePanel
    } = useEditorStore();

    const [showExportModal, setShowExportModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    
    // 使用工具管理器 hooks
    const { activeTool, activateToolById, toolManager } = useToolManager();
    const { groups } = useToolRegistry();

    // 初始化工具系统
    useEffect(() => {
        // 只在第一次加载时注册工具
        if (toolManager.registry.getAllTools().length === 0) {
            registerDefaultTools();
        }
        
        // 初始化默认快捷键
        toolManager.initializeDefaultShortcuts();
        
        // 默认激活选择工具
        if (toolManager.registry.hasTool('select')) {
            activateToolById('select');
        }
    }, [toolManager, activateToolById]);

    // 处理工具选择
    const handleToolSelect = (toolId: string) => {
        activateToolById(toolId);
    };

    // 获取网格状态
    const { grid, toggleGrid: toggleGridStore } = useAlignmentStore();
    
    // 切换网格显示
    const toggleGrid = () => {
        toggleGridStore();
    };

    // 适应屏幕 - 使用store中的方法
    const fitToScreen = () => {
        zoomToFit();
    };

    // 打开导出弹窗
    const handleExport = () => {
        setShowExportModal(true);
    };

    // 按分组渲染工具
    const renderToolGroups = () => {
        if (groups.length === 0) {
            // 如果没有定义组，直接渲染所有工具
            const allTools = toolManager.registry.getAllTools();
            return (
                <div className="flex items-center gap-1">
                    {allTools.map((tool) => {
                        const Icon = tool.icon;
                        const isActive = activeTool === tool.id;

                        return (
                            <button
                                key={tool.id}
                                onClick={() => handleToolSelect(tool.id)}
                                className={`toolbar-btn ${isActive ? 'active' : ''}`}
                                title={tool.tooltip || `${tool.name}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                            >
                                <Icon size={18} />
                            </button>
                        );
                    })}
                </div>
            );
        }

        // 按组渲染工具
        return groups.map((group, groupIndex) => (
            <React.Fragment key={group.id}>
                {groupIndex > 0 && <div className="w-px h-6 bg-gray-300 mx-2" />}
                <div className="flex items-center gap-1">
                    {group.tools.map((toolId) => {
                        const tool = toolManager.registry.getTool(toolId);
                        if (!tool) return null;

                        const Icon = tool.icon;
                        const isActive = activeTool === tool.id;

                        return (
                            <button
                                key={tool.id}
                                onClick={() => handleToolSelect(tool.id)}
                                className={`toolbar-btn ${isActive ? 'active' : ''}`}
                                title={tool.tooltip || `${tool.name}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                            >
                                <Icon size={18} />
                            </button>
                        );
                    })}
                </div>
            </React.Fragment>
        ));
    };

    return (
        <div className={`bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 ${className}`}>
            {/* 工具组 */}
            {renderToolGroups()}

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {/* 历史操作 */}
            <SimpleUndoRedoButtons />
            
            <button
                onClick={() => setActivePanel(activePanel === 'history' ? null : 'history')}
                className={`toolbar-btn ${activePanel === 'history' ? 'active' : ''}`}
                title="历史记录面板"
            >
                <History size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {/* 缩放控制 */}
            <div className="flex items-center gap-1">
                <button
                    onClick={zoomOut}
                    className="toolbar-btn"
                    title="缩小 (Ctrl + -)"
                >
                    <ZoomOut size={18} />
                </button>
                <span className="text-sm text-gray-600 min-w-[50px] text-center">
                    {Math.round(canvasState.zoom * 100)}%
                </span>
                <button
                    onClick={zoomIn}
                    className="toolbar-btn"
                    title="放大 (Ctrl + +)"
                >
                    <ZoomIn size={18} />
                </button>
                <button
                    onClick={fitToScreen}
                    className="toolbar-btn"
                    title="适应屏幕 (Ctrl + 0)"
                >
                    <Maximize2 size={18} />
                </button>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {/* 视图控制 */}
            <div className="flex items-center gap-1">
                <button
                    onClick={toggleGrid}
                    className={`toolbar-btn ${grid.visible ? 'active' : ''}`}
                    title="显示/隐藏网格"
                >
                    <Grid3X3 size={18} />
                </button>
                <AlignmentSettings />
            </div>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {/* 画布主题 */}
            <CanvasThemeSelector
                onThemeChange={(theme) => {
                    // 这里可以实现主题切换逻辑
                    console.log('Theme changed:', theme);
                }}
            />

            {/* 右侧操作 */}
            <div className="flex items-center gap-1 ml-auto">
                <button
                    onClick={() => {
                        // 这里将集成项目管理器
                        alert('项目管理器功能即将开放！');
                    }}
                    className="toolbar-btn"
                    title="项目管理"
                >
                    <FolderOpen size={18} />
                </button>
                <button
                    onClick={() => {
                        // 这里将集成快速保存功能
                        alert('快速保存功能即将开放！');
                    }}
                    className="toolbar-btn"
                    title="保存项目"
                >
                    <Save size={18} />
                </button>
                <button
                    onClick={handleExport}
                    className="toolbar-btn"
                    title="导出"
                >
                    <Download size={18} />
                </button>
                <button
                    onClick={() => setShowHelpModal(true)}
                    className="toolbar-btn"
                    title="帮助 (快捷键)"
                >
                    <span className="text-sm font-medium">?</span>
                </button>
            </div>

            {/* 导出弹窗 */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            {/* 帮助弹窗 */}
            <HelpModal
                isOpen={showHelpModal}
                onClose={() => setShowHelpModal(false)}
            />
        </div>
    );
};