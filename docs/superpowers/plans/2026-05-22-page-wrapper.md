# PageWrapper 公共布局组件 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建 PageWrapper 公共布局组件，为表格页面提供统一的上中下 flex 布局。

**Architecture:** 单一 Vue SFC 组件，纯 Tailwind CSS 类，通过插槽组合 header/content/footer，props 支持各区域样式覆盖。放在 `src/shared/components/page-wrapper/` 目录。

**Tech Stack:** Vue 3 SFC + Tailwind CSS + Vitest

---

## File Structure

| 操作 | 文件 | 职责 |
|------|------|------|
| Create | `src/shared/components/page-wrapper/PageWrapper.vue` | 布局组件 |
| Create | `src/shared/components/page-wrapper/index.ts` | 导出 |
| Create | `src/shared/components/page-wrapper/PageWrapper.spec.ts` | 测试 |

---

### Task 1: 创建 PageWrapper 组件

**Files:**
- Create: `src/shared/components/page-wrapper/PageWrapper.vue`
- Create: `src/shared/components/page-wrapper/index.ts`

- [ ] **Step 1: 创建 PageWrapper.vue**

```vue
<script setup lang="ts">
import type { StyleValue } from 'vue';

defineOptions({ name: 'PageWrapper' });

defineProps<{
  headerClass?: string;
  headerStyle?: StyleValue;
  contentClass?: string;
  contentStyle?: StyleValue;
  footerClass?: string;
  footerStyle?: StyleValue;
}>();
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div
      v-if="$slots.header || $slots.search || $slots.extra"
      :class="['bg-white rounded p-4 mb-4', headerClass]"
      :style="headerStyle"
    >
      <slot name="header">
        <div class="flex items-center justify-between">
          <div><slot name="search" /></div>
          <div><slot name="extra" /></div>
        </div>
      </slot>
    </div>

    <!-- Content -->
    <div
      :class="['flex-1 overflow-auto p-4', contentClass]"
      :style="contentStyle"
    >
      <slot />
    </div>

    <!-- Footer -->
    <div
      v-if="$slots.footer"
      :class="['pt-4', footerClass]"
      :style="footerStyle"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: 创建 index.ts 导出**

```typescript
export { default as PageWrapper } from './PageWrapper.vue';
```

---

### Task 2: 编写测试

**Files:**
- Create: `src/shared/components/page-wrapper/PageWrapper.spec.ts`

- [ ] **Step 1: 编写组件测试**

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PageWrapper from './PageWrapper.vue';

describe('PageWrapper', () => {
  it('渲染 default 插槽内容', () => {
    const wrapper = mount(PageWrapper, {
      slots: { default: '<div class="table">表格</div>' },
    });
    expect(wrapper.find('.table').text()).toBe('表格');
  });

  it('default 区域包含 flex-1 和 overflow-auto', () => {
    const wrapper = mount(PageWrapper, {
      slots: { default: 'content' },
    });
    const content = wrapper.find('.flex-1');
    expect(content.classes()).toContain('overflow-auto');
    expect(content.classes()).toContain('p-4');
  });

  it('无 header 插槽时不渲染 header 区域', () => {
    const wrapper = mount(PageWrapper, {
      slots: { default: 'content' },
    });
    expect(wrapper.find('.bg-white').exists()).toBe(false);
  });

  it('有 search 插槽时渲染 header 区域', () => {
    const wrapper = mount(PageWrapper, {
      slots: { search: '<div class="filter">搜索</div>' },
    });
    expect(wrapper.find('.bg-white').exists()).toBe(true);
    expect(wrapper.find('.filter').text()).toBe('搜索');
  });

  it('search 和 extra 插槽左右分布', () => {
    const wrapper = mount(PageWrapper, {
      slots: {
        search: '<div class="left">搜索</div>',
        extra: '<div class="right">操作</div>',
      },
    });
    const header = wrapper.find('.bg-white .flex');
    expect(header.find('.left').text()).toBe('搜索');
    expect(header.find('.right').text()).toBe('操作');
  });

  it('#header 插槽替换默认 search/extra 布局', () => {
    const wrapper = mount(PageWrapper, {
      slots: { header: '<div class="custom-header">自定义</div>' },
    });
    expect(wrapper.find('.custom-header').text()).toBe('自定义');
    expect(wrapper.find('.flex.items-center').exists()).toBe(false);
  });

  it('无 footer 插槽时不渲染 footer 区域', () => {
    const wrapper = mount(PageWrapper, {
      slots: { default: 'content' },
    });
    // footer 有 pt-4 class，检查不应存在
    const allDivs = wrapper.findAll('.pt-4');
    expect(allDivs.length).toBe(0);
  });

  it('有 footer 插槽时渲染 footer 区域', () => {
    const wrapper = mount(PageWrapper, {
      slots: {
        default: 'content',
        footer: '<div class="pager">分页</div>',
      },
    });
    const footer = wrapper.find('.pt-4');
    expect(footer.find('.pager').text()).toBe('分页');
  });

  it('contentClass 和 contentStyle 追加到 content 区域', () => {
    const wrapper = mount(PageWrapper, {
      props: {
        contentClass: 'custom-content',
        contentStyle: { maxHeight: '500px' },
      },
      slots: { default: 'content' },
    });
    const content = wrapper.find('.flex-1');
    expect(content.classes()).toContain('custom-content');
    expect(content.attributes('style')).toContain('max-height');
  });

  it('headerClass 和 headerStyle 追加到 header 区域', () => {
    const wrapper = mount(PageWrapper, {
      props: {
        headerClass: 'custom-header',
        headerStyle: { background: 'red' },
      },
      slots: { search: '搜索' },
    });
    const header = wrapper.find('.bg-white');
    expect(header.classes()).toContain('custom-header');
    expect(header.attributes('style')).toContain('background');
  });

  it('footerClass 和 footerStyle 追加到 footer 区域', () => {
    const wrapper = mount(PageWrapper, {
      props: {
        footerClass: 'custom-footer',
        footerStyle: { borderTop: '1px solid #eee' },
      },
      slots: {
        default: 'content',
        footer: '<div>分页</div>',
      },
    });
    const footer = wrapper.find('.pt-4');
    expect(footer.classes()).toContain('custom-footer');
    expect(footer.attributes('style')).toContain('border-top');
  });
});
```

- [ ] **Step 2: 运行测试**

Run: `npx vitest run src/shared/components/page-wrapper/PageWrapper.spec.ts`
Expected: 10 tests PASS

- [ ] **Step 3: 提交**

```bash
git add src/shared/components/page-wrapper/
git commit -m "feat: add PageWrapper layout component"
```
