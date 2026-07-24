## Context

Current state verified on 2026-07-24:

| Area | Current State | Upgrade Concern |
|---|---|---|
| Dependencies | `vxe-table: 4.3.7`, `xe-utils: ^3.5.0` | Latest verified as `vxe-table@4.20.7`, `xe-utils@4.0.11` |
| Runtime registration | `template/src/core/plugins/vxeTable.ts` imports many `vxe-table/es/*` modules directly | `npm pack vxe-table@4.20.7 --dry-run` shows `es/grid`, `es/table`, `es/column`, `es/toolbar`, but not old top-level `es/filter`, `es/checkbox`, `es/vxe-pager`, `es/vxe-modal`, or `es/tooltip` paths |
| Type imports | Uses `VxeGridInstance` from package root and `vxe-table/types/grid`, `vxe-table/types/table` | Package file list shows only `types/index.d.ts` and `types/all.d.ts`; internal type paths should be considered unstable |
| Theme bridge | `template/src/core/theme/bridges/vxeTable.ts` is explicitly written for `vxe-table@4.3.7` CSS | `4.20.7` includes larger `es/table/style.css` and theme files, so selectors must be rechecked |
| Business usage | `vxe-grid` powers user list, role list, generated list templates, and theme preview | Existing behavior must remain stable after import/type/style changes |

The upgrade has three moving parts:

```text
Dependency version
      |
      v
Runtime registration -----> Business grid behavior
      |                           |
      v                           v
Style import + theme bridge --> Visual regression
```

## Goals / Non-Goals

**Goals:**

- Upgrade the template to `vxe-table@4.20.7` and `xe-utils@^4.0.11`.
- Keep the generated admin template on Vue 3, Vite, Ant Design Vue 3, Tailwind, and `vxe-grid`.
- Preserve list page behavior: proxy query, pagination, sorting, checkbox selection, and delete refresh.
- Preserve the theme system contract where VXE visual tokens are driven by `core/theme`.
- Produce a verification path that can prove build, unit tests, runtime behavior, and visual theme behavior.

**Non-Goals:**

- Do not migrate the whole table stack to `vxe-pc-ui` in this change.
- Do not redesign list-page data flow or replace `proxyConfig`.
- Do not rewrite cross-page selection UX beyond what the upgrade requires.
- Do not treat old docs in `docs/superpowers/*` as canonical if they conflict with this OpenSpec change.

## Decisions

### Decision 1: Upgrade as a compatibility change, not a dependency-only change

Rationale: The current code depends on internal module paths, internal type paths, and CSS internals. `vxe-table@4.20.7` still ships some familiar ES paths, but the old registration list is no longer structurally valid as-is.

Alternative considered: only change `package.json` and lockfile. Rejected because `es/filter`, `es/checkbox`, `es/vxe-pager`, `es/vxe-modal`, and `es/tooltip` are not visible in the `4.20.7` package file list.

### Decision 2: Prefer a stable VXE install path for runtime registration

The implementation should first try a stable import strategy:

- Import the root VXE installer/config object from `vxe-table`.
- Import global or component CSS from stable published paths such as `vxe-table/es/style.css` or `vxe-table/es/index.css`.
- Register the components needed by the template through the supported installer surface.

If bundle size or tree-shaking becomes unacceptable, add a second pass to selectively import currently shipped modules such as `vxe-table/es/grid`, `vxe-table/es/table`, `vxe-table/es/column`, and `vxe-table/es/toolbar`. This second pass must not rely on removed deep paths.

### Decision 3: Keep `@vxe-ui/core` out of the first upgrade unless compilation requires it

`@vxe-ui/core@4.4.18` depends on `xe-utils@^4.0.11` and is part of the newer VXE ecosystem. It should be treated as a compatibility dependency only if `vxe-table@4.20.7` or official imports require it in practice.

Rationale: Adding `@vxe-ui/core` as an explicit dependency expands the template surface and may start a broader ecosystem migration. This change's target is to keep the current `vxe-grid` template stable on the latest `vxe-table` v4.

### Decision 4: Rebuild type imports around public exports

Internal type paths should be replaced with package-root type exports where available. If the exact old types are not exported, define narrow local aliases for the methods the template actually uses, especially for:

- `commitProxy('query')`
- `clearCheckboxRow()`
- `setCheckboxRow(rows, true)`
- checkbox event payloads consumed by cross-page selection

Rationale: The template does not need the full VXE internal constructor shape. Narrow local types reduce future coupling.

### Decision 5: Treat theme bridge recalibration as a required phase

The upgrade is not complete until `template/src/core/theme/bridges/vxeTable.ts` is checked against `vxe-table@4.20.7` rendered DOM and CSS.

The implementation should verify:

- Main table container classes
- Header/body/footer column classes
- Pager classes
- Checkbox icon classes
- Sort active classes
- Border rendering method, especially `background-image: linear-gradient(...)`
- Hover/current/checked row state classes

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Root installer increases `vendor-vxe` chunk size | Measure build output first; only optimize import granularity after behavior is stable |
| Public type exports do not match old internal types | Use narrow local interfaces for the methods and event fields actually consumed |
| Theme selectors silently stop matching | Use `ThemePreview` as the visual smoke page and inspect rendered DOM/CSS after the upgrade |
| `commitProxy('query')` behavior changes | Add runtime smoke checks for search, reset, pagination, and reload paths |
| Cross-page checkbox header breaks | Validate `VxeCheckbox` import/rendering and consider using globally registered `<vxe-checkbox>` or a local wrapper if direct import changes |
| Existing dirty worktree obscures upgrade diff | Keep this OpenSpec change separate and avoid reverting unrelated existing changes |

## Migration Plan

1. Dependency probe:
   - Update `template/package.json` and lockfile.
   - Run `pnpm install` inside `template`.
   - Run `pnpm test` and `pnpm build` to collect first-break errors.

2. Runtime registration:
   - Replace removed deep imports in `template/src/core/plugins/vxeTable.ts`.
   - Preserve Chinese locale setup.
   - Confirm VXE components used by templates are registered before app mount.

3. Type compatibility:
   - Replace `vxe-table/types/*` imports.
   - Replace or narrow `VxeGridInstance`, `VxeGridConstructor`, and event payload types.

4. Behavior regression:
   - Validate `UserList`, `RoleList`, `VxeTableShowcase`, and generated list template behavior.
   - Verify search/reset calls still trigger `commitProxy('query')`.
   - Verify checkbox selection, checkbox-all, sort, pagination, and delete refresh.

5. Theme recalibration:
   - Compare the rendered `4.20.7` DOM/CSS to the theme bridge selectors.
   - Update selectors only after confirming the new source of truth.

6. Final gates:
   - `cd template && pnpm test`
   - `cd template && pnpm build`
   - root `pnpm test`
   - root `pnpm build`

Rollback is a normal revert of the dependency and compatibility commits. The implementation should keep dependency changes and compatibility fixes easy to separate in review.

## Open Questions

- Does `vxe-table@4.20.7` root installation register every component the template uses, including pager, checkbox, modal, and tooltip?
- Does the package root still export `VxeGridInstance`, `VxeGridConstructor`, and `VxeTableDefines`, or should the implementation use narrow local types?
- Does `vxe-table/es/style.css` include all styles currently imported component-by-component?
- Should the final dependency pin be exact `4.20.7` or patch-compatible `~4.20.7`? For this template, `~4.20.7` is acceptable only after the first verified upgrade passes.
