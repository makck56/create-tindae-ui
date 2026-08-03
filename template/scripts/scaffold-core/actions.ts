/**
 * 核心脚手架动作
 */
import path from "path";
import {
  checkDirectoryExists,
  confirmOverwrite,
  createDirectory,
  createFile,
  question,
  questionWithValidation,
  readdir,
  removeDirectory,
  writeFile,
} from "./io";
import {
  validateChineseName,
  validateName,
  toCamelCase,
  toKebabCase,
  toPascalCase,
  type DirEntry,
} from "./utils";
import { prepareTemplateData, renderTemplate } from "./template";
import { getDomainChineseName, readDomainRoutes, registerDomainToRootRouter, updateRoutes } from "./route-manager";
import {
  rebuildDomainMenuConfig,
  updateMenuConfig,
} from "./menu-manager";
import { updateDomainReadme } from "./readme-manager";
import type { PatchResult } from "./types";
import { assertProjectRoot } from "./precheck";
import type { DomainArgs, FeatureArgs, FeatureType } from "./args";

/**
 * Feature 页面类型 → 对应模板路径映射。
 *
 * - `list`（表格型）沿用既有模板名（向后兼容）。
 * - `overview`（概览型）使用 `-overview` 后缀的专用模板。
 *
 * 集中在此，避免渲染调用处散落字符串，未来新增类型（如 form/detail）只需在此扩展。
 */
const FEATURE_TEMPLATE_PATHS: Record<
  FeatureType,
  {
    view: string;
    composable: string;
    api: string;
    model: string;
    constants: string;
  }
> = {
  list: {
    view: "feature/view-list.vue.hbs",
    composable: "feature/composable-list.ts.hbs",
    api: "feature/api.ts.hbs",
    model: "feature/model.ts.hbs",
    constants: "feature/constants.ts.hbs",
  },
  overview: {
    view: "feature/view-overview.vue.hbs",
    composable: "feature/composable-overview.ts.hbs",
    api: "feature/api-overview.ts.hbs",
    model: "feature/model-overview.ts.hbs",
    constants: "feature/constants-overview.ts.hbs",
  },
};

// ============ Domain 脚手架 ============ 

