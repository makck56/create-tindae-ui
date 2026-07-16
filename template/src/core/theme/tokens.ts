import type { ThemeMode, ThemeTokens } from './types';

const APP_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const sharedTypography = {
  headingXl: {
    fontFamily: APP_SANS,
    fontSize: '28px',
    fontWeight: '600',
    lineHeight: '36px',
  },
  headingLg: {
    fontFamily: APP_SANS,
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '32px',
  },
  headingMd: {
    fontFamily: APP_SANS,
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '28px',
  },
  bodyLg: {
    fontFamily: APP_SANS,
    fontSize: '18px',
    fontWeight: '400',
    lineHeight: '28px',
  },
  bodyMd: {
    fontFamily: APP_SANS,
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '24px',
  },
  bodySm: {
    fontFamily: APP_SANS,
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '22px',
  },
  label: {
    fontFamily: APP_SANS,
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '20px',
  },
} as const;

const sharedSpacing = {
  unit: '4px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

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
  typography: sharedTypography,
  spacing: sharedSpacing,
  radius: { sm: '2px', base: '4px', md: '6px', lg: '8px', xl: '12px' },
  layout: { sidebarWidth: '220px', sidebarCollapsedWidth: '80px', headerHeight: '48px' },
};

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
    white: '#1f1f1f',
    subtle: '#262626',
  },
  border: {
    base: '#434343',
    light: '#303030',
    lighter: '#262626',
    extraLight: '#1f1f1f',
  },
  typography: sharedTypography,
  spacing: sharedSpacing,
  radius: { sm: '2px', base: '4px', md: '6px', lg: '8px', xl: '12px' },
  layout: { sidebarWidth: '220px', sidebarCollapsedWidth: '80px', headerHeight: '48px' },
};

export function getTokensByMode(mode: ThemeMode): ThemeTokens {
  return mode === 'dark' ? darkTokens : lightTokens;
}
