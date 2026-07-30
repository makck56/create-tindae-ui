import { describe, it, expect } from 'vitest';
import { isExternalLink, resolveDocPath, resolveInternalDoc } from './link';

describe('isExternalLink', () => {
  it('识别 http / https 为外部链接', () => {
    expect(isExternalLink('http://a.com')).toBe(true);
    expect(isExternalLink('https://a.com/b')).toBe(true);
  });

  it('识别 mailto / tel 为外部链接', () => {
    expect(isExternalLink('mailto:a@b.com')).toBe(true);
    expect(isExternalLink('tel:123456')).toBe(true);
  });

  it('相对路径与纯锚点视为非外部', () => {
    expect(isExternalLink('docs/a.md')).toBe(false);
    expect(isExternalLink('#section')).toBe(false);
  });
});

describe('resolveDocPath', () => {
  it('根目录文档：相对链接拼到根下', () => {
    expect(resolveDocPath('docs/ARCHITECTURE.md', '/README.md')).toBe('/docs/ARCHITECTURE.md');
    expect(resolveDocPath('theme.md', '/README.md')).toBe('/theme.md');
  });

  it('子目录文档：以同级目录为基准', () => {
    expect(resolveDocPath('MIGRATION.md', '/docs/a.md')).toBe('/docs/MIGRATION.md');
  });

  it('支持 .. 回到上级目录', () => {
    expect(resolveDocPath('../theme.md', '/docs/a.md')).toBe('/theme.md');
    expect(resolveDocPath('../../theme.md', '/docs/sub/a.md')).toBe('/theme.md');
  });

  it('剥离锚点与查询串', () => {
    expect(resolveDocPath('docs/a.md#section', '/README.md')).toBe('/docs/a.md');
    expect(resolveDocPath('docs/a.md?v=1', '/README.md')).toBe('/docs/a.md');
  });
});

describe('resolveInternalDoc', () => {
  const docPaths = new Set<string>(['/README.md', '/docs/a.md', '/theme.md']);

  it('命中文档集合 → 返回绝对路径', () => {
    expect(resolveInternalDoc('docs/a.md', '/README.md', docPaths)).toBe('/docs/a.md');
    expect(resolveInternalDoc('theme.md', '/README.md', docPaths)).toBe('/theme.md');
  });

  it('外部链接 / 纯锚点 / 空值 → null', () => {
    expect(resolveInternalDoc('https://a.com', '/README.md', docPaths)).toBeNull();
    expect(resolveInternalDoc('#section', '/README.md', docPaths)).toBeNull();
    expect(resolveInternalDoc('', '/README.md', docPaths)).toBeNull();
  });

  it('解析后不在集合内 → null', () => {
    expect(resolveInternalDoc('missing.md', '/README.md', docPaths)).toBeNull();
  });
});
