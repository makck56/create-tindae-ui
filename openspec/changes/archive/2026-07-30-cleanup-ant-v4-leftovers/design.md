## Context

The Ant Design Vue v4 migration replaced the old v3 selector-heavy Less bridge with `ConfigProvider` token mapping in `template/src/core/theme/bridges/antDesignVue.ts`. The runtime style injector still imports an empty `ANTD_THEME_CSS` value from `bridges/antd.ts`, and template metadata still contains the old `*.less?inline` declaration plus the `less` dev dependency.

The template docs also still describe `ant-design-vue@^3.2`, `antd.css`, and `bridges/antd/*.less` as the active theme path. That guidance is now wrong and can cause future maintainers to reintroduce v3-era override files.

## Goals / Non-Goals

**Goals:**
- Remove obsolete Ant v3/Less bridge code and dependency declarations.
- Keep VXE Table CSS variable fallback injection intact.
- Update template theme documentation and template-level agent guidance to describe the v4 token mapping path.
- Add focused regression checks so empty Ant bridge code and old Less guidance do not come back unnoticed.

**Non-Goals:**
- Do not change the Ant Design Vue version again.
- Do not redesign the theme system or layout visuals.
- Do not remove VXE, Tailwind, ECharts, or their theme bridges.
- Do not archive `upgrade-ant-design-vue-v4` as part of this cleanup unless explicitly requested later.

## Decisions

### Decision 1: Delete the empty Ant CSS bridge instead of keeping an extension point

`template/src/core/theme/bridges/antd.ts` currently exports an empty string only to satisfy `injectStyle.ts`. Keeping a file for a hypothetical fallback makes the actual theme path less clear. If a future v4-specific CSS fallback is needed, it should be introduced with a concrete name and documented reason at that time.

Alternative considered: keep the empty bridge as a placeholder. Rejected because it is indistinguishable from dead code and encourages new selector overrides before proving a real gap.

### Decision 2: Keep the style injector but narrow it to VXE

`injectThemeOverrideStyles()` is still needed because `VXE_THEME_CSS` provides runtime CSS variable overrides for VXE Table and vxe-pc-ui surfaces. The cleanup should remove Ant from that pipeline without deleting the injector itself.

Alternative considered: delete the injector entirely. Rejected because it would break VXE theme coupling.

### Decision 3: Remove Less support only after source references are gone

The Ant v4 migration already removed `bridges/antd/*.less`; current active source no longer imports `*.less?inline`. Therefore the `less` dev dependency and the ambient module declaration can be removed together, with lockfile refresh and build/test validation.

Alternative considered: keep `less` for future customization. Rejected because no current template source consumes it, and future Less usage can add the dependency when it becomes real again.

### Decision 4: Update docs rather than delete `theme.md`

`template/theme.md` is still part of the generated project documentation and is linked from README and the in-app readme viewer. The file should stay, but its Ant section must describe v4 ConfigProvider token mapping instead of v3 Less overrides.

Alternative considered: delete `theme.md`. Rejected because it is a user-facing guide for the template theme system.

## Risks / Trade-offs

- Removing `less` could break hidden `.less` imports if the search missed one -> Mitigation: run static search plus template build.
- Simplifying `injectStyle.ts` could accidentally stop VXE overrides -> Mitigation: keep `VXE_THEME_CSS` import and run template tests/build.
- Updating Chinese docs can suffer terminal encoding display noise -> Mitigation: patch files as UTF-8 and verify targeted strings with search rather than relying on garbled console rendering.
