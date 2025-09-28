/**
 * 模板分类配置
 * 定义模板分类、子分类、画布尺寸映射和显示信息
 */

import { TemplateCategory, TemplateCategoryConfig } from '@/types/template';

// 模板分类配置
export const templateCategories: Record<TemplateCategory, TemplateCategoryConfig> = {
  [TemplateCategory.SOCIAL_MEDIA]: {
    name: '社交媒体',
    icon: '📱',
    subcategories: {
      'instagram-post': {
        name: 'Instagram帖子',
        size: { width: 1080, height: 1080 }
      },
      'instagram-story': {
        name: 'Instagram故事',
        size: { width: 1080, height: 1920 }
      },
      'facebook-post': {
        name: 'Facebook帖子',
        size: { width: 1200, height: 630 }
      },
      'facebook-cover': {
        name: 'Facebook封面',
        size: { width: 1640, height: 859 }
      },
      'twitter-header': {
        name: 'Twitter头图',
        size: { width: 1500, height: 500 }
      },
      'twitter-post': {
        name: 'Twitter帖子',
        size: { width: 1024, height: 512 }
      },
      'linkedin-post': {
        name: 'LinkedIn帖子',
        size: { width: 1200, height: 627 }
      },
      'linkedin-banner': {
        name: 'LinkedIn横幅',
        size: { width: 1584, height: 396 }
      },
      'youtube-thumbnail': {
        name: 'YouTube缩略图',
        size: { width: 1280, height: 720 }
      },
      'youtube-banner': {
        name: 'YouTube频道横幅',
        size: { width: 2560, height: 1440 }
      },
      'pinterest-pin': {
        name: 'Pinterest图钉',
        size: { width: 1000, height: 1500 }
      },
      'tiktok-video': {
        name: 'TikTok视频',
        size: { width: 1080, height: 1920 }
      }
    }
  },

  [TemplateCategory.PRINT]: {
    name: '印刷品',
    icon: '🖨️',
    subcategories: {
      'flyer-a4': {
        name: 'A4传单',
        size: { width: 2480, height: 3508 } // 300 DPI
      },
      'flyer-a5': {
        name: 'A5传单',
        size: { width: 1748, height: 2480 }
      },
      'business-card': {
        name: '名片',
        size: { width: 1050, height: 600 } // 标准名片尺寸
      },
      'business-card-vertical': {
        name: '竖版名片',
        size: { width: 600, height: 1050 }
      },
      'poster-a3': {
        name: 'A3海报',
        size: { width: 3508, height: 4961 }
      },
      'poster-a2': {
        name: 'A2海报',
        size: { width: 4961, height: 7016 }
      },
      'poster-a1': {
        name: 'A1海报',
        size: { width: 7016, height: 9933 }
      },
      'brochure-trifold': {
        name: '三折宣传册',
        size: { width: 7440, height: 3508 } // 展开尺寸
      },
      'brochure-bifold': {
        name: '对折宣传册',
        size: { width: 4960, height: 3508 }
      },
      'invitation-card': {
        name: '邀请函',
        size: { width: 1500, height: 2100 }
      },
      'greeting-card': {
        name: '贺卡',
        size: { width: 1500, height: 2100 }
      },
      'certificate': {
        name: '证书',
        size: { width: 3508, height: 2480 } // A4横向
      },
      'letterhead': {
        name: '信头纸',
        size: { width: 2480, height: 3508 }
      },
      'envelope': {
        name: '信封',
        size: { width: 3307, height: 2362 } // DL信封
      },
      'sticker': {
        name: '贴纸',
        size: { width: 600, height: 600 }
      },
      'bookmark': {
        name: '书签',
        size: { width: 600, height: 2100 }
      }
    }
  },

  [TemplateCategory.PRESENTATION]: {
    name: '演示文稿',
    icon: '📊',
    subcategories: {
      'ppt-standard': {
        name: 'PPT标准',
        size: { width: 1024, height: 768 } // 4:3比例
      },
      'ppt-widescreen': {
        name: 'PPT宽屏',
        size: { width: 1920, height: 1080 } // 16:9比例
      },
      'keynote': {
        name: 'Keynote',
        size: { width: 1920, height: 1080 }
      },
      'google-slides': {
        name: 'Google Slides',
        size: { width: 1920, height: 1080 }
      },
      'prezi': {
        name: 'Prezi',
        size: { width: 1920, height: 1080 }
      },
      'slide-deck': {
        name: '幻灯片组',
        size: { width: 1920, height: 1080 }
      },
      'pitch-deck': {
        name: '路演PPT',
        size: { width: 1920, height: 1080 }
      },
      'webinar-slide': {
        name: '网络研讨会',
        size: { width: 1920, height: 1080 }
      }
    }
  },

  [TemplateCategory.DIGITAL_MARKETING]: {
    name: '数字营销',
    icon: '📈',
    subcategories: {
      'banner-leaderboard': {
        name: '横幅广告',
        size: { width: 728, height: 90 }
      },
      'banner-rectangle': {
        name: '矩形广告',
        size: { width: 336, height: 280 }
      },
      'banner-square': {
        name: '方形广告',
        size: { width: 300, height: 300 }
      },
      'banner-skyscraper': {
        name: '摩天楼广告',
        size: { width: 160, height: 600 }
      },
      'email-header': {
        name: '邮件头图',
        size: { width: 600, height: 200 }
      },
      'email-signature': {
        name: '邮件签名',
        size: { width: 500, height: 150 }
      },
      'web-banner': {
        name: '网站横幅',
        size: { width: 1200, height: 300 }
      },
      'hero-banner': {
        name: '主横幅',
        size: { width: 1920, height: 600 }
      },
      'popup-ad': {
        name: '弹窗广告',
        size: { width: 500, height: 400 }
      },
      'sidebar-ad': {
        name: '侧边栏广告',
        size: { width: 300, height: 600 }
      },
      'mobile-banner': {
        name: '移动横幅',
        size: { width: 320, height: 50 }
      },
      'retargeting-ad': {
        name: '重定向广告',
        size: { width: 300, height: 250 }
      }
    }
  },

  [TemplateCategory.MOBILE]: {
    name: '移动端',
    icon: '📱',
    subcategories: {
      'phone-wallpaper': {
        name: '手机壁纸',
        size: { width: 1080, height: 1920 }
      },
      'tablet-wallpaper': {
        name: '平板壁纸',
        size: { width: 2048, height: 2732 }
      },
      'app-screenshot': {
        name: '应用截图',
        size: { width: 1242, height: 2208 } // iPhone 6 Plus
      },
      'app-icon': {
        name: 'App图标',
        size: { width: 1024, height: 1024 }
      },
      'mobile-ad': {
        name: '移动广告',
        size: { width: 320, height: 480 }
      },
      'mobile-story': {
        name: '移动故事',
        size: { width: 1080, height: 1920 }
      },
      'mobile-banner': {
        name: '移动横幅',
        size: { width: 320, height: 50 }
      },
      'splash-screen': {
        name: '启动屏幕',
        size: { width: 1080, height: 1920 }
      },
      'lock-screen': {
        name: '锁屏壁纸',
        size: { width: 1080, height: 1920 }
      },
      'widget-design': {
        name: '小组件设计',
        size: { width: 400, height: 400 }
      }
    }
  },

  [TemplateCategory.CUSTOM]: {
    name: '自定义',
    icon: '🎨',
    subcategories: {
      'custom-size': {
        name: '自定义尺寸',
        size: { width: 1920, height: 1080 }
      },
      'user-template': {
        name: '用户模板',
        size: { width: 1920, height: 1080 }
      },
      'saved-template': {
        name: '保存的模板',
        size: { width: 1920, height: 1080 }
      },
      'imported-template': {
        name: '导入的模板',
        size: { width: 1920, height: 1080 }
      }
    }
  }
};

