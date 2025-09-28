// 本地存储工具类
export class LocalStorageManager {
  private static readonly PREFIX = 'poster_editor_';
  
  // 保存数据到本地存储
  static save<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(this.PREFIX + key, serializedData);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error('存储失败');
    }
  }
  
  // 从本地存储读取数据
  static load<T>(key: string): T | null {
    try {
      const serializedData = localStorage.getItem(this.PREFIX + key);
      if (serializedData === null) {
        return null;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }
  
  // 删除本地存储中的数据
  static remove(key: string): void {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
  
  // 检查本地存储中是否存在指定键
  static exists(key: string): boolean {
    return localStorage.getItem(this.PREFIX + key) !== null;
  }
  
  // 获取所有以指定前缀开头的键
  static getKeys(prefix: string = ''): string[] {
    const keys: string[] = [];
    const fullPrefix = this.PREFIX + prefix;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(fullPrefix)) {
        keys.push(key.substring(this.PREFIX.length));
      }
    }
    
    return keys;
  }
  
  // 清除所有编辑器相关的本地存储数据
  static clearAll(): void {
    const keys = this.getKeys();
    keys.forEach(key => this.remove(key));
  }
  
  // 获取本地存储使用情况
  static getStorageInfo(): {
    used: number;
    available: number;
    percentage: number;
  } {
    let used = 0;
    
    // 计算已使用的存储空间
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }
    
    // 估算可用存储空间（通常为 5MB）
    const available = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (used / available) * 100;
    
    return {
      used,
      available,
      percentage: Math.min(percentage, 100),
    };
  }
}

// 项目元数据接口
interface ProjectMetadata {
  id: string;
  name: string;
  thumbnail: string;
  lastModified: number;
  size: number;
}

// 项目数据管理
export class ProjectManager {
  private static readonly PROJECT_PREFIX = 'project_';
  private static readonly METADATA_KEY = 'projects_metadata';

  // 保存项目
  static async saveProject(
    id: string,
    name: string,
    data: any,
    thumbnail?: string
  ): Promise<void> {
    try {
      const projectData = {
        id,
        name,
        data,
        thumbnail: thumbnail || '',
        createdAt: Date.now(),
        lastModified: Date.now(),
      };
      
      const serializedData = JSON.stringify(projectData);
      LocalStorageManager.save(this.PROJECT_PREFIX + id, projectData);
      
      // 更新项目元数据
      this.updateProjectMetadata(id, name, thumbnail || '', serializedData.length);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('保存项目失败');
    }
  }
  
