# CLI 命令助手 - 技术方案

## 1. 技术选型

### 1.1 开发语言

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| **Node.js + TypeScript** | npm 生态丰富、开发者熟悉、开发效率高 | 需要运行时环境（Node.js） | ✅ 推荐 |
| Go | 编译型、单文件部署、跨平台好 | 生态相对较小 | 备选 |
| Python | 生态丰富、适合 AI 集成 | 依赖管理复杂、启动较慢 | 备选 |

**最终选择：Node.js + TypeScript**

### 1.2 核心库选择

#### CLI 框架与工具
| 用途 | 库选择 | 说明 |
|------|--------|------|
| CLI 框架 | `commander` | 成熟的命令行框架，支持子命令 |
| 交互式输入 | `enquirer` / `prompts` | 现代化的交互式输入库 |
| 参数解析 | `commander` (内置) | 内置参数解析 |
| 样式输出 | `chalk` | 终端彩色输出 |
| 进度显示 | `ora` | 加载动画和进度条 |
| 确认提示 | `confirms` | 确认对话框 |

#### LLM API 支持
| 提供商 | 库 | 优先级 |
|--------|-----|-------|
| OpenAI | `openai` | P0 |
| Anthropic Claude | `@anthropic-ai/sdk` | P1 |
| Ollama | 自行 HTTP 调用 | P1 |

#### 工具库
| 用途 | 库 |
|------|-----|
| 配置管理 | `cosmiconfig` |
| 命令执行 | `execa` |
| 环境检测 | `node:os` |
| 历史存储 | `lowdb` / `conf` |
| 剪贴板 | `clipboardy` |

### 1.3 依赖清单

```json
{
  "dependencies": {
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "enquirer": "^2.4.2",
    "prompts": "^2.4.2",
    "openai": "^4.0.0",
    "@anthropic-ai/sdk": "^0.24.0",
    "execa": "^8.0.0",
    "cosmiconfig": "^9.0.0",
    "lowdb": "^7.0.0",
    "clipboardy": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "vitest": "^1.0.0"
  }
}
```

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLI 入口层                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ 交互模式   │    │  一键模式   │    │  仅生成模式 │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         业务逻辑层                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│ │ 命令生成器  │───▶│  命令解析器 │───▶│ 安全检查    │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│  ┌─────────────┐    ┌─────────────┐                              │
│ │ 历史管理    │    │ 命令执行器 │                              │
│  └─────────────┘    └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         LLM 服务层                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│ │ OpenAI      │    │  Claude     │    │  Ollama     │          │
│ │ Service     │    │  Service    │    │  Service    │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         数据持久层                              │
│  ┌─────────────┐    ┌─────────────┐                              │
│ │ 配置文件    │    │ 历史数据库  │                              │
│ │ (config.json)│  │ (db.json)   │                              │
│  └─────────────┘    └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## 3. CLI 使用方式

### 3.1 交互模式

```bash
# 启动交互模式
$ wxt

🤖 WXT Shell - AI 命令助手
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

请输入你想执行的操作 (Ctrl+C 退出):
> 查看占用 8080 端口的进程

⏳ 正在生成命令...

[1] lsof -i :8080
    查看指定端口占用情况
    ⭐ 推荐

[2] netstat -tulnp | grep 8080
    使用 netstat 查看端口

[3] ss -tulnp | grep 8080
    使用 ss 命令查看端口

请选择 [1-3, c=复制, r=重新生成, q=退出]: 1

⚠️  该命令需要系统管理员权限
确认执行? [Y/n]: Y

COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    12345  user   24u  IPv4  ...    0t0  TCP *:8080

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

请输入你想执行的操作 (Ctrl+C 退出):
> _
```

### 3.2 一键模式

```bash
# 直接执行推荐的命令
$ wxt -y 查看占用 8080 端口的进程

⏳ 正在生成命令...
✅ 执行: lsof -i :8080

COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    12345  user   24u  IPv4  ...    0t0  TCP *:8080
```

### 3.3 仅生成模式

```bash
# 只生成命令，不执行
$ wxt -n 查看占用 8080 端口的进程

⏳ 正在生成命令...

[1] lsof -i :8080
    查看指定端口占用情况
    ⭐ 推荐

[2] netstat -tulnp | grep 8080
    使用 netstat 查看端口

[3] ss -tulnp | grep 8080
    使用 ss 命令查看端口
```

### 3.4 命令选项

