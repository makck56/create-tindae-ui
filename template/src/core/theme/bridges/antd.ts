/**
 * Ant Design Vue 主题桥接层（覆盖样式入口）。
 *
 * 背景：项目使用 ant-design-vue@^3.2（v3 线）。v3 没有 v4/v5 的 ConfigProvider token 运行时 API，
 * 主题主色在 antd.css 编译期固化为字面色（如 #1890ff）。要在运行时跟随「统一主题」换色，
 * 最务实的方式是注入一段覆盖样式，把主色相关的高频组件改为引用我们的 CSS 变量。
 *
 * 实现方式：覆盖样式按组件类别拆分为 bridges/antd/*.less（用 less 嵌套 + mixin 组织），
 * 本文件用 Vite `?inline` 把每个 .less 编译后的 CSS 读为字符串并按序拼接为 ANTD_THEME_CSS；
 * 由 injectStyle.ts 在 <head> 末尾注入单个 <style>（位于 antd.css 之后，同特异性下后加载胜）。
 * 全程引用 :root 的 CSS 变量，主题切换时由 applyTokensToRoot 刷新变量即可联动，无需重新注入。
 *
 * 为何用 .less 而非内联字符串：.less 文件享受完整 CSS 工具链（语法高亮 / lint / Prettier / HMR），
 * 开发者调整规则直接编辑对应 .less 即可，无需在巨型 TS 模板字符串里翻找。
 *
 * less 能力边界：主题色为运行时 var(--color-primary)，less 的编译期变量（@x）与颜色函数
 * （lighten / darken）对 var() 无效——.less 仅用嵌套与 mixin 组织代码，不能用 less 算颜色。
 *
 * 升级路径：未来迁移到 ant-design-vue v4/v5 后，可改用 ConfigProvider :theme="{ token }{}"，
 * 届时本目录可大幅精简，甚至仅保留 token 映射即可。
 */

// 各组件类别的覆盖样式（less 编译后以字符串形式引入）。
// 顺序即加载顺序：base 须最先（body 全局兜底）；其后各类别互无同选择器冲突，顺序可调。
import base from './antd/base.less?inline';
import buttons from './antd/buttons.less?inline';
import selection from './antd/selection.less?inline';
import navigation from './antd/navigation.less?inline';
import inputs from './antd/inputs.less?inline';
import feedback from './antd/feedback.less?inline';
import containers from './antd/containers.less?inline';
import picker from './antd/picker.less?inline';
import misc from './antd/misc.less?inline';

/**
 * antd v3 主题覆盖样式（由上述 .less 编译拼接而成）。
 * 由 injectStyle.ts 在挂载时注入一次，全程通过 CSS 变量自动响应主题变化。
 */
export const ANTD_THEME_CSS = [
  base,
  buttons,
  selection,
  navigation,
  inputs,
  feedback,
  containers,
  picker,
  misc,
].join('\n');
