<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MarkdownViewer from '@/shared/components/markdown/MarkdownViewer.vue';
import MarkdownOutline from '@/shared/components/markdown/MarkdownOutline.vue';
import { BackToTop } from '@/shared/components/back-to-top';
import type { Heading } from '@/shared/components/markdown/heading';

interface MarkdownDocItem {
  path: string;
  label: string;
  source: string;
}

defineOptions({ name: 'ReadmeView' });

const route = useRoute();
const router = useRouter();
const headings = ref<Heading[]>([]);

const SIDE_WIDTH = 260;
const SIDE_GAP = 16;
const STORAGE_KEY = 'readme-view:panel-state';

function loadPanelState(): { leftCollapsed: boolean; rightCollapsed: boolean } {
  if (typeof window === 'undefined') {
    return { leftCollapsed: false, rightCollapsed: false };
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { leftCollapsed: false, rightCollapsed: false };
    }

    const parsed = JSON.parse(raw) as Partial<{
      leftCollapsed: boolean;
      rightCollapsed: boolean;
    }>;

    return {
      leftCollapsed: parsed.leftCollapsed === true,
      rightCollapsed: parsed.rightCollapsed === true,
    };
  } catch {
    return { leftCollapsed: false, rightCollapsed: false };
  }
}

const initialPanelState = loadPanelState();
const isLeftCollapsed = ref(initialPanelState.leftCollapsed);
const isRightCollapsed = ref(initialPanelState.rightCollapsed);

const markdownModules = import.meta.glob(
  [
    '/README.md',
    '/ARCHITECTURE.md',
    '/design.md',
    '/theme.md',
    '/docs/**/*.md',
    '/src/**/*.md',
    '/build-plugins/**/*.md',
    '/scripts/**/*.md',
  ],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  },
) as Record<string, string>;

const ROOT_DOC_PRIORITY = ['/README.md', '/ARCHITECTURE.md', '/design.md', '/theme.md'] as const;
const FALLBACK_DOC_PATH = '/README.md';

function getDocBucket(path: string): number {
  const rootIndex = ROOT_DOC_PRIORITY.indexOf(path as (typeof ROOT_DOC_PRIORITY)[number]);
  if (rootIndex >= 0) {
    return rootIndex;
  }

  if (path.startsWith('/docs/')) {
    return 10;
  }

  if (path.startsWith('/src/')) {
    return 20;
  }

  if (path.startsWith('/build-plugins/')) {
    return 30;
  }

  if (path.startsWith('/scripts/')) {
    return 40;
  }

  return 50;
}

const documents = computed<MarkdownDocItem[]>(() =>
  Object.entries(markdownModules)
    .map(([path, source]) => ({
      path,
      label: path.slice(1),
      source,
    }))
    .sort((left, right) => {
      const bucketDiff = getDocBucket(left.path) - getDocBucket(right.path);
      if (bucketDiff !== 0) {
        return bucketDiff;
      }

      return left.label.localeCompare(right.label);
    }),
);

const availableDocPaths = computed(() => new Set(documents.value.map((item) => item.path)));

const currentDocPath = computed(() => {
  const file = typeof route.query.file === 'string' ? route.query.file : '';
  if (file && availableDocPaths.value.has(file)) {
    return file;
  }

  if (availableDocPaths.value.has(FALLBACK_DOC_PATH)) {
    return FALLBACK_DOC_PATH;
  }

  return documents.value[0]?.path ?? '';
});

const currentDoc = computed(
  () => documents.value.find((item) => item.path === currentDocPath.value) ?? null,
);

const contentStyle = computed(() => ({
  paddingLeft: `${isLeftCollapsed.value ? 0 : SIDE_WIDTH + SIDE_GAP}px`,
  paddingRight: `${isRightCollapsed.value ? 0 : SIDE_WIDTH + SIDE_GAP}px`,
}));

function updateCurrentFile(path: string) {
  void router.replace({
    query: {
      ...route.query,
      file: path,
    },
  });
}

/** MarkdownViewer 内部文档链接点击 → 在 SPA 内切换文档（不跳出系统）。 */
function onNavigate(docPath: string): void {
  if (availableDocPaths.value.has(docPath)) {
    updateCurrentFile(docPath);
  }
}

function toggleLeftCollapsed() {
  isLeftCollapsed.value = !isLeftCollapsed.value;
}

function toggleRightCollapsed() {
  isRightCollapsed.value = !isRightCollapsed.value;
}

