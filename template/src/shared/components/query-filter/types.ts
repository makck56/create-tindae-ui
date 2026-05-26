export type FilterItemConfig =
  | {
      type: 'input' | 'select' | 'tree-select' | 'cascader' | 'date-picker';
      label?: string;
      name: string;
      fieldProps?: Record<string, any>;
    }
  | {
      type: 'date-range';
      label?: string;
      name: [string, string];
      fieldProps?: Record<string, any>;
    };
