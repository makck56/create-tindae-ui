import type { Component } from 'vue';
import {
  AppstoreOutlined,
  BgColorsOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue';

/**
 * 菜单图标注册表：把后端/配置下发的图标名字符串解析为图标组件。
 *
 * 为何是「字符串 + 白名单」而不是菜单里直接存组件：
 * - 菜单树来自 /user/info 接口（MSW 或真实后端），网络层只能传可序列化字符串；
 * - 白名单收敛可渲染的图标面，未注册的名字不会被交给运行时动态解析。
 *
 * 为何根级菜单必须有兜底图标：
 * ant-design-vue 折叠态（inline-collapsed）隐藏文字的样式是
 * `.ant-menu-item-icon + span { opacity: 0 }` —— 仅当文字前面存在 icon 元素时生效；
 * 没有 icon 的菜单项收缩后文字不会被隐藏，只会被 80px 折叠侧栏裁切。
 */
const MENU_ICONS: Record<string, Component> = {
  AppstoreOutlined,
  BgColorsOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
};

/** 根级菜单的兜底图标（icon 未配置或名字不在注册表时回退） */
const DEFAULT_MENU_ICON: Component = AppstoreOutlined;

/**
 * 严格解析：按名字查注册表，未配置或未注册返回 undefined。
 * 用于子级菜单项——弹层子项折叠时仍显示文字，缺图标无副作用。
 */
export function resolveMenuIcon(name?: string): Component | undefined {
  return name ? MENU_ICONS[name] : undefined;
}

/**
 * 根级菜单解析：未配置或名字未知时回退默认图标。
 * 折叠态的根级菜单只显示图标，缺图标会导致文字被裁切，因此不允许为空。
 */
export function resolveRootMenuIcon(name?: string): Component {
  return (name && MENU_ICONS[name]) || DEFAULT_MENU_ICON;
}
