import type { Ref } from 'vue';

export const SELECTION_NONE = 'none' as const;
export const SELECTION_CURRENT_PAGE = 'currentPage' as const;
export const SELECTION_ALL_PAGES = 'allPages' as const;

export type SelectionMode =
  | typeof SELECTION_NONE
  | typeof SELECTION_CURRENT_PAGE
  | typeof SELECTION_ALL_PAGES;

export type SelectionState =
  | { mode: typeof SELECTION_NONE }
  | { mode: typeof SELECTION_CURRENT_PAGE; selectedIds: Set<string> }
  | { mode: typeof SELECTION_ALL_PAGES; excludedIds: Set<string> };

export interface UseCrossPageSelectOptions<T = any> {
  rowKey: string;
  total: Ref<number>;
  checkableTotal?: Ref<number>;
  data: Ref<T[]>;
  isDisabled?: (row: T) => boolean;
}

export type SelectionPayload =
  | { selectAll: true; excludedIds: string[] }
  | { selectAll: false; selectedIds: string[] };

export function isCurrentPageMode(
  state: SelectionState,
): state is { mode: typeof SELECTION_CURRENT_PAGE; selectedIds: Set<string> } {
  return state.mode === SELECTION_CURRENT_PAGE;
}

export function isAllPagesMode(
  state: SelectionState,
): state is { mode: typeof SELECTION_ALL_PAGES; excludedIds: Set<string> } {
  return state.mode === SELECTION_ALL_PAGES;
}
