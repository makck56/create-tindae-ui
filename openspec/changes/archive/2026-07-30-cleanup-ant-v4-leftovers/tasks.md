## 1. Baseline Checks

- [x] 1.1 Inspect active template references for `ANTD_THEME_CSS`, `bridges/antd/*.less`, `*.less?inline`, and `less`.
- [x] 1.2 Confirm existing unrelated dirty files are not part of this cleanup scope.

## 2. Source Cleanup

- [x] 2.1 Delete the empty `template/src/core/theme/bridges/antd.ts` bridge.
- [x] 2.2 Simplify `template/src/core/theme/bridges/injectStyle.ts` so it only injects `VXE_THEME_CSS`.
- [x] 2.3 Remove obsolete `*.less?inline` declaration from `template/env.d.ts`.

## 3. Dependency Cleanup

- [x] 3.1 Remove `less` from `template/package.json`.
- [x] 3.2 Refresh `template/pnpm-lock.yaml` after dependency removal.

## 4. Documentation Cleanup

- [x] 4.1 Update `template/theme.md` to document Ant Design Vue v4 ConfigProvider token mapping.
- [x] 4.2 Update `template/AGENTS.md` to remove the deleted `bridges/antd/*.less` editing guidance.

## 5. Regression Guards

- [x] 5.1 Update scaffold cleanup contract tests to reject obsolete Ant v3/Less bridge references in active template source and docs.
- [x] 5.2 Run static searches to confirm active source no longer references the removed Ant bridge or Less inline contract.

## 6. Validation

- [x] 6.1 Run root `pnpm test`.
- [x] 6.2 Run root `pnpm run build`.
- [x] 6.3 Run template `pnpm test`.
- [x] 6.4 Run template `pnpm run build`.
- [x] 6.5 Restore generated `template/src/shared/constants/routeNames.ts` timestamp noise before staging.
- [x] 6.6 Run `openspec validate cleanup-ant-v4-leftovers --strict`.
- [x] 6.7 Review final diff scope and confirm unrelated `.gitignore` / root `AGENTS.md` changes remain unstaged.
