export interface Command {
  command: string;
  description: string;
  isRecommended?: boolean;
}

export interface LLMRequest {
  input: string;
  osInfo: OSInfo;
}

export interface LLMResponse {
  commands: Command[];
}

export interface OSInfo {
  platform: NodeJS.Platform;
  arch: string;
  version: string;
  shell: string;
}

export interface Options {
  yes: boolean;
  noExec: boolean;
  copy: boolean;
  provider: string;
  model?: string;
}

export interface LLMProvider {
  name: string;
  generateCommands(request: LLMRequest): Promise<LLMResponse>;
}

export interface Config {
  llm: {
    provider: string;
    model: string;
    apiKey: string;
    baseUrl?: string;
    maxRetries?: number;
    timeout?: number;
  };
  safety: {
    confirmDangerous: boolean;
    dangerousPatterns: string[];
  };
}