  // 加载项目
  static loadProject(id: string): any | null {
    try {
      const projectData = LocalStorageManager.load(this.PROJECT_PREFIX + id);
      return projectData ? projectData.data : null;
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  }
  
  // 删除项目
  static deleteProject(id: string): void {
    try {
      LocalStorageManager.remove(this.PROJECT_PREFIX + id);
      this.removeProjectMetadata(id);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }
  
  // 获取所有项目列表
  static getProjectList(): ProjectMetadata[] {
    try {
      const metadata = LocalStorageManager.load<ProjectMetadata[]>(this.METADATA_KEY);
      return metadata || [];
    } catch (error) {
      console.error('Failed to get project list:', error);
      return [];
    }
  }
  
  // 更新项目元数据
  private static updateProjectMetadata(
    id: string,
    name: string,
    thumbnail: string,
    size: number
  ): void {
    const metadata = this.getProjectList();
    const existingIndex = metadata.findIndex(p => p.id === id);
    
    const projectMeta: ProjectMetadata = {
      id,
      name,
      thumbnail,
      lastModified: Date.now(),
      size,
    };
    
    if (existingIndex >= 0) {
      metadata[existingIndex] = projectMeta;
    } else {
      metadata.push(projectMeta);
    }
    
    // 按最后修改时间排序
    metadata.sort((a, b) => b.lastModified - a.lastModified);
    
    // 限制项目数量（最多保留50个项目）
    const limitedMetadata = metadata.slice(0, 50);
    
    LocalStorageManager.save(this.METADATA_KEY, limitedMetadata);
  }
  
  // 移除项目元数据
  private static removeProjectMetadata(id: string): void {
    const metadata = this.getProjectList();
    const filteredMetadata = metadata.filter(p => p.id !== id);
    LocalStorageManager.save(this.METADATA_KEY, filteredMetadata);
  }
  
  // 清理过期项目（超过30天未修改的项目）
  static cleanupOldProjects(): void {
    const metadata = this.getProjectList();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const projectsToDelete = metadata.filter(p => p.lastModified < thirtyDaysAgo);
    
    projectsToDelete.forEach(project => {
      this.deleteProject(project.id);
    });
    
    if (projectsToDelete.length > 0) {
      console.log(`Cleaned up ${projectsToDelete.length} old projects`);
    }
  }
}

// 用户偏好设置管理
export class PreferencesManager {
  private static readonly PREFERENCES_KEY = 'user_preferences';
  
  // 默认偏好设置
  private static readonly DEFAULT_PREFERENCES = {
    theme: 'light',
    language: 'zh-CN',
    autoSave: true,
    autoSaveInterval: 5,
    showGrid: false,
    snapToGrid: false,
    showRulers: false,
    showGuides: true,
    recentColors: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'],
    recentFonts: ['Arial', 'Helvetica', 'Times New Roman'],
  };
  
  // 获取用户偏好设置
  static getPreferences(): any {
    const preferences = LocalStorageManager.load(this.PREFERENCES_KEY);
    return { ...this.DEFAULT_PREFERENCES, ...preferences };
  }
  
  // 保存用户偏好设置
  static savePreferences(preferences: any): void {
    const currentPreferences = this.getPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    LocalStorageManager.save(this.PREFERENCES_KEY, updatedPreferences);
  }
  
  // 重置用户偏好设置
  static resetPreferences(): void {
    LocalStorageManager.save(this.PREFERENCES_KEY, this.DEFAULT_PREFERENCES);
  }
}

// 缓存管理
// 缓存项接口
interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  expiry?: number; // 过期时间（毫秒）
  size: number;
}

export class CacheManager {
  private static readonly CACHE_PREFIX = 'cache_';
  private static readonly CACHE_METADATA_KEY = 'cache_metadata';
  
  // 设置缓存
  static setCache(
    key: string,
    data: any,
    expiryMinutes: number = 60
  ): void {
    try {
      const cacheItem: CacheItem = {
        key,
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (expiryMinutes * 60 * 1000),
        size: JSON.stringify(data).length,
      };
      
      LocalStorageManager.save(this.CACHE_PREFIX + key, cacheItem);
      this.updateCacheMetadata(key, cacheItem);
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }
  
  // 获取缓存
  static getCache<T>(key: string): T | null {
    try {
      const cacheItem = LocalStorageManager.load<CacheItem>(this.CACHE_PREFIX + key);
      
      if (!cacheItem) {
        return null;
      }
      
      // 检查是否过期
      if (cacheItem.expiry && Date.now() > cacheItem.expiry) {
        this.removeCache(key);
        return null;
      }
      
      return cacheItem.data as T;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }
  
  // 移除缓存
  static removeCache(key: string): void {
    LocalStorageManager.remove(this.CACHE_PREFIX + key);
    this.removeCacheMetadata(key);
  }
  
  // 清理过期缓存
  static cleanupExpiredCache(): void {
    const metadata = this.getCacheMetadata();
    const now = Date.now();
    
    metadata.forEach(item => {
      if (item.expiry && now > item.expiry) {
        this.removeCache(item.key);
      }
    });
  }
  
  // 获取缓存元数据
  private static getCacheMetadata(): CacheItem[] {
    return LocalStorageManager.load<CacheItem[]>(this.CACHE_METADATA_KEY) || [];
  }
  
  // 更新缓存元数据
  private static updateCacheMetadata(key: string, cacheItem: CacheItem): void {
    const metadata = this.getCacheMetadata();
    const existingIndex = metadata.findIndex(item => item.key === key);
    
    if (existingIndex >= 0) {
      metadata[existingIndex] = cacheItem;
    } else {
      metadata.push(cacheItem);
    }
    
    LocalStorageManager.save(this.CACHE_METADATA_KEY, metadata);
  }
  
  // 移除缓存元数据
  private static removeCacheMetadata(key: string): void {
    const metadata = this.getCacheMetadata();
    const filteredMetadata = metadata.filter(item => item.key !== key);
    LocalStorageManager.save(this.CACHE_METADATA_KEY, filteredMetadata);
  }
}

// 导出所有管理器
export {
  LocalStorageManager as Storage,
  ProjectManager as Projects,
  PreferencesManager as Preferences,
  CacheManager as Cache,
};