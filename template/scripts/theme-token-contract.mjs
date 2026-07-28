const NUMERIC_SPACING_SCALE = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44,
  48, 52, 56, 60, 64, 72, 80, 96,
];

const REQUIRED_COLOR_KEYS = [
  'primary',
  'primary-hover',
  'primary-active',
  'on-primary',
  'title',
  'body',
  'container',
  'page',
];

const REQUIRED_FONT_KEYS = [
  'heading-xl',
  'heading-lg',
  'heading-md',
  'body-lg',
  'body-md',
  'body-sm',
  'label',
];

const REQUIRED_RADIUS_KEYS = ['sm', 'md', 'lg', 'xl', '2xl'];
const REQUIRED_SPACING_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

const TYPOGRAPHY_KEY_MAP = {
  'heading-xl': 'headingXl',
  'heading-lg': 'headingLg',
  'heading-md': 'headingMd',
  'body-lg': 'bodyLg',
  'body-md': 'bodyMd',
  'body-sm': 'bodySm',
  label: 'label',
};

const SPACING_KEY_MAP = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  '2xl': '2xl',
};

function getAtPath(source, path) {
  return path.split('.').reduce((current, segment) => current?.[segment], source);
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectString(errors, value, path) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${path} must be a non-empty string`);
  }
}

function expectTuple(errors, value, path) {
  if (!Array.isArray(value) || value.length !== 2) {
    errors.push(`${path} must be a [fontSize, options] tuple`);
    return;
  }

  expectString(errors, value[0], `${path}[0]`);

  if (!isPlainObject(value[1])) {
    errors.push(`${path}[1] must be an object`);
    return;
  }

  expectString(errors, value[1].lineHeight, `${path}[1].lineHeight`);
  expectString(errors, value[1].fontWeight, `${path}[1].fontWeight`);
}

export function validateRawTailwindTokens(rawTokens) {
  const errors = [];
  const extend = rawTokens?.theme?.extend;

  if (!isPlainObject(rawTokens)) {
    errors.push('theme.tokens.json root must be an object');
    return errors;
  }

  if (!isPlainObject(extend)) {
    errors.push('theme.tokens.json must contain a theme.extend object');
    return errors;
  }

  for (const key of REQUIRED_COLOR_KEYS) {
    expectString(errors, getAtPath(extend, `colors.${key}`), `theme.extend.colors.${key}`);
  }

  for (const key of REQUIRED_FONT_KEYS) {
    const family = getAtPath(extend, `fontFamily.${key}`);
    if (!Array.isArray(family) || family.length === 0) {
      errors.push(`theme.extend.fontFamily.${key} must be a non-empty array`);
    } else {
      expectString(errors, family[0], `theme.extend.fontFamily.${key}[0]`);
    }

    expectTuple(errors, getAtPath(extend, `fontSize.${key}`), `theme.extend.fontSize.${key}`);
  }

  for (const key of REQUIRED_RADIUS_KEYS) {
    expectString(errors, getAtPath(extend, `borderRadius.${key}`), `theme.extend.borderRadius.${key}`);
  }

  for (const key of REQUIRED_SPACING_KEYS) {
    expectString(errors, getAtPath(extend, `spacing.${key}`), `theme.extend.spacing.${key}`);
  }

  return errors;
}

export function assertValidRawTailwindTokens(rawTokens) {
  const errors = validateRawTailwindTokens(rawTokens);
  if (errors.length > 0) {
    throw new Error(`theme.tokens.json validation failed:\n- ${errors.join('\n- ')}`);
  }
}

export function buildProjectTailwindExtend(rawTokens) {
  assertValidRawTailwindTokens(rawTokens);

  return {
    colors: {
      primary: {
        DEFAULT: 'var(--color-primary)',
        hover: 'var(--color-primary-hover)',
        active: 'var(--color-primary-active)',
        disabled: 'var(--color-primary-disabled)',
      },
      success: {
        DEFAULT: 'var(--color-success)',
        hover: 'var(--color-success-hover)',
        active: 'var(--color-success-active)',
        disabled: 'var(--color-success-disabled)',
      },
      danger: {
        DEFAULT: 'var(--color-danger)',
        hover: 'var(--color-danger-hover)',
        active: 'var(--color-danger-active)',
        disabled: 'var(--color-danger-disabled)',
      },
      warning: {
        DEFAULT: 'var(--color-warning)',
        hover: 'var(--color-warning-hover)',
        active: 'var(--color-warning-active)',
        disabled: 'var(--color-warning-disabled)',
      },
      info: {
        DEFAULT: 'var(--color-info)',
        hover: 'var(--color-info-hover)',
        active: 'var(--color-info-active)',
        disabled: 'var(--color-info-disabled)',
      },
    },
    textColor: {
      title: 'var(--text-title)',
      body: 'var(--text-body)',
      secondary: 'var(--text-secondary)',
      disabled: 'var(--text-disabled)',
      inverse: 'var(--text-inverse)',
    },
    backgroundColor: {
      white: 'var(--bg-white)',
      page: 'var(--bg-page)',
      container: 'var(--bg-container)',
      elevated: 'var(--bg-elevated)',
      subtle: 'var(--bg-subtle)',
    },
    borderColor: {
      base: 'var(--border-base)',
      light: 'var(--border-light)',
      lighter: 'var(--border-lighter)',
      'extra-light': 'var(--border-extra-light)',
    },
    spacing: Object.fromEntries([
      ...NUMERIC_SPACING_SCALE.map((value) => [String(value), `calc(var(--space-unit) * ${value})`]),
      ['xs', 'var(--space-xs)'],
      ['sm', 'var(--space-sm)'],
      ['md', 'var(--space-md)'],
      ['lg', 'var(--space-lg)'],
      ['xl', 'var(--space-xl)'],
      ['2xl', 'var(--space-2xl)'],
    ]),
    fontFamily: {
      sans: ['var(--font-family-body-lg)'],
      heading: ['var(--font-family-heading-xl)'],
      body: ['var(--font-family-body-lg)'],
      label: ['var(--font-family-label)'],
    },
    fontSize: {
      xs: [
        'var(--font-size-label)',
        { lineHeight: 'var(--line-height-label)', fontWeight: 'var(--font-weight-label)' },
      ],
      sm: [
        'var(--font-size-body-sm)',
        { lineHeight: 'var(--line-height-body-sm)', fontWeight: 'var(--font-weight-body-sm)' },
      ],
      tiny: [
        'var(--font-size-body-md)',
        { lineHeight: 'var(--line-height-body-md)', fontWeight: 'var(--font-weight-body-md)' },
      ],
      base: [
        'var(--font-size-body-lg)',
        { lineHeight: 'var(--line-height-body-lg)', fontWeight: 'var(--font-weight-body-lg)' },
      ],
      lg: [
        'var(--font-size-heading-md)',
        { lineHeight: 'var(--line-height-heading-md)', fontWeight: 'var(--font-weight-heading-md)' },
      ],
      xl: [
        'var(--font-size-heading-lg)',
        { lineHeight: 'var(--line-height-heading-lg)', fontWeight: 'var(--font-weight-heading-lg)' },
      ],
      '2xl': [
        'var(--font-size-heading-xl)',
        { lineHeight: 'var(--line-height-heading-xl)', fontWeight: 'var(--font-weight-heading-xl)' },
      ],
      '3xl': ['32px', { lineHeight: '40px' }],
      '4xl': ['36px', { lineHeight: '44px' }],
      '5xl': ['40px', { lineHeight: '48px' }],
    },
    borderRadius: {
      sm: 'var(--radius-sm)',
      DEFAULT: 'var(--radius-base)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
    },
  };
}

export function buildProjectTailwindTheme(rawTokens) {
  return {
    theme: {
      extend: buildProjectTailwindExtend(rawTokens),
    },
  };
}

const TAILWIND_COLOR_VARIABLES = [
  ['primary', 'var(--color-primary)'],
  ['primary-hover', 'var(--color-primary-hover)'],
  ['primary-active', 'var(--color-primary-active)'],
  ['primary-disabled', 'var(--color-primary-disabled)'],
  ['success', 'var(--color-success)'],
  ['success-hover', 'var(--color-success-hover)'],
  ['success-active', 'var(--color-success-active)'],
  ['success-disabled', 'var(--color-success-disabled)'],
  ['danger', 'var(--color-danger)'],
  ['danger-hover', 'var(--color-danger-hover)'],
  ['danger-active', 'var(--color-danger-active)'],
  ['danger-disabled', 'var(--color-danger-disabled)'],
  ['warning', 'var(--color-warning)'],
  ['warning-hover', 'var(--color-warning-hover)'],
  ['warning-active', 'var(--color-warning-active)'],
  ['warning-disabled', 'var(--color-warning-disabled)'],
  ['info', 'var(--color-info)'],
  ['info-hover', 'var(--color-info-hover)'],
  ['info-active', 'var(--color-info-active)'],
  ['info-disabled', 'var(--color-info-disabled)'],
  ['title', 'var(--text-title)'],
  ['body', 'var(--text-body)'],
  ['secondary', 'var(--text-secondary)'],
  ['disabled', 'var(--text-disabled)'],
  ['inverse', 'var(--text-inverse)'],
  ['white', 'var(--bg-white)'],
  ['page', 'var(--bg-page)'],
  ['container', 'var(--bg-container)'],
  ['elevated', 'var(--bg-elevated)'],
  ['subtle', 'var(--bg-subtle)'],
  ['base', 'var(--border-base)'],
  ['light', 'var(--border-light)'],
  ['lighter', 'var(--border-lighter)'],
  ['extra-light', 'var(--border-extra-light)'],
];

const TAILWIND_FONT_FAMILY_VARIABLES = [
  ['sans', 'var(--font-family-body-lg)'],
  ['heading', 'var(--font-family-heading-xl)'],
  ['body', 'var(--font-family-body-lg)'],
  ['label', 'var(--font-family-label)'],
];

const TAILWIND_FONT_SIZE_VARIABLES = [
  ['xs', 'var(--font-size-label)', 'var(--line-height-label)', 'var(--font-weight-label)'],
  ['sm', 'var(--font-size-body-sm)', 'var(--line-height-body-sm)', 'var(--font-weight-body-sm)'],
  ['tiny', 'var(--font-size-body-md)', 'var(--line-height-body-md)', 'var(--font-weight-body-md)'],
  ['base', 'var(--font-size-body-lg)', 'var(--line-height-body-lg)', 'var(--font-weight-body-lg)'],
  ['lg', 'var(--font-size-heading-md)', 'var(--line-height-heading-md)', 'var(--font-weight-heading-md)'],
  ['xl', 'var(--font-size-heading-lg)', 'var(--line-height-heading-lg)', 'var(--font-weight-heading-lg)'],
  ['2xl', 'var(--font-size-heading-xl)', 'var(--line-height-heading-xl)', 'var(--font-weight-heading-xl)'],
  ['3xl', '32px', '40px', undefined],
  ['4xl', '36px', '44px', undefined],
  ['5xl', '40px', '48px', undefined],
];

const TAILWIND_RADIUS_VARIABLES = [
  ['xs', 'var(--radius-sm)'],
  ['sm', 'var(--radius-base)'],
  ['md', 'var(--radius-md)'],
  ['lg', 'var(--radius-lg)'],
  ['xl', 'var(--radius-xl)'],
];

function appendThemeVariable(lines, name, value) {
  lines.push(`  ${name}: ${value};`);
}

function normalizeCssText(cssText) {
  return cssText.replace(/\r\n/g, '\n');
}

export function buildProjectTailwindThemeCss(rawTokens) {
  assertValidRawTailwindTokens(rawTokens);

  const lines = [
    '/*',
    ' * 由 scripts/export-theme-tokens.mjs 自动生成。',
    ' * 这里使用 @theme inline，让 Tailwind v4 只生成工具类，并把最终颜色/间距/圆角继续交给运行时 :root 变量。',
    ' */',
    '@theme inline {',
  ];

  // v4 统一使用 --color-* 命名空间；text/bg/border 的语义色也映射进这里，以保留 text-title、bg-page、border-base 等工具类。
  for (const [key, value] of TAILWIND_COLOR_VARIABLES) {
    appendThemeVariable(lines, `--color-${key}`, value);
  }

  for (const value of NUMERIC_SPACING_SCALE) {
    appendThemeVariable(lines, `--spacing-${value}`, `calc(var(--space-unit) * ${value})`);
  }
  for (const key of REQUIRED_SPACING_KEYS) {
    appendThemeVariable(lines, `--spacing-${key}`, `var(--space-${key})`);
  }

  for (const [key, value] of TAILWIND_FONT_FAMILY_VARIABLES) {
    appendThemeVariable(lines, `--font-${key}`, value);
  }

  // Tailwind v4 的字体元数据通过 --text-<name>--line-height / --font-weight 副变量表达。
  for (const [key, size, lineHeight, fontWeight] of TAILWIND_FONT_SIZE_VARIABLES) {
    appendThemeVariable(lines, `--text-${key}`, size);
    appendThemeVariable(lines, `--text-${key}--line-height`, lineHeight);
    if (fontWeight) {
      appendThemeVariable(lines, `--text-${key}--font-weight`, fontWeight);
    }
  }

  // v4 已将 rounded-sm 改名为 rounded-xs，原先无后缀 rounded 对应新的 rounded-sm。
  for (const [key, value] of TAILWIND_RADIUS_VARIABLES) {
    appendThemeVariable(lines, `--radius-${key}`, value);
  }

  lines.push('}', '');
  return lines.join('\n');
}

export function assertThemeCssMatchesRawTokens(rawTokens, cssText) {
  const expectedCss = buildProjectTailwindThemeCss(rawTokens);
  if (normalizeCssText(cssText) !== expectedCss) {
    throw new Error('theme.tailwind.css 与 theme.tokens.json 不一致，请重新执行 pnpm run tokens:export');
  }
}

export function stringifyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function parseRgbaColor(value) {
  const match = value
    .trim()
    .toLowerCase()
    .match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([.\d]+)\s*\)$/);

  if (!match) {
    throw new Error(`Unsupported rgba color: ${value}`);
  }

  return {
    r: Number.parseInt(match[1], 10),
    g: Number.parseInt(match[2], 10),
    b: Number.parseInt(match[3], 10),
    a: Number.parseFloat(match[4]),
  };
}

function toHexChannel(value) {
  return Math.round(value).toString(16).padStart(2, '0');
}

export function normalizeLightModeColor(value) {
  const normalized = value.trim().toLowerCase();

  if (normalized.startsWith('#')) {
    return normalized;
  }

  if (normalized.startsWith('rgba(')) {
    const { r, g, b, a } = parseRgbaColor(normalized);
    const blended = {
      r: (1 - a) * 255 + a * r,
      g: (1 - a) * 255 + a * g,
      b: (1 - a) * 255 + a * b,
    };

    return `#${toHexChannel(blended.r)}${toHexChannel(blended.g)}${toHexChannel(blended.b)}`;
  }

  throw new Error(`Unsupported color format: ${value}`);
}

