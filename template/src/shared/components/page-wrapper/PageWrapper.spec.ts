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

  it('有 extra 插槽时渲染 header 区域', () => {
    const wrapper = mount(PageWrapper, {
      slots: { extra: '<div class="btn">新增</div>' },
    });
    expect(wrapper.find('.bg-white').exists()).toBe(true);
    expect(wrapper.find('.btn').text()).toBe('新增');
  });

  it('#header 插槽优先于 search 和 extra', () => {
    const wrapper = mount(PageWrapper, {
      slots: {
        header: '<div class="custom">自定义header</div>',
        search: '<div class="filter">搜索</div>',
        extra: '<div class="btn">操作</div>',
      },
    });
    expect(wrapper.find('.custom').text()).toBe('自定义header');
    expect(wrapper.find('.filter').exists()).toBe(false);
    expect(wrapper.find('.btn').exists()).toBe(false);
  });
});
