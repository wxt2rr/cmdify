import chalk from 'chalk';
import { Command } from '../types/index.js';

export function printHeader(): void {
  console.log(chalk.dim('Cmdify'));
  console.log(chalk.dim('─'.repeat(48)));
  console.log();
}

export function printSeparator(): void {
  console.log();
  console.log(chalk.dim('─'.repeat(48)));
  console.log();
}

export function printCommands(commands: Command[]): void {
  commands.forEach((cmd, index) => {
    const prefix = chalk.white(`[${index + 1}]`);
    const command = chalk.white(cmd.command);
    const description = chalk.hex('#00ff00')(cmd.description);
    const recommended = cmd.isRecommended ? chalk.white(' *') : '';

    console.log(`${prefix} ${command}${recommended}`);
    console.log(`    ${description}`);
    console.log();
  });
}

export function printWarning(message: string): void {
  console.log();
  console.log(chalk.dim(message));
}

export function printSuccess(message: string): void {
  console.log(chalk.dim(message));
}

export function printError(message: string): void {
  console.error(chalk.dim(message));
}

export function printInfo(message: string): void {
  console.log(chalk.dim(message));
}
