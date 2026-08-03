// Flat Config（ESLint 10）。
// 迁移自旧 .eslintrc.cjs（legacy eslintrc 已在 ESLint 10 移除）。
//
// 结构：用 @vue/eslint-config-typescript 的 withVueTs 组合 Vue + TypeScript 规则集，
// 格式化交给独立 prettier（skip-formatting 只关闭冲突规则，不把 prettier 当 eslint 规则跑）。
import pluginVue from 'eslint-plugin-vue';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default withVueTs(
  // Flat Config 默认只忽略 node_modules；dist/public 必须显式忽略，否则 eslint .
  // 会扫描构建产物（旧 legacy 下一直在发生）。
  {
    name: 'tindae/ignores',
    ignores: ['dist/**', 'public/**', 'node_modules/**'],
  },
  // Vue 3 推荐规则集（v10 flat 命名：flat/recommended，等价于旧 vue3-recommended）。
  pluginVue.configs['flat/recommended'],
  // TypeScript 推荐规则集（typescript-eslint v8，已适配 .vue 分块解析）。
  vueTsConfigs.recommended,
  // 项目自定义规则。
  {
    name: 'tindae/custom-rules',
    rules: {
      'vue/multi-word-component-names': 'off',
      // 下划线前缀的参数/变量/catch 绑定视为故意未使用（社区约定），不报错。
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // 模板既有 any 多为 echarts/vxe-table 等第三方复杂类型包装，降级为 warn 不阻断；
      // 新增 any 仍会被提示。后续作为「类型债清理」专项单独处理。
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // 测试文件常定义多个局部组件作为测试用例，one-component-per-file 不适用。
  {
    name: 'tindae/spec-overrides',
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'vue/one-component-per-file': 'off',
    },
  },
  // 放最后：关闭与 prettier 冲突的规则（prettier/prettier: off）。
  skipFormatting,
);
