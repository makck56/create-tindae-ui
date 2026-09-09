export interface MenuItem {
  label: string;
  code?: string;
  routeName?: string;
  /**
   * 菜单图标名（@ant-design/icons-vue 组件名字符串）。
   *
   * 菜单树经 /user/info 接口下发，只能承载可序列化的字符串，
   * 前端在 menuIcons.ts 的白名单注册表中把名字解析为组件。
   * 根级菜单未配置或名字未知时，侧边栏会回退默认图标——
   * antd 折叠态依赖 icon 才能隐藏文字（`.ant-menu-item-icon + span { opacity: 0 }`），
   * 没有 icon 的根级菜单收缩后文字会被裁切。
   */
  icon?: string;
  children?: MenuItem[];
}

export type MenuConfig = MenuItem[];
