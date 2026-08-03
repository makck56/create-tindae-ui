<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/github.css';
import { createSlugger, type Heading } from './heading';
import { resolveInternalDoc } from './link';

/**
 * 通用 Markdown 渲染器（Typora / GitHub 经典浅色阅读风）。
 *
 * - 输入 Markdown 源码 → markdown-it 渲染为 HTML，通过 v-html 注入；
 * - 视觉为固定浅色文档风（白底深字、标题底边框、行内代码浅灰底、代码块 #f6f8fa、表格斑马纹），
 *   不跟随主题（亮暗 / 主色预设）——Typora 的克制美感来自固定排版；
 * - 「大纲 + 锚点跳转」：渲染时给每个 <hN> 注入唯一 id，渲染后从 DOM 提取标题 emit('headings')。
 *
 * 安全：html:false 禁止内联 HTML（转义后输出）；v-html 仅用于渲染可信文档。
 */
defineOptions({ name: 'MarkdownViewer' });

const props = defineProps<{
  /** Markdown 源码 */
  source: string;
  /** 系统内可用的文档绝对路径集合（以 / 开头），用于识别指向内部文档的链接 */
  docPaths?: Set<string>;
  /** 当前文档的绝对路径（以 / 开头），作为解析相对链接的基准目录 */
  currentDocPath?: string;
}>();

const emit = defineEmits<{
  /** 渲染完成后，按 DOM 顺序输出标题列表（供大纲使用，slug 即 <hN> 真实 id） */
  headings: [Heading[]];
  /** 点击指向内部文档的链接时触发，payload 为目标文档的绝对路径（由父组件在 SPA 内切换） */
  navigate: [string];
}>();

const rootRef = ref<HTMLElement>();

// 单例实例：html:false（禁内联 HTML，安全默认）；linkify：自动把裸链接转为 <a>；
// highlight：用 highlight.js 按语言做语法高亮（GitHub 浅色主题，与 Typora 风一致）；
//   不认识的语言返回 '' → markdown-it 用默认转义（不高亮但不报错）。
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
  highlight(code, lang) {
    const language = lang?.toLowerCase();
    // vue 不在 common 预置包，借用 xml 高亮（SFC 主体是 xml/html）；
    // 刻意不 import 'highlight.js/lib/languages/vue'：该子路径在 highlight.js v11 的 exports
    // + pnpm 环境下会解析失败（"Does the file exist?"），故用 common 已含的 xml 替代。
    const target = language === 'vue' ? 'xml' : language;
    if (target && hljs.getLanguage(target)) {
      try {
        return hljs.highlight(code, { language: target }).value;
      } catch {
        // 高亮失败回退默认转义
      }
    }
    return '';
  },
});

// 渲染规则：在模块级一次性配置，依赖（slugger / docPaths / currentDocPath）
// 通过 md.render(src, env) 的 env 传入——避免在 computed 内修改 md 状态（side effect）。
md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const slugger = env?.slugger;
  const token = tokens[idx];
  if (slugger && !token.attrGet('id')) {
    token.attrSet('id', slugger(tokens[idx + 1]?.content ?? ''));
  }
  return self.renderToken(tokens, idx, options);
};

// 内部文档链接：把指向系统内文档的相对链接解析为绝对路径并打标记，
// 由容器 click（handleClick）拦截改走 SPA 切换，避免原生整页导航跳出系统。
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const { docPaths, currentDocPath } = env ?? {};
  if (docPaths && currentDocPath) {
    const token = tokens[idx];
    const href = token.attrGet('href') ?? '';
    const resolved = resolveInternalDoc(href, currentDocPath, docPaths);
    if (resolved) {
      token.attrSet('data-doc-link', 'true');
      token.attrSet('data-doc-path', resolved);
    }
  }
  return self.renderToken(tokens, idx, options);
};

/**
 * 渲染为 HTML：纯函数——读 source / docPaths / currentDocPath，组装 env 后交给 md.render。
 * rules 从 env 取 slugger / 文档路径（见上方模块级配置），不在 computed 内修改 md。
 */
const html = computed(() => {
  const env = {
    slugger: createSlugger(),
    docPaths: props.docPaths,
    currentDocPath: props.currentDocPath,
  };
  return md.render(props.source ?? '', env);
});

/**
 * 拦截正文里「内部文档链接」的点击：阻止浏览器原生整页导航，改 emit('navigate')
 * 让父组件在 SPA 内切换文档，避免点击相对链接时跳出当前系统。
 * 修饰键（Ctrl/Cmd/Shift/Alt）与非左键放行，交给浏览器原生新标签打开，符合用户预期。
 */
