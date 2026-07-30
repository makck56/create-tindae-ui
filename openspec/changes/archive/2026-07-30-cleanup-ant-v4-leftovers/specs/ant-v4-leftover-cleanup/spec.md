## ADDED Requirements

### Requirement: Remove obsolete Ant v3 theme bridge code
The template SHALL NOT keep empty Ant v3 CSS bridge modules after Ant Design Vue v4 token mapping has become the active Ant theme integration path.

#### Scenario: Ant CSS bridge no longer exists as an empty runtime import
- **WHEN** the template source is inspected after cleanup
- **THEN** `template/src/core/theme/bridges/antd.ts` MUST NOT remain as an empty `ANTD_THEME_CSS` export
- **AND** `injectStyle.ts` MUST NOT import `ANTD_THEME_CSS`
- **AND** `injectStyle.ts` MUST continue to inject `VXE_THEME_CSS`

### Requirement: Remove unused Less integration from the template
The template SHALL NOT declare or install Less support solely for deleted Ant v3 theme override files.

#### Scenario: Less support is absent when no source consumes it
- **WHEN** active template source contains no `*.less` or `*.less?inline` imports
- **THEN** `template/package.json` MUST NOT include `less` only for the removed Ant bridge
- **AND** `template/env.d.ts` MUST NOT declare `*.less?inline`
- **AND** `template/pnpm-lock.yaml` MUST be refreshed so the dependency graph reflects the package change

### Requirement: Document Ant v4 token-based theming
Generated template documentation SHALL describe Ant Design Vue v4 theming through `ConfigProvider` token mapping rather than the old v3 Less override workflow.

#### Scenario: Theme guide reflects the current Ant theme path
- **WHEN** `template/theme.md` is inspected after cleanup
- **THEN** it MUST describe `bridges/antDesignVue.ts` and root `a-config-provider` theme usage as the Ant integration path
- **AND** it MUST NOT instruct developers to edit deleted `bridges/antd/*.less` files

#### Scenario: Template agent guidance reflects the current Ant theme path
- **WHEN** `template/AGENTS.md` is inspected after cleanup
- **THEN** it MUST point Ant theme changes to `bridges/antDesignVue.ts` or documented local fallback CSS
- **AND** it MUST NOT point maintainers to deleted Ant v3 Less bridge files

### Requirement: Cleanup remains behavior-preserving
The cleanup SHALL preserve the Ant v4 runtime behavior delivered by the previous upgrade.

#### Scenario: Existing validation still passes
- **WHEN** cleanup is complete
- **THEN** root scaffold tests MUST pass
- **AND** root CLI build MUST pass
- **AND** template tests MUST pass
- **AND** template production build MUST pass
