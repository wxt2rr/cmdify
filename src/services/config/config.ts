import { cosmiconfig } from 'cosmiconfig';
import { Config } from '../../types/index.js';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_CONFIG: Config = {
  llm: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    maxRetries: 3,
    timeout: 30000,
  },
  safety: {
    confirmDangerous: true,
    dangerousPatterns: [
      'rm -rf',
      'rm -r /',
      'dd if=',
      'mkfs',
      'format',
      'shutdown',
      'reboot',
    ],
  },
};

// Config file search path
const CONFIG_FILE_PATH = path.join(os.homedir(), '.cmdify', 'config.json');

class ConfigService {
  private config: Config | null = null;

  async load(): Promise<Config> {
    if (this.config) {
      return this.config!;
    }

    // cosmiconfig default search order:
    // 1. Properties in package.json
    // 2. .cmdifyrc file
    // 3. .cmdifyrc.json etc.
    // 4. .config/.cmdifyrc etc.
    // 5. cmdify.config.js etc.
    const explorer = cosmiconfig('cmdify');

    const result = await explorer.search();

    if (result) {
      this.config = { ...DEFAULT_CONFIG, ...result.config };
    } else {
      // If default search fails, try to read ~/.cmdify/config.json
      this.config = await this.loadFromFile();
    }

    return this.config!;
  }

  private async loadFromFile(): Promise<Config> {
    const fs = await import('node:fs/promises');

    try {
      const content = await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
      const userConfig = JSON.parse(content);
      return { ...DEFAULT_CONFIG, ...userConfig };
    } catch (error) {
      // File doesn't exist or parse failed, return default config
      return DEFAULT_CONFIG;
    }
  }

  getApiKey(): string {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    return this.config.llm.apiKey || process.env.OPENAI_API_KEY || '';
  }

  getConfig(): Config {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    return this.config;
  }
}

export const configService = new ConfigService();
