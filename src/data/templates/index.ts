/**
 * 设计模板数据主入口
 * 汇总所有分类的模板数据
 */

import { DesignTemplate } from '@/types/template';
import { socialMediaTemplates } from './socialMedia';
import { printTemplates } from './print';
import { presentationTemplates } from './presentation';

// 汇总所有模板
export const allDesignTemplates: DesignTemplate[] = [
  ...socialMediaTemplates,
  ...printTemplates,
  ...presentationTemplates
];

// 按分类导出
export {
  socialMediaTemplates,
  printTemplates,
  presentationTemplates
};

// 按子分类导出
export * from './socialMedia';
export * from './print';
export * from './presentation';

// 模板统计信息
export const templateStats = {
  total: allDesignTemplates.length,
  byCategory: {
    social_media: socialMediaTemplates.length,
    print: printTemplates.length,
    presentation: presentationTemplates.length
  },
  byStyle: allDesignTemplates.reduce((acc, template) => {
    acc[template.metadata.style] = (acc[template.metadata.style] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  byDifficulty: allDesignTemplates.reduce((acc, template) => {
    acc[template.metadata.difficulty] = (acc[template.metadata.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
};

// 获取模板的辅助函数
export const getTemplateById = (id: string): DesignTemplate | undefined => {
  return allDesignTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): DesignTemplate[] => {
  return allDesignTemplates.filter(template => template.category === category);
};

export const getTemplatesBySubcategory = (subcategory: string): DesignTemplate[] => {
  return allDesignTemplates.filter(template => template.subcategory === subcategory);
};

export const getTemplatesByStyle = (style: string): DesignTemplate[] => {
  return allDesignTemplates.filter(template => template.metadata.style === style);
};

export const getTemplatesByIndustry = (industry: string): DesignTemplate[] => {
  return allDesignTemplates.filter(template => 
    template.metadata.industry.includes(industry)
  );
};

export const getTemplatesByDifficulty = (difficulty: string): DesignTemplate[] => {
  return allDesignTemplates.filter(template => template.metadata.difficulty === difficulty);
};

export const searchTemplates = (query: string): DesignTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return allDesignTemplates.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    template.metadata.industry.some(industry => industry.toLowerCase().includes(lowercaseQuery))
  );
};