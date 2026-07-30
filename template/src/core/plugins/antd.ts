// Ant Design Vue v4 使用 CSS-in-JS 注入组件样式，不能再引入 v3 全量编译样式表。
// reset.css 只负责基础浏览器样式归一化；组件主题由 App.vue 的 ConfigProvider token 接管。
import 'ant-design-vue/dist/reset.css';
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
