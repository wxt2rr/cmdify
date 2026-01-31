import { generateCommands } from '../services/command/generator.js';
import { executeCommand } from '../services/command/executor.js';
import { isDangerousCommand, getWarningMessage } from '../services/command/safety.js';
import { printCommands, printWarning } from '../ui/display.js';
import { Options, Command } from '../types/index.js';

async function confirm(message: string): Promise<boolean> {
  const readline = await import('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message + ' [Y/n]: ', (answer) => {
      rl.close();

      const trimmed = answer.trim().toLowerCase();

      if (trimmed === '' || trimmed === 'y' || trimmed === 'yes') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

export async function oneshotMode(
  query: string,
  options: Options,
): Promise<void> {
  try {
    const commands = await generateCommands(query, options);

    if (commands.length === 0) {
      console.log('未生成任何命令');
      return;
    }

    printCommands(commands);

    // 只生成模式，不执行
    if (options.noExec) {
      return;
    }

    // 获取要执行的命令
    let command: Command;

    if (options.yes) {
      // 自动执行推荐的命令（第一个）
      command = commands[0];
    } else {
      // 需要用户选择
      const readline = await import('node:readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        rl.question(
          `请选择 [1-${commands.length}, q=退出]: `,
          (answer) => {
            rl.close();
            resolve(answer.trim());
          },
        );
      });

      if (answer.toLowerCase() === 'q') {
        return;
      }

      const index = parseInt(answer) - 1;

      if (isNaN(index) || index < 0 || index >= commands.length) {
        console.log('无效的选择');
        return;
      }

      command = commands[index];
    }

    // 安全检查
    if (isDangerousCommand(command.command)) {
      printWarning(
        '⚠️  危险命令: ' + command.command + '，请确认后执行',
      );
      const confirmed = await confirm('确认执行');

      if (!confirmed) {
        console.log('已取消执行');
        return;
      }
    } else {
      const warning = getWarningMessage(command.command);
      if (warning) {
        printWarning(warning);
      }

      const confirmed = await confirm('确认执行');

      if (!confirmed) {
        console.log('已取消执行');
        return;
      }
    }

    await executeCommand(command.command);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}
