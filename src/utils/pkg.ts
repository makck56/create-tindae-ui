import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface PkgJson {
  name: string;
  [key: string]: unknown;
}

export function setProjectName(projectDir: string, name: string): void {
  const pkgPath = join(projectDir, 'package.json');
  const content = readFileSync(pkgPath, 'utf-8');
  const pkg: PkgJson = JSON.parse(content);
  pkg.name = name;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
}
