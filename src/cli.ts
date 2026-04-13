import prompts from 'prompts';
import { resolve } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';

export interface CliArgs {
  projectName: string;
  targetDir: string;
}

export async function parseArgs(argv: string[]): Promise<CliArgs> {
  const inputName = argv.find((a) => !a.startsWith('-') && a !== argv[0] && a !== argv[1]);

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

  return { projectName, targetDir };
}
