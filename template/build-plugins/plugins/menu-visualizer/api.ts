import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';
import type { Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import ts from 'typescript';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export interface MenuPluginOptions {
    viewsPath: string;      // 页面组件目录，如 'src/views'
    menuConfigPath: string; // 菜单配置文件路径，如 'src/config/menu.js'
    routeNamesPath: string; // 路由名称常量文件路径，如 'src/shared/constants/routeNames.ts'
}

export const createApiMiddleware = (options: MenuPluginOptions): Connect.NextHandleFunction => {
    return async (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);

        // API: 获取路由名称常量 (解析 ROUTE_NAMES)
        if (url.pathname === '/get-route-names') {
            try {
                const content = fs.readFileSync(path.resolve(process.cwd(), options.routeNamesPath), 'utf-8');
                
                // 简单的正则解析器
                // 1. 提取 ROUTE_NAMES 对象内容
                const mainMatch = content.match(/export const ROUTE_NAMES = \{([\s\S]*?)\}\s*as const/);
                const routeTree: Record<string, Array<{ key: string; value: string; comment: string }>> = {};

                if (mainMatch) {
                    const body = mainMatch[1];
                    // 2. 提取每个 Domain 块:   DomainName: { ... }
                    const domainRegex = /(\w+):\s*\{([\s\S]*?)\},?/g;
                    let domainMatch;
                    
                    while ((domainMatch = domainRegex.exec(body)) !== null) {
                        const domainName = domainMatch[1];
                        const domainBody = domainMatch[2];
                        const items = [];

                        // 3. 提取 Domain 内的 Key-Value 和注释
                        // 匹配模式: (/** comment */)? key: "value",
                        const itemRegex = /(?:\/\*\*\s*(.*?)\s*\*\/)?\s*(\w+):\s*"(.*?)",?/g;
                        let itemMatch;

                        while ((itemMatch = itemRegex.exec(domainBody)) !== null) {
                            items.push({
                                comment: itemMatch[1] || '',
                                key: itemMatch[2],
                                value: itemMatch[3]
                            });
                        }
                        
                        if (items.length > 0) {
                            routeTree[domainName] = items;
                        }
                    }
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ tree: routeTree }));
            } catch (error) {
                console.error(error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to parse route names' }));
            }
            return;
        }

        // API: Serve Static Assets (Vue, RemixIcon)
        // Note: Middleware is mounted at /__menu-api, so req.url is relative (e.g. /static/vue.js)
        if (url.pathname.startsWith('/static/')) {
            const fileName = url.pathname.replace('/static/', '');
            let filePath = '';
            let contentType = 'text/plain';

            try {
                if (fileName === 'vue.js') {
                    // Resolve vue global build
                    // Note: 'vue' main entry might be cjs or esm. We need dist/vue.global.js specifically.
                    // require.resolve('vue/dist/vue.global.js') should work if exports map allows it or if it's just a file.
                    filePath = require.resolve('vue/dist/vue.global.js');
                    contentType = 'application/javascript';
                } else if (fileName === 'remixicon.css') {
                    filePath = require.resolve('remixicon/fonts/remixicon.css');
                    contentType = 'text/css';
                } else if (fileName.startsWith('remixicon.') || fileName.includes('remixicon')) {
                    // Serve font files from the same directory as css
                    const cssPath = require.resolve('remixicon/fonts/remixicon.css');
                    const fontsDir = path.dirname(cssPath);
                    filePath = path.join(fontsDir, fileName);
                    
                    if (fileName.endsWith('.woff2')) contentType = 'font/woff2';
                    else if (fileName.endsWith('.woff')) contentType = 'font/woff';
                    else if (fileName.endsWith('.ttf')) contentType = 'font/ttf';
                }
            } catch (e) {
                console.error('Failed to resolve static asset:', fileName, e);
            }

            if (filePath && fs.existsSync(filePath)) {
                res.setHeader('Content-Type', contentType);
                fs.createReadStream(filePath).pipe(res);
                return;
            }
        }

        // API: 获取文件目录树（作为路由候选）- 保留但暂不使用
        if (url.pathname === '/get-views') {
            try {
                const files = await glob('**/*.vue', { cwd: path.resolve(process.cwd(), options.viewsPath) });
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ files }));
            } catch {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to scan views' }));
            }
            return;
        }

        // API: 获取当前菜单配置 (AST版)
        if (url.pathname === '/get-menu') {
            try {
                const filePath = path.resolve(process.cwd(), options.menuConfigPath);
                const content = fs.readFileSync(filePath, 'utf-8');
                const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

                let importsEnd = 0;
                let menuConfigNode: ts.ArrayLiteralExpression | null = null;

                // 1. Find Imports end position
                // 2. Find menuConfig array
                ts.forEachChild(sourceFile, (node) => {
                    if (ts.isImportDeclaration(node)) {
                        importsEnd = Math.max(importsEnd, node.end);
                    }
                    if (ts.isVariableStatement(node)) {
                         const hasExport = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
                         if (hasExport) {
                             node.declarationList.declarations.forEach(decl => {
                                 if (ts.isIdentifier(decl.name) && decl.name.text === 'menuConfig') {
                                     if (decl.initializer && ts.isArrayLiteralExpression(decl.initializer)) {
                                         menuConfigNode = decl.initializer;
                                     }
                                 }
                             });
                         }
                    }
                });

                if (!menuConfigNode) {
                    throw new Error('Could not find export const menuConfig = [...]');
                }

                // const imports = content.slice(0, importsEnd).trim(); // Or just take the raw block
                // We actually want the import block to prepend in the UI eval context.
                // Just extracting all import statements is enough.
                const importsContent = content.substring(0, importsEnd);

                const arrayCode = (menuConfigNode as ts.Node).getText(sourceFile);

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                    imports: importsContent, 
                    code: arrayCode 
                }));

            } catch (error: any) {
                console.error(error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to read menu config: ' + error.message }));
            }
            return;
        }

        // API: 保存菜单配置 (AST Replace版)
        if (url.pathname === '/save-menu' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const { code } = JSON.parse(body); // Receive ONLY the new array code
                    
                    const filePath = path.resolve(process.cwd(), options.menuConfigPath);
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

                    let replaceStart = -1;
                    let replaceEnd = -1;

                    ts.forEachChild(sourceFile, (node) => {
                        if (ts.isVariableStatement(node)) {
                             const hasExport = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
                             if (hasExport) {
                                 node.declarationList.declarations.forEach(decl => {
                                     if (ts.isIdentifier(decl.name) && decl.name.text === 'menuConfig') {
                                         if (decl.initializer && ts.isArrayLiteralExpression(decl.initializer)) {
                                             replaceStart = decl.initializer.getStart(sourceFile);
                                             replaceEnd = decl.initializer.getEnd();
                                         }
                                     }
                                 });
                             }
                        }
                    });

                    if (replaceStart === -1) {
                        throw new Error('Could not find original menuConfig array to replace');
                    }

                    const newContent = content.slice(0, replaceStart) + code + content.slice(replaceEnd);
                    
                    // 写入文件
                    fs.writeFileSync(filePath, newContent);
                    res.end('ok');
                } catch (error) {
                    console.error(error);
                    res.statusCode = 500;
                    res.end('Failed to save menu config');
                }
            });
            return;
        }

        next();
    };
};