watch(
  [isLeftCollapsed, isRightCollapsed],
  ([leftCollapsed, rightCollapsed]) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        leftCollapsed,
        rightCollapsed,
      }),
    );
  },
  { immediate: true },
);

watch(
  [documents, currentDocPath],
  ([nextDocs, nextPath]) => {
    if (!nextPath || nextDocs.length === 0) {
      return;
    }

    const queryFile = typeof route.query.file === 'string' ? route.query.file : '';
    if (queryFile !== nextPath) {
      updateCurrentFile(nextPath);
    }
  },
  { immediate: true },
);

watch(currentDocPath, () => {
  headings.value = [];
});
</script>

<template>
  <div class="relative h-full min-h-0">
    <aside
      v-if="!isLeftCollapsed"
      class="absolute left-0 top-0 z-10 h-full w-[260px] overflow-hidden rounded-lg border border-[#d0d7de] bg-white"
    >
      <div class="border-b border-[#d8dee4] px-3 py-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-semibold text-[#1f2328]">文档目录</span>
          <div class="flex items-center gap-2">
            <a-tag color="blue">{{ documents.length }}</a-tag>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-[#57606a] transition hover:border-[#d0d7de] hover:bg-[#f6f8fa] hover:text-[#1f2328]"
              type="button"
              @click="toggleLeftCollapsed"
            >
              <span aria-hidden="true">&lt;</span>
            </button>
          </div>
        </div>
        <div class="mt-2 truncate text-xs text-[#57606a]">
          {{ currentDoc?.label ?? '暂无文档' }}
        </div>
      </div>
      <div class="h-[calc(100%-57px)] overflow-y-auto p-2">
        <a-menu
          :selected-keys="currentDocPath ? [currentDocPath] : []"
          mode="inline"
          @select="({ key }) => updateCurrentFile(String(key))"
        >
          <a-menu-item v-for="item in documents" :key="item.path">
            <span class="block truncate">{{ item.label }}</span>
          </a-menu-item>
        </a-menu>
      </div>
    </aside>

    <aside
      v-if="!isRightCollapsed"
      class="absolute right-0 top-0 z-10 h-full w-[260px] overflow-hidden rounded-lg border border-[#d0d7de] bg-white"
    >
      <div class="border-b border-[#d8dee4] px-3 py-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-semibold text-[#1f2328]">文档大纲</span>
          <button
            class="flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-[#57606a] transition hover:border-[#d0d7de] hover:bg-[#f6f8fa] hover:text-[#1f2328]"
            type="button"
            @click="toggleRightCollapsed"
          >
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
      </div>
      <div class="h-[calc(100%-49px)] overflow-y-auto">
        <MarkdownOutline :headings="headings" />
      </div>
    </aside>

    <div class="h-full min-h-0 transition-all duration-200" :style="contentStyle">
      <div class="h-full min-h-0 overflow-y-auto">
        <MarkdownViewer
          v-if="currentDoc"
          :source="currentDoc.source"
          :doc-paths="availableDocPaths"
          :current-doc-path="currentDocPath"
          @headings="headings = $event"
          @navigate="onNavigate"
        />
        <div
          v-else
          class="flex h-full items-center justify-center rounded-lg border border-dashed border-[#d0d7de] bg-white px-6 text-sm text-[#57606a]"
        >
          No Markdown documents are available for preview.
        </div>

        <BackToTop />
      </div>
    </div>

    <div
      v-if="isLeftCollapsed"
      class="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center"
    >
      <button
        class="pointer-events-auto flex h-16 w-6 items-center justify-center rounded-r-full border border-l-0 border-[#d0d7de] bg-white/92 text-[#57606a] shadow-xs backdrop-blur transition hover:w-7 hover:text-[#1f2328]"
        type="button"
        @click="toggleLeftCollapsed"
      >
        <span aria-hidden="true">&gt;</span>
      </button>
    </div>

    <div
      v-if="isRightCollapsed"
      class="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center"
    >
      <button
        class="pointer-events-auto flex h-16 w-6 items-center justify-center rounded-l-full border border-r-0 border-[#d0d7de] bg-white/92 text-[#57606a] shadow-xs backdrop-blur transition hover:w-7 hover:text-[#1f2328]"
        type="button"
        @click="toggleRightCollapsed"
      >
        <span aria-hidden="true">&lt;</span>
      </button>
    </div>
  </div>
</template>