function compareValue(errors, actual, expected, label) {
  if (actual !== expected) {
    errors.push(`${label} mismatch: expected ${expected}, received ${actual}`);
  }
}

export function validateLightTokensAgainstRawTokens(rawTokens, lightTokens) {
  assertValidRawTailwindTokens(rawTokens);

  const errors = [];
  const extend = rawTokens.theme.extend;

  compareValue(errors, extend.colors.primary, lightTokens.colors.primary.DEFAULT, 'colors.primary');
  compareValue(errors, extend.colors['primary-hover'], lightTokens.colors.primary.hover, 'colors.primary-hover');
  compareValue(errors, extend.colors['primary-active'], lightTokens.colors.primary.active, 'colors.primary-active');
  compareValue(errors, extend.colors.container, lightTokens.bg.container, 'colors.container');
  compareValue(errors, extend.colors.page, lightTokens.bg.page, 'colors.page');

  for (const [rawKey, tokenKey] of Object.entries(TYPOGRAPHY_KEY_MAP)) {
    compareValue(errors, extend.fontFamily[rawKey][0], lightTokens.typography[tokenKey].fontFamily, `fontFamily.${rawKey}`);
    compareValue(errors, extend.fontSize[rawKey][0], lightTokens.typography[tokenKey].fontSize, `fontSize.${rawKey}`);
    compareValue(
      errors,
      extend.fontSize[rawKey][1].fontWeight,
      lightTokens.typography[tokenKey].fontWeight,
      `fontWeight.${rawKey}`,
    );
    compareValue(
      errors,
      extend.fontSize[rawKey][1].lineHeight,
      lightTokens.typography[tokenKey].lineHeight,
      `lineHeight.${rawKey}`,
    );
  }

  compareValue(errors, lightTokens.spacing.unit, lightTokens.spacing.xs, 'spacing.unit -> spacing.xs');
  for (const [rawKey, tokenKey] of Object.entries(SPACING_KEY_MAP)) {
    compareValue(errors, extend.spacing[rawKey], lightTokens.spacing[tokenKey], `spacing.${rawKey}`);
  }

  compareValue(errors, extend.borderRadius.sm, lightTokens.radius.sm, 'borderRadius.sm');
  compareValue(errors, extend.borderRadius.md, lightTokens.radius.base, 'borderRadius.md -> radius.base');
  compareValue(errors, extend.borderRadius.lg, lightTokens.radius.md, 'borderRadius.lg -> radius.md');
  compareValue(errors, extend.borderRadius.xl, lightTokens.radius.lg, 'borderRadius.xl -> radius.lg');
  compareValue(errors, extend.borderRadius['2xl'], lightTokens.radius.xl, 'borderRadius.2xl -> radius.xl');
  compareValue(
    errors,
    normalizeLightModeColor(extend.colors.title),
    normalizeLightModeColor(lightTokens.text.title),
    'colors.title -> text.title',
  );
  compareValue(
    errors,
    normalizeLightModeColor(extend.colors.body),
    normalizeLightModeColor(lightTokens.text.body),
    'colors.body -> text.body',
  );

  return errors;
}

export function assertLightTokensMatchRawTokens(rawTokens, lightTokens) {
  const errors = validateLightTokensAgainstRawTokens(rawTokens, lightTokens);
  if (errors.length > 0) {
    throw new Error(`design.md and lightTokens are out of sync:\n- ${errors.join('\n- ')}`);
  }
}
