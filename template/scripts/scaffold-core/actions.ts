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
} from "./io";
import {
  validateChineseName,
  validateName,
  toCamelCase,
  toKebabCase,
  toPascalCase,
} from "./utils";
import { prepareTemplateData, renderTemplate } from "./template";
import { getDomainChineseName, updateRoutes } from "./route-manager";
import { updateDomainReadme } from "./readme-manager";

// ============ Domain 脚手架 ============ 

export const scaffoldDomain = async () => {
  console.log("\n🚀 开始创建新的业务域 (Domain)...");

  const domainName = await questionWithValidation(
    "请输入域名 (kebab-case, 如: data-source-management): ",
    (input) => validateName(input, "domain")
  );

  const chineseName = await questionWithValidation(
    "请输入中文名 (如: 数据源管理): ",
    validateChineseName
  );

  const featureNameInput = await question(
    "请输入默认特性名 (可选，直接回车则使用域名): "
  );
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
  if (featureName) {
    featureChineseName = await questionWithValidation(
      "请输入特性的中文名: ",
      validateChineseName
    );
  }

  try {
    const dirs = [
      basePath,
      `${basePath}/pages`,
      `${basePath}/features/${featureKebab}/views`,
      `${basePath}/features/${featureKebab}/components/list`,
      `${basePath}/features/${featureKebab}/components/shared`,
      `${basePath}/features/${featureKebab}/composables`,
      `${basePath}/features/${featureKebab}/api`,
      `${basePath}/features/${featureKebab}/models`,
      `${basePath}/features/${featureKebab}/constants`,
      `${basePath}/shared/components`,
      `${basePath}/shared/utils`,
      `${basePath}/shared/assets`,
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
      )}.ts`,
      await renderTemplate("feature/api.ts.hbs", templateData)
    );
    await createFile(
      `${basePath}/features/${featureKebab}/models/${toCamelCase(
        featureName || domainName
      )}.ts`,
      await renderTemplate("feature/model.ts.hbs", templateData)
    );
    await createFile(
      `${basePath}/features/${featureKebab}/constants/index.ts`,
      await renderTemplate("feature/constants.ts.hbs", templateData)
    );

    // Update README
    await updateDomainReadme(domainKebab, chineseName);
  } catch (error) {
    console.error(
      "\n❌ 创建过程中出现错误:",
      error instanceof Error ? error.message : error
    );
    console.log("\n🔄 正在清理已创建的文件...");
    try {
      await removeDirectory(basePath);
      console.log("✅ 清理完成\n");
    } catch (cleanupError) {
      console.error("⚠️  清理失败，请手动删除目录:", basePath);
    }
    return;
  }

  console.log("\n✨ Domain 创建完成!");
  console.log("📝 下一步操作:");
  console.log(
    `   1. 在 src/router/index.ts 中导入路由: import { ${toCamelCase(
      domainName
    )}Routes } from '@/pages/${domainKebab}/${domainKebab}.routes';`
  );
  console.log(`   2. 替换 API 路径为真实的后端接口`);
  console.log(`   3. 根据实际需求调整数据模型\n`);
};

// ============ Feature 脚手架 ============ 

const getExistingDomains = async (): Promise<string[]> => {
  const pagesPath = path.join(process.cwd(), "src/pages");
  try {
    const entries = (await readdir(pagesPath, {
      withFileTypes: true,
    })) as any[];
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    console.error("❌ 读取 pages 目录失败", error);
    return [];
  }
};

export const scaffoldFeature = async () => {
  console.log("\n🚀 开始在现有域下创建新特性 (Feature)...");

  const domains = await getExistingDomains();

  if (domains.length === 0) {
    console.log("❌ 没有找到已存在的域，请先使用 pnpm scaffold:domain 创建域");
    return;
  }

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

  const domainName = domains[domainIndex];

  const featureName = await questionWithValidation(
    "请输入新特性名 (kebab-case): ",
    (input) => validateName(input, "feature")
  );

  const featureChineseName = await questionWithValidation(
    "请输入特性中文名: ",
    validateChineseName
  );

  const domainKebab = toKebabCase(domainName);
  const featureKebab = toKebabCase(featureName);
  const featurePascal = toPascalCase(featureName);

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
    });

    await createFile(
      `${basePath}/views/${featurePascal}List.view.vue`,
      await renderTemplate("feature/view-list.vue.hbs", templateData)
    );
    await createFile(
      `${basePath}/composables/use${featurePascal}List.ts`,
      await renderTemplate("feature/composable-list.ts.hbs", templateData)
    );
    await createFile(
      `${basePath}/api/${toCamelCase(featureName)}.ts`,
      await renderTemplate("feature/api.ts.hbs", templateData)
    );
    await createFile(
      `${basePath}/models/${toCamelCase(featureName)}.ts`,
      await renderTemplate("feature/model.ts.hbs", templateData)
    );
    await createFile(
      `${basePath}/constants/index.ts`,
      await renderTemplate("feature/constants.ts.hbs", templateData)
    );

    // 生成 Page 文件 (路由壳)
    const pagePath = path.join(
      process.cwd(),
      "src/pages",
      domainKebab,
      "pages",
      `${featurePascal}List.page.vue`
    );
    await createFile(
      pagePath,
      await renderTemplate("feature/page-list.vue.hbs", templateData)
    );

    const domainPascal = toPascalCase(domainName);

    // 更新路由
    await updateRoutes(
      domainKebab,
      featureKebab,
      domainPascal,
      featurePascal,
      featureChineseName
    );

    // 获取 Domain 中文名并更新 README
    const domainChineseName = await getDomainChineseName(domainKebab, domainName);
    await updateDomainReadme(domainKebab, domainChineseName);

  } catch (error) {
    console.error(
      "\n❌ 创建过程中出现错误:",
      error instanceof Error ? error.message : error
    );
    console.log("\n🔄 正在清理已创建的文件...");
    try {
      await removeDirectory(basePath);
      console.log("✅ 清理完成\n");
    } catch (cleanupError) {
      console.error("⚠️  清理失败，请手动删除目录:", basePath);
    }
    return;
  }

  console.log("\n✨ Feature 创建完成!");
  console.log("📝 提示:");
  console.log(
    `   1. 路由配置已自动更新，请检查 ${domainKebab}.routes.ts 确认无误`
  );
  console.log(`   2. 已生成 Page 壳文件: pages/${featurePascal}List.page.vue\n`);
};
