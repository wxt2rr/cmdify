import readline from 'node:readline';
import { generateCommands } from '../services/command/generator.js';
import { executeCommand } from '../services/command/executor.js';
import { isDangerousCommand, getWarningMessage } from '../services/command/safety.js';
import { configService } from '../services/config/config.js';
import { printHeader, printSeparator, printCommands, printWarning } from '../ui/display.js';
import { Options } from '../types/index.js';

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function confirm(question: string, defaultValue = true): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const suffix = defaultValue ? ' [Y/n]' : ' [y/N]';

  return new Promise((resolve) => {
    rl.question(question + suffix + ': ', (answer) => {
      rl.close();

      const trimmed = answer.trim().toLowerCase();

      if (trimmed === '') {
        resolve(defaultValue);
        return;
      }

      if (trimmed === 'y' || trimmed === 'yes') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

export async function interactiveMode(options: Options): Promise<void> {
  await configService.load();
  printHeader();

  while (true) {
    try {
      const query = await prompt('> ');

      if (!query) {
        continue;
      }

      const commands = await generateCommands(query, options);

      if (commands.length === 0) {
        console.log('No commands generated');
        continue;
      }

      printCommands(commands);

      const choice = await prompt(
        `Select [1-${commands.length}, c=copy, r=regen, q=quit]: `,
      );

      if (choice.toLowerCase() === 'q') {
        break;
      }

      if (choice.toLowerCase() === 'r') {
        continue;
      }

      if (choice.toLowerCase() === 'c') {
        console.log('Copy not implemented');
        continue;
      }

      const index = parseInt(choice) - 1;

      if (isNaN(index) || index < 0 || index >= commands.length) {
        console.log('Invalid selection');
        continue;
      }

      const command = commands[index];

      // 检查危险命令
      if (isDangerousCommand(command.command)) {
        printWarning('Dangerous: ' + command.command);
        const confirmed = await confirm('Execute?', false);

        if (!confirmed) {
          console.log('Cancelled');
          continue;
        }
      } else {
        const warning = getWarningMessage(command.command);
        if (warning) {
          printWarning(warning);
        }

        const confirmed = await confirm('Execute?', true);

        if (!confirmed) {
          console.log('Cancelled');
          continue;
        }
      }

      await executeCommand(command.command, query);

      printSeparator();
    } catch (error: any) {
      console.error(error.message);

      if (error.message.includes('API Key')) {
        break;
      }
    }
  }
}