// 分类显示顺序
export const categoryOrder: TemplateCategory[] = [
  TemplateCategory.SOCIAL_MEDIA,
  TemplateCategory.PRINT,
  TemplateCategory.PRESENTATION,
  TemplateCategory.DIGITAL_MARKETING,
  TemplateCategory.MOBILE,
  TemplateCategory.CUSTOM
];

// 获取分类信息的辅助函数
export const getCategoryInfo = (category: TemplateCategory): TemplateCategoryConfig => {
  return templateCategories[category];
};

export const getSubcategoryInfo = (category: TemplateCategory, subcategory: string) => {
  return templateCategories[category]?.subcategories[subcategory];
};

export const getAllSubcategories = () => {
  const subcategories: Array<{
    category: TemplateCategory;
    subcategory: string;
    info: { name: string; size: { width: number; height: number } };
  }> = [];

  Object.entries(templateCategories).forEach(([category, config]) => {
    Object.entries(config.subcategories).forEach(([subcategory, info]) => {
      subcategories.push({
        category: category as TemplateCategory,
        subcategory,
        info
      });
    });
  });

  return subcategories;
};

// 根据画布尺寸查找匹配的子分类
export const findMatchingSubcategories = (
  width: number, 
  height: number, 
  tolerance: number = 50
) => {
  const matches: Array<{
    category: TemplateCategory;
    subcategory: string;
    info: { name: string; size: { width: number; height: number } };
    exactMatch: boolean;
  }> = [];

  Object.entries(templateCategories).forEach(([category, config]) => {
    Object.entries(config.subcategories).forEach(([subcategory, info]) => {
      const widthDiff = Math.abs(info.size.width - width);
      const heightDiff = Math.abs(info.size.height - height);
      
      if (widthDiff <= tolerance && heightDiff <= tolerance) {
        matches.push({
          category: category as TemplateCategory,
          subcategory,
          info,
          exactMatch: widthDiff === 0 && heightDiff === 0
        });
      }
    });
  });

  // 精确匹配优先
  return matches.sort((a, b) => {
    if (a.exactMatch && !b.exactMatch) return -1;
    if (!a.exactMatch && b.exactMatch) return 1;
    return 0;
  });
};