export const scaffoldDomain = async (args: DomainArgs = {}) => {
  assertProjectRoot();
  console.log("\n🚀 开始创建新的业务域 (Domain)...");

  // 非交互模式：提供了 --name 即跳过交互（便于 CI / 脚本化）
  const isNonInteractive = args.name !== undefined;

  const domainName = args.name ?? await questionWithValidation(
    "请输入域名 (kebab-case, 如: data-source-management): ",
    (input) => validateName(input, "domain")
  );

  const chineseName = args.chinese ?? await questionWithValidation(
    "请输入中文名 (如: 数据源管理): ",
    validateChineseName
  );

  const featureNameInput =
    args.feature !== undefined
      ? args.feature
      : isNonInteractive
        ? ""
        : await question("请输入默认特性名 (可选，直接回车则使用域名): ");
  let featureName = featureNameInput.trim();

  if (featureName) {
    const validation = validateName(featureName, "feature");
    if (!validation.valid) {
      console.log(`❌ ${validation.error}`);
      console.log("将使用域名作为默认特性名\n");
      featureName = "";
    }
  }

  const domainKebab = toKebabCase(domainName);
  const domainPascal = toPascalCase(domainName);
  const domainCamel = toCamelCase(domainName);
  const featureKebab = featureName ? toKebabCase(featureName) : domainKebab;

  const basePath = path.join(process.cwd(), "src/pages", domainKebab);

  const exists = await checkDirectoryExists(basePath);
  if (exists) {
    const shouldOverwrite = await confirmOverwrite(basePath);
    if (!shouldOverwrite) {
      console.log("\n❌ 操作已取消\n");
      return;
    }
    await removeDirectory(basePath);
    console.log("");
  }

  let featureChineseName = chineseName;
  if (featureName && !isNonInteractive) {
    featureChineseName = await questionWithValidation(
      "请输入特性的中文名: ",
      validateChineseName
    );
  }

  // 记录所有「对已存在文件的追加修改」，用于失败时事务回滚
  const patches: PatchResult[] = [];
  let addedMenu = false;

  try {
    const dirs = [
      basePath,
      `${basePath}/pages`,
      `${basePath}/features/${featureKebab}/views`,
      `${basePath}/features/${featureKebab}/components/list`,
      `${basePath}/features/${featureKebab}/composables`,
      `${basePath}/features/${featureKebab}/api`,
      `${basePath}/features/${featureKebab}/models`,
      `${basePath}/features/${featureKebab}/constants`,
    ];

    console.log("📁 创建目录结构...");
    for (const dir of dirs) {
      await createDirectory(dir);
    }

    console.log("\n📝 生成文件...");

    const templateData = prepareTemplateData({
      domainName,
      featureName: featureName || domainName,
      chineseName,
      featureChineseName,
    });

    // Domain Files
    await createFile(
      `${basePath}/${domainKebab}.routes.ts`,
      await renderTemplate("domain/routes.ts.hbs", templateData)
    );
    await createFile(
      `${basePath}/pages/${domainPascal}List.page.vue`,
      await renderTemplate("domain/page-list.vue.hbs", templateData)
    );
    // Feature Files
    await createFile(
      `${basePath}/features/${featureKebab}/views/${domainPascal}List.view.vue`,
      await renderTemplate("feature/view-list.vue.hbs", templateData)
    );
    await createFile(
      `${basePath}/features/${featureKebab}/composables/use${toPascalCase(
        featureName || domainName
      )}List.ts`,
      await renderTemplate("feature/composable-list.ts.hbs", templateData)
    );
    await createFile(
      `${basePath}/features/${featureKebab}/api/${toCamelCase(
        featureName || domainName
      )}.api.ts`,
      await renderTemplate("feature/api.ts.hbs", templateData)
    );
    await createFile(
      `${basePath}/features/${featureKebab}/models/${toPascalCase(
        featureName || domainName
      )}.ts`,
      await renderTemplate("feature/model.ts.hbs", templateData)
    );
    await createFile(
      `${basePath}/features/${featureKebab}/models/index.ts`,
      `export * from './${toPascalCase(featureName || domainName)}';\n`
    );
    await createFile(
      `${basePath}/features/${featureKebab}/constants/index.ts`,
      await renderTemplate("feature/constants.ts.hbs", templateData)
    );

    // 接入根路由（src/core/bootstrap/router.ts）
    const routerPatch = await registerDomainToRootRouter(domainCamel, domainKebab);
    if (routerPatch.changed) patches.push(routerPatch);
    // 接入失败（如锚点被手动破坏）直接抛错，触发下方事务回滚
    if (!routerPatch.ok) {
      throw new Error(`接入根路由失败：${routerPatch.reason ?? "未知原因"}`);
    }

    // 是否添加侧边栏菜单：
    //   --no-menu → 不加；非交互模式 → 默认加（根级）；交互模式 → 询问
    let addMenu: boolean;
    if (args.noMenu) {
      addMenu = false;
    } else if (isNonInteractive) {
      addMenu = true;
    } else {
      const addMenuAnswer = await question(
        "是否添加侧边栏菜单？(yes/no，默认 yes): "
      );
      addMenu =
        addMenuAnswer.trim() === "" ||
        addMenuAnswer.trim().toLowerCase() === "yes";
    }

    if (addMenu) {
      // domain 是顶级业务域，其菜单恒为根级（不应挂到其它菜单下当子项）。
      // 标签沿用域中文名，无需再询问父级 / 标签。
      const menuPatch = await updateMenuConfig(chineseName, domainPascal, null);
      if (menuPatch.changed) patches.push(menuPatch);

      // mock 菜单不再单独维护：mock/handlers/auth.ts 直接回吐 menuConfig（单一真相源），
      // 故新增域只需更新 menu.config.ts，无需再 updateMockMenus。
      addedMenu = true;
    }

    // Update README
    await updateDomainReadme(domainKebab, chineseName);
  } catch (error) {
    console.error(
      "\n❌ 创建过程中出现错误:",
      error instanceof Error ? error.message : error
    );

    // 事务回滚：还原对已存在文件（router/menu/mock）的追加修改
    if (patches.length > 0) {
      console.log("\n🔄 正在回滚已修改的配置文件...");
      for (const patch of patches) {
        if (patch.changed && patch.filePath && patch.originalContent !== undefined) {
          try {
            await writeFile(patch.filePath, patch.originalContent);
            console.log(`↩️  已还原: ${patch.filePath}`);
          } catch {
            console.warn(`⚠️  还原失败，请手动检查: ${patch.filePath}`);
          }
        }
      }
    }

    // 清理本次新建的 domain 目录
    console.log("\n🔄 正在清理已创建的文件...");
    try {
      await removeDirectory(basePath);
      console.log("✅ 清理完成\n");
    } catch {
      console.error("⚠️  清理失败，请手动删除目录:", basePath);
    }
    return;
  }

  console.log("\n✨ Domain 创建完成!");
  console.log("📝 已自动完成:");
  console.log("   ✅ 生成域目录结构 + 默认特性文件");
  console.log("   ✅ 接入根路由 (src/core/bootstrap/router.ts)");
  if (addedMenu) {
    console.log("   ✅ 配置侧边栏菜单 + mock 登录权限");
  }
  console.log("📝 下一步操作:");
  console.log("   1. 替换 API 路径为真实的后端接口");
  console.log("   2. 根据实际需求调整数据模型\n");
};

