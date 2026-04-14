/**
 * 路由文件扫描器
 * 扫描 .routes.ts 文件，提取路由信息
 */

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import glob from 'fast-glob';
import type { RouteInfo } from './types.js';

/**
 * 查找项目根目录（通过查找 package.json）
 * 跳过 internal 包，继续向上查找实际的项目根目录
 */
function findProjectRoot(startDir: string = process.cwd()): string {
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    const pkgPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkgContent = fs.readFileSync(pkgPath, 'utf-8');
        const pkg = JSON.parse(pkgContent);

        // 如果是 internal 包，继续向上查找
        const isInternalPackage = pkg.name?.startsWith('@internal/');
        const hasWorkspace = !!pkg.workspaces || !!pkg.pnpm?.workspaces;

        // 找到项目根：不是 internal 包，或者有 workspace 配置
        if (!isInternalPackage || hasWorkspace) {
          return currentDir;
        }
      } catch {
        // package.json 解析失败，继续查找
      }
    }
    currentDir = path.dirname(currentDir);
  }

  // 如果没找到，返回起始目录
  return startDir;
}

/**
 * 扫描所有路由文件
 * @param pattern 文件匹配模式
 * @returns 路由信息列表
 */
export function scanRouteFiles(pattern: string = 'src/pages/**/*.routes.ts'): RouteInfo[] {
  const root = findProjectRoot();
  const routeFiles = glob.sync(pattern, { cwd: root, absolute: true });

  const routes: RouteInfo[] = [];

  for (const filePath of routeFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

    const fileRoutes = extractRoutesFromSourceFile(sourceFile, filePath, root);
    routes.push(...fileRoutes);
  }

  return routes;
}

/**
 * 从 TypeScript AST 中提取路由信息
 */
function extractRoutesFromSourceFile(
  sourceFile: ts.SourceFile,
  filePath: string,
  root: string
): RouteInfo[] {
  const routes: RouteInfo[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isObjectLiteralExpression(node)) {
      let routeName: string | undefined;
      let componentPath: string | undefined;

      // 解析路由对象
      node.properties.forEach((prop) => {
        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
          // 路由 name
          if (prop.name.text === 'name') {
            if (ts.isStringLiteral(prop.initializer)) {
              routeName = prop.initializer.text;
            }
          }
          // 组件路径
          if (prop.name.text === 'component') {
            componentPath = extractComponentPath(prop.initializer);
          }
        }
      });

      if (routeName && componentPath) {
        const absolutePagePath = resolveAbsolutePath(filePath, componentPath, root);

        // 只处理 .page.vue 文件
        if (
          fs.existsSync(absolutePagePath) &&
          absolutePagePath.endsWith('.page.vue')
        ) {
          routes.push({
            name: routeName,
            componentPath,
            absolutePagePath,
            pageContent: fs.readFileSync(absolutePagePath, 'utf-8'),
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return routes;
}

/**
 * 从 AST 节点中提取组件路径
 */
function extractComponentPath(
  initializer: ts.Expression
): string | undefined {
  // 处理动态导入: () => import('./pages/xxx.page.vue')
  if (ts.isArrowFunction(initializer)) {
    const body = initializer.body;
    if (ts.isCallExpression(body)) {
      const importPath = body.arguments[0];
      if (ts.isStringLiteral(importPath)) {
        return importPath.text;
      }
    }
  }

  return undefined;
}

/**
 * 解析组件路径为绝对路径
 */
function resolveAbsolutePath(
  routeFilePath: string,
  componentPath: string,
  root: string
): string {
  const routeDir = path.dirname(routeFilePath);

  if (componentPath.startsWith('./')) {
    return path.resolve(routeDir, componentPath);
  } else if (componentPath.startsWith('@/')) {
    const srcPath = path.resolve(root, 'src');
    return path.resolve(srcPath, componentPath.slice(2));
  } else {
    return path.resolve(root, componentPath);
  }
}
