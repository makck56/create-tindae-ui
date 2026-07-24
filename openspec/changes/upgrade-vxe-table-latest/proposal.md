## Why

The template still pins `vxe-table` to `4.3.7` while the current npm latest verified on 2026-07-24 is `4.20.7`. The version gap is large enough that the upgrade must be treated as a VXE integration compatibility change, not a simple dependency bump.

The template already relies on `vxe-grid` for generated list pages, theme preview, user management, role management, and cross-page selection. Keeping the table stack current reduces long-term maintenance risk, but the current integration uses internal VXE module paths, type paths, and CSS selectors that are likely to break across the upgrade.

## What Changes

- Upgrade the template dependency target from `vxe-table@4.3.7` and `xe-utils@^3.5.0` to the latest compatible v4 line, currently `vxe-table@4.20.7` and `xe-utils@^4.0.11`.
- Rework the VXE runtime registration strategy so it no longer depends on removed top-level deep paths such as `vxe-table/es/filter`, `vxe-table/es/checkbox`, `vxe-table/es/vxe-pager`, `vxe-table/es/vxe-modal`, and `vxe-table/es/tooltip`.
- Normalize VXE type imports away from fragile internal paths such as `vxe-table/types/grid` and `vxe-table/types/table`.
- Recalibrate the VXE theme bridge against the real `4.20.7` CSS structure before declaring the upgrade complete.
- Keep the existing scaffold behavior centered on `vxe-grid`, `proxyConfig`, pagination, sorting, checkbox selection, and theme integration.

## Capabilities

### New Capabilities

- `vxe-table-upgrade`: Covers the upgraded VXE dependency contract, runtime registration behavior, type compatibility, theme bridge validation, and regression requirements for generated table pages.

### Modified Capabilities

- None. There are no existing OpenSpec main specs under `openspec/specs/` to modify.

## Impact

- Dependencies:
  - `template/package.json`
  - `template/pnpm-lock.yaml`
- Runtime integration:
  - `template/src/core/plugins/vxeTable.ts`
  - `template/src/core/bootstrap/index.ts`
- Type and business integration:
  - `template/src/pages/user-management/features/user/composables/useUser.ts`
  - `template/src/pages/user-management/features/role/composables/useRoleList.ts`
  - `template/src/shared/components/cross-page-select/useCrossPageGrid.ts`
  - `template/src/shared/components/cross-page-select/CrossPageCheckboxHeader.vue`
  - `template/src/shared/components/cross-page-select/README.md`
- Visual integration:
  - `template/src/core/theme/bridges/vxeTable.ts`
  - `template/src/pages/theme-preview/features/theme-preview/components/VxeTableShowcase.section.vue`
- Generated output:
  - `template/scripts/templates/feature/view-list.vue.hbs`
  - `template/scripts/templates/feature/composable-list.ts.hbs`
  - scaffold docs and generated component type output if needed
- Validation:
  - `template` unit tests and build
  - root CLI tests and build
  - runtime smoke checks for user list, role list, theme preview, and cross-page selection
