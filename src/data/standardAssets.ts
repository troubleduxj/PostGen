// 标准素材库数据
export interface AssetItem {
  id: string;
  name: string;
  icon: string; // Lucide React 图标名称
  category: string;
  tags: string[];
  color?: string;
  imageUrl?: string; // 自定义图片素材的URL
}

export interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  assets: AssetItem[];
}

// 标准素材库
export const standardAssets: AssetCategory[] = [
  {
    id: 'basic-shapes',
    name: '基础形状',
    icon: 'Square',
    assets: [
      { id: 'circle', name: '圆形', icon: 'Circle', category: 'basic-shapes', tags: ['圆', '基础', '形状'] },
      { id: 'square', name: '正方形', icon: 'Square', category: 'basic-shapes', tags: ['方形', '基础', '形状'] },
      { id: 'triangle', name: '三角形', icon: 'Triangle', category: 'basic-shapes', tags: ['三角', '基础', '形状'] },
      { id: 'diamond', name: '菱形', icon: 'Diamond', category: 'basic-shapes', tags: ['菱形', '基础', '形状'] },
      { id: 'hexagon', name: '六边形', icon: 'Hexagon', category: 'basic-shapes', tags: ['六边形', '基础', '形状'] },
      { id: 'star', name: '星形', icon: 'Star', category: 'basic-shapes', tags: ['星星', '基础', '形状'] },
      { id: 'heart', name: '心形', icon: 'Heart', category: 'basic-shapes', tags: ['心', '爱心', '形状'] },
    ]
  },
  {
    id: 'arrows',
    name: '箭头指向',
    icon: 'ArrowRight',
    assets: [
      { id: 'arrow-up', name: '向上箭头', icon: 'ArrowUp', category: 'arrows', tags: ['箭头', '向上', '指向'] },
      { id: 'arrow-down', name: '向下箭头', icon: 'ArrowDown', category: 'arrows', tags: ['箭头', '向下', '指向'] },
      { id: 'arrow-left', name: '向左箭头', icon: 'ArrowLeft', category: 'arrows', tags: ['箭头', '向左', '指向'] },
      { id: 'arrow-right', name: '向右箭头', icon: 'ArrowRight', category: 'arrows', tags: ['箭头', '向右', '指向'] },
      { id: 'arrow-up-right', name: '右上箭头', icon: 'ArrowUpRight', category: 'arrows', tags: ['箭头', '右上', '指向'] },
      { id: 'arrow-down-right', name: '右下箭头', icon: 'ArrowDownRight', category: 'arrows', tags: ['箭头', '右下', '指向'] },
      { id: 'chevron-up', name: '向上尖括号', icon: 'ChevronUp', category: 'arrows', tags: ['尖括号', '向上', '指向'] },
      { id: 'chevron-down', name: '向下尖括号', icon: 'ChevronDown', category: 'arrows', tags: ['尖括号', '向下', '指向'] },
    ]
  },
  {
    id: 'business',
    name: '商务办公',
    icon: 'Briefcase',
    assets: [
      { id: 'briefcase', name: '公文包', icon: 'Briefcase', category: 'business', tags: ['公文包', '商务', '办公'] },
      { id: 'building', name: '建筑', icon: 'Building', category: 'business', tags: ['建筑', '公司', '办公'] },
      { id: 'chart-bar', name: '柱状图', icon: 'BarChart3', category: 'business', tags: ['图表', '数据', '分析'] },
      { id: 'chart-line', name: '折线图', icon: 'LineChart', category: 'business', tags: ['图表', '趋势', '分析'] },
      { id: 'chart-pie', name: '饼图', icon: 'PieChart', category: 'business', tags: ['饼图', '比例', '分析'] },
      { id: 'target', name: '目标', icon: 'Target', category: 'business', tags: ['目标', '靶心', '目的'] },
      { id: 'trophy', name: '奖杯', icon: 'Trophy', category: 'business', tags: ['奖杯', '成就', '胜利'] },
      { id: 'handshake', name: '握手', icon: 'Handshake', category: 'business', tags: ['握手', '合作', '协议'] },
    ]
  },
  {
    id: 'communication',
    name: '通讯交流',
    icon: 'MessageCircle',
    assets: [
      { id: 'message', name: '消息', icon: 'MessageCircle', category: 'communication', tags: ['消息', '聊天', '交流'] },
      { id: 'mail', name: '邮件', icon: 'Mail', category: 'communication', tags: ['邮件', '邮箱', '通讯'] },
      { id: 'phone', name: '电话', icon: 'Phone', category: 'communication', tags: ['电话', '通话', '联系'] },
      { id: 'video', name: '视频', icon: 'Video', category: 'communication', tags: ['视频', '会议', '通话'] },
      { id: 'megaphone', name: '扩音器', icon: 'Megaphone', category: 'communication', tags: ['扩音器', '宣传', '通知'] },
      { id: 'bell', name: '铃铛', icon: 'Bell', category: 'communication', tags: ['铃铛', '通知', '提醒'] },
      { id: 'wifi', name: 'WiFi', icon: 'Wifi', category: 'communication', tags: ['WiFi', '网络', '连接'] },
      { id: 'signal', name: '信号', icon: 'Signal', category: 'communication', tags: ['信号', '网络', '连接'] },
    ]
  },
  {
    id: 'social',
    name: '社交媒体',
    icon: 'Users',
    assets: [
      { id: 'user', name: '用户', icon: 'User', category: 'social', tags: ['用户', '个人', '头像'] },
      { id: 'users', name: '用户群', icon: 'Users', category: 'social', tags: ['用户', '团队', '群组'] },
      { id: 'thumbs-up', name: '点赞', icon: 'ThumbsUp', category: 'social', tags: ['点赞', '喜欢', '好评'] },
      { id: 'thumbs-down', name: '点踩', icon: 'ThumbsDown', category: 'social', tags: ['点踩', '不喜欢', '差评'] },
      { id: 'share', name: '分享', icon: 'Share2', category: 'social', tags: ['分享', '转发', '传播'] },
      { id: 'bookmark', name: '书签', icon: 'Bookmark', category: 'social', tags: ['书签', '收藏', '保存'] },
      { id: 'eye', name: '查看', icon: 'Eye', category: 'social', tags: ['查看', '浏览', '观看'] },
      { id: 'camera', name: '相机', icon: 'Camera', category: 'social', tags: ['相机', '拍照', '摄影'] },
    ]
  },
  {
    id: 'technology',
    name: '科技数码',
    icon: 'Smartphone',
    assets: [
      { id: 'smartphone', name: '智能手机', icon: 'Smartphone', category: 'technology', tags: ['手机', '智能', '设备'] },
      { id: 'laptop', name: '笔记本', icon: 'Laptop', category: 'technology', tags: ['笔记本', '电脑', '设备'] },
      { id: 'monitor', name: '显示器', icon: 'Monitor', category: 'technology', tags: ['显示器', '屏幕', '设备'] },
      { id: 'tablet', name: '平板', icon: 'Tablet', category: 'technology', tags: ['平板', '设备', '触屏'] },
      { id: 'headphones', name: '耳机', icon: 'Headphones', category: 'technology', tags: ['耳机', '音频', '设备'] },
      { id: 'cpu', name: '处理器', icon: 'Cpu', category: 'technology', tags: ['处理器', 'CPU', '芯片'] },
      { id: 'database', name: '数据库', icon: 'Database', category: 'technology', tags: ['数据库', '存储', '数据'] },
      { id: 'cloud', name: '云存储', icon: 'Cloud', category: 'technology', tags: ['云', '存储', '网络'] },
    ]
  },
  {
    id: 'nature',
    name: '自然环境',
    icon: 'TreePine',
    assets: [
      { id: 'sun', name: '太阳', icon: 'Sun', category: 'nature', tags: ['太阳', '天气', '自然'] },
      { id: 'moon', name: '月亮', icon: 'Moon', category: 'nature', tags: ['月亮', '夜晚', '自然'] },
      { id: 'cloud-rain', name: '下雨', icon: 'CloudRain', category: 'nature', tags: ['雨', '天气', '自然'] },
      { id: 'snowflake', name: '雪花', icon: 'Snowflake', category: 'nature', tags: ['雪花', '冬天', '自然'] },
      { id: 'tree', name: '树木', icon: 'TreePine', category: 'nature', tags: ['树', '植物', '自然'] },
      { id: 'flower', name: '花朵', icon: 'Flower', category: 'nature', tags: ['花', '植物', '自然'] },
      { id: 'leaf', name: '叶子', icon: 'Leaf', category: 'nature', tags: ['叶子', '植物', '自然'] },
      { id: 'mountain', name: '山峰', icon: 'Mountain', category: 'nature', tags: ['山', '自然', '风景'] },
    ]
  },
  {
    id: 'transport',
    name: '交通出行',
    icon: 'Car',
    assets: [
      { id: 'car', name: '汽车', icon: 'Car', category: 'transport', tags: ['汽车', '交通', '出行'] },
      { id: 'bike', name: '自行车', icon: 'Bike', category: 'transport', tags: ['自行车', '交通', '出行'] },
      { id: 'plane', name: '飞机', icon: 'Plane', category: 'transport', tags: ['飞机', '航空', '出行'] },
      { id: 'train', name: '火车', icon: 'Train', category: 'transport', tags: ['火车', '铁路', '出行'] },
      { id: 'bus', name: '公交车', icon: 'Bus', category: 'transport', tags: ['公交', '巴士', '出行'] },
      { id: 'ship', name: '轮船', icon: 'Ship', category: 'transport', tags: ['轮船', '航海', '出行'] },
      { id: 'fuel', name: '加油站', icon: 'Fuel', category: 'transport', tags: ['加油', '燃料', '服务'] },
      { id: 'map-pin', name: '地点', icon: 'MapPin', category: 'transport', tags: ['地点', '位置', '导航'] },
    ]
  },
  {
    id: 'food',
    name: '美食餐饮',
    icon: 'Coffee',
    assets: [
      { id: 'coffee', name: '咖啡', icon: 'Coffee', category: 'food', tags: ['咖啡', '饮品', '美食'] },
      { id: 'wine', name: '红酒', icon: 'Wine', category: 'food', tags: ['红酒', '酒类', '饮品'] },
      { id: 'pizza', name: '披萨', icon: 'Pizza', category: 'food', tags: ['披萨', '食物', '美食'] },
      { id: 'cake', name: '蛋糕', icon: 'Cake', category: 'food', tags: ['蛋糕', '甜品', '美食'] },
      { id: 'ice-cream', name: '冰淇淋', icon: 'IceCream', category: 'food', tags: ['冰淇淋', '甜品', '美食'] },
      { id: 'utensils', name: '餐具', icon: 'Utensils', category: 'food', tags: ['餐具', '用餐', '工具'] },
      { id: 'chef-hat', name: '厨师帽', icon: 'ChefHat', category: 'food', tags: ['厨师', '烹饪', '餐饮'] },
      { id: 'apple', name: '苹果', icon: 'Apple', category: 'food', tags: ['苹果', '水果', '健康'] },
    ]
  },
  {
    id: 'education',
    name: '教育学习',
    icon: 'GraduationCap',
    assets: [
      { id: 'book', name: '书本', icon: 'Book', category: 'education', tags: ['书', '阅读', '学习'] },
      { id: 'graduation-cap', name: '学士帽', icon: 'GraduationCap', category: 'education', tags: ['毕业', '学位', '教育'] },
      { id: 'pencil', name: '铅笔', icon: 'Pencil', category: 'education', tags: ['铅笔', '写作', '学习'] },
      { id: 'calculator', name: '计算器', icon: 'Calculator', category: 'education', tags: ['计算器', '数学', '工具'] },
      { id: 'microscope', name: '显微镜', icon: 'Microscope', category: 'education', tags: ['显微镜', '科学', '研究'] },
      { id: 'flask', name: '烧瓶', icon: 'FlaskConical', category: 'education', tags: ['烧瓶', '化学', '实验'] },
      { id: 'globe', name: '地球仪', icon: 'Globe', category: 'education', tags: ['地球', '地理', '世界'] },
      { id: 'library', name: '图书馆', icon: 'Library', category: 'education', tags: ['图书馆', '学习', '知识'] },
    ]
  },
  {
    id: 'hand-drawn',
    name: '手绘风格',
    icon: 'PenTool',
    assets: [
      { id: 'hand-arrow', name: '手绘箭头', icon: 'ArrowRight', category: 'hand-drawn', tags: ['手绘', '箭头', '指向', 'excalidraw'] },
      { id: 'hand-circle', name: '手绘圆圈', icon: 'Circle', category: 'hand-drawn', tags: ['手绘', '圆圈', '标记', 'excalidraw'] },
      { id: 'hand-rect', name: '手绘方框', icon: 'Square', category: 'hand-drawn', tags: ['手绘', '方框', '框选', 'excalidraw'] },
      { id: 'hand-line', name: '手绘线条', icon: 'Minus', category: 'hand-drawn', tags: ['手绘', '线条', '连接', 'excalidraw'] },
      { id: 'hand-star', name: '手绘星星', icon: 'Star', category: 'hand-drawn', tags: ['手绘', '星星', '重点', 'excalidraw'] },
      { id: 'hand-cloud', name: '手绘云朵', icon: 'Cloud', category: 'hand-drawn', tags: ['手绘', '云朵', '思考', 'excalidraw'] },
      { id: 'hand-speech', name: '手绘对话框', icon: 'MessageCircle', category: 'hand-drawn', tags: ['手绘', '对话', '气泡', 'excalidraw'] },
      { id: 'hand-highlight', name: '手绘高亮', icon: 'Highlighter', category: 'hand-drawn', tags: ['手绘', '高亮', '标记', 'excalidraw'] },
    ]
  }
];

// 获取所有素材
export const getAllAssets = (): AssetItem[] => {
  return standardAssets.flatMap(category => category.assets);
};

// 根据分类获取素材
export const getAssetsByCategory = (categoryId: string): AssetItem[] => {
  const category = standardAssets.find(cat => cat.id === categoryId);
  return category ? category.assets : [];
};

// 搜索素材
export const searchAssets = (query: string): AssetItem[] => {
  const lowercaseQuery = query.toLowerCase();
  return getAllAssets().filter(asset => 
    asset.name.toLowerCase().includes(lowercaseQuery) ||
    asset.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};