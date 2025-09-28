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

// 头像设计尺寸
export const AVATAR_PRESETS: CanvasPreset[] = [
  {
    name: '微信头像',
    width: 640,
    height: 640,
    ratio: '1:1',
    icon: '👤',
    category: 'avatar',
    description: '微信个人头像标准尺寸'
  },
  {
    name: 'QQ头像',
    width: 640,
    height: 640,
    ratio: '1:1',
    icon: '👤',
    category: 'avatar',
    description: 'QQ个人头像标准尺寸'
  },
  {
    name: '抖音头像',
    width: 720,
    height: 720,
    ratio: '1:1',
    icon: '👤',
    category: 'avatar',
    description: '抖音个人头像'
  },
  {
    name: '小红书头像',
    width: 400,
    height: 400,
    ratio: '1:1',
    icon: '👤',
    category: 'avatar',
    description: '小红书个人头像'
  },
  {
    name: 'Instagram头像',
    width: 320,
    height: 320,
    ratio: '1:1',
    icon: '👤',
    category: 'avatar',
    description: 'Instagram个人头像'
  },
  {
    name: 'Twitter头像',
    width: 400,
    height: 400,
    ratio: '1:1',
    icon: '👤',
    category: 'avatar',
    description: 'Twitter个人头像'
  },
  {
    name: 'LinkedIn头像',
    width: 400,
    height: 400,
    ratio: '1:1',
    icon: '👤',
    category: 'avatar',
    description: 'LinkedIn专业头像'
  },
  {
    name: '游戏头像',
    width: 512,
    height: 512,
    ratio: '1:1',
    icon: '🎮',
    category: 'avatar',
    description: '游戏平台头像'
  },
  {
    name: '论坛头像',
    width: 200,
    height: 200,
    ratio: '1:1',
    icon: '💬',
    category: 'avatar',
    description: '论坛社区头像'
  },
  {
    name: '高清头像',
    width: 1024,
    height: 1024,
    ratio: '1:1',
    icon: '✨',
    category: 'avatar',
    description: '高清头像，适用于多平台'
  }
];

// 读书卡片尺寸
export const READING_CARD_PRESETS: CanvasPreset[] = [
  {
    name: '读书笔记卡片',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    icon: '📚',
    category: 'reading',
    description: '适合分享的读书笔记卡片'
  },
  {
    name: '书摘卡片',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: '📖',
    category: 'reading',
    description: '正方形书摘分享卡片'
  },
  {
    name: '读书清单',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    icon: '📋',
    category: 'reading',
    description: '竖版读书清单卡片'
  },
  {
    name: '书评卡片',
    width: 1200,
    height: 1500,
    ratio: '4:5',
    icon: '⭐',
    category: 'reading',
    description: '书评分享卡片'
  },
  {
    name: '阅读进度',
    width: 1080,
    height: 1440,
    ratio: '3:4',
    icon: '📊',
    category: 'reading',
    description: '阅读进度展示卡片'
  },
  {
    name: '读书挑战',
    width: 1080,
    height: 1620,
    ratio: '2:3',
    icon: '🏆',
    category: 'reading',
    description: '读书挑战打卡卡片'
  },
  {
    name: '书单推荐',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    icon: '💡',
    category: 'reading',
    description: '书单推荐卡片'
  },
  {
    name: '读后感',
    width: 1080,
    height: 1440,
    ratio: '3:4',
    icon: '💭',
    category: 'reading',
    description: '读后感分享卡片'
  }
];

// 学习教育类卡片
export const EDUCATION_PRESETS: CanvasPreset[] = [
  {
    name: '知识卡片',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: '🧠',
    category: 'education',
    description: '知识点总结卡片'
  },
  {
    name: '学习笔记',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    icon: '📝',
    category: 'education',
    description: '学习笔记整理卡片'
  },
  {
    name: '思维导图',
    width: 1920,
    height: 1080,
    ratio: '16:9',
    icon: '🗺️',
    category: 'education',
    description: '横版思维导图'
  },
  {
    name: '课程封面',
    width: 1280,
    height: 720,
    ratio: '16:9',
    icon: '🎓',
    category: 'education',
    description: '在线课程封面'
  },
  {
    name: '学习计划',
    width: 1080,
    height: 1440,
    ratio: '3:4',
    icon: '📅',
    category: 'education',
    description: '学习计划表'
  },
  {
    name: '复习卡片',
    width: 800,
    height: 1200,
    ratio: '2:3',
    icon: '🔄',
    category: 'education',
    description: '复习记忆卡片'
  },
  {
    name: '考试倒计时',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: '⏰',
    category: 'education',
    description: '考试倒计时卡片'
  },
  {
    name: '成绩单',
    width: 1200,
    height: 1600,
    ratio: '3:4',
    icon: '📊',
    category: 'education',
    description: '成绩展示卡片'
  }
];

