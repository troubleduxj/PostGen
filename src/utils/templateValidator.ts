/**
 * 模板验证器
 * 提供模板数据完整性检查、版本兼容性迁移和错误处理功能
 */

import {
  DesignTemplate,
  TemplateValidationResult,
  TemplateMigration,
  TemplateCategory,
  TemplateStyle,
  TemplateObject,
  TemplateCanvas,
  TemplateMetadata,
  TemplatePreview,
  TemplateCustomizable
} from '../types/template';

export class TemplateValidator {
  private static migrations: TemplateMigration[] = [];

  /**
   * 验证模板数据完整性
   */
  static validateTemplate(template: any): TemplateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 验证基本字段
      this.validateBasicFields(template, errors);
      
      // 验证画布配置
      this.validateCanvas(template.canvas, errors);
      
      // 验证模板对象
      this.validateObjects(template.objects, errors, warnings);
      
      // 验证元数据
      this.validateMetadata(template.metadata, errors, warnings);
      
      // 验证预览信息
      this.validatePreview(template.preview, errors, warnings);
      
      // 验证自定义属性
      this.validateCustomizable(template.customizable, errors);

    } catch (error) {
      errors.push(`验证过程中发生错误: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * 验证基本字段
   */
  private static validateBasicFields(template: any, errors: string[]): void {
    if (!template) {
      errors.push('模板数据不能为空');
      return;
    }

    if (!template.id || typeof template.id !== 'string') {
      errors.push('模板ID不能为空且必须是字符串');
    }

    if (!template.name || typeof template.name !== 'string') {
      errors.push('模板名称不能为空且必须是字符串');
    }

    if (!template.description || typeof template.description !== 'string') {
      errors.push('模板描述不能为空且必须是字符串');
    }

    if (!Object.values(TemplateCategory).includes(template.category)) {
      errors.push(`无效的模板分类: ${template.category}`);
    }

    if (template.subcategory && typeof template.subcategory !== 'string') {
      errors.push('子分类必须是字符串');
    }
  }

  /**
   * 验证画布配置
   */
  private static validateCanvas(canvas: any, errors: string[]): void {
    if (!canvas) {
      errors.push('画布配置不能为空');
      return;
    }

    if (!Number.isInteger(canvas.width) || canvas.width <= 0) {
      errors.push('画布宽度必须是正整数');
    }

    if (!Number.isInteger(canvas.height) || canvas.height <= 0) {
      errors.push('画布高度必须是正整数');
    }

    if (!canvas.backgroundColor || typeof canvas.backgroundColor !== 'string') {
      errors.push('画布背景色不能为空且必须是字符串');
    }

    // 验证颜色格式
    if (canvas.backgroundColor && !this.isValidColor(canvas.backgroundColor)) {
      errors.push(`无效的背景色格式: ${canvas.backgroundColor}`);
    }

    if (canvas.backgroundImage && typeof canvas.backgroundImage !== 'string') {
      errors.push('背景图片必须是字符串URL');
    }
  }

  /**
   * 验证模板对象数组
   */
  private static validateObjects(objects: any, errors: string[], warnings: string[]): void {
    if (!Array.isArray(objects)) {
      errors.push('模板对象必须是数组');
      return;
    }

    if (objects.length === 0) {
      warnings.push('模板没有包含任何对象');
    }

    objects.forEach((obj, index) => {
      this.validateObject(obj, index, errors, warnings);
    });
  }

  /**
   * 验证单个模板对象
   */
  private static validateObject(obj: any, index: number, errors: string[], warnings: string[]): void {
    const prefix = `对象 ${index}`;

    if (!obj.id || typeof obj.id !== 'string') {
      errors.push(`${prefix}: ID不能为空且必须是字符串`);
    }

    const validTypes = ['text', 'image', 'shape', 'group'];
    if (!validTypes.includes(obj.type)) {
      errors.push(`${prefix}: 无效的对象类型 ${obj.type}`);
    }

    if (!obj.fabricObject) {
      errors.push(`${prefix}: 缺少Fabric.js对象数据`);
    }

    if (!obj.editable || typeof obj.editable !== 'object') {
      errors.push(`${prefix}: 缺少可编辑属性配置`);
    } else {
      this.validateEditableProperties(obj.editable, prefix, errors);
    }

    if (obj.placeholder) {
      this.validatePlaceholder(obj.placeholder, prefix, errors, warnings);
    }
  }

  /**
   * 验证可编辑属性
   */
  private static validateEditableProperties(editable: any, prefix: string, errors: string[]): void {
    const requiredProps = ['content', 'style', 'position', 'size'];
    
    requiredProps.forEach(prop => {
      if (typeof editable[prop] !== 'boolean') {
        errors.push(`${prefix}: 可编辑属性 ${prop} 必须是布尔值`);
      }
    });
  }

  /**
   * 验证占位符
   */
  private static validatePlaceholder(placeholder: any, prefix: string, errors: string[], warnings: string[]): void {
    const validPlaceholderTypes = ['text', 'image', 'logo', 'icon'];
    
    if (!validPlaceholderTypes.includes(placeholder.type)) {
      errors.push(`${prefix}: 无效的占位符类型 ${placeholder.type}`);
    }

    if (!placeholder.defaultContent || typeof placeholder.defaultContent !== 'string') {
      errors.push(`${prefix}: 占位符默认内容不能为空且必须是字符串`);
    }

    if (!Array.isArray(placeholder.suggestions)) {
      warnings.push(`${prefix}: 占位符建议应该是字符串数组`);
    }
  }

  /**
   * 验证元数据
   */
  private static validateMetadata(metadata: any, errors: string[], warnings: string[]): void {
    if (!metadata) {
      errors.push('模板元数据不能为空');
      return;
    }

    if (!Array.isArray(metadata.tags)) {
      errors.push('标签必须是数组');
    }

    if (!Object.values(TemplateStyle).includes(metadata.style)) {
      errors.push(`无效的模板风格: ${metadata.style}`);
    }

    if (!Array.isArray(metadata.industry)) {
      errors.push('行业分类必须是数组');
    }

    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(metadata.difficulty)) {
      errors.push(`无效的难度级别: ${metadata.difficulty}`);
    }

    if (!Array.isArray(metadata.colors)) {
      errors.push('颜色列表必须是数组');
    } else {
      metadata.colors.forEach((color: any, index: number) => {
        if (!this.isValidColor(color)) {
          errors.push(`无效的颜色格式 (索引 ${index}): ${color}`);
        }
      });
    }

    if (!Array.isArray(metadata.fonts)) {
      errors.push('字体列表必须是数组');
    }

    if (!metadata.author || typeof metadata.author !== 'string') {
      warnings.push('建议提供作者信息');
    }

    if (!metadata.version || typeof metadata.version !== 'string') {
      warnings.push('建议提供版本信息');
    }

    // 验证日期格式
    if (metadata.createdAt && !this.isValidDate(metadata.createdAt)) {
      errors.push(`无效的创建日期格式: ${metadata.createdAt}`);
    }

    if (metadata.updatedAt && !this.isValidDate(metadata.updatedAt)) {
      errors.push(`无效的更新日期格式: ${metadata.updatedAt}`);
    }
  }

  /**
   * 验证预览信息
   */
  private static validatePreview(preview: any, errors: string[], warnings: string[]): void {
    if (!preview) {
      errors.push('预览信息不能为空');
      return;
    }

    if (!preview.thumbnail || typeof preview.thumbnail !== 'string') {
      errors.push('缩略图URL不能为空且必须是字符串');
    }

    if (!preview.fullPreview || typeof preview.fullPreview !== 'string') {
      errors.push('完整预览图URL不能为空且必须是字符串');
    }

    if (!preview.description || typeof preview.description !== 'string') {
      warnings.push('建议提供预览描述');
    }
  }

  /**
   * 验证自定义属性
   */
  private static validateCustomizable(customizable: any, errors: string[]): void {
    if (!customizable) {
      errors.push('自定义属性配置不能为空');
      return;
    }

    const requiredProps = ['colors', 'fonts', 'images', 'text'];
    
    requiredProps.forEach(prop => {
      if (typeof customizable[prop] !== 'boolean') {
        errors.push(`自定义属性 ${prop} 必须是布尔值`);
      }
    });
  }

  /**
   * 处理版本兼容性迁移
   */
  static migrateTemplate(template: any, fromVersion?: string): DesignTemplate {
    if (!fromVersion) {
      // 尝试从模板数据中获取版本信息
      fromVersion = template.metadata?.version || template.version || '1.0';
    }

    let migratedTemplate = template;

    // 按版本顺序应用迁移
    for (const migration of this.migrations) {
      if (this.shouldApplyMigration(fromVersion, migration.fromVersion)) {
        try {
          migratedTemplate = migration.migrate(migratedTemplate);
          console.log(`已应用迁移: ${migration.fromVersion} -> ${migration.toVersion}`);
        } catch (error) {
          console.error(`迁移失败 (${migration.fromVersion} -> ${migration.toVersion}):`, error);
          throw new Error(`模板迁移失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    return migratedTemplate;
  }

  /**
   * 注册版本迁移
   */
  static registerMigration(migration: TemplateMigration): void {
    this.migrations.push(migration);
    // 按版本排序
    this.migrations.sort((a, b) => this.compareVersions(a.fromVersion, b.fromVersion));
  }

  /**
   * 创建模板格式错误处理机制
   */
  static handleValidationError(result: TemplateValidationResult, templateId?: string): void {
    if (result.isValid) return;

    const errorMessage = `模板验证失败${templateId ? ` (ID: ${templateId})` : ''}:\n${result.errors.join('\n')}`;
    
    console.error(errorMessage);
    
    if (result.warnings && result.warnings.length > 0) {
      console.warn(`模板验证警告:\n${result.warnings.join('\n')}`);
    }

    throw new Error(errorMessage);
  }

  /**
   * 验证颜色格式
   */
  private static isValidColor(color: string): boolean {
    // 支持 hex, rgb, rgba, hsl, hsla 和 CSS 颜色名称
    const colorRegex = /^(#([0-9A-Fa-f]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)|hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)|[a-zA-Z]+)$/;
    return colorRegex.test(color);
  }

  /**
   * 验证日期格式 (ISO 8601)
   */
  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString === date.toISOString();
  }

  /**
   * 判断是否应该应用迁移
   */
  private static shouldApplyMigration(currentVersion: string, migrationFromVersion: string): boolean {
    return this.compareVersions(currentVersion, migrationFromVersion) <= 0;
  }

  /**
   * 比较版本号
   */
  private static compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }
}