// ============ Feature 脚手架 ============ 

const getExistingDomains = async (): Promise<string[]> => {
  const pagesPath = path.join(process.cwd(), "src/pages");
  try {
    const entries = (await readdir(pagesPath, {
      withFileTypes: true,
    })) as DirEntry[];
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    console.error("❌ 读取 pages 目录失败", error);
    return [];
  }
};

export const scaffoldFeature = async (args: FeatureArgs = {}) => {
  assertProjectRoot();
  console.log("\n🚀 开始在现有域下创建新特性 (Feature)...");

  const domains = await getExistingDomains();

  if (domains.length === 0) {
    console.log("❌ 没有找到已存在的域，请先使用 pnpm scaffold:domain 创建域");
    return;
  }

  const isNonInteractive = args.name !== undefined;

  // 选域：非交互用 --domain（序号或域名），交互则列表选择
  let domainName: string;
  if (args.domain) {
    domainName = /^\d+$/.test(args.domain)
      ? domains[parseInt(args.domain) - 1] ?? ""
      : args.domain;
    if (!domainName || !domains.includes(domainName)) {
      console.error(`❌ 无效的域: ${args.domain}（可用: ${domains.join(", ")}）`);
      return;
    }
  } else {
    console.log("已存在的域:");
    domains.forEach((domain, index) => {
      console.log(`  ${index + 1}. ${domain}`);
    });
    console.log();

    const domainIndexStr = await question(`请选择域 (1-${domains.length}): `);
    const domainIndex = parseInt(domainIndexStr.trim()) - 1;

    if (isNaN(domainIndex) || domainIndex < 0 || domainIndex >= domains.length) {
      console.log("❌ 无效的选择");
      return;
    }
    domainName = domains[domainIndex];
  }

  const featureName = args.name ?? await questionWithValidation(
    "请输入新特性名 (kebab-case): ",
    (input) => validateName(input, "feature")
  );

  const featureChineseName = args.chinese ?? await questionWithValidation(
    "请输入特性中文名: ",
    validateChineseName
  );

  const domainKebab = toKebabCase(domainName);
  const domainPascal = toPascalCase(domainName);
  const featureKebab = toKebabCase(featureName);
  const featurePascal = toPascalCase(featureName);
  // Vue Router 的 name 是全局唯一空间。新增 feature 默认拼入 domain 前缀，
  // 避免 sales/order 与 finance/order 这类跨域同名特性互相覆盖。
  const featureRouteName = `${domainPascal}${featurePascal}`;

  // 选择页面类型：非交互用 --type（默认 list），交互则列表询问。
  // 决定后续渲染哪一套模板（表格型 CRUD / 概览型 Dashboard）。
  let featureType: FeatureType;
  if (args.type) {
    featureType = args.type;
  } else if (isNonInteractive) {
    featureType = "list";
  } else {
    console.log("\n页面类型:");
    console.log("  1. 表格型（vxe-grid 分页表格 + 增删改查）");
    console.log("  2. 概览型（KPI 统计卡片 + 近期数据列表）");
    const typeAnswer = await question("请选择页面类型 (1/2，默认 1): ");
    featureType = typeAnswer.trim() === "2" ? "overview" : "list";
  }
  // 派生 PascalCase 后缀，用于文件名 / 组件名拼接（与模板内命名对齐）
  const typeSuffix = featureType === "overview" ? "Overview" : "List";

  const basePath = path.join(
    process.cwd(),
    "src/pages",
    domainKebab,
    "features",
    featureKebab
  );

  const exists = await checkDirectoryExists(basePath);
  if (exists) {
    const shouldOverwrite = await confirmOverwrite(basePath);
    if (!shouldOverwrite) {
      console.log("\n❌ 操作已取消\n");
      return;
    }
    await removeDirectory(basePath);
    console.log("");
  }

  const patches: PatchResult[] = [];

  try {
    const dirs = [
      `${basePath}/views`,
      `${basePath}/components`,
      `${basePath}/composables`,
      `${basePath}/api`,
      `${basePath}/models`,
      `${basePath}/constants`,
    ];

    console.log("📁 创建目录结构...");
    for (const dir of dirs) {
      await createDirectory(dir);
    }

    console.log("\n📝 生成文件...");

    const templateData = prepareTemplateData({
      domainName,
      featureName,
      chineseName: "",
      featureChineseName,
      featureType,
      featureRouteName,
    });

    // 按页面类型选取模板（view/composable 内部已硬编码对应类型命名）
    const tplPaths = FEATURE_TEMPLATE_PATHS[featureType];

    await createFile(
      `${basePath}/views/${featurePascal}${typeSuffix}.view.vue`,
      await renderTemplate(tplPaths.view, templateData)
    );
    await createFile(
      `${basePath}/composables/use${featurePascal}${typeSuffix}.ts`,
      await renderTemplate(tplPaths.composable, templateData)
    );
    await createFile(
      `${basePath}/api/${toCamelCase(featureName)}.api.ts`,
      await renderTemplate(tplPaths.api, templateData)
    );
    await createFile(
      `${basePath}/models/${toPascalCase(featureName)}.ts`,
      await renderTemplate(tplPaths.model, templateData)
    );
    await createFile(
      `${basePath}/models/index.ts`,
      `export * from './${toPascalCase(featureName)}';\n`
    );
    await createFile(
      `${basePath}/constants/index.ts`,
      await renderTemplate(tplPaths.constants, templateData)
    );

    // 是否创建页面：--no-page → 不建；非交互 → 默认建；交互 → 询问
    let createPage: boolean;
    if (args.noPage) {
      createPage = false;
    } else if (isNonInteractive) {
      createPage = true;
    } else {
      const createPageAnswer = await question(
        "是否为此特性创建页面？(yes/no，默认 yes): "
      );
      createPage =
        createPageAnswer.trim() === "" ||
        createPageAnswer.trim().toLowerCase() === "yes";
    }

    if (createPage) {
      // 生成 Page 文件 (路由壳) —— 文件名按类型后缀区分（List / Overview）
      const pagePath = path.join(
        process.cwd(),
        "src/pages",
        domainKebab,
        "pages",
        `${featurePascal}${typeSuffix}.page.vue`
      );
      await createFile(
        pagePath,
        await renderTemplate("feature/page-list.vue.hbs", templateData)
      );

      // 更新路由（component 懒加载路径需带上同款 typeSuffix）
      await updateRoutes(
        domainKebab,
        featureKebab,
        featurePascal,
        featureRouteName,
        featureChineseName,
        typeSuffix
      );

      // 是否添加菜单：--no-menu → 不加；非交互 → 默认加（根级）；交互 → 询问
      let addMenu: boolean;
      if (args.noMenu) {
        addMenu = false;
      } else if (isNonInteractive) {
        addMenu = true;
      } else {
        const addMenuAnswer = await question(
          "是否添加侧边栏菜单？(yes/no，默认 yes): "
        );
        addMenu =
          addMenuAnswer.trim() === "" ||
          addMenuAnswer.trim().toLowerCase() === "yes";
      }

      if (addMenu) {
        // 以该域 routes.ts 的全部路由重建域菜单（1 条→叶子，多条→父级+全部子项），
        // 确保加 feature 后默认特性仍作为子菜单第一项，不会被"过滤掉"。
        const routes = await readDomainRoutes(domainKebab);
        const menuPatch = await rebuildDomainMenuConfig(domainPascal, routes);
        if (menuPatch.changed) patches.push(menuPatch);

        // mock 菜单由 menu.config.ts 单一驱动，无需单独写入 mock（见 domain 分支说明）
      }
    }

    // 获取 Domain 中文名并更新 README
    const domainChineseName = await getDomainChineseName(
      domainKebab,
      domainName
    );
    await updateDomainReadme(domainKebab, domainChineseName);
  } catch (error) {
    console.error(
      "\n❌ 创建过程中出现错误:",
      error instanceof Error ? error.message : error
    );

    // 事务回滚：还原已修改的配置文件（菜单 / mock 权限）
    if (patches.length > 0) {
      console.log("\n🔄 正在回滚已修改的配置文件...");
      for (const patch of patches) {
        if (patch.changed && patch.filePath && patch.originalContent !== undefined) {
          try {
            await writeFile(patch.filePath, patch.originalContent);
            console.log(`↩️  已还原: ${patch.filePath}`);
          } catch {
            console.warn(`⚠️  还原失败，请手动检查: ${patch.filePath}`);
          }
        }
      }
    }

    console.log("\n🔄 正在清理已创建的文件...");
    try {
      await removeDirectory(basePath);
      console.log("✅ 清理完成\n");
    } catch {
      console.error("⚠️  清理失败，请手动删除目录:", basePath);
    }
    return;
  }

  console.log("\n✨ Feature 创建完成!");
};
