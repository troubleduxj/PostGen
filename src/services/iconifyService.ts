import { Asset } from '@/stores/assetLibraryStore';

import { ICONIFY_CONFIG, getErrorMessage } from '@/config/onlineAssets';

// Iconify API 配置
const ICONIFY_API_BASE = ICONIFY_CONFIG.API_BASE;

// Iconify 图标接口
interface IconifyIcon {
  prefix: string;
  name: string;
  body: string;
  width?: number;
  height?: number;
  viewBox?: string;
}

// Iconify 搜索响应
interface IconifySearchResponse {
  icons: string[];
  total: number;
  limit: number;
  start: number;
}

// Iconify 图标集信息
interface IconifyCollection {
  prefix: string;
  name: string;
  author: {
    name: string;
    url?: string;
  };
  license: {
    title: string;
    spdx?: string;
    url?: string;
  };
  samples: string[];
  height?: number;
  category?: string;
  palette?: boolean;
  total: number;
}

// Iconify 服务类
export class IconifyService {
  private static instance: IconifyService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = ICONIFY_CONFIG.CACHE_DURATION;

  static getInstance(): IconifyService {
    if (!IconifyService.instance) {
      IconifyService.instance = new IconifyService();
    }
    return IconifyService.instance;
  }

  // 获取缓存键
  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${paramString}`;
  }

  // 检查缓存
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  // 设置缓存
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 发起 API 请求
  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // 检查缓存
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) {
      return cached;
    }

    // 构建 URL
    const url = new URL(`${ICONIFY_API_BASE}${endpoint}`);
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        const error = new Error(`Iconify API error: ${response.status} ${response.statusText}`);
        (error as any).response = { status: response.status };
        throw error;
      }

      const data = await response.json();
      
      // 缓存结果
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Iconify API request failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // 搜索图标
  async searchIcons(
    query: string,
    limit: number = 20,
    start: number = 0,
    prefixes?: string[]
  ): Promise<{ assets: Asset[]; total: number; hasMore: boolean }> {
    try {
      const params: Record<string, any> = {
        query,
        limit,
        start
      };

      if (prefixes && prefixes.length > 0) {
        params.prefixes = prefixes.join(',');
      }

      const response = await this.request<IconifySearchResponse>('/search', params);
      
      // 获取图标详细信息
      const iconPromises = response.icons.slice(0, limit).map(iconName => 
        this.getIconData(iconName)
      );
      
      const icons = await Promise.all(iconPromises);
      const assets = icons.filter(Boolean).map(icon => this.convertToAsset(icon!));
      
      return {
        assets,
        total: response.total,
        hasMore: start + limit < response.total
      };
    } catch (error) {
      console.error('Failed to search Iconify icons:', error);
      return { assets: [], total: 0, hasMore: false };
    }
  }

  // 获取图标数据
  async getIconData(iconName: string): Promise<IconifyIcon | null> {
    try {
      const [prefix, name] = iconName.split(':');
      if (!prefix || !name) return null;

      const response = await this.request<{ [key: string]: IconifyIcon }>(`/${prefix}.json`, {
        icons: name
      });

      const iconData = response[name];
      if (!iconData) return null;

      return {
        prefix,
        name,
        ...iconData
      };
    } catch (error) {
      console.error(`Failed to get icon data for ${iconName}:`, error);
      return null;
    }
  }

  // 获取图标集列表
  async getCollections(): Promise<IconifyCollection[]> {
    try {
      const response = await this.request<{ [key: string]: IconifyCollection }>('/collections');
      return Object.values(response);
    } catch (error) {
      console.error('Failed to get Iconify collections:', error);
      return [];
    }
  }

  // 获取热门图标集
  async getPopularCollections(limit: number = 10): Promise<IconifyCollection[]> {
    const collections = await this.getCollections();
    
    // 按图标数量排序，取前几个
    return collections
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }

  // 获取图标集中的图标
  async getCollectionIcons(
    prefix: string,
    limit: number = 20,
    start: number = 0
  ): Promise<{ assets: Asset[]; hasMore: boolean }> {
    try {
      const response = await this.request<{ icons: { [key: string]: IconifyIcon } }>(`/${prefix}.json`);
      
      const iconNames = Object.keys(response.icons);
      const selectedIcons = iconNames.slice(start, start + limit);
      
      const assets = selectedIcons.map(name => {
        const iconData = response.icons[name];
        return this.convertToAsset({
          prefix,
          name,
          ...iconData
        });
      });
      
      return {
        assets,
        hasMore: start + limit < iconNames.length
      };
    } catch (error) {
      console.error(`Failed to get icons from collection ${prefix}:`, error);
      return { assets: [], hasMore: false };
    }
  }

  // 转换 Iconify 图标为 Asset 格式
  private convertToAsset(icon: IconifyIcon): Asset {
    const iconName = `${icon.prefix}:${icon.name}`;
    const svgContent = this.generateSVG(icon);
    const dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;

    // 生成标签
    const tags = [
      icon.prefix,
      icon.name,
      ...icon.name.split('-'),
      ...icon.name.split('_')
    ].filter(Boolean);

    return {
      id: `iconify-${iconName}`,
      name: this.formatIconName(icon.name),
      type: 'icon',
      category: 'icons',
      url: dataUrl,
      thumbnail: dataUrl,
      tags,
      size: svgContent.length,
      dimensions: {
        width: icon.width || 24,
        height: icon.height || 24
      },
      isCustom: false,
      createdAt: new Date().toISOString(),
      source: 'iconify'
    };
  }

  // 生成 SVG 内容
  private generateSVG(icon: IconifyIcon): string {
    const width = icon.width || 24;
    const height = icon.height || 24;
    const viewBox = icon.viewBox || `0 0 ${width} ${height}`;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">${icon.body}</svg>`;
  }

  // 格式化图标名称
  private formatIconName(name: string): string {
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // 获取自定义颜色的图标 SVG
  getColoredIconSVG(iconName: string, color: string = '#000000'): Promise<string | null> {
    return new Promise(async (resolve) => {
      try {
        const iconData = await this.getIconData(iconName);
        if (!iconData) {
          resolve(null);
          return;
        }

        const width = iconData.width || 24;
        const height = iconData.height || 24;
        const viewBox = iconData.viewBox || `0 0 ${width} ${height}`;

        // 替换颜色
        let body = iconData.body;
        if (color !== '#000000') {
          body = body.replace(/fill="[^"]*"/g, `fill="${color}"`);
          body = body.replace(/stroke="[^"]*"/g, `stroke="${color}"`);
          if (!body.includes('fill=') && !body.includes('stroke=')) {
            body = body.replace(/<path/g, `<path fill="${color}"`);
          }
        }

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">${body}</svg>`;
        resolve(svg);
      } catch (error) {
        console.error('Failed to generate colored icon:', error);
        resolve(null);
      }
    });
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
  }

  // 获取缓存统计
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 导出单例实例
export const iconifyService = IconifyService.getInstance();

// 预定义的热门图标集
export const POPULAR_ICON_COLLECTIONS = [
  { prefix: 'mdi', name: 'Material Design Icons', category: 'General' },
  { prefix: 'fa', name: 'Font Awesome', category: 'General' },
  { prefix: 'heroicons', name: 'Heroicons', category: 'General' },
  { prefix: 'lucide', name: 'Lucide', category: 'General' },
  { prefix: 'tabler', name: 'Tabler Icons', category: 'General' },
  { prefix: 'carbon', name: 'Carbon', category: 'Business' },
  { prefix: 'ant-design', name: 'Ant Design Icons', category: 'UI' },
  { prefix: 'bootstrap', name: 'Bootstrap Icons', category: 'UI' },
  { prefix: 'feather', name: 'Feather', category: 'General' },
  { prefix: 'phosphor', name: 'Phosphor', category: 'General' }
];

// 图标分类
export const ICON_CATEGORIES = [
  { id: 'all', name: '全部', query: '' },
  { id: 'ui', name: 'UI界面', query: 'ui interface button' },
  { id: 'business', name: '商务', query: 'business office work' },
  { id: 'communication', name: '通讯', query: 'communication chat message' },
  { id: 'media', name: '媒体', query: 'media music video image' },
  { id: 'social', name: '社交', query: 'social network share' },
  { id: 'technology', name: '科技', query: 'technology computer device' },
  { id: 'transport', name: '交通', query: 'transport car plane ship' },
  { id: 'weather', name: '天气', query: 'weather sun rain cloud' },
  { id: 'food', name: '美食', query: 'food drink restaurant' },
  { id: 'health', name: '健康', query: 'health medical hospital' }
];

// 工具函数：根据用途推荐图标集
export function getRecommendedCollections(purpose: 'ui' | 'business' | 'general'): string[] {
  switch (purpose) {
    case 'ui':
      return ['heroicons', 'lucide', 'tabler', 'ant-design', 'bootstrap'];
    case 'business':
      return ['carbon', 'mdi', 'fa', 'lucide'];
    case 'general':
    default:
      return ['mdi', 'heroicons', 'lucide', 'feather', 'phosphor'];
  }
}