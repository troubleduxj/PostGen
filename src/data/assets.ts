import { Asset } from '@/types';

// 素材分类
export const assetCategories = [
  { id: 'all', name: '全部', icon: '📋' },
  { id: 'icons', name: '图标', icon: '🎯' },
  { id: 'shapes', name: '形状', icon: '🔷' },
  { id: 'illustrations', name: '插画', icon: '🎨' },
  { id: 'photos', name: '照片', icon: '📷' },
  { id: 'patterns', name: '图案', icon: '🔳' },
  { id: 'backgrounds', name: '背景', icon: '🖼️' }
];

// 图标素材
export const iconAssets: Asset[] = [
  {
    id: 'icon-heart',
    name: '爱心',
    type: 'icon',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwLjg0IDQuNjFhNS41IDUuNSAwIDAgMC03Ljc4IDBMMTIgNS42N2wtMS4wNi0xLjA2YTUuNSA1LjUgMCAwIDAtNy43OCA3Ljc4bDEuMDYgMS4wNkwxMiAyMS4yM2w3Ljc4LTcuNzggMS4wNi0xLjA2YTUuNSA1LjUgMCAwIDAtLjc4LTcuNzh6IiBmaWxsPSIjRkY2QjZCIi8+Cjwvc3ZnPg==',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwLjg0IDQuNjFhNS41IDUuNSAwIDAgMC03Ljc4IDBMMTIgNS42N2wtMS4wNi0xLjA2YTUuNSA1LjUgMCAwIDAtNy43OCA3Ljc4bDEuMDYgMS4wNkwxMiAyMS4yM2w3Ljc4LTcuNzggMS4wNi0xLjA2YTUuNSA1LjUgMCAwIDAtLjc4LTcuNzh6IiBmaWxsPSIjRkY2QjZCIi8+Cjwvc3ZnPg==',
    category: 'icons',
    tags: ['爱心', '喜欢', '红色', '情感'],
    size: 1024,
    dimensions: { width: 24, height: 24 },
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'icon-star',
    name: '星星',
    type: 'icon',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0ibTEyIDJsMyA2IDYgMC00IDUtMSA3LTQtMi00IDItMS03LTQtNSA2IDAgMy02eiIgZmlsbD0iI0ZGRDcwMCIvPgo8L3N2Zz4=',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0ibTEyIDJsMyA2IDYgMC00IDUtMSA3LTQtMi00IDItMS03LTQtNSA2IDAgMy02eiIgZmlsbD0iI0ZGRDcwMCIvPgo8L3N2Zz4=',
    category: 'icons',
    tags: ['星星', '评分', '黄色', '装饰'],
    size: 1024,
    dimensions: { width: 24, height: 24 },
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'icon-check',
    name: '对勾',
    type: 'icon',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDZMOSAxN2wtNS01IiBzdHJva2U9IiMxMEI5ODEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDZMOSAxN2wtNS01IiBzdHJva2U9IiMxMEI5ODEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==',
    category: 'icons',
    tags: ['对勾', '完成', '绿色', '确认'],
    size: 1024,
    dimensions: { width: 24, height: 24 },
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'icon-arrow',
    name: '箭头',
    type: 'icon',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUgMTJoMTRtLTcgN2w3LTctNy03IiBzdHJva2U9IiMzQjgyRjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUgMTJoMTRtLTcgN2w3LTctNy03IiBzdHJva2U9IiMzQjgyRjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==',
    category: 'icons',
    tags: ['箭头', '方向', '蓝色', '指示'],
    size: 1024,
    dimensions: { width: 24, height: 24 },
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// 形状素材
export const shapeAssets: Asset[] = [
  {
    id: 'shape-circle',
    name: '圆形',
    type: 'shape',
    url: 'circle',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjgiIGZpbGw9IiMzQjgyRjYiLz4KPC9zdmc+',
    category: 'shapes',
    tags: ['圆形', '基础', '几何'],
    size: 0,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'shape-square',
    name: '正方形',
    type: 'shape',
    url: 'square',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMTBCOTgxIi8+Cjwvc3ZnPg==',
    category: 'shapes',
    tags: ['正方形', '矩形', '基础', '几何'],
    size: 0,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'shape-triangle',
    name: '三角形',
    type: 'shape',
    url: 'triangle',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDhMNTYgNTZIOFoiIGZpbGw9IiNGNTlFMEIiLz4KPC9zdmc+',
    category: 'shapes',
    tags: ['三角形', '基础', '几何'],
    size: 0,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'shape-hexagon',
    name: '六边形',
    type: 'shape',
    url: 'hexagon',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDhMNDggMTZWNDhMMzIgNTZMMTYgNDhWMTZaIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjwvc3ZnPg==',
    category: 'shapes',
    tags: ['六边形', '多边形', '几何'],
    size: 0,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// 背景素材
export const backgroundAssets: Asset[] = [
  {
    id: 'bg-gradient-1',
    name: '蓝紫渐变',
    type: 'image',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2N2VlYTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNzY0YmEyO3N0b3Atb3BhY2l0eToxIiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2dyYWQxKSIvPgo8L3N2Zz4=',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjY3ZWVhO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM3NjRiYTI7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSJ1cmwoI2dyYWQxKSIvPgo8L3N2Zz4=',
    category: 'backgrounds',
    tags: ['渐变', '蓝色', '紫色', '背景'],
    size: 2048,
    dimensions: { width: 800, height: 600 },
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'bg-gradient-2',
    name: '粉橙渐变',
    type: 'image',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmOWE5ZTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmVjZmVmO3N0b3Atb3BhY2l0eToxIiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2dyYWQyKSIvPgo8L3N2Zz4=',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDIiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmY5YTllO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZWNmZWY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSJ1cmwoI2dyYWQyKSIvPgo8L3N2Zz4=',
    category: 'backgrounds',
    tags: ['渐变', '粉色', '橙色', '背景'],
    size: 2048,
    dimensions: { width: 800, height: 600 },
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// 合并所有素材
export const allAssets: Asset[] = [
  ...iconAssets,
  ...shapeAssets,
  ...backgroundAssets
];

// 根据分类获取素材
export const getAssetsByCategory = (categoryId: string): Asset[] => {
  if (categoryId === 'all') return allAssets;
  return allAssets.filter(asset => asset.category === categoryId);
};

// 搜索素材
export const searchAssets = (query: string): Asset[] => {
  const lowercaseQuery = query.toLowerCase();
  return allAssets.filter(asset => 
    asset.name.toLowerCase().includes(lowercaseQuery) ||
    asset.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};