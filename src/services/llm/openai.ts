import OpenAI from 'openai';
import { BaseLLMProvider } from './base.js';
import { LLMRequest, LLMResponse } from '../../types/index.js';

// 从内容中提取 JSON，处理可能的 markdown 代码块
function extractJSON(content: string): any {
  content = content.trim();

  // 尝试直接解析
  try {
    return JSON.parse(content);
  } catch (e) {
    // 不是纯 JSON，继续尝试其他格式
  }

  // 尝试提取 markdown 代码块中的 JSON
  // 格式 1: ```json\n{...}\n```
  // 格式 2: ```\n{...}\n```
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/is;
  const match = content.match(jsonBlockRegex);

  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      // 解析失败
    }
  }

  // 尝试提取花括号内的内容
  const braceRegex = /\{[\s\S]*\}/;
  const braceMatch = content.match(braceRegex);

  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch (e) {
      // 解析失败
    }
  }

  // 都失败了，抛出错误
  throw new Error(`无法解析 JSON: ${content.substring(0, 100)}...`);
}

export class OpenAIProvider extends BaseLLMProvider {
  name = 'OpenAI';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4o-mini', baseUrl?: string) {
    super();
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });
    this.model = model;
  }

  async generateCommands(request: LLMRequest): Promise<LLMResponse> {
    const systemPrompt = this.buildSystemPrompt(request.osInfo);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.input },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;

      if (!content) {
        return { commands: [] };
      }

      // 使用提取函数解析 JSON
      const response = extractJSON(content) as LLMResponse;

      // 标记第一个命令为推荐
      if (response.commands && response.commands.length > 0) {
        response.commands[0].isRecommended = true;
      }

      return response;
    } catch (error) {
      console.error('OpenAI API 调用失败:', error);
      throw error;
    }
  }
}

export function createOpenAIProvider(
  apiKey: string,
  model?: string,
  baseUrl?: string,
): OpenAIProvider {
  return new OpenAIProvider(apiKey, model, baseUrl);
}
