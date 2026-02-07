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
      console.log('No commands generated');
      return;
    }

    printCommands(commands);

    // Generate only mode, don't execute
    if (options.noExec) {
      return;
    }

    // Get command to execute
    let command: Command;

    if (options.yes) {
      // Auto-execute recommended command (first one)
      command = commands[0];
    } else {
      // Need user selection
      const readline = await import('node:readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        rl.question(
          `Select [1-${commands.length}, q=quit]: `,
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
        console.log('Invalid selection');
        return;
      }

      command = commands[index];
    }

    // Safety check
    if (isDangerousCommand(command.command)) {
      printWarning(
        '⚠️  DANGER: ' + command.command + ', please confirm before executing',
      );
      const confirmed = await confirm('Confirm execution');

      if (!confirmed) {
        console.log('Execution cancelled');
        return;
      }
    } else {
      const warning = getWarningMessage(command.command);
      if (warning) {
        printWarning(warning);
      }

      const confirmed = await confirm('Confirm execution');

      if (!confirmed) {
        console.log('Execution cancelled');
        return;
      }
    }

    await executeCommand(command.command);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}