```bash
$ wxt --help

Usage: wxt [options] [query]

AI 命令助手 - 用自然语言生成 Shell 命令

Options:
  -y, --yes         自动执行推荐命令，无需确认
  -n, --no-exec     只生成命令，不执行
  -c, --copy        复制命令到剪贴板
  -p, --provider    LLM 提供商 (openai, claude, ollama) [default: openai]
  -m, --model       指定模型
  -h, --help        显示帮助信息
  -v, --version     显示版本号

Examples:
  wxt 查看占用 8080 端口的进程
  wxt -y 启动所有 docker 容器
  wxt -n 查看系统内存使用情况
  wxt --help
```

## 4. 项目结构

```
wxt-fast-shell/
├── src/
│   ├── index.ts                # 程序入口
│   ├── cli/
│   │   ├── index.ts            # CLI 入口
│   │   ├── interactive.ts      # 交互模式
│   │   └── oneshot.ts         # 一键模式
│   ├── services/
│   │   ├── llm/
│   │   │   ├── base.ts         # LLM Provider 基类
│   │   │   ├── openai.ts       # OpenAI 服务
│   │   │   ├── claude.ts       # Claude 服务
│   │   │   └── ollama.ts       # Ollama 服务
│   │   ├── command/
│   │   │   ├── generator.ts    # 命令生成器
│   │   │   ├── executor.ts     # 命令执行器
│   │   │   └── safety.ts       # 安全检查
│   │   ├── history/
│   │   │   └── history.ts      # 历史服务
│   │   └── config/
│   │       └── config.ts      # 配置服务
│   ├── ui/
│   │   ├── display.ts          # 显示工具
│   │   ├── input.ts            # 输入处理
│   │   └── confirm.ts          # 确认对话框
│   └── types/
│       └── index.ts            # 类型定义
├── prompts/
│   └── system.txt              # LLM 系统提示词
├── bin/
│   └── wxt                     # 可执行文件
├── package.json
├── tsconfig.json
└── README.md
```

## 5. 核心模块设计

### 5.1 CLI 入口 (cli/index.ts)

```typescript
import { Command } from 'commander';
import { interactiveMode } from './interactive';
import { oneshotMode } from './oneshot';

export function createCLI(): Command {
  const program = new Command();

  program
    .name('wxt')
    .description('AI 命令助手 - 用自然语言生成 Shell 命令')
    .version('1.0.0')
    .option('-y, --yes', '自动执行推荐命令')
    .option('-n, --no-exec', '只生成命令，不执行')
    .option('-c, --copy', '复制命令到剪贴板')
    .option('-p, --provider <name>', 'LLM 提供商', 'openai')
    .option('-m, --model <name>', '指定模型')
    .argument('[query]', '自然语言描述')
    .action(async (query, options) => {
      if (!query) {
        // 交互模式
        await interactiveMode(options);
      } else {
        // 一键模式
        await oneshotMode(query, options);
      }
    });

  return program;
}
```

### 5.2 交互模式 (cli/interactive.ts)

```typescript
import { chalk } from 'chalk';
import { input, confirm } from '@inquirer/prompts';
import { generateCommands } from '../services/command/generator';
import { executeCommand } from '../services/command/executor';
import { checkSafety } from '../services/command/safety';

export async function interactiveMode(options: Options): Promise<void> {
  console.log(chalk.cyan('🤖 WXT Shell - AI 命令助手'));
  console.log(chalk.gray('━'.repeat(64)));

  while (true) {
    const query = await input({
      message: '请输入你想执行的操作 (Ctrl+C 退出):',
    });

    // 生成命令
    const commands = await generateCommands(query, options);

    // 显示命令列表
    displayCommands(commands);

    // 用户选择
    const choice = await input({
      message: `请选择 [1-${commands.length}, c=复制, r=重新生成, q=退出]:`,
    });

    if (choice === 'q') break;
    if (choice === 'r') continue;

    const index = parseInt(choice) - 1;
    const command = commands[index];

    // 安全检查
    if (await checkSafety(command)) {
      const confirmed = await confirm({
        message: '确认执行?',
        default: true,
      });

      if (confirmed) {
        await executeCommand(command);
      }
    }
  }
}
```

### 5.3 LLM 服务 (services/llm/openai.ts)

```typescript
import OpenAI from 'openai';
import { LLMProvider, LLMRequest, LLMResponse } from '../../'types';

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4o-mini') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateCommands(request: LLMRequest): Promise<LLMResponse> {
    const systemPrompt = this.buildSystemPrompt(request.osInfo);

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.input },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content || '{"commands":[]}');
  }

  private buildSystemPrompt(osInfo: OSInfo): string {
    return `你是一个 Shell 命令专家。根据用户的自然语言描述，生成对应的命令。

