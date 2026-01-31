import { LLMProvider, LLMRequest, LLMResponse } from '../../types/index.js';

export abstract class BaseLLMProvider implements LLMProvider {
  abstract name: string;
  abstract generateCommands(request: LLMRequest): Promise<LLMResponse>;

  protected buildSystemPrompt(
    osInfo: { platform: string; arch: string; shell: string },
  ): string {
    return `You are a shell command expert. Parse user intent and return appropriate commands.

System:
- OS: ${osInfo.platform}
- Arch: ${osInfo.arch}
- Shell: ${osInfo.shell}

Rules:
1. Generate 1-3 most suitable commands
2. Prefer simple, safe commands
3. Consider OS differences (macOS/Linux)
4. For port queries: use lsof -i :PORT, netstat, or ss
5. For process queries: use ps, pgrep, or top
6. Provide brief descriptions

Return ONLY raw JSON, no markdown blocks.

JSON format:
{
  "commands": [
    {
      "command": "command string",
      "description": "brief description"
    }
  ]
}`;
  }
}
