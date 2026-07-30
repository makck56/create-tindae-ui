/**
 * Markdown 内部文档链接解析工具。
 *
 * 背景：MarkdownViewer 渲染文档时，正文里的相对链接（例如 README「更多文档」中的
 *   `[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)`）会被 markdown-it 渲染成原生 <a>，
 *   点击即触发浏览器整页导航，导致跳出 SPA（离开当前系统）。
 *
 * 这里负责把「相对链接」解析为系统内文档的绝对路径，供 MarkdownViewer：
 *   1. 命中系统内文档 → 打标记，由 click 拦截，改走 SPA 内切换文档；
 *   2. 外部链接 / 纯锚点 / 失效链接 → 保持原生 <a> 行为不动。
 *
 * 全部为纯函数，便于单测覆盖（见 link.spec.ts）。
 */

/** 匹配带协议前缀的链接：http(s) / mailto / tel / ftp / file / data。 */
const EXTERNAL_LINK_PATTERN = /^(https?:|mailto:|tel:|ftp:|file:|data:)/i;

/** 判定是否为外部链接（带协议），这类链接不应在系统内拦截。 */
export function isExternalLink(href: string): boolean {
  return EXTERNAL_LINK_PATTERN.test(href);
}

/**
 * 基于当前文档路径，把相对链接解析为以 / 开头的「仓库绝对路径」。
 *
 * 规则：
 *   - 先剥离查询串与锚点（`#section` / `?query` 不参与文档定位）；
 *   - 以当前文档所在目录为基准，逐段处理 `.`（当前目录）与 `..`（上级目录）。
 *
 * 示例：
 *   resolveDocPath('docs/ARCHITECTURE.md', '/README.md')  → '/docs/ARCHITECTURE.md'
 *   resolveDocPath('theme.md',            '/README.md')    → '/theme.md'
 *   resolveDocPath('../theme.md',         '/docs/a.md')    → '/theme.md'
 *   resolveDocPath('MIGRATION.md',        '/docs/a.md')    → '/docs/MIGRATION.md'
 */
export function resolveDocPath(href: string, currentDocPath: string): string {
  // 仅取 path 部分，丢弃锚点 / 查询串
  const linkPath = href.split(/[#?]/)[0];
  // 当前文档所在目录：'/docs/a.md' → '/docs'；'/README.md'（根目录）→ ''
  const lastSlash = currentDocPath.lastIndexOf('/');
  const baseDir = lastSlash > 0 ? currentDocPath.slice(0, lastSlash) : '';

  const segments = `${baseDir}/${linkPath}`.split('/');
  const stack: string[] = [];
  for (const segment of segments) {
    if (segment === '' || segment === '.') {
      // 空段（连续斜杠）或当前目录标记，直接跳过
      continue;
    }
    if (segment === '..') {
      // 回到上级目录：弹出栈顶
      stack.pop();
      continue;
    }
    stack.push(segment);
  }
  return `/${stack.join('/')}`;
}

/**
 * 判定链接是否指向系统内已有文档：是则返回其绝对路径，否则返回 null。
 *
 * - 外部链接 / 纯锚点 / 空值 → null（保持原生行为）；
 * - 解析后不在文档集合内 → null（可能是失效链接或静态资源，仍走原生）；
 * - 命中文档集合 → 返回解析后的绝对路径。
 */
export function resolveInternalDoc(
  href: string,
  currentDocPath: string,
  docPaths: Set<string>,
): string | null {
  if (!href || isExternalLink(href) || href.startsWith('#')) {
    return null;
  }
  const resolved = resolveDocPath(href, currentDocPath);
  return docPaths.has(resolved) ? resolved : null;
}
