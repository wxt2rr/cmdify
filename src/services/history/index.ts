import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';

const HISTORY_DIR = path.join(os.homedir(), '.cmdify');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.txt');
const PAGE_SIZE = 5;

export interface HistoryEntry {
  timestamp: string;
  command: string;
  input: string;
}

class HistoryService {
  constructor() {
    this.ensureHistoryFile();
  }

  private ensureHistoryFile(): void {
    if (!fs.existsSync(HISTORY_DIR)) {
      fs.mkdirSync(HISTORY_DIR, { recursive: true });
    }
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, '', 'utf-8');
    }
  }

  add(command: string, input?: string): void {
    const entry: HistoryEntry = {
      timestamp: new Date().toISOString(),
      command,
      input: input || '',
    };

    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(HISTORY_FILE, line, 'utf-8');
  }

  getAll(): HistoryEntry[] {
    const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
    if (!content.trim()) return [];

    return content
      .trim()
      .split('\n')
      .map(line => {
        try {
          return JSON.parse(line) as HistoryEntry;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is HistoryEntry => entry !== null);
  }

  search(keyword: string): HistoryEntry[] {
    const all = this.getAll();
    const lowerKeyword = keyword.toLowerCase();
    return all.filter(entry =>
      entry.command.toLowerCase().includes(lowerKeyword) ||
      entry.input.toLowerCase().includes(lowerKeyword)
    );
  }

  private clearScreen(): void {
    process.stdout.write('\x1b[2J\x1b[H');
  }

  private render(
    entries: HistoryEntry[],
    page: number,
    selectedIndex: number
  ): void {
    this.clearScreen();

    const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, entries.length);
    const pageEntries = entries.slice(startIndex, endIndex);

    console.log(`History (page ${page}/${totalPages}):`);
    console.log('─'.repeat(48));

    pageEntries.forEach((entry, i) => {
      const index = startIndex + i + 1;
      const isSelected = i === selectedIndex;
      const date = new Date(entry.timestamp).toLocaleString();
      const prefix = isSelected ? '→ ' : '  ';
      console.log(`${prefix}[${index}] ${entry.command}`);
      if (entry.input) {
        console.log(`      Input: ${entry.input}`);
      }
      console.log(`      Time: ${date}`);
      console.log();
    });

    console.log('─'.repeat(48));
    console.log(`  <Page ${page}/${totalPages}>    ↑/↓ select, ←/→ or n/p page, Enter execute, q quit`);
  }

  async interactive(keyword?: string, onExecute?: (command: string) => void): Promise<void> {
    const entries = keyword ? this.search(keyword) : this.getAll();

    if (entries.length === 0) {
      console.log('No history found');
      return;
    }

    let page = 1;
    let selectedIndex = 0;
    const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));

    const updateSelection = (delta: number): void => {
      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = Math.min(startIndex + PAGE_SIZE, entries.length);
      const maxIndex = endIndex - startIndex - 1;

      selectedIndex = Math.max(0, Math.min(maxIndex, selectedIndex + delta));
    };

    const changePage = (delta: number): void => {
      const newPage = Math.max(1, Math.min(totalPages, page + delta));
      if (newPage !== page) {
        page = newPage;
        selectedIndex = 0;
      }
    };

    (readline as any).emitKeypressEvents = true;

    this.render(entries, page, selectedIndex);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    process.stdin.setRawMode(true);

    await new Promise<void>(resolve => {
      const handleKey = (
        str: string,
        key: { name: string; ctrl: boolean; meta: boolean; shift: boolean; sequence?: string }
      ): void => {
        if (key.ctrl && key.name === 'c') {
          process.stdin.setRawMode(false);
          rl.close();
          resolve();
          return;
        }

        if (key.name === 'q') {
          process.stdin.setRawMode(false);
          rl.close();
          resolve();
          return;
        }

        if (key.name === 'return') {
          const startIndex = (page - 1) * PAGE_SIZE;
          const endIndex = Math.min(startIndex + PAGE_SIZE, entries.length);
          const pageEntries = entries.slice(startIndex, endIndex);

          if (selectedIndex < pageEntries.length) {
            const command = pageEntries[selectedIndex].command;
            process.stdin.setRawMode(false);
            rl.close();
            console.log();
            if (onExecute) {
              onExecute(command);
            }
            resolve();
          }
          return;
        }

        if (key.name === 'up' || key.sequence === '\x1b[A') {
          updateSelection(-1);
          this.render(entries, page, selectedIndex);
        } else if (key.name === 'down' || key.sequence === '\x1b[B') {
          updateSelection(1);
          this.render(entries, page, selectedIndex);
        } else if (key.name === 'left' || key.sequence === '\x1b[D') {
          const oldPage = page;
          changePage(-1);
          if (page !== oldPage) {
            selectedIndex = 0;
            this.render(entries, page, selectedIndex);
          }
        } else if (key.name === 'right' || key.sequence === '\x1b[C') {
          const oldPage = page;
          changePage(1);
          if (page !== oldPage) {
            selectedIndex = 0;
            this.render(entries, page, selectedIndex);
          }
        } else if (key.name === 'k') {
          updateSelection(-1);
          this.render(entries, page, selectedIndex);
        } else if (key.name === 'j') {
          updateSelection(1);
          this.render(entries, page, selectedIndex);
        } else if (key.name === 'h' || key.name === 'p') {
          const oldPage = page;
          changePage(-1);
          if (page !== oldPage) {
            selectedIndex = 0;
            this.render(entries, page, selectedIndex);
          }
        } else if (key.name === 'l' || key.name === 'n') {
          const oldPage = page;
          changePage(1);
          if (page !== oldPage) {
            selectedIndex = 0;
            this.render(entries, page, selectedIndex);
          }
        } else if (key.name === 'escape') {
          process.stdin.setRawMode(false);
          rl.close();
          resolve();
        }
      };

      rl.on('keypress', handleKey);
    });
  }

  open(): void {
    const { exec } = require('child_process');
    const openCmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${openCmd} ${HISTORY_FILE}`);
  }
}

export const historyService = new HistoryService();
