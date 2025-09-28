import React, { useState } from 'react';
import { 
  Save, 
  FolderOpen, 
  Plus, 
  Search, 
  MoreVertical, 
  Download, 
  Upload,
  Trash2,
  Copy,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { useProjectStore, Project } from '@/stores/projectStore';

interface ProjectManagerProps {
  onSave?: (projectId: string) => void;
  onLoad?: (project: Project) => void;
  onClose?: () => void;
  currentCanvasData?: string;
  currentCanvasSize?: { width: number; height: number };
  currentThumbnail?: string;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  onSave,
  onLoad,
  onClose,
  currentCanvasData,
  currentCanvasSize,
  currentThumbnail
}) => {
  const {
    projects,
    currentProject,
    saveProject,
    loadProject,
    deleteProject,
    duplicateProject,
    searchProjects,
    exportProject,
    importProject,
    setLoading,
    isLoading
  } = useProjectStore();

  const [activeTab, setActiveTab] = useState<'recent' | 'all' | 'new'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectName, setProjectName] = useState(currentProject?.name || '');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // 获取要显示的项目列表
  const getDisplayProjects = () => {
    let projectList = projects;
    
    if (searchQuery) {
      projectList = searchProjects(searchQuery);
    }
    
    switch (activeTab) {
      case 'recent':
        return projectList.slice(0, 6);
      case 'all':
        return projectList;
      default:
        return projectList;
    }
  };

  // 保存项目
  const handleSave = async () => {
    if (!projectName.trim() || !currentCanvasData || !currentCanvasSize) return;
    
    setLoading(true);
    try {
      const projectId = await saveProject(
        projectName.trim(),
        currentCanvasData,
        currentCanvasSize,
        currentThumbnail
      );
      
      onSave?.(projectId);
      setShowSaveDialog(false);
      setProjectName('');
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载项目
  const handleLoad = async (project: Project) => {
    setLoading(true);
    try {
      const loadedProject = await loadProject(project.id);
      if (loadedProject) {
        onLoad?.(loadedProject);
        onClose?.();
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除项目
  const handleDelete = (projectId: string) => {
    if (window.confirm('确定要删除这个项目吗？此操作不可撤销。')) {
      deleteProject(projectId);
    }
  };

  // 复制项目
  const handleDuplicate = async (projectId: string) => {
    setLoading(true);
    try {
      await duplicateProject(projectId);
    } catch (error) {
      console.error('Failed to duplicate project:', error);
    } finally {
      setLoading(false);
    }
  };

  // 导出项目
  const handleExport = (projectId: string) => {
    try {
      const data = exportProject(projectId);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project_${projectId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export project:', error);
    }
  };

  // 导入项目
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result as string;
        await importProject(data);
      } catch (error) {
        console.error('Failed to import project:', error);
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
    
    // 重置文件输入
    event.target.value = '';
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="project-manager">
      {/* 头部 */}
      <div className="project-header">
        <h3 className="project-title">项目管理</h3>
        <div className="project-actions">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="action-btn primary"
            disabled={!currentCanvasData}
          >
            <Save size={16} />
            保存项目
          </button>
          
          <label className="action-btn">
            <Upload size={16} />
            导入项目
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="搜索项目..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* 标签页 */}
      <div className="project-tabs">
        <button
          onClick={() => setActiveTab('recent')}
          className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
        >
          最近项目
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
        >
          所有项目 ({projects.length})
        </button>
      </div>

      {/* 项目列表 */}
      <div className="project-list">
        {getDisplayProjects().length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={48} className="empty-icon" />
            <h4>暂无项目</h4>
            <p>开始创建您的第一个海报项目吧！</p>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="create-btn"
              disabled={!currentCanvasData}
            >
              <Plus size={16} />
              创建项目
            </button>
          </div>
        ) : (
          <div className="project-grid">
            {getDisplayProjects().map((project) => (
              <div key={project.id} className="project-card group">
                {/* 缩略图 */}
                <div className="project-thumbnail">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  
                  {/* 悬停操作 */}
                  <div className="thumbnail-overlay">
                    <button
                      onClick={() => handleLoad(project)}
                      className="overlay-btn primary"
                    >
                      打开
                    </button>
                  </div>
                </div>

                {/* 项目信息 */}
                <div className="project-info">
                  <h4 className="project-name" title={project.name}>
                    {project.name}
                  </h4>
                  <div className="project-meta">
                    <span className="project-size">
                      {project.canvasSize.width} × {project.canvasSize.height}
                    </span>
                    <span className="project-time">
                      <Calendar size={12} />
                      {formatTime(project.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* 操作菜单 */}
                <div className="project-menu">
                  <button
                    onClick={() => setSelectedProject(
                      selectedProject?.id === project.id ? null : project
                    )}
                    className="menu-trigger"
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {selectedProject?.id === project.id && (
                    <div className="menu-dropdown">
                      <button
                        onClick={() => handleLoad(project)}
                        className="menu-item"
                      >
                        <FolderOpen size={14} />
                        打开
                      </button>
                      <button
                        onClick={() => handleDuplicate(project.id)}
                        className="menu-item"
                      >
                        <Copy size={14} />
                        复制
                      </button>
                      <button
                        onClick={() => handleExport(project.id)}
                        className="menu-item"
                      >
                        <Download size={14} />
                        导出
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="menu-item danger"
                      >
                        <Trash2 size={14} />
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 保存对话框 */}
      {showSaveDialog && (
        <div className="save-dialog-overlay">
          <div className="save-dialog">
            <h4>保存项目</h4>
            <div className="dialog-content">
              <label>项目名称</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="输入项目名称..."
                className="project-name-input"
                autoFocus
              />
            </div>
            <div className="dialog-actions">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="dialog-btn secondary"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="dialog-btn primary"
                disabled={!projectName.trim() || isLoading}
              >
                {isLoading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;