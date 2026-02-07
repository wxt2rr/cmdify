import { execa } from 'execa';
import chalk from 'chalk';
import { historyService } from '../history/index.js';

export async function executeCommand(command: string, input?: string): Promise<void> {
  console.log(chalk.yellow('✅ Executing:'), command);
  console.log();

  try {
    const { stdout, stderr, exitCode } = await execa('sh', ['-c', command], {
      stdio: 'inherit',
    });

    historyService.add(command, input);

    if (exitCode !== 0) {
      console.error(chalk.red(`Command failed, exit code: ${exitCode}`));
    }
  } catch (error: any) {
    console.error(chalk.red('Command failed:'), error.message);

    if (error.exitCode !== undefined) {
      console.error(chalk.red(`Exit code: ${error.exitCode}`));
    }
  }
}

export async function executeCommandQuiet(
  command: string,
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  try {
    const { stdout, stderr, exitCode } = await execa('sh', ['-c', command]);

    return {
      stdout: stdout || '',
      stderr: stderr || '',
      exitCode: exitCode || null,
    };
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.exitCode || -1,
    };
  }
}