function handleClick(event: MouseEvent): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  const target = event.target as HTMLElement | null;
  const anchor = target?.closest<HTMLAnchorElement>('a');
  if (!anchor || anchor.dataset.docLink !== 'true') {
    return;
  }
  const docPath = anchor.getAttribute('data-doc-path');
  if (docPath) {
    event.preventDefault();
    emit('navigate', docPath);
  }
}

/** 从真实 DOM 提取标题并 emit（slug 取自 <hN id>，与大纲同源）。 */
async function emitHeadings(): Promise<void> {
  await nextTick();
  const root = rootRef.value;
  if (!root) return;
  const els = root.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6');
  emit(
    'headings',
    Array.from(els).map((el) => ({
      level: Number(el.tagName[1]),
      text: el.textContent ?? '',
      slug: el.id,
    })),
  );
}

onMounted(emitHeadings);
watch(html, emitHeadings);
</script>

<template>
  <div ref="rootRef" class="markdown-body" @click="handleClick" v-html="html" />
</template>

<!--
  非 scoped：v-html 注入的子元素不带 data 属性，scoped 选择器无法命中。
  用统一的 `.markdown-body` 前缀做命名隔离。
  配色为 Typora / GitHub 经典浅色文档风，固定不跟随主题。
-->
<style>
.markdown-body {
  color: #1f2328;
  background: #ffffff;
  padding: 40px 48px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  word-break: break-word;
}

/* 标题：深色 + 600 字重；h1/h2 带底边框（GitHub 标志性） */
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  color: #1f2328;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 16px;
  line-height: 1.25;
  scroll-margin-top: 64px; /* 锚点跳转留出顶栏高度 */
}
.markdown-body h1 {
  font-size: 2em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #d0d7de;
}
.markdown-body h2 {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #d8dee4;
}
.markdown-body h3 {
  font-size: 1.25em;
}
.markdown-body h4 {
  font-size: 1em;
}
.markdown-body h5 {
  font-size: 0.875em;
}
.markdown-body h6 {
  font-size: 0.85em;
  color: #57606a;
}

.markdown-body p {
  margin: 0 0 16px;
}

/* 链接：GitHub 蓝 */
.markdown-body a {
  color: #0969da;
  text-decoration: none;
}
.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body ul,
.markdown-body ol {
  margin: 0 0 16px;
  padding-left: 2em;
}
.markdown-body li {
  margin: 2px 0;
}
.markdown-body li::marker {
  color: #57606a;
}

/* 引用块：灰左边框 + 次级灰字 */
.markdown-body blockquote {
  margin: 0 0 16px;
  padding: 0 1em;
  color: #57606a;
  border-left: 0.25em solid #d0d7de;
}

/* 行内代码：Typora 经典 —— 浅粉底 + 暗红字（醒目，区别于正文） */
.markdown-body code {
  font-family:
    ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 85%;
  padding: 0.2em 0.4em;
  color: #c7254e;
  background: #f9f2f4;
  border-radius: 6px;
}

/* 代码块：#f6f8fa 浅灰底 + 边框（明显框出） */
.markdown-body pre {
  margin: 0 0 16px;
  padding: 16px;
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  overflow-x: auto;
  line-height: 1.45;
}
/* 代码块内的 code：撤销行内 code 的暗红/粉底，恢复正常深色字 */
.markdown-body pre code {
  padding: 0;
  color: #1f2328;
  background: transparent;
  border-radius: 0;
  font-size: 100%;
}

/* 表格：细边框 + 表头底色 + 斑马纹 */
.markdown-body table {
  border-collapse: collapse;
  margin: 0 0 16px;
  display: block;
  overflow-x: auto; /* 窄屏横向滚动 */
}
.markdown-body th,
.markdown-body td {
  border: 1px solid #d0d7de;
  padding: 6px 13px;
}
.markdown-body th {
  font-weight: 600;
  background: #f6f8fa;
}
.markdown-body tr:nth-child(2n) td {
  background: #f6f8fa;
}

/* 分割线 */
.markdown-body hr {
  height: 0.25em;
  margin: 24px 0;
  padding: 0;
  border: 0;
  background-color: #d0d7de;
}

.markdown-body img {
  max-width: 100%;
}

.markdown-body strong {
  font-weight: 600;
  color: #1f2328;
}
</style>
