import { Command } from 'commander';
import { interactiveMode } from './interactive.js';
import { oneshotMode } from './oneshot.js';
import { historyCommand } from './history.js';
import { Options } from '../types/index.js';

export function createCLI(): Command {
  const program = new Command();

  program
    .name('cmdify')
    .description('AI shell assistant - generate commands using natural language')
    .version('1.0.0')
    .option('-y, --yes', 'Auto-execute recommended command')
    .option('-n, --no-exec', 'Generate only, do not execute')
    .option('-c, --copy', 'Copy command to clipboard')
    .option('-p, --provider <name>', 'LLM provider (default: openai)', 'openai')
    .option('-m, --model <name>', 'Specify model')
    .argument('[query]', 'Natural language query')
    .action(async (query, options, cmd) => {
      const opts: Options = {
        yes: options.yes || false,
        noExec: options.noExec || false,
        copy: options.copy || false,
        provider: options.provider || 'openai',
        model: options.model,
      };

      if (!query) {
        await interactiveMode(opts);
      } else {
        await oneshotMode(query, opts);
      }
    });

  program.addCommand(historyCommand());

  return program;
}
