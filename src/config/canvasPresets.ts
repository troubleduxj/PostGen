// 画布尺寸预设配置
export interface CanvasPreset {
  name: string;
  width: number;
  height: number;
  ratio: string;
  icon: string;
  category: string;
  description?: string;
}

// 社交媒体尺寸 - 重点关注移动端
export const SOCIAL_MEDIA_PRESETS: CanvasPreset[] = [
  // Instagram 系列
  {
    name: 'Instagram 正方形',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: '📷',
    category: 'social',
    description: 'Instagram 帖子标准格式，最受欢迎'
  },
  {
    name: 'Instagram 故事',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    icon: '📱',
    category: 'social',
    description: 'Instagram/Facebook 故事，24小时展示'
  },
  {
    name: 'Instagram Reels',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    icon: '🎬',
    category: 'social',
    description: 'Instagram 短视频封面'
  },
  {
    name: 'Instagram 轮播',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    icon: '🔄',
    category: 'social',
    description: 'Instagram 多图轮播格式'
  },
  
  // 抖音/TikTok 系列
  {
    name: '抖音/TikTok',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    icon: '🎵',
    category: 'social',
    description: '抖音、TikTok 短视频封面'
  },
  {
    name: '抖音横屏',
    width: 1920,
    height: 1080,
    ratio: '16:9',
    icon: '📺',
    category: 'social',
    description: '抖音横屏模式'
  },
  
  // 小红书系列
  {
    name: '小红书笔记',
    width: 1080,
    height: 1440,
    ratio: '3:4',
    icon: '📝',
    category: 'social',
    description: '小红书图文笔记标准尺寸'
  },
  {
    name: '小红书封面',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: '🔖',
    category: 'social',
    description: '小红书笔记封面图'
  },
  
  // 微信系列
  {
    name: '微信朋友圈',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: '💬',
    category: 'social',
    description: '微信朋友圈九宫格'
  },
  {
    name: '微信公众号封面',
    width: 900,
    height: 500,
    ratio: '1.8:1',
    icon: '📰',
    category: 'social',
    description: '微信公众号头图'
  },
  {
    name: '微信公众号次条',
    width: 200,
    height: 200,
    ratio: '1:1',
    icon: '📄',
    category: 'social',
    description: '微信公众号次条小图'
  },
  
  // 微博系列
  {
    name: '微博配图',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: '🐦',
    category: 'social',
    description: '微博单图配图'
  },
  {
    name: '微博长图',
    width: 1080,
    height: 2340,
    ratio: '9:19.5',
    icon: '📜',
    category: 'social',
    description: '微博长图文'
  },
  
  // Facebook 系列
  {
    name: 'Facebook 帖子',
    width: 1200,
    height: 630,
    ratio: '1.91:1',
    icon: '📘',
    category: 'social',
    description: 'Facebook 链接分享图'
  },
  {
    name: 'Facebook 封面',
    width: 1200,
    height: 630,
    ratio: '1.91:1',
    icon: '🎭',
    category: 'social',
    description: 'Facebook 页面封面'
  },
  {
    name: 'Facebook 故事',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    icon: '📱',
    category: 'social',
    description: 'Facebook 故事格式'
  },
  
  // Twitter/X 系列
  {
    name: 'Twitter 帖子',
    width: 1200,
    height: 675,
    ratio: '16:9',
    icon: '🐦',
    category: 'social',
    description: 'Twitter 图片帖子'
  },
  {
    name: 'Twitter 头图',
    width: 1500,
    height: 500,
    ratio: '3:1',
    icon: '🎨',
    category: 'social',
    description: 'Twitter 个人资料头图'
  },
  
  // LinkedIn 系列
  {
    name: 'LinkedIn 帖子',
    width: 1200,
    height: 627,
    ratio: '1.91:1',
    icon: '💼',
    category: 'social',
    description: 'LinkedIn 分享图片'
  },
  {
    name: 'LinkedIn 横幅',
    width: 1584,
    height: 396,
    ratio: '4:1',
    icon: '🏢',
    category: 'social',
    description: 'LinkedIn 个人资料背景'
  },
  
  // YouTube 系列
  {
    name: 'YouTube 缩略图',
    width: 1280,
    height: 720,
    ratio: '16:9',
    icon: '📺',
    category: 'social',
    description: 'YouTube 视频缩略图'
  },
  {
    name: 'YouTube Shorts',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    icon: '🎬',
    category: 'social',
    description: 'YouTube 短视频封面'
  },
  {
    name: 'YouTube 频道封面',
    width: 2560,
    height: 1440,
    ratio: '16:9',
    icon: '🎪',
    category: 'social',
    description: 'YouTube 频道横幅'
  },
  
  // 快手系列
  {
    name: '快手短视频',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    icon: '⚡',
    category: 'social',
    description: '快手短视频封面'
  },
  
  // B站系列
  {
    name: 'B站封面',
    width: 1146,
    height: 717,
    ratio: '1.6:1',
    icon: '📺',
    category: 'social',
    description: 'B站视频封面'
  },
  {
    name: 'B站动态',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: '🎮',
    category: 'social',
    description: 'B站动态配图'
  }
];

