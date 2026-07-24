## ADDED Requirements

### Requirement: Template dependency stack is upgraded to the latest verified VXE v4 line
The template SHALL use the latest verified compatible VXE v4 dependency set for this change: `vxe-table@4.20.7` and `xe-utils@^4.0.11`.

#### Scenario: Dependency manifest reflects the upgrade target
- **WHEN** `template/package.json` is inspected after implementation
- **THEN** it MUST declare `vxe-table` as `4.20.7` or a deliberately approved patch-compatible `~4.20.7`
- **AND** it MUST declare `xe-utils` as `^4.0.11` or a deliberately approved compatible range

#### Scenario: Lockfile is consistent with the manifest
- **WHEN** template dependencies are installed after implementation
- **THEN** `template/pnpm-lock.yaml` MUST resolve `vxe-table` to the selected upgrade target
- **AND** it MUST resolve `xe-utils` to a v4 compatible version

### Requirement: Runtime registration avoids removed VXE deep paths
The VXE plugin SHALL avoid importing VXE modules from deep paths that are absent from the `vxe-table@4.20.7` package file list.

#### Scenario: Removed paths are not used
- **WHEN** `template/src/core/plugins/vxeTable.ts` is inspected after implementation
- **THEN** it MUST NOT import from `vxe-table/es/filter`
- **AND** it MUST NOT import from `vxe-table/es/checkbox`
- **AND** it MUST NOT import from `vxe-table/es/vxe-pager`
- **AND** it MUST NOT import from `vxe-table/es/vxe-modal`
- **AND** it MUST NOT import from `vxe-table/es/tooltip`

#### Scenario: Components required by the template are available at runtime
- **WHEN** the generated admin app renders list pages after implementation
- **THEN** `vxe-grid`, checkbox selection, pagination, sorting, modal, and tooltip behavior used by the template MUST be available without Vue unknown-component warnings

### Requirement: VXE query and grid behavior remains compatible
The upgrade SHALL preserve the existing `vxe-grid` data flow based on `proxyConfig`, list query functions, pagination, sorting, and checkbox selection.

#### Scenario: Search triggers VXE proxy query
- **WHEN** a user triggers search or reset in `UserList`
- **THEN** the grid MUST call `commitProxy('query')` without throwing `getCheckedFilters is not a function`

#### Scenario: Generated list pages keep the grid contract
- **WHEN** a feature list page is generated from the scaffold templates
- **THEN** the generated view MUST still render a `vxe-grid`
- **AND** the generated composable MUST still provide `gridOptions` with `columns`, `pagerConfig`, and `proxyConfig.ajax.query`

### Requirement: VXE type usage is decoupled from unstable internal paths
The upgraded template SHALL avoid depending on internal VXE type paths that are not part of the stable package root contract.

#### Scenario: Internal type paths are removed
- **WHEN** `template/src` is searched for VXE type imports after implementation
- **THEN** it MUST NOT import from `vxe-table/types/grid`
- **AND** it MUST NOT import from `vxe-table/types/table`

#### Scenario: Cross-page selection remains typed
- **WHEN** TypeScript checks `useCrossPageGrid`
- **THEN** checkbox change handlers, checkbox-all handlers, and grid checkbox methods MUST have explicit types or narrow local interfaces
- **AND** the implementation MUST NOT use broad `any` as the primary type strategy for the grid integration

### Requirement: Theme bridge is validated against VXE 4.20.7
The upgrade SHALL recalibrate VXE theme bridge selectors against the real `vxe-table@4.20.7` DOM and CSS structure before completion.

#### Scenario: Theme preview verifies VXE visual states
- **WHEN** `ThemePreview` renders the VXE showcase after implementation
- **THEN** table header background, border lines, hover row, current row, checked row, active sort icon, active pager item, and checkbox color MUST follow the template theme tokens

#### Scenario: Theme bridge comments name the verified VXE version
- **WHEN** `template/src/core/theme/bridges/vxeTable.ts` is inspected after implementation
- **THEN** its leading documentation MUST reference `vxe-table@4.20.7` or the final selected upgraded version as the verified CSS baseline

### Requirement: Upgrade passes build and test gates
The upgrade SHALL pass the template and root validation gates before being considered complete.

#### Scenario: Template validation passes
- **WHEN** `cd template && pnpm test` is run
- **THEN** all template tests MUST pass
- **WHEN** `cd template && pnpm build` is run
- **THEN** the template build MUST pass

#### Scenario: Root validation passes
- **WHEN** root `pnpm test` is run
- **THEN** all scaffold CLI tests MUST pass
- **WHEN** root `pnpm build` is run
- **THEN** the CLI build MUST pass
