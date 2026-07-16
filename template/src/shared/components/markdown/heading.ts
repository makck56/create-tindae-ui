/**
 * Markdown 标题工具：slug 生成 + 去重。
 *
 * 用于「文档大纲 + 锚点跳转」：
 *   - MarkdownViewer 渲染时给每个 <hN> 注入 id（由 createSlugger 保证唯一）；
 *   - 大纲项的 slug 取自渲染后 DOM 的真实 id，点击 getElementById(slug) 一定能命中。
 */

/** 标题项：大纲渲染与锚点跳转共用。 */
export interface Heading {
  /** 标题层级 1-6 */
  level: number;
  /** 显示文本（已剥离 inline 标记） */
  text: string;
  /** 对应 <hN id="slug">，点击跳转目标 */
  slug: string;
}

/**
 * slug 化：转小写 → 去标点（保留字母 / 数字 / 下划线 / 中文 / 连字符 / 空格）→ 空格转 - → 合并连字符。
 * 中文标题保留原字（id 允许中文，getElementById 也支持），仅清掉顿号 / 冒号等标点。
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w一-龥- ]/g, '') // \w=[a-zA-Z0-9_]；额外保留中文与连字符、空格
    .replace(/\s+/g, '-') // 空格 → -
    .replace(/-+/g, '-') // 合并多个 -
    .replace(/^-|-$/g, ''); // 去首尾 -
}

/**
 * 创建「带去重」的 slug 生成器：同名标题第二次出现起追加 -1 / -2 ... 后缀，保证 id 唯一。
 * 每次渲染（source 变化）应新建一个 slugger，使计数从 0 开始、与标题出现顺序一致。
 */
export function createSlugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text: string): string => {
    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}
