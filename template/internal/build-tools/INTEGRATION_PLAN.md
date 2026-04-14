# vite-plugin-route-names 整合方案设计

## 1. 概述

本方案将检查和修复功能完全整合到 `vite-plugin-route-names` 插件中，使用 `@vue/compiler-sfc` 替代正则表达式解析 Vue 文件，并移除独立脚本。

## 2. 插件 API 设计

### 2.1 插件配置选项

```typescript
interface RouteNamesPluginOptions {
  // 输出文件路径 (默认: "src/shared/constants/routeNames.ts")
  outputFile?: string;
  
  // 是否启用一致性检查 (默认: true)
  enableCheck?: boolean;
  
  // 是否启用自动修复 (默认: false)
  enableFix?: boolean;
  
  // 检查失败时是否抛出错误 (默认: false)
  strict?: boolean;
  
  // 自定义文件匹配模式
  routeFilePattern?: string | string[];
}
```

### 2.2 导出函数

```typescript
// 插件主函数
export function autoRoutesPlugin(options?: RouteNamesPluginOptions): Plugin;

// 检查路由名称一致性
export function runConsistencyCheck(options?: RouteNamesPluginOptions): ConsistencyCheckReport;

// 修复路由名称不一致
export function runRouteNamesFix(options?: RouteNamesPluginOptions): FixReport;

// CLI 入口函数
export function runCli(args: string[]): Promise<void>;
```

## 3. 文件结构设计

```
internal/build-tools/src/plugins/vite-plugin-route-names/
├── index.ts                    # 插件入口，导出所有公共 API
├── plugin.ts                   # Vite 插件实现
├── generator.ts                # 路由名称常量生成逻辑
├── checker.ts                  # 一致性检查逻辑 (使用 @vue/compiler-sfc)
├── fixer.ts                    # 自动修复逻辑 (使用 @vue/compiler-sfc)
├── parser.ts                   # Vue 文件解析器 (使用 @vue/compiler-sfc)
├── scanner.ts                  # 路由文件扫描器 (TypeScript AST)
├── types.ts                    # 类型定义
└── cli.ts                      # CLI 命令行接口
```

## 4. 关键模块设计

### 4.1 Vue 文件解析器 (parser.ts)

使用 `@vue/compiler-sfc` 替代正则表达式：

```typescript
import { parse } from '@vue/compiler-sfc';

interface ParsedScriptSetup {
  hasDefineOptions: boolean;
  componentName: string | null;
  scriptContent: string;
  importEndLine: number;
}

export function parseVueFile(content: string): ParsedScriptSetup | null {
  const { descriptor } = parse(content);
  
  if (!descriptor.scriptSetup) {
    return null;
  }
  
  const scriptContent = descriptor.scriptSetup.content;
  
  // 使用 AST 或更精确的方式查找 defineOptions
  const defineOptionsMatch = findDefineOptions(scriptContent);
  
  return {
    hasDefineOptions: !!defineOptionsMatch,
    componentName: defineOptionsMatch?.name || null,
    scriptContent,
    importEndLine: findLastImportLine(scriptContent),
  };
}
```

### 4.2 检查器 (checker.ts)

```typescript
export function checkRouteNameConsistency(
  options: RouteNamesPluginOptions
): ConsistencyCheckReport {
  const routes = scanRouteFiles(options);
  const results: ComponentCheckResult[] = [];
  
  for (const route of routes) {
    const parsed = parseVueFile(route.pageContent);
    const isMatch = parsed?.componentName === route.name;
    
    results.push({
      pagePath: route.pagePath,
      routeName: route.name,
      componentName: parsed?.componentName || null,
      hasDefineOptions: parsed?.hasDefineOptions || false,
      isMatch,
    });
  }
  
  return generateReport(results);
}
```

### 4.3 修复器 (fixer.ts)

```typescript
export function fixRouteNames(options: RouteNamesPluginOptions): FixReport {
  const routes = scanRouteFiles(options);
  const results: FixResult[] = [];
  
  for (const route of routes) {
    const parsed = parseVueFile(route.pageContent);
    
    if (!parsed || parsed.isMatch) continue;
    
    const newContent = injectDefineOptions(
      route.pageContent,
      route.name,
      parsed
    );
    
    // 写入文件
    fs.writeFileSync(route.pagePath, newContent, 'utf-8');
    
    results.push({
      filePath: route.pagePath,
      routeName: route.name,
      action: parsed.hasDefineOptions ? 'replace' : 'inject',
    });
  }
  
  return generateFixReport(results);
}
```

