<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue';
import MarkdownIt from 'markdown-it';
import { createSlugger, type Heading } from './heading';

/**
 * 通用 Markdown 渲染器（科技风，跟随主题系统）。
 *
 * - 输入 Markdown 源码 → markdown-it 渲染为 HTML，通过 v-html 注入；
 * - 科技风接入主题系统：背景/文字跟随亮暗模式、强调色（标题/链接/代码/网格/发光）跟随主色预设
 *   —— 顶栏切「亮/暗」或「蓝/绿/紫/橙/红」主色，文档页科技风即时联动；
 * - 赛博纹理：::before 主色网格 + ::after 顶部扫描发光线；
 * - 「大纲 + 锚点跳转」：渲染时给每个 <hN> 注入唯一 id，渲染后从 DOM 提取标题 emit('headings')。
 *
 * 安全：html:false 禁止内联 HTML（转义后输出）；v-html 仅用于渲染可信文档。
 */
defineOptions({ name: 'MarkdownViewer' });

const props = defineProps<{
  /** Markdown 源码 */
  source: string;
}>();

const emit = defineEmits<{
  /** 渲染完成后，按 DOM 顺序输出标题列表（供大纲使用，slug 即 <hN> 真实 id） */
  headings: [Heading[]];
}>();

const rootRef = ref<HTMLElement>();

// 单例实例：html:false（禁内联 HTML，安全默认）；linkify：自动把裸链接转为 <a>
const md = new MarkdownIt({ html: false, linkify: true, typographer: false });

/**
 * 渲染为 HTML：每次重算时新建 slugger，并覆写 heading_open 给每个 <hN> 注入「去重后的唯一 id」。
 */
const html = computed(() => {
  const slug = createSlugger();
  md.renderer.rules.heading_open = (tokens, idx, options, _env, self) => {
    const token = tokens[idx];
    if (!token.attrGet('id')) {
      token.attrSet('id', slug(tokens[idx + 1]?.content ?? ''));
    }
    return self.renderToken(tokens, idx, options);
  };
  return md.render(props.source ?? '');
});

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
  <div ref="rootRef" class="markdown-body" v-html="html" />
</template>

<!--
  非 scoped：v-html 注入的子元素不带 data 属性，scoped 选择器无法命中。
  用统一的 `.markdown-body` 前缀做命名隔离。
  科技风配色全部引用主题 CSS 变量（var(--color-primary) 等）+ color-mix 半透明主色，
  随亮暗模式与主色预设联动（color-mix 需 Chrome111+/Safari16.2+/Firefox113+，降级无害）。
-->
<style>
.markdown-body {
  position: relative;
  color: var(--text-body);
  /* 主色调底：容器色掺少量主色 —— 亮色=淡主色白，暗色=深主色灰，两端都带主色调 */
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--bg-container) 88%, var(--color-primary)),
    color-mix(in srgb, var(--bg-container) 95%, var(--color-primary))
  );
  padding: 36px 44px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 28%, transparent);
  box-shadow:
    0 0 40px color-mix(in srgb, var(--color-primary) 8%, transparent),
    inset 0 2px 0 color-mix(in srgb, var(--color-primary) 35%, transparent);
  font-size: 14px;
  line-height: 1.8;
  word-break: break-word;
  overflow: hidden; /* 让网格 / 扫描线不溢出圆角 */
}

/* 赛博网格背景：主色细线，22px 格 */
.markdown-body::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(color-mix(in srgb, var(--color-primary) 7%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 7%, transparent) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.7;
  z-index: 0;
}

/* 顶部扫描发光线 */
.markdown-body::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  opacity: 0.75;
  z-index: 0;
}

/* 正文内容浮于网格之上 */
.markdown-body > * {
  position: relative;
  z-index: 1;
}

/* 标题：主色 + 发光 */
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  color: var(--color-primary);
  font-weight: 600;
  margin: 1.5em 0 0.6em;
  line-height: 1.3;
  scroll-margin-top: 64px; /* 锚点跳转留出顶栏高度 */
  text-shadow: 0 0 14px color-mix(in srgb, var(--color-primary) 35%, transparent);
}
.markdown-body h1 {
  font-size: 1.8em;
  border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
  padding-bottom: 0.3em;
}
.markdown-body h2 {
  font-size: 1.4em;
  border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 15%, transparent);
  padding-bottom: 0.3em;
}
.markdown-body h3 {
  font-size: 1.15em;
}
.markdown-body h4 {
  font-size: 1em;
}

.markdown-body p {
  margin: 0.8em 0;
}

/* 链接：主色 + 虚线下划线，hover 加亮 */
.markdown-body a {
  color: var(--color-primary);
  text-decoration: none;
  border-bottom: 1px dashed color-mix(in srgb, var(--color-primary) 45%, transparent);
  transition: color 0.15s, border-color 0.15s;
}
.markdown-body a:hover {
  border-bottom-color: var(--color-primary);
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 1.6em;
  margin: 0.8em 0;
}
.markdown-body li {
  margin: 0.3em 0;
}
.markdown-body li::marker {
  color: var(--color-primary);
}

/* 引用块：主色左边框 + 半透明底 */
.markdown-body blockquote {
  margin: 1em 0;
  padding: 0.5em 1.2em;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--color-primary) 7%, transparent);
  border-left: 3px solid var(--color-primary);
  border-radius: 0 6px 6px 0;
}

/* 行内代码：主色半透明底 + 描边 */
.markdown-body code {
  font-family: ui-monospace, 'JetBrains Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 0.9em;
  padding: 0.15em 0.45em;
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
  border-radius: 4px;
}

/* 代码块：固定深色（亮暗一致，科技标志）+ 主色描边 + 内发光 */
.markdown-body pre {
  margin: 1em 0;
  padding: 16px 18px;
  background: #0d1117;
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: inset 0 0 30px color-mix(in srgb, var(--color-primary) 5%, transparent);
}
.markdown-body pre code {
  padding: 0;
  background: transparent;
  border: none;
  color: #c9d1d9;
  font-size: 0.85em;
  line-height: 1.65;
}

/* 表格：主色描边 + 表头高亮 */
.markdown-body table {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
  display: block;
  overflow-x: auto; /* 窄屏横向滚动 */
}
.markdown-body th,
.markdown-body td {
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
  padding: 0.55em 0.9em;
  text-align: left;
  white-space: normal;
}
.markdown-body th {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  font-weight: 600;
  letter-spacing: 0.02em;
}
.markdown-body tr:hover td {
  background: color-mix(in srgb, var(--color-primary) 4%, transparent);
}

/* 分割线：主色渐变光线 */
.markdown-body hr {
  border: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-primary) 45%, transparent),
    transparent
  );
  margin: 1.8em 0;
}

.markdown-body img {
  max-width: 100%;
  border-radius: 6px;
}

.markdown-body strong {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
