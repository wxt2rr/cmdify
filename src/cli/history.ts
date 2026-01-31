import { Command } from 'commander';
import { historyService } from '../services/history/index.js';

export function historyCommand(): Command {
  const cmd = new Command();

  cmd
    .name('history')
    .description('View command history')
    .alias('his')
    .option('-o, --open', 'Open history file')
    .option('-s, --search <keyword>', 'Search history')
    .action(async (options) => {
      if (options.open) {
        historyService.open();
        return;
      }

      await historyService.interactive(options.search);
    });

  return cmd;
}
