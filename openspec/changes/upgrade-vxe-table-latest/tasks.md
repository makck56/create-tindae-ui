## 1. Dependency Probe

- [ ] 1.1 Confirm the final target versions with `npm view vxe-table version` and `npm view xe-utils version`.
- [ ] 1.2 Update `template/package.json` to the selected `vxe-table` and `xe-utils` versions.
- [ ] 1.3 Refresh `template/pnpm-lock.yaml` with `cd template && pnpm install`.
- [ ] 1.4 Run `cd template && pnpm test` and capture the first compatibility failures.
- [ ] 1.5 Run `cd template && pnpm build` and capture import/type/build failures.

## 2. Runtime Registration Compatibility

- [ ] 2.1 Replace removed VXE deep imports in `template/src/core/plugins/vxeTable.ts`.
- [ ] 2.2 Preserve Chinese locale setup for VXE.
- [ ] 2.3 Register every VXE component used by current pages and generated templates.
- [ ] 2.4 Choose one stable style import strategy and remove obsolete component style imports.
- [ ] 2.5 Re-run `cd template && pnpm build` to verify import compatibility.

## 3. Type Compatibility

- [ ] 3.1 Replace `vxe-table/types/grid` imports in cross-page selection code and docs.
- [ ] 3.2 Replace `vxe-table/types/table` imports in cross-page selection code and docs.
- [ ] 3.3 Verify or replace `VxeGridInstance` usage in user and role composables.
- [ ] 3.4 Add narrow local interfaces where public VXE exports do not provide stable types.
- [ ] 3.5 Re-run `cd template && pnpm test` and `cd template && pnpm build`.

## 4. Behavior Regression

- [ ] 4.1 Verify `UserList` renders, searches, resets, paginates, sorts, and deletes with reload.
- [ ] 4.2 Verify `RoleList` renders, paginates, sorts, and deletes with expected grid behavior.
- [ ] 4.3 Verify `CrossPageCheckboxHeader` renders and handles current-page and all-page selection.
- [ ] 4.4 Verify scaffold-generated feature list output still uses `vxe-grid` and `gridOptions` correctly.
- [ ] 4.5 Verify there are no Vue unknown-component warnings for VXE components used by the template.

## 5. Theme Bridge Recalibration

- [ ] 5.1 Inspect `vxe-table@4.20.7` rendered DOM/CSS for table, header, body, footer, pager, checkbox, and sort elements.
- [ ] 5.2 Update `template/src/core/theme/bridges/vxeTable.ts` selectors only where the new verified structure differs.
- [ ] 5.3 Update the bridge comments to name the final verified VXE version.
- [ ] 5.4 Verify `ThemePreview` VXE showcase follows theme tokens across header, borders, hover, current, checked, sort, pager, and checkbox states.

## 6. Final Gates

- [ ] 6.1 Run `cd template && pnpm test`.
- [ ] 6.2 Run `cd template && pnpm build`.
- [ ] 6.3 Run root `pnpm test`.
- [ ] 6.4 Run root `pnpm build`.
- [ ] 6.5 Review the final diff to ensure dependency changes, compatibility fixes, and theme recalibration are scoped to this OpenSpec change.