// 印刷品尺寸
export const PRINT_PRESETS: CanvasPreset[] = [
  {
    name: 'A4 纵向',
    width: 2480,
    height: 3508,
    ratio: 'A4',
    icon: '📄',
    category: 'print',
    description: '210 × 297 mm，300 DPI'
  },
  {
    name: 'A4 横向',
    width: 3508,
    height: 2480,
    ratio: 'A4',
    icon: '📄',
    category: 'print',
    description: '297 × 210 mm，300 DPI'
  },
  {
    name: 'A3 纵向',
    width: 3508,
    height: 4961,
    ratio: 'A3',
    icon: '📋',
    category: 'print',
    description: '297 × 420 mm，300 DPI'
  },
  {
    name: 'A5 纵向',
    width: 1748,
    height: 2480,
    ratio: 'A5',
    icon: '📝',
    category: 'print',
    description: '148 × 210 mm，300 DPI'
  },
  {
    name: '名片',
    width: 1050,
    height: 600,
    ratio: '1.75:1',
    icon: '💳',
    category: 'print',
    description: '90 × 54 mm，300 DPI'
  },
  {
    name: '传单 A5',
    width: 1748,
    height: 2480,
    ratio: 'A5',
    icon: '📜',
    category: 'print',
    description: '148 × 210 mm，300 DPI'
  }
];

// 海报尺寸
export const POSTER_PRESETS: CanvasPreset[] = [
  {
    name: '电影海报',
    width: 2025,
    height: 3000,
    ratio: '2:3',
    icon: '🎬',
    category: 'poster',
    description: '标准电影海报比例'
  },
  {
    name: '活动海报',
    width: 1800,
    height: 2400,
    ratio: '3:4',
    icon: '🎪',
    category: 'poster',
    description: '活动宣传海报'
  },
  {
    name: '宣传单页',
    width: 2100,
    height: 2970,
    ratio: 'A4',
    icon: '📢',
    category: 'poster',
    description: 'A4 尺寸宣传单'
  },
  {
    name: '横幅广告',
    width: 3000,
    height: 1000,
    ratio: '3:1',
    icon: '🏷️',
    category: 'poster',
    description: '横向广告横幅'
  },
  {
    name: '地铁广告',
    width: 4200,
    height: 2970,
    ratio: 'A3+',
    icon: '🚇',
    category: 'poster',
    description: '地铁站广告牌'
  }
];

// 数字屏幕尺寸
export const DIGITAL_PRESETS: CanvasPreset[] = [
  {
    name: '桌面壁纸 HD',
    width: 1920,
    height: 1080,
    ratio: '16:9',
    icon: '🖥️',
    category: 'digital',
    description: '1080p 高清壁纸'
  },
  {
    name: '桌面壁纸 4K',
    width: 3840,
    height: 2160,
    ratio: '16:9',
    icon: '🖥️',
    category: 'digital',
    description: '4K 超高清壁纸'
  },
  {
    name: '手机壁纸',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    icon: '📱',
    category: 'digital',
    description: '手机竖屏壁纸'
  },
  {
    name: '平板壁纸',
    width: 2048,
    height: 2732,
    ratio: '3:4',
    icon: '📱',
    category: 'digital',
    description: 'iPad 壁纸'
  },
  {
    name: '网页横幅',
    width: 1200,
    height: 400,
    ratio: '3:1',
    icon: '🌐',
    category: 'digital',
    description: '网站头部横幅'
  }
];

// 移动端专用尺寸
export const MOBILE_PRESETS: CanvasPreset[] = [
  // 手机屏幕尺寸
  {
    name: 'iPhone 14 Pro',
    width: 1179,
    height: 2556,
    ratio: '19.5:9',
    icon: '📱',
    category: 'mobile',
    description: 'iPhone 14 Pro 屏幕尺寸'
  },
  {
    name: 'iPhone 标准',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    icon: '📱',
    category: 'mobile',
    description: '标准 iPhone 屏幕比例'
  },
  {
    name: 'Android 标准',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    icon: '🤖',
    category: 'mobile',
    description: '标准 Android 屏幕'
  },
  {
    name: '小米手机',
    width: 1080,
    height: 2340,
    ratio: '19.5:9',
    icon: '📱',
    category: 'mobile',
    description: '小米全面屏手机'
  },
  
  // 移动端海报常用尺寸
  {
    name: '手机海报 竖版',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    icon: '📄',
    category: 'mobile',
    description: '手机竖屏海报标准尺寸'
  },
  {
    name: '手机海报 方形',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: '⬜',
    category: 'mobile',
    description: '手机方形海报'
  },
  {
    name: '手机长图',
    width: 1080,
    height: 2400,
    ratio: '9:20',
    icon: '📜',
    category: 'mobile',
    description: '手机长图海报'
  },
  {
    name: '手机超长图',
    width: 1080,
    height: 3240,
    ratio: '1:3',
    icon: '📋',
    category: 'mobile',
    description: '手机超长图文'
  },
  
  // 平板尺寸
  {
    name: 'iPad 标准',
    width: 2048,
    height: 2732,
    ratio: '3:4',
    icon: '📱',
    category: 'mobile',
    description: 'iPad 标准屏幕尺寸'
  },
  {
    name: 'iPad 横屏',
    width: 2732,
    height: 2048,
    ratio: '4:3',
    icon: '📱',
    category: 'mobile',
    description: 'iPad 横屏模式'
  },
  
  // 移动端广告尺寸
  {
    name: '移动横幅',
    width: 1080,
    height: 540,
    ratio: '2:1',
    icon: '🏷️',
    category: 'mobile',
    description: '移动端横幅广告'
  },
  {
    name: '移动插屏',
    width: 1080,
    height: 1620,
    ratio: '2:3',
    icon: '📺',
    category: 'mobile',
    description: '移动端插屏广告'
  }
];

