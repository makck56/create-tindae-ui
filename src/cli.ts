import prompts from 'prompts';
import { resolve } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';

export type PackageManager = 'pnpm' | 'npm' | 'yarn';

export interface CliArgs {
  projectName: string;
  targetDir: string;
  packageManager: PackageManager;
  skipInstall: boolean;
  skipGit: boolean;
}

const PACKAGE_MANAGERS: PackageManager[] = ['pnpm', 'npm', 'yarn'];

function parsePackageManager(argv: string[]): PackageManager {
  const equalsArg = argv.find((arg) => arg.startsWith('--package-manager='));
  const packageManagerIndex = argv.indexOf('--package-manager');
  const value = equalsArg?.split('=')[1] ?? (packageManagerIndex >= 0 ? argv[packageManagerIndex + 1] : 'pnpm');

  if (!PACKAGE_MANAGERS.includes(value as PackageManager)) {
    throw new Error(`Package manager must be one of: ${PACKAGE_MANAGERS.join(', ')}`);
  }

  return value as PackageManager;
}

function getOptionValueIndexes(argv: string[]): Set<number> {
  const indexes = new Set<number>();
  const packageManagerIndex = argv.indexOf('--package-manager');
  if (packageManagerIndex >= 0) {
    indexes.add(packageManagerIndex + 1);
  }
  return indexes;
}

export async function parseArgs(argv: string[]): Promise<CliArgs> {
  const packageManager = parsePackageManager(argv);
  const skipInstall = argv.includes('--no-install') || argv.includes('--skip-install');
  const skipGit = argv.includes('--skip-git');
  const optionValueIndexes = getOptionValueIndexes(argv);
  const inputName = argv.find((a, index) => {
    return !a.startsWith('-') && a !== argv[0] && a !== argv[1] && !optionValueIndexes.has(index);
  });

  let projectName = inputName;

  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'name',
      message: 'Project name:',
      initial: 'my-tindae-app',
      validate: (value: string) => {
        if (!value.trim()) return 'Project name cannot be empty';
        if (!/^[a-z0-9-]+$/.test(value.trim())) {
          return 'Project name must be lowercase letters, numbers, and hyphens only';
        }
        return true;
      },
    });
    projectName = response.name;
  }

  if (!projectName) {
    throw new Error('Project name is required');
  }

  projectName = projectName.trim();
  const targetDir = resolve(process.cwd(), projectName);

  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    const response = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory "${projectName}" already exists and is not empty. Overwrite?`,
      initial: false,
    });
    if (!response.overwrite) {
      throw new Error('Operation cancelled');
    }
  }

  return { projectName, targetDir, packageManager, skipInstall, skipGit };
}
