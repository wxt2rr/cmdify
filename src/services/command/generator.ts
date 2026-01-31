import os from 'node:os';
import { createOpenAIProvider } from '../llm/openai.js';
import { configService } from '../config/config.js';
import { Options, LLMRequest, LLMResponse, Command } from '../../types/index.js';

export async function generateCommands(
  input: string,
  options: Options,
): Promise<Command[]> {
  const config = await configService.load();
  const apiKey = configService.getApiKey();

  if (!apiKey) {
    throw new Error('未配置 API Key，请设置 OPENAI_API_KEY 环境变量或在配置文件中设置');
  }

  const request: LLMRequest = {
    input,
    osInfo: {
      platform: os.platform(),
      arch: os.arch(),
      version: os.release(),
      shell: process.env.SHELL || 'bash',
    },
  };

  const provider = createOpenAIProvider(
    apiKey,
    options.model || config.llm.model,
    config.llm.baseUrl,
  );

  const response: LLMResponse = await provider.generateCommands(request);

  return response.commands || [];
}
