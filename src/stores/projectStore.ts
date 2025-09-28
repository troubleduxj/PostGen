import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
  id: string;
  name: string;
  thumbnail: string;
  canvasData: string; // JSON序列化的画布数据
  canvasSize: { width: number; height: number };
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
}

interface ProjectActions {
  // 项目管理
  saveProject: (name: string, canvasData: string, canvasSize: { width: number; height: number }, thumbnail?: string) => Promise<string>;
  loadProject: (projectId: string) => Promise<Project | null>;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => Promise<string>;
  
  // 项目列表
  getProjects: () => Project[];
  searchProjects: (query: string) => Project[];
  getProjectsByTag: (tag: string) => Project[];
  
  // 当前项目
  setCurrentProject: (project: Project | null) => void;
  updateCurrentProject: (updates: Partial<Project>) => void;
  
  // 工具方法
  generateThumbnail: (canvas: fabric.Canvas) => string;
  exportProject: (projectId: string) => string;
  importProject: (data: string) => Promise<string>;
  
  // 状态管理
  setLoading: (loading: boolean) => void;
}

type ProjectStore = ProjectState & ProjectActions;

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      projects: [],
      currentProject: null,
      isLoading: false,

      // 保存项目
      saveProject: async (name, canvasData, canvasSize, thumbnail) => {
        const { projects, currentProject } = get();
        const now = Date.now();
        
        // 如果是更新现有项目
        if (currentProject) {
          const updatedProject: Project = {
            ...currentProject,
            name,
            canvasData,
            canvasSize,
            thumbnail: thumbnail || currentProject.thumbnail,
            updatedAt: now,
          };
          
          const updatedProjects = projects.map(p => 
            p.id === currentProject.id ? updatedProject : p
          );
          
          set({ 
            projects: updatedProjects,
            currentProject: updatedProject 
          });
          
          return currentProject.id;
        }
        
        // 创建新项目
        const newProject: Project = {
          id: `project_${now}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          canvasData,
          canvasSize,
          thumbnail: thumbnail || '',
          createdAt: now,
          updatedAt: now,
          tags: [],
        };
        
        set({ 
          projects: [...projects, newProject],
          currentProject: newProject 
        });
        
        return newProject.id;
      },

      // 加载项目
      loadProject: async (projectId) => {
        const { projects } = get();
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
          set({ currentProject: project });
          return project;
        }
        
        return null;
      },

      // 删除项目
      deleteProject: (projectId) => {
        const { projects, currentProject } = get();
        const updatedProjects = projects.filter(p => p.id !== projectId);
        
        set({ 
          projects: updatedProjects,
          currentProject: currentProject?.id === projectId ? null : currentProject
        });
      },

      // 复制项目
      duplicateProject: async (projectId) => {
        const { projects } = get();
        const originalProject = projects.find(p => p.id === projectId);
        
        if (!originalProject) return '';
        
        const now = Date.now();
        const duplicatedProject: Project = {
          ...originalProject,
          id: `project_${now}_${Math.random().toString(36).substr(2, 9)}`,
          name: `${originalProject.name} (副本)`,
          createdAt: now,
          updatedAt: now,
        };
        
        set({ projects: [...projects, duplicatedProject] });
        return duplicatedProject.id;
      },

      // 获取所有项目
      getProjects: () => {
        return get().projects.sort((a, b) => b.updatedAt - a.updatedAt);
      },

      // 搜索项目
      searchProjects: (query) => {
        const { projects } = get();
        const lowerQuery = query.toLowerCase();
        
        return projects.filter(project =>
          project.name.toLowerCase().includes(lowerQuery) ||
          project.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        ).sort((a, b) => b.updatedAt - a.updatedAt);
      },

      // 按标签获取项目
      getProjectsByTag: (tag) => {
        const { projects } = get();
        return projects.filter(project =>
          project.tags.includes(tag)
        ).sort((a, b) => b.updatedAt - a.updatedAt);
      },

      // 设置当前项目
      setCurrentProject: (project) => {
        set({ currentProject: project });
      },

      // 更新当前项目
      updateCurrentProject: (updates) => {
        const { currentProject, projects } = get();
        if (!currentProject) return;
        
        const updatedProject = { ...currentProject, ...updates, updatedAt: Date.now() };
        const updatedProjects = projects.map(p =>
          p.id === currentProject.id ? updatedProject : p
        );
        
        set({
          currentProject: updatedProject,
          projects: updatedProjects
        });
      },

      // 生成缩略图
      generateThumbnail: (canvas) => {
        try {
          return canvas.toDataURL({
            format: 'png',
            quality: 0.5,
            multiplier: 0.2, // 缩小到20%
            width: 200,
            height: 150,
          });
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
          return '';
        }
      },

      // 导出项目
      exportProject: (projectId) => {
        const { projects } = get();
        const project = projects.find(p => p.id === projectId);
        
        if (!project) return '';
        
        return JSON.stringify({
          version: '1.0',
          project,
          exportedAt: Date.now(),
        });
      },

      // 导入项目
      importProject: async (data) => {
        try {
          const importData = JSON.parse(data);
          const project = importData.project;
          
          if (!project || !project.name || !project.canvasData) {
            throw new Error('Invalid project data');
          }
          
          const now = Date.now();
          const importedProject: Project = {
            ...project,
            id: `project_${now}_${Math.random().toString(36).substr(2, 9)}`,
            name: `${project.name} (导入)`,
            createdAt: now,
            updatedAt: now,
          };
          
          const { projects } = get();
          set({ projects: [...projects, importedProject] });
          
          return importedProject.id;
        } catch (error) {
          console.error('Failed to import project:', error);
          throw error;
        }
      },

      // 设置加载状态
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'project-store',
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
      }),
    }
  )
);