// 获取推荐的画布尺寸
export const getRecommendedSizes = (category?: TemplateCategory) => {
  if (category && templateCategories[category]) {
    return Object.entries(templateCategories[category].subcategories).map(
      ([subcategory, info]) => ({
        name: info.name,
        width: info.size.width,
        height: info.size.height,
        category,
        subcategory
      })
    );
  }

  // 返回所有分类的推荐尺寸
  const sizes: Array<{
    name: string;
    width: number;
    height: number;
    category: TemplateCategory;
    subcategory: string;
  }> = [];

  Object.entries(templateCategories).forEach(([category, config]) => {
    Object.entries(config.subcategories).forEach(([subcategory, info]) => {
      sizes.push({
        name: info.name,
        width: info.size.width,
        height: info.size.height,
        category: category as TemplateCategory,
        subcategory
      });
    });
  });

  return sizes;
};

// 分类统计信息
export const getCategoryStats = () => {
  const stats: Record<TemplateCategory, number> = {} as any;
  
  Object.keys(templateCategories).forEach(category => {
    const categoryKey = category as TemplateCategory;
    stats[categoryKey] = Object.keys(templateCategories[categoryKey].subcategories).length;
  });

  return stats;
};

// 常用尺寸预设
export const commonSizes = [
  // 社交媒体常用尺寸
  { name: 'Instagram帖子', width: 1080, height: 1080, category: 'social_media' },
  { name: 'Instagram故事', width: 1080, height: 1920, category: 'social_media' },
  { name: 'Facebook帖子', width: 1200, height: 630, category: 'social_media' },
  { name: 'Twitter头图', width: 1500, height: 500, category: 'social_media' },
  
  // 印刷品常用尺寸
  { name: 'A4传单', width: 2480, height: 3508, category: 'print' },
  { name: '名片', width: 1050, height: 600, category: 'print' },
  { name: 'A3海报', width: 3508, height: 4961, category: 'print' },
  
  // 演示文稿常用尺寸
  { name: 'PPT宽屏', width: 1920, height: 1080, category: 'presentation' },
  { name: 'PPT标准', width: 1024, height: 768, category: 'presentation' },
  
  // 数字营销常用尺寸
  { name: '横幅广告', width: 728, height: 90, category: 'digital_marketing' },
  { name: '方形广告', width: 300, height: 300, category: 'digital_marketing' },
  
  // 移动端常用尺寸
  { name: '手机壁纸', width: 1080, height: 1920, category: 'mobile' },
  { name: 'App图标', width: 1024, height: 1024, category: 'mobile' }
];

export default templateCategories;