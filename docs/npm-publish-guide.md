# create-tindae-ui 发布指南

本文记录 `create-tindae-ui` 脚手架打包后发布到 npm 官方仓库，或发布到公司本地 Nexus npm 私服的标准流程。

当前仓库已经具备 CLI 脚手架发布所需的基础配置：

```json
{
  "name": "create-tindae-ui",
  "version": "1.0.0",
  "bin": {
    "create-tindae-ui": "./dist/bin/create-tindae-ui.js"
  },
  "files": [
    "dist",
    "template"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  }
}
```

关键点说明：

- `name` 是最终发布到 npm 或 Nexus 的包名。
- `version` 是包版本，每次重复发布都必须递增。
- `bin` 决定用户安装后可以执行的命令，这里是 `create-tindae-ui`。
- `files` 决定真正发布进 npm 包的文件，这里只发布编译产物 `dist` 和脚手架模板 `template`。
- `prepublishOnly` 会在 `npm publish` 前自动执行构建，避免发布旧的 `dist`。

## 1. 发布前检查

发布前先安装依赖、运行测试、构建产物：

```powershell
pnpm install
pnpm test
pnpm build
```

然后预检查 npm 包内容：

```powershell
npm pack --dry-run
```

重点确认输出中包含：

```text
dist/
template/
package.json
README.md
```

如果 `dist` 或 `template` 没有出现在 dry-run 输出中，不要发布，需要先检查 `package.json` 的 `files` 配置和构建结果。

也可以生成本地 tar 包做一次真实安装验证：

```powershell
npm pack
npm install -g .\create-tindae-ui-1.0.0.tgz
create-tindae-ui my-demo
```

如果能正常生成 `my-demo` 项目，说明 CLI 入口、模板文件和构建产物基本可用。

## 2. 发布到 npm 官方仓库

先检查包名是否已经被占用：

```powershell
npm view create-tindae-ui
```

如果返回 404，通常表示包名还没有被占用。

登录 npm：

```powershell
npm login
```

发布公开包：

```powershell
npm publish --access public
```

后续每次发布前都要升级版本号：

```powershell
npm version patch
npm publish --access public
```

常见版本升级规则：

```text
1.0.0 -> 1.0.1  修复 bug
1.0.0 -> 1.1.0  新增兼容功能
1.0.0 -> 2.0.0  破坏性变更
```

用户使用方式：

```powershell
npx create-tindae-ui my-project
```

因为包名是 `create-tindae-ui`，也可以使用 npm create 语法：

```powershell
npm create tindae-ui my-project
```

## 3. 发布到本地 Nexus

假设 Nexus npm hosted 仓库地址是：

```text
http://your-nexus-host/repository/npm-hosted/
```

先登录 Nexus npm 仓库：

```powershell
npm login --registry=http://your-nexus-host/repository/npm-hosted/ --auth-type=legacy
```

然后发布：

```powershell
npm publish --registry=http://your-nexus-host/repository/npm-hosted/
```

如果公司内部统一通过 Nexus 安装依赖，通常会有两个仓库：

- `npm-hosted`：公司内部包发布到这里。
- `npm-group`：公司内部安装依赖时使用，通常聚合了 `npm-hosted` 和 npm 官方代理仓库。

因此推荐约定：

```text
发布包：使用 npm-hosted
安装包：使用 npm-group
```

项目根目录 `.npmrc` 可以配置安装仓库：

```ini
registry=http://your-nexus-host/repository/npm-group/
```

如果希望这个包固定发布到 Nexus，可以在 `package.json` 中加入：

```json
{
  "publishConfig": {
    "registry": "http://your-nexus-host/repository/npm-hosted/"
  }
}
```

这样之后执行：

```powershell
npm publish
```

就会默认发布到 Nexus 的 `npm-hosted` 仓库。

## 4. 推荐发布流程

内部私服发布推荐使用下面的固定流程：

```powershell
pnpm test
pnpm build
npm pack --dry-run
npm version patch
npm publish --registry=http://your-nexus-host/repository/npm-hosted/
```

如果是第一次发布到 npm 官方仓库，先确认包名是否可用；如果只是公司内部使用，优先发布到 Nexus，避免公开包名冲突和误泄露模板代码。

## 5. 常见问题

### 5.1 发布时报版本已存在

原因是 npm 和 Nexus 都不允许覆盖同一个版本。

处理方式：

```powershell
npm version patch
npm publish
```

不要直接手动删除远端包再重发，除非明确知道 Nexus 的包治理策略允许这样做。

### 5.2 发布后 npx 找不到命令

先检查 `package.json` 的 `bin`：

```json
{
  "bin": {
    "create-tindae-ui": "./dist/bin/create-tindae-ui.js"
  }
}
```

再检查源码入口是否保留 Node shebang：

```typescript
#!/usr/bin/env node
```

这个声明必须位于 CLI 入口文件第一行，否则全局安装后可能无法作为命令执行。

### 5.3 发布后生成项目缺文件

先用 dry-run 检查发布包里是否包含模板：

```powershell
npm pack --dry-run
```

如果缺少模板文件，优先检查 `package.json`：

```json
{
  "files": [
    "dist",
    "template"
  ]
}
```

`template` 必须包含在 `files` 中，否则发布后的脚手架没有可复制的项目模板。