// 生活记录类卡片
export const LIFESTYLE_PRESETS: CanvasPreset[] = [
  {
    name: '日记卡片',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    icon: '📔',
    category: 'lifestyle',
    description: '日常生活记录卡片'
  },
  {
    name: '心情日记',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: '😊',
    category: 'lifestyle',
    description: '心情记录卡片'
  },
  {
    name: '美食记录',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    icon: '🍽️',
    category: 'lifestyle',
    description: '美食分享卡片'
  },
  {
    name: '旅行日记',
    width: 1080,
    height: 1440,
    ratio: '3:4',
    icon: '✈️',
    category: 'lifestyle',
    description: '旅行记录卡片'
  },
  {
    name: '健身打卡',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: '💪',
    category: 'lifestyle',
    description: '健身记录卡片'
  },
  {
    name: '习惯养成',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    icon: '✅',
    category: 'lifestyle',
    description: '习惯打卡卡片'
  },
  {
    name: '目标规划',
    width: 1080,
    height: 1440,
    ratio: '3:4',
    icon: '🎯',
    category: 'lifestyle',
    description: '目标设定卡片'
  },
  {
    name: '感恩日记',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    icon: '🙏',
    category: 'lifestyle',
    description: '感恩记录卡片'
  }
];

// 商业设计类
export const BUSINESS_PRESETS: CanvasPreset[] = [
  {
    name: 'Logo设计',
    width: 1000,
    height: 1000,
    ratio: '1:1',
    icon: '🏷️',
    category: 'business',
    description: 'Logo标志设计'
  },
  {
    name: '品牌卡片',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: '🎨',
    category: 'business',
    description: '品牌展示卡片'
  },
  {
    name: '产品介绍',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    icon: '📦',
    category: 'business',
    description: '产品介绍卡片'
  },
  {
    name: '价格表',
    width: 1080,
    height: 1440,
    ratio: '3:4',
    icon: '💰',
    category: 'business',
    description: '价格表展示'
  },
  {
    name: '团队介绍',
    width: 1200,
    height: 800,
    ratio: '3:2',
    icon: '👥',
    category: 'business',
    description: '团队成员介绍'
  },
  {
    name: '公司简介',
    width: 1920,
    height: 1080,
    ratio: '16:9',
    icon: '🏢',
    category: 'business',
    description: '公司介绍展示'
  },
  {
    name: '服务介绍',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    icon: '🛠️',
    category: 'business',
    description: '服务项目介绍'
  },
  {
    name: '招聘海报',
    width: 1080,
    height: 1440,
    ratio: '3:4',
    icon: '👔',
    category: 'business',
    description: '招聘信息海报'
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
  avatar: AVATAR_PRESETS,
  reading: READING_CARD_PRESETS,
  education: EDUCATION_PRESETS,
  lifestyle: LIFESTYLE_PRESETS,
  business: BUSINESS_PRESETS,
  poster: POSTER_PRESETS,
  print: PRINT_PRESETS,
  digital: DIGITAL_PRESETS,
  custom: CUSTOM_PRESETS
};

// 分类信息
export const PRESET_CATEGORIES = [
  {
    key: 'social' as const,
    name: '社交媒体',
    icon: '📱',
    description: '抖音、小红书、微信、Instagram等社交平台',
    popular: true
  },
  {
    key: 'avatar' as const,
    name: '头像设计',
    icon: '👤',
    description: '各平台个人头像设计尺寸',
    popular: true
  },
  {
    key: 'reading' as const,
    name: '读书卡片',
    icon: '📚',
    description: '读书笔记、书摘、书评等精美卡片',
    popular: true
  },
  {
    key: 'education' as const,
    name: '学习教育',
    icon: '🎓',
    description: '知识卡片、学习笔记、课程封面等'
  },
  {
    key: 'lifestyle' as const,
    name: '生活记录',
    icon: '📔',
    description: '日记、心情、美食、旅行等生活记录'
  },
  {
    key: 'business' as const,
    name: '商业设计',
    icon: '💼',
    description: 'Logo、品牌、产品介绍等商业用途'
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