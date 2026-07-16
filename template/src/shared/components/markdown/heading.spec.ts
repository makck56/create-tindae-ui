import { describe, it, expect } from 'vitest';
import { slugify, createSlugger } from './heading';

describe('slugify', () => {
  it('英文：空格转连字符 + 转小写', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('中文标题：保留中文、去掉顿号 / 冒号等标点、空格转连字符', () => {
    expect(slugify('六、必须先理解的 6 个核心机制')).toBe('六必须先理解的-6-个核心机制');
  });

  it('去除标点（逗号 / 冒号 / 感叹号）', () => {
    expect(slugify('A,B:C!')).toBe('abc');
  });

  it('合并多个连字符 / 去首尾连字符', () => {
    expect(slugify('  --a   b--  ')).toBe('a-b');
  });

  it('空串 → 空串', () => {
    expect(slugify('')).toBe('');
  });
});

describe('createSlugger（去重）', () => {
  it('首次出现不加后缀', () => {
    const slug = createSlugger();
    expect(slug('概述')).toBe('概述');
  });

  it('重复标题追加 -1 / -2', () => {
    const slug = createSlugger();
    expect(slug('安装')).toBe('安装');
    expect(slug('安装')).toBe('安装-1');
    expect(slug('安装')).toBe('安装-2');
  });

  it('不同标题互不影响', () => {
    const slug = createSlugger();
    expect(slug('A')).toBe('a');
    expect(slug('B')).toBe('b');
    expect(slug('A')).toBe('a-1');
  });

  it('每次新建 slugger 计数从 0 开始', () => {
    const a = createSlugger();
    a('X');
    const b = createSlugger();
    expect(b('X')).toBe('x'); // 新实例不继承 a 的计数
  });
});
