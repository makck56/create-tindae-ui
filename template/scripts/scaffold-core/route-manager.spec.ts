import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { updateRoutes } from './route-manager';

const tempRoots: string[] = [];

async function createDomainRoutes(rootDir: string, domain: string): Promise<void> {
  const domainDir = path.join(rootDir, 'src/pages', domain);
  await mkdir(domainDir, { recursive: true });
  await writeFile(
    path.join(domainDir, `${domain}.routes.ts`),
    `import type { RouteRecordRaw } from 'vue-router';

export const ${domain}Routes: RouteRecordRaw[] = [
  {
    path: '/${domain}',
    name: '${domain}',
    component: () => import('./pages/${domain}.page.vue'),
    meta: { code: '${domain}', title: '${domain}', keepAlive: true },
  },
];
`,
    'utf-8',
  );
}

describe('updateRoutes', () => {
  afterEach(async () => {
    await Promise.all(tempRoots.map((root) => rm(root, { recursive: true, force: true })));
    tempRoots.length = 0;
  });

  it('为跨域同名 feature 写入不同的路由名和权限码', async () => {
    const rootDir = await mkdtemp(path.join(tmpdir(), 'tindae-scaffold-routes-'));
    tempRoots.push(rootDir);
    await createDomainRoutes(rootDir, 'sales');
    await createDomainRoutes(rootDir, 'finance');

    await updateRoutes('sales', 'order', 'Order', 'SalesOrder', '订单', 'List', rootDir);
    await updateRoutes('finance', 'order', 'Order', 'FinanceOrder', '订单', 'List', rootDir);

    const salesRoutes = await readFile(path.join(rootDir, 'src/pages/sales/sales.routes.ts'), 'utf-8');
    const financeRoutes = await readFile(path.join(rootDir, 'src/pages/finance/finance.routes.ts'), 'utf-8');

    // route name 与 meta.code 使用同一个带域名前缀的名称，避免 Vue Router 全局 name 冲突。
    expect(salesRoutes).toContain("name: 'SalesOrder'");
    expect(salesRoutes).toContain("meta: { code: 'SalesOrder'");
    expect(financeRoutes).toContain("name: 'FinanceOrder'");
    expect(financeRoutes).toContain("meta: { code: 'FinanceOrder'");
  });
});