### 4.4 CLI 接口

```typescript
export async function runCli(args: string[]): Promise<void> {
  const command = args[0] || 'check';
  
  switch (command) {
    case 'check':
      const report = await runConsistencyCheck();
      if (report.unmatched > 0) {
        process.exit(1);
      }
      break;
      
    case 'fix':
      const dryRun = !args.includes('--fix');
      const fixReport = await runRouteNamesFix({ dryRun });
      // ... 输出结果
      break;
      
    case 'generate':
      await generateNames();
      break;
      
    default:
      console.error('Unknown command:', command);
      process.exit(1);
  }
}
```

## 5. CLI 使用方式

### 5.1 通过 bin 命令

在 `package.json` 中添加：

```json
{
  "bin": {
    "route-names": "./dist/cli.js"
  }
}
```

使用方式：

```bash
# 检查一致性
npx route-names check
npx route-names check --json

# 修复不一致
npx route-names fix --dry     # 预览
npx route-names fix --fix     # 执行修复

# 仅生成常量文件
npx route-names generate
```

### 5.2 通过 npm scripts

```json
{
  "scripts": {
    "check:route-names": "route-names check",
    "fix:route-names": "route-names fix --fix",
    "generate:route-names": "route-names generate"
  }
}
```

### 5.3 直接导入使用

```typescript
import { 
  runConsistencyCheck, 
  runRouteNamesFix 
} from '@internal/build-tools';

// 检查
const report = await runConsistencyCheck();

// 修复
const fixReport = await runRouteNamesFix({ dryRun: false });
```

## 6. 迁移路径

### 6.1 阶段 1: 添加新依赖和重构

1. 添加 `@vue/compiler-sfc` 到 build-tools
2. 创建新的文件结构 (不删除旧代码)
3. 使用 `@vue/compiler-sfc` 重写解析逻辑

### 6.2 阶段 2: 向后兼容的导出

保持现有导出，添加新导出：

```typescript
// 旧导出 (保持兼容)
export { autoRoutesPlugin } from './vite-plugin-route-names/index.js';
export { runConsistencyCheck } from './vite-plugin-route-names/index.js';

// 新导出
export { runRouteNamesFix } from './vite-plugin-route-names/index.js';
export { runCli } from './vite-plugin-route-names/index.js';
```

### 6.3 阶段 3: 更新 package.json scripts

```json
{
  "scripts": {
    "check:route-names": "route-names check",
    "fix:route-names": "route-names fix --fix",
    "generate:route-names": "route-names generate"
  }
}
```

### 6.4 阶段 4: 废弃旧脚本

1. 在 `scripts/check-route-names.ts` 添加废弃警告
2. 在 `scripts/fix-route-names.ts` 添加废弃警告
3. 指向新的使用方式

### 6.5 阶段 5: 移除旧脚本

在下一个主版本中移除独立脚本。

## 7. 实现步骤

### 步骤 1: 添加依赖

```bash
cd /home/code/features-demo/internal/build-tools
pnpm add @vue/compiler-sfc
```

### 步骤 2: 创建文件结构

创建目录和文件框架。

### 步骤 3: 实现核心模块

1. `types.ts` - 类型定义
2. `parser.ts` - Vue 文件解析
3. `scanner.ts` - 路由扫描
4. `generator.ts` - 常量生成
5. `checker.ts` - 一致性检查
6. `fixer.ts` - 自动修复
7. `cli.ts` - CLI 接口
8. `plugin.ts` - Vite 插件
9. `index.ts` - 统一导出

### 步骤 4: 更新配置文件

1. 更新 `package.json` 添加 bin 入口
2. 更新根 `package.json` scripts

### 步骤 5: 测试

1. 测试检查功能
2. 测试修复功能
3. 测试 CLI 命令
4. 测试插件集成

### 步骤 6: 文档更新

更新 README 和使用文档。

## 8. 向后兼容性保证

- 保持 `autoRoutesPlugin()` 导出不变
- 保持 `runConsistencyCheck()` 函数签名不变
- 仅添加新功能，不修改现有 API
- 独立脚本可以保留一个版本作为过渡

## 9. 错误处理

```typescript
export interface PluginError {
  code: string;
  message: string;
  filePath?: string;
  details?: unknown;
}

export class RouteNamesPluginError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'RouteNamesPluginError';
  }
}
```

## 10. 测试策略

1. 单元测试: 各个模块的独立测试
2. 集成测试: 插件与 Vite 集成测试
3. E2E 测试: CLI 命令端到端测试
4. 快照测试: 生成代码的快照验证