系统信息：
- 操作系统：${osInfo.platform}
- 架构：${osInfo.arch}

要求：
1. 生成 1-3 个候选命令
2. 命令适用于当前操作系统
3. 返回 JSON 格式

返回格式：
{
  "commands": [
    {
      "command": "命令字符串",
      "description": "命令说明",
      "isRecommended": true
    }
  ]
}`;
  }
}
```

### 5.4 命令执行器 (services/command/executor.ts)

```typescript
import { execa } from 'execa';
import { chalk } from 'chalk';

export async function executeCommand(command: string): Promise<void> {
  console.log(chalk.yellow('✅ 执行:'), command);
  console.log();

  try {
    const { stdout, stderr } = await execa('sh', ['-c', command], {
      stdio: 'inherit',
    });

    if (stdout) console.log(stdout);
    if (stderr) console.error(chalk.red(stderr));
  } catch (error) {
    console.error(chalk.red('命令执行失败:'), error);
  }
}
```

## 6. LLM Prompt 模板

```txt
# prompts/system.txt
你是一个 Shell 命令助手。用户会用自然语言描述想要执行的操作，
你需要理解语义并返回对应的命令。

系统信息：
- 操作系统：{platform}
- 架构：{arch}
- Shell：{shell}

操作原则：
1. 根据用户描述，生成 1-3 个最适合的命令
2. 优先选择简单、安全的命令
3. 考虑操作系统差异（macOS/Linux）
4. 提供命令的简短说明

返回格式（JSON）：
{
  "commands": [
    {
      "command": "命令字符串",
      "description": "简短说明",
      "isRecommended": true
    }
  ]
}

用户输入：{user_input}
```

## 7. 配置文件

```json
// ~/.wxt-shell/config.json
{
  "llm": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "apiKey": "sk-xxxxx",
    "baseUrl": "https://api.openai.com/v1",
    "maxRetries": 3,
    "timeout": 30000
  },
  "safety": {
    "confirmDangerous": true,
    "dangerousPatterns": [
      "rm -rf",
      "rm -r /",
      "dd if=",
      "mkfs",
      "format"
    ]
  }
}
```

## 8. 类型定义

```typescript
// src/types/index.ts
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
```

## 9. 实现计划

### 阶段一：项目初始化
- [ ] 项目脚手架搭建
- [ ] TypeScript 配置
- [ ] 基础依赖安装
- [ ] CLI 入口框架

### 阶段二：核心业务逻辑
- [ ] LLM Provider 接口设计
- [ ] OpenAI 服务实现
- [ ] 命令生成器
- [ ] 命令执行器

### 阶段三：交互功能
- [ ] 交互模式实现
- [ ] 命令展示与选择
- [ ] 确认对话框
- [ ] 安全检查

### 阶段四：配置与历史
- [ ] 配置文件管理
- [ ] 环境变量支持
- [ ] 历史记录存储

### 阶段五：扩展功能
- [ ] Claude Provider
- [ ] Ollama Provider
- [ ] 剪贴板集成

## 10. 发布方案

### 10.1 npm 发布

```json
// package.json
{
  "name": "wxt-shell",
  "version": "1.0.0",
  "description": "AI 命令助手 - 用自然语言生成 Shell 命令",
  "main": "dist/index.js",
  "bin": {
    "wxt": "./bin/wxt"
  },
  "files": [
    "dist",
    "bin",
    "prompts"
  ],
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js"
  }
}
`````

### 10.2 安装使用

```bash
# 全局安装
npm install -g wxt-shell

# 使用
wxt

# 或 npx 使用
npx wxt-shell
```

## 11. 技术对比总结

| 特性 | TUI 方案 | CLI 方案 |
|------|---------|---------|
| 开发复杂度 | 高（React、状态管理） | 低（简单的输入输出） |
| 启动速度 | 较慢 | 快 |
| 开发者习惯 | 偏"应用感" | 符合 shell 习惯 |
| 视觉反馈 | 丰富 | 简洁 |
| 维护成本 | 高 | 低 |
| 兼容性 | 某些终端可能有问题 | 通用性好 |

**推荐使用 CLI 方案**，原因：
1. 场景简单直接，不需要复杂的界面
2. 开发者更习惯 CLI 交互方式
3. 开发效率高，代码量少
4. 启动快，即开即用
5. 可以作为 shell 工具链的一部分