// 自定义常用尺寸
export const CUSTOM_PRESETS: CanvasPreset[] = [
  {
    name: '正方形 小',
    width: 800,
    height: 800,
    ratio: '1:1',
    icon: '⬜',
    category: 'custom',
    description: '小尺寸正方形'
  },
  {
    name: '正方形 中',
    width: 1200,
    height: 1200,
    ratio: '1:1',
    icon: '⬜',
    category: 'custom',
    description: '中等尺寸正方形'
  },
  {
    name: '正方形 大',
    width: 1800,
    height: 1800,
    ratio: '1:1',
    icon: '⬜',
    category: 'custom',
    description: '大尺寸正方形'
  },
  {
    name: '横向 16:9',
    width: 1600,
    height: 900,
    ratio: '16:9',
    icon: '📺',
    category: 'custom',
    description: '宽屏横向格式'
  },
  {
    name: '纵向 9:16',
    width: 900,
    height: 1600,
    ratio: '9:16',
    icon: '📱',
    category: 'custom',
    description: '手机纵向格式'
  },
  {
    name: '黄金比例',
    width: 1618,
    height: 1000,
    ratio: '1.618:1',
    icon: '✨',
    category: 'custom',
    description: '黄金比例矩形'
  },
  {
    name: '超宽屏',
    width: 2560,
    height: 1080,
    ratio: '21:9',
    icon: '📺',
    category: 'custom',
    description: '超宽屏显示器比例'
  },
  {
    name: '电商主图',
    width: 800,
    height: 800,
    ratio: '1:1',
    icon: '🛒',
    category: 'custom',
    description: '电商平台商品主图'
  }
];

// 所有预设的集合
export const ALL_CANVAS_PRESETS = {
  social: SOCIAL_MEDIA_PRESETS,
  mobile: MOBILE_PRESETS,
  print: PRINT_PRESETS,
  poster: POSTER_PRESETS,
  digital: DIGITAL_PRESETS,
  custom: CUSTOM_PRESETS
};

// 分类信息
export const PRESET_CATEGORIES = [
  {
    key: 'social' as const,
    name: '社交媒体',
    icon: '📱',
    description: '抖音、小红书、微信、Instagram等社交平台'
  },
  {
    key: 'mobile' as const,
    name: '移动端',
    icon: '📱',
    description: '手机、平板等移动设备专用尺寸'
  },
  {
    key: 'poster' as const,
    name: '海报',
    icon: '🎪',
    description: '各种海报和宣传品尺寸'
  },
  {
    key: 'print' as const,
    name: '印刷品',
    icon: '🖨️',
    description: '适用于印刷的标准纸张尺寸'
  },
  {
    key: 'digital' as const,
    name: '数字屏幕',
    icon: '🖥️',
    description: '适用于数字设备的屏幕尺寸'
  },
  {
    key: 'custom' as const,
    name: '常用尺寸',
    icon: '⚙️',
    description: '其他常用的自定义尺寸'
  }
];

// 获取所有预设
export const getAllPresets = (): CanvasPreset[] => {
  return Object.values(ALL_CANVAS_PRESETS).flat();
};

// 根据分类获取预设
export const getPresetsByCategory = (category: keyof typeof ALL_CANVAS_PRESETS): CanvasPreset[] => {
  return ALL_CANVAS_PRESETS[category] || [];
};

// 搜索预设
export const searchPresets = (query: string): CanvasPreset[] => {
  const allPresets = getAllPresets();
  const lowerQuery = query.toLowerCase();
  
  return allPresets.filter(preset => 
    preset.name.toLowerCase().includes(lowerQuery) ||
    preset.description?.toLowerCase().includes(lowerQuery) ||
    preset.ratio.toLowerCase().includes(lowerQuery)
  );
};