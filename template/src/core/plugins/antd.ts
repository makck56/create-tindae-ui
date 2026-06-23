// Ant Design Vue 基础样式（antd v3 的字面色主色在此固化）。
// 运行时主题（主色随品牌预设 / 亮暗模式联动）由 core/theme 统一接管：
//   - core/theme/bridges/antd.ts 注入覆盖样式，把主色高频组件改为引用 var(--color-primary)；
//   - core/theme 在 app.mount 前通过 setupTheme() 注入，全程靠 CSS 变量驱动。
// 因此本文件只保留「引入 antd.css + i18n 说明」，不再放置任何配色覆盖。
import 'ant-design-vue/dist/antd.css';

// 组件文案中文化：在 App.vue 通过 <a-config-provider :locale="zhCN"> 统一注入，
// 覆盖分页 / 表格空状态 / 确认弹窗按钮 / DatePicker / TimePicker / Calendar 等组件文案。
//
// 补充说明：若使用 DatePicker 时发现月份/星期仍为英文，需显式安装 dayjs（antd 的日期底层依赖）
// 并设置其 locale——dayjs 虽是 antd 的依赖，但 pnpm 严格隔离不会 hoist 到顶层 node_modules，
// 业务代码必须显式声明才能 import：
//   pnpm add dayjs
//   import dayjs from 'dayjs';
//   import 'dayjs/locale/zh-cn';
//   dayjs.locale('zh-cn');
