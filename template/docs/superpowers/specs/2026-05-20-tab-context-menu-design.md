# Tab Context Menu & Custom Tag List

## Summary

Replace the antd `a-tabs` component with a custom horizontal tag list. Add a right-click context menu with refresh/close operations. Change tab identity from route name to route path to support multiple tabs for the same route (e.g. detail pages). Add visited-order tracking so closing a tab navigates to the previously visited tab.

## Design Decisions

- **Tab unique key**: `route.path` (includes params, excludes query). This allows `/order/123` and `/order/456` to be separate tabs while `_tabTitle` query param does not affect tab identity.
- **Dynamic tab title**: Passed via `router.push({ query: { _tabTitle: '...' } })`. Falls back to `route.meta.title`, then `route.name`.
- **Close navigation**: Tracks visit order in `visitedOrder: string[]`. On close, navigates to the most recently visited tab still in the tabs list. Fallback to `/`.
- **Context menu trigger**: `a-dropdown` with `trigger="['contextmenu']"`, wrapped around each tag element.
- **Visual style**: Pill/capsule tags. Active tag: `bg-primary text-white`. Inactive: `bg-gray-100 text-gray-700`. Hover highlight.

## Store Changes (`src/layouts/tab/tab.ts`)

### TabItem interface

```typescript
export interface TabItem {
  key: string;       // route.path — unique identifier
  name: string;      // route.name — for KeepAlive include matching
  path: string;      // route.fullPath — for navigation
  title: string;     // _tabTitle query ?? meta.title ?? route.name
  keepAlive: boolean;
}
```

### State changes

- `activeTab` — now stores `key` (route.path) instead of `route.name`
- New: `visitedOrder: string[]` — ordered list of tab keys by visit time (most recent last)

### addTab changes

- Use `route.path` as key for dedup (instead of `route.name`). Same route name with different params creates separate tabs.
- Title resolution: `route.query._tabTitle ?? route.meta.title ?? route.name`.
- Push key to `visitedOrder` (move to end if already present).

### closeTab changes

- Parameter changes from `name: string` to `key: string`.
- After removing tab, find navigation target by walking `visitedOrder` in reverse to find the first key still present in `tabs`. If none found, fallback to `/`.
- Clean removed key from `visitedOrder`.

### New actions

- `closeLeftTabs(key: string, router: Router)` — remove all tabs to the left of `key`. Activate `key`. Clean `visitedOrder`.
- `closeRightTabs(key: string, router: Router)` — remove all tabs to the right of `key`. Activate `key`. Clean `visitedOrder`.

### Existing action changes

- `closeOtherTabs(key: string)` — already exists, parameter changes from `name` to `key`. Clean `visitedOrder`.
- `closeAllTabs(router: Router)` — already exists. Clear `visitedOrder`.
- `refreshTab(key: string)` — parameter changes from `name` to `key`. KeepAlive exclusion uses the tab's `name` field.

### cachedNames getter

No change. Still returns `tab.name` values (route.name) for KeepAlive `include` matching. Multiple tabs for the same route share one KeepAlive cache instance.

## Component Changes (`src/layouts/tab/TabBar.vue`)

### Remove

- `a-tabs` with `editable-card` type
- Standalone refresh button

### Add: Custom tag list

Horizontal list of capsule-shaped tags. Each tag contains:
- Title text
- Close icon (×) — only shown when tabs count > 1

Layout:
```
┌─────────┐  ┌───────────────┐  ┌──────────┐
│ 首页    │  │ 订单 #123 详情×│  │ 用户管理 ×│
└─────────┘  └───────────────┘  └──────────┘
   ^active        ^inactive       ^inactive
```

- Active tag: filled background (primary color), white text
- Inactive tag: light gray background, dark text
- Hover: slightly darker background
- Close icon: appears on hover or always visible when tabs > 1
- Container: horizontal flex with overflow-x auto scroll

### Add: Right-click context menu

Wrapped in `a-dropdown` with `trigger="['contextmenu']"` per tag.

Menu items (5):

| Item | Action | Disabled when |
|------|--------|---------------|
| Refresh | `refreshTab(key)` | Tab is not keepAlive |
| Close | `closeTab(key, router)` | Only 1 tab remains |
| Close Left | `closeLeftTabs(key, router)` | No tabs to the left |
| Close Right | `closeRightTabs(key, router)` | No tabs to the right |
| Close Others | `closeOtherTabs(key)` | Only 1 tab remains |

After "Close Left/Right/Others", the right-clicked tab stays active.
After "Close", navigates to the previously visited tab via `visitedOrder`.

## Files Changed

| File | Change |
|------|--------|
| `src/layouts/tab/tab.ts` | TabItem interface, store state/actions/getters |
| `src/layouts/tab/TabBar.vue` | Replace a-tabs with custom tag list + dropdown menu |

## Files Unchanged

- `Default.layout.vue` — KeepAlive `:include` binds to `cachedNames` which still returns route names
- Route configuration — no changes; `_tabTitle` is passed by callers as needed
