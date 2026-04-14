/**
 * 路由名称常量生成器
 * 从路由配置中提取名称，生成 TypeScript 常量文件
 */

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import glob from 'fast-glob';
import type { DomainRouteMap } from './types.js';

// 配置：输出文件的位置
const OUTPUT_FILE = 'src/shared/constants/routeNames.ts';

/**
 * 将连字符/下划线命名转换为 PascalCase (如: data-source -> DataSource)
 */
function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w)/g, (c) => c.replace('-', '').toUpperCase());
}

/**
 * 将路由 Name 转换为常量 Key (如: UserDetail -> USER_DETAIL)
 * 优先使用 // @key: MY_KEY 注释，否则自动生成
 */
function generateKey(name: string, codeSnippet: string): string {
  // 1. 尝试匹配 // @key: XXX 注释
  const keyMatch = codeSnippet.match(/\/\/\s*@key:\s*(\w+)/);
  if (keyMatch) {
    return keyMatch[1].toUpperCase();
  }

  // 2. 自动生成：将 PascalCase 或 camelCase 转换为 SNAKE_CASE
  return name
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, '');
}

/**
 * 生成路由名称常量文件
 * @param outputFile 输出文件路径
 */
export function generateNames(outputFile: string = OUTPUT_FILE): void {
  const root = process.cwd();
  const files = glob.sync('src/pages/**/*.routes.ts', {
    cwd: root,
    absolute: true,
  });

  const nameMap: DomainRouteMap = {};

  files.forEach((filePath) => {
    const relativePath = path.relative(root, filePath);
    const pathParts = relativePath.split(path.sep);
    const domainName = pathParts[2]; // src/pages/{domain}/...

    if (!domainName) return;

    const domainKey = toPascalCase(domainName);
    const content = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    if (!nameMap[domainKey]) {
      nameMap[domainKey] = {};
    }

    // AST Traversal
    const visit = (node: ts.Node) => {
      if (ts.isObjectLiteralExpression(node)) {
        let name: string | undefined;
        let title: string | undefined;

        node.properties.forEach((prop) => {
          if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
            // Find 'name'
            if (prop.name.text === 'name') {
              if (ts.isStringLiteral(prop.initializer)) {
                name = prop.initializer.text;
              }
            }
            // Find 'meta' -> 'title'
            if (prop.name.text === 'meta') {
              if (ts.isObjectLiteralExpression(prop.initializer)) {
                prop.initializer.properties.forEach((metaProp) => {
                  if (
                    ts.isPropertyAssignment(metaProp) &&
                    ts.isIdentifier(metaProp.name)
                  ) {
                    if (metaProp.name.text === 'title') {
                      if (ts.isStringLiteral(metaProp.initializer)) {
                        title = metaProp.initializer.text;
                      }
                    }
                  }
                });
              }
            }
          }
        });

        if (name) {
          const fullText = node.getText(sourceFile);
          const key = generateKey(name, fullText);

          nameMap[domainKey][key] = {
            name,
            title,
          };
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  });

  // 生成 TypeScript 文件内容
  let fileContent = `/**
 * 🔒 自动生成的路由名称常量
 * ⚠️ 请勿手动修改，修改 src/pages 下的 *.routes.ts 后会自动更新
 * 🕒 生成时间: ${new Date().toLocaleString()}
 */

export const ROUTE_NAMES = {
`;

  for (const [domain, routes] of Object.entries(nameMap)) {
    fileContent += `  ${domain}: {\n`;
    for (const [key, { name, title }] of Object.entries(routes)) {
      if (title) {
        fileContent += `    /** ${title} */\n`;
      }
      fileContent += `    ${key}: "${name}",\n`;
    }
    fileContent += `  },\n`;
  }

  fileContent += `} as const;

// 导出类型以便在代码中使用
export type RouteNameKey = keyof typeof ROUTE_NAMES;
`;

  // 写入文件
  const outputPath = path.resolve(root, outputFile);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, fileContent);

  console.log(
    `[AutoRoutes] Generated ${Object.keys(nameMap).length} domains in ${outputFile}`
  );
}
