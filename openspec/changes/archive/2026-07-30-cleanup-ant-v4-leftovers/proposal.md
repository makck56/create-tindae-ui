## Why

Ant Design Vue has been upgraded to v4, but the template still contains a few v3-era leftovers: an empty Ant CSS bridge, a Less inline type declaration, the `less` dev dependency, and documentation that still tells developers to edit deleted `bridges/antd/*.less` files. These leftovers increase maintenance cost and can lead future changes back to the removed v3 selector-override model.

## What Changes

- Remove the empty `template/src/core/theme/bridges/antd.ts` bridge and simplify the runtime style injector to only inject still-needed VXE CSS overrides.
- Remove the obsolete `*.less?inline` ambient module declaration and the `less` dev dependency from the template dependency graph.
- Refresh `template/theme.md` so the theme architecture describes Ant Design Vue v4 ConfigProvider token mapping instead of the old v3 Less override bridge.
- Refresh `template/AGENTS.md` guidance so future Ant theme edits point to `bridges/antDesignVue.ts` or local component fallback CSS, not deleted `.less` files.
- Keep existing Ant v4 runtime behavior unchanged: ConfigProvider token mapping remains the primary Ant theme integration path, and VXE CSS variable overrides continue to be injected once.

## Capabilities

### New Capabilities
- `ant-v4-leftover-cleanup`: Defines the cleanup contract for removing obsolete Ant v3/Less leftovers after the Ant Design Vue v4 migration.

### Modified Capabilities
- None.

## Impact

- Affected source files: `template/src/core/theme/bridges/injectStyle.ts`, `template/src/core/theme/bridges/antd.ts`, and `template/env.d.ts`.
- Affected dependencies: `template/package.json` and `template/pnpm-lock.yaml`.
- Affected documentation: `template/theme.md` and `template/AGENTS.md`.
- Affected validation: template tests/build and root scaffold tests/build should continue to pass; static searches should confirm that active source no longer references `ANTD_THEME_CSS`, `*.less?inline`, or `bridges/antd/*.less`.
