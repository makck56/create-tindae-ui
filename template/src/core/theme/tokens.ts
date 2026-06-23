import type { ThemeTokens, ThemeMode } from './types';

/**
 * 主题 Token 默认值 —— 亮色 / 暗色两套基础配色。
 *
 * 配色取值与 Ant Design 默认色板对齐（#1890ff 为主色），
 * 这样默认状态下 antd 原生样式与 Token 驱动的覆盖层视觉一致，
 * 切换主色 / 暗色时才显式体现差异。
 *
 * 所有对象均以字面量声明，配合 types.ts 的 readonly 接口形成不可变约束。
 */

/** 亮色主题 Token：默认配色 */
export const lightTokens: ThemeTokens = {
  colors: {
    primary: { DEFAULT: '#1890ff', hover: '#40a9ff', active: '#096dd9', disabled: '#91d5ff' },
    success: { DEFAULT: '#52c41a', hover: '#73d13d', active: '#389e0d', disabled: '#b7eb8f' },
    warning: { DEFAULT: '#faad14', hover: '#ffc53d', active: '#d48806', disabled: '#ffe58f' },
    danger: { DEFAULT: '#f5222d', hover: '#ff4d4f', active: '#cf1322', disabled: '#ffa39e' },
    info: { DEFAULT: '#1890ff', hover: '#40a9ff', active: '#096dd9', disabled: '#91d5ff' },
  },
  text: {
    title: 'rgba(0, 0, 0, 0.85)',
    body: 'rgba(0, 0, 0, 0.75)',
    secondary: 'rgba(0, 0, 0, 0.45)',
    disabled: 'rgba(0, 0, 0, 0.25)',
    inverse: 'rgba(255, 255, 255, 0.85)',
  },
  bg: {
    page: '#f0f2f5',
    container: '#ffffff',
    elevated: '#ffffff',
    white: '#ffffff',
    subtle: '#fafafa',
  },
  border: {
    base: '#d9d9d9',
    light: '#e8e8e8',
    lighter: '#f0f0f0',
    extraLight: '#f5f5f5',
  },
  radius: { sm: '2px', base: '4px', md: '6px', lg: '8px', xl: '12px' },
  layout: { sidebarWidth: '220px', sidebarCollapsedWidth: '80px', headerHeight: '48px' },
};

/** 暗色主题 Token：参考 antd 暗色色板（v4 dark algorithm 取色思路） */
export const darkTokens: ThemeTokens = {
  colors: {
    primary: { DEFAULT: '#177ddc', hover: '#1890ff', active: '#096dd9', disabled: '#16486e' },
    success: { DEFAULT: '#49aa19', hover: '#73d13d', active: '#389e0d', disabled: '#274916' },
    warning: { DEFAULT: '#d89614', hover: '#ffc53d', active: '#d48806', disabled: '#594214' },
    danger: { DEFAULT: '#d32029', hover: '#ff4d4f', active: '#cf1322', disabled: '#5c0011' },
    info: { DEFAULT: '#177ddc', hover: '#1890ff', active: '#096dd9', disabled: '#16486e' },
  },
  text: {
    title: 'rgba(255, 255, 255, 0.85)',
    body: 'rgba(255, 255, 255, 0.75)',
    secondary: 'rgba(255, 255, 255, 0.45)',
    disabled: 'rgba(255, 255, 255, 0.25)',
    inverse: 'rgba(0, 0, 0, 0.85)',
  },
  bg: {
    page: '#141414',
    container: '#1f1f1f',
    elevated: '#262626',
    // 暗色下「white」语义退化为容器色：业务里 bg-white 的区块不会刺眼地泛白
    white: '#1f1f1f',
    subtle: '#262626',
  },
  border: {
    base: '#434343',
    light: '#303030',
    lighter: '#262626',
    extraLight: '#1f1f1f',
  },
  radius: { sm: '2px', base: '4px', md: '6px', lg: '8px', xl: '12px' },
  layout: { sidebarWidth: '220px', sidebarCollapsedWidth: '80px', headerHeight: '48px' },
};

/**
 * 根据模式获取对应 Token 集。
 * 保持纯函数 + 不可变返回（直接返回常量引用，调用方不应修改）。
 *
 * @param mode 主题模式
 * @returns 该模式下的完整 Token 集合
 */
export function getTokensByMode(mode: ThemeMode): ThemeTokens {
  return mode === 'dark' ? darkTokens : lightTokens;
}
