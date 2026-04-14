export interface MenuItem {
  label: string;
  code?: string;
  routeName?: string;
  children?: MenuItem[];
}

export type MenuConfig = MenuItem[];
