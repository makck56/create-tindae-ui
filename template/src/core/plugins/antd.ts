// Ant Design Vue 基础样式（antd v3 的字面色主色在此固化）。
// 运行时主题（主色随品牌预设 / 亮暗模式联动）由 core/theme 统一接管：
//   - core/theme/bridges/antd.ts 注入覆盖样式，把主色高频组件改为引用 var(--color-primary)；
//   - core/theme 在 app.mount 前通过 setupTheme() 注入，全程靠 CSS 变量驱动。
// 因此本文件只保留「引入 antd.css + dayjs 中文 locale」，不再放置任何配色覆盖。
import 'ant-design-vue/dist/antd.css';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 组件文案中文化：在 App.vue 通过 <a-config-provider :locale="zhCN"> 统一注入，
// 覆盖分页 / 表格空状态 / 确认弹窗按钮 / DatePicker / TimePicker / Calendar 等组件文案。
//
// dayjs 中文 locale：DatePicker / TimePicker / Calendar 的月份、星期文案由 dayjs 控制，
// antd 的 ConfigProvider 管不到。dayjs 虽是 antd 的依赖，但 pnpm 严格隔离不会 hoist 到顶层
// node_modules，业务代码必须显式声明（见 package.json 的 dayjs 依赖）才能 import。
// 这里统一注入中文 locale，避免日期组件出现英文月份 / 星期。
dayjs.locale('zh-cn');
