import OpenAI from 'openai';
import { BaseLLMProvider } from './base.js';
import { LLMRequest, LLMResponse } from '../../types/index.js';

// Extract JSON from content, handle possible markdown code blocks
function extractJSON(content: string): any {
  content = content.trim();

  // Try to parse directly
  try {
    return JSON.parse(content);
  } catch (e) {
    // Not pure JSON, try other formats
  }

  // Try to extract JSON from markdown code blocks
  // Format 1: ```json\n{...}\n```
  // Format 2: ```\n{...}\n```
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/is;
  const match = content.match(jsonBlockRegex);

  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      // Parse failed
    }
  }

  // Try to extract content within braces
  const braceRegex = /\{[\s\S]*\}/;
  const braceMatch = content.match(braceRegex);

  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch (e) {
      // Parse failed
    }
  }

  // All failed, throw error
  throw new Error(`Failed to parse JSON: ${content.substring(0, 100)}...`);
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

      // Use extract function to parse JSON
      const response = extractJSON(content) as LLMResponse;

      // Mark first command as recommended
      if (response.commands && response.commands.length > 0) {
        response.commands[0].isRecommended = true;
      }

      return response;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
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
