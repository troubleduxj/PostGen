/**
 * 模板缓存系统测试
 * 验证缓存功能是否正常工作
 */

import { templateRenderCache } from '../services/templateRenderCache';

// 简单的测试函数
export function testTemplateCache() {
  console.log('开始测试模板缓存系统...');

  // 测试预览图缓存
  const templateId = 'test-template-1';
  const previewData = 'data:image/png;base64,test-preview-data';
  
  // 设置预览图缓存
  templateRenderCache.setPreview(templateId, previewData);
  console.log('✓ 预览图缓存设置成功');

  // 获取预览图缓存
  const cachedPreview = templateRenderCache.getPreview(templateId);
  if (cachedPreview === previewData) {
    console.log('✓ 预览图缓存获取成功');
  } else {
    console.error('✗ 预览图缓存获取失败');
  }

  // 测试缩略图缓存
  const thumbnailData = 'data:image/jpeg;base64,test-thumbnail-data';
  templateRenderCache.setThumbnail(templateId, thumbnailData);
  console.log('✓ 缩略图缓存设置成功');

  const cachedThumbnail = templateRenderCache.getThumbnail(templateId);
  if (cachedThumbnail === thumbnailData) {
    console.log('✓ 缩略图缓存获取成功');
  } else {
    console.error('✗ 缩略图缓存获取失败');
  }

  // 测试渲染结果缓存
  const renderKey = templateRenderCache.generateRenderKey(templateId, { mode: 'fast_preview' });
  const renderResult = { dataUrl: 'test-render-result', width: 1080, height: 1080 };
  
  templateRenderCache.setRenderResult(renderKey, renderResult);
  console.log('✓ 渲染结果缓存设置成功');

  const cachedRenderResult = templateRenderCache.getRenderResult(renderKey);
  if (cachedRenderResult && cachedRenderResult.dataUrl === renderResult.dataUrl) {
    console.log('✓ 渲染结果缓存获取成功');
  } else {
    console.error('✗ 渲染结果缓存获取失败');
  }

  // 测试缓存统计
  const stats = templateRenderCache.getStats();
  console.log('缓存统计信息:', {
    预览图条目: stats.preview.entryCount,
    缩略图条目: stats.thumbnail.entryCount,
    渲染结果条目: stats.render.entryCount,
    总大小: `${(stats.total.totalSize / 1024).toFixed(2)} KB`
  });

  // 测试缓存失效
  templateRenderCache.invalidateTemplate(templateId);
  console.log('✓ 模板缓存失效成功');

  // 验证缓存已被清理
  const clearedPreview = templateRenderCache.getPreview(templateId);
  const clearedThumbnail = templateRenderCache.getThumbnail(templateId);
  
  if (!clearedPreview && !clearedThumbnail) {
    console.log('✓ 缓存清理验证成功');
  } else {
    console.error('✗ 缓存清理验证失败');
  }

  console.log('模板缓存系统测试完成！');
}

// 如果在浏览器环境中，添加到全局对象以便调试
if (typeof window !== 'undefined') {
  (window as any).testTemplateCache = testTemplateCache;
}