// 预定义的版本迁移
export const templateMigrations = {
  /**
   * 从 v1.0 迁移到 v2.0
   */
  migrateFromV1ToV2: {
    fromVersion: '1.0',
    toVersion: '2.0',
    migrate: (template: any): DesignTemplate => {
      // 添加新的字段和结构
      return {
        ...template,
        customizable: template.customizable || {
          colors: true,
          fonts: true,
          images: true,
          text: true
        },
        metadata: {
          ...template.metadata,
          version: '2.0',
          updatedAt: new Date().toISOString()
        }
      };
    }
  } as TemplateMigration,

  /**
   * 从 v2.0 迁移到 v2.1
   */
  migrateFromV2ToV2_1: {
    fromVersion: '2.0',
    toVersion: '2.1',
    migrate: (template: any): DesignTemplate => {
      // 添加占位符支持
      const migratedObjects = template.objects.map((obj: any) => ({
        ...obj,
        placeholder: obj.placeholder || (obj.type === 'text' ? {
          type: 'text',
          defaultContent: obj.fabricObject?.text || '文本占位符',
          suggestions: []
        } : undefined)
      }));

      return {
        ...template,
        objects: migratedObjects,
        metadata: {
          ...template.metadata,
          version: '2.1',
          updatedAt: new Date().toISOString()
        }
      };
    }
  } as TemplateMigration
};

// 注册预定义迁移
TemplateValidator.registerMigration(templateMigrations.migrateFromV1ToV2);
TemplateValidator.registerMigration(templateMigrations.migrateFromV2ToV2_1);