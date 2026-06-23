<script setup lang="ts">
import { ref } from 'vue';
import MarkdownViewer from '@/shared/components/markdown/MarkdownViewer.vue';
import MarkdownOutline from '@/shared/components/markdown/MarkdownOutline.vue';
import { BackToTop } from '@/shared/components/back-to-top';
import type { Heading } from '@/shared/components/markdown/heading';

/**
 * 项目文档页：应用内阅读 README.md，左侧大纲可点击跳转（整页科技风，跟随主题系统）。
 *
 * 内容来源：构建期通过 import.meta.glob 读取项目根 README.md 的原始文本（?raw）。
 *   - '/' = Vite 项目根（即 template/），故 '/README.md' 命中 template/README.md；
 *   - eager + import:'default'：构建时同步打包为字符串，无需运行时 fetch；
 *   - 换源：改下方 glob 的路径即可读取其他 md（如 '/docs/xxx.md'）。
 */
defineOptions({ name: 'ReadmeView' });

const readmeModules = import.meta.glob('/README.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const readmeRaw = readmeModules['/README.md'] ?? '';

// MarkdownViewer 渲染后回传的标题列表，喂给左侧大纲
const headings = ref<Heading[]>([]);
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 顶部说明：科技风卡片（主色调底 + 描边 + 发光，跟随主题） -->
    <div class="flex items-center justify-between gap-4 flex-wrap p-5 rounded-xl" style="
        background: color-mix(in srgb, var(--bg-container) 90%, var(--color-primary));
        border: 1px solid color-mix(in srgb, var(--color-primary) 28%, transparent);
        box-shadow: 0 0 30px color-mix(in srgb, var(--color-primary) 5%, transparent);
      ">
      <div class="min-w-0">
        <h2 class="m-0 mb-1 text-2xl font-bold" style="
            color: var(--color-primary);
            text-shadow: 0 0 14px color-mix(in srgb, var(--color-primary) 35%, transparent);
          ">
          项目文档
        </h2>
        <p class="m-0 text-sm leading-relaxed" style="color: var(--text-secondary)">
          即项目根目录的 README.md，构建期打包进来，离线可读。左侧大纲点击可跳转到对应章节。
        </p>
      </div>
      <a-tag color="processing">README.md</a-tag>
    </div>

    <!-- 左：sticky 大纲（窄屏 lg 以下隐藏）；右：Markdown 正文（自带科技风卡片） -->
    <div class="flex items-start gap-4">
      <aside class="hidden lg:block w-60 shrink-0">
        <MarkdownOutline :headings="headings" />
      </aside>
      <div class="flex-1 min-w-0">
        <MarkdownViewer :source="readmeRaw" @headings="headings = $event" />
      </div>
    </div>

    <!-- 文档过长时，右下角返回顶部（fixed，不占文档流） -->
    <BackToTop />
  </div>
</template>
