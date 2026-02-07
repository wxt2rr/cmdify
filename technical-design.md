# CLI Command Assistant - Technical Design

## 1. Technology Selection

### 1.1 Development Language

| Option | Pros | Cons | Selection |
|--------|------|-------|----------|
| **Node.js + TypeScript** | Rich npm ecosystem, developer familiarity, high efficiency | Requires runtime environment (Node.js) | ✅ Recommended |
| Go | Compiled, single file deployment, good cross-platform | Relatively small ecosystem | Alternate |
| Python | Rich ecosystem, suitable for AI integration | Complex dependency management, slow startup | Alternate |

**Final Selection: Node.js + TypeScript**

### 1.2 Core Library Selection

#### CLI Framework & Tools
| Purpose | Library | Description |
|---------|----------|-------------|
| CLI Framework | `commander` | Mature command-line framework with subcommand support |
| Interactive Input | `enquirer` / `prompts` | Modern interactive input libraries |
| Argument Parsing | `commander` (built-in) | Built-in argument parsing |
| Styled Output | `chalk` | Terminal colored output |
| Progress Display | `ora` | Loading animations and progress bars |
| Confirmation Prompt | `confirms` | Confirmation dialogs |

#### LLM API Support
| Provider | Library | Priority |
|----------|--------|----------|
| OpenAI | `openai` | P0 |
| Anthropic Claude | `@anthropic-ai/sdk` | P1 |
| Ollama | Custom HTTP call | P1 |

#### Utility Libraries
| Purpose | Library |
|---------|----------|
| Configuration Management | `cosmiconfig` |
| Command Execution | `execa` |
| Environment Detection | `node:os` |
| History Storage | `lowdb` / `conf` |
| Clipboard | `clipboardy` |

### 1.3 Dependency List

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

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLI Entry Layer                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ Interactive  │    │  One-Shot   │    │  Generate-Only│          │
│  │     Mode     │    │    Mode     │    │     Mode     │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Business Logic Layer                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   Command   │───▶│   Command   │───▶│   Safety    │          │
│  │  Generator   │    │   Parser    │    │   Checker    │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│  ┌─────────────┐    ┌─────────────┐                              │
│  │  History     │    │  Command    │                              │
│  │  Manager     │    │  Executor   │                              │
│  └─────────────┘    └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         LLM Service Layer                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   OpenAI     │    │   Claude    │    │   Ollama    │          │
│  │   Service     │    │   Service    │    │   Service    │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Data Persistence Layer                     │
│  ┌─────────────┐    ┌─────────────┐                              │
│  │   Config     │    │  History    │                              │
│  │   File       │    │  Database   │                              │
│  │ (config.json)│  │ (db.json)   │                              │
│  └─────────────┘    └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## 3. CLI Usage

### 3.1 Interactive Mode

```bash
# Start interactive mode
$ wxt

🤖 WXT Shell - AI Command Assistant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Enter your request (Ctrl+C to exit):
> Check process using port 8080

⏳ Generating commands...

[1] lsof -i :8080
    Check specified port usage
    ⭐ Recommended

[2] netstat -tulnp | grep 8080
    Use netstat to check port

[3] ss -tulnp | grep 8080
    Use ss command to check port

Select [1-3, c=copy, r=regen, q=quit]: 1

⚠️  This command requires system admin privileges
Confirm execution? [Y/n]: Y

COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    12345  user   24u  IPv4  ...    0t0  TCP *:8080

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Enter your request (Ctrl+C to exit):
> _
```

### 3.2 One-Shot Mode

```bash
# Auto-execute recommended command
$ wxt -y Check process using port 8080

⏳ Generating commands...
✅ Executing: lsof -i :8080

COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    12345  user   24u  IPv4  ...    0t0  TCP *:8080
```

### 3.3 Generate-Only Mode

```bash
# Generate commands only, don't execute
$ wxt -n Check process using port 8080

⏳ Generating commands...

[1] lsof -i :8080
    Check specified port usage
    ⭐ Recommended

[2] netstat -tulnp | grep 8080
    Use netstat to check port

[3] ss -tulnp | grep 8080
    Use ss command to check port
```

### 3.4 Command Options

```bash
$ wxt --help

Usage: wxt [options] [query]

AI Command Assistant - Generate Shell commands using natural language

Options:
  -y, --yes         Auto-execute recommended command without confirmation
  -n, --no-exec     Generate commands only, don't execute
  -c, --copy        Copy command to clipboard
  -p, --provider    LLM provider (openai, claude, ollama) [default: openai]
  -m, --model       Specify model
  -h, --help        Display help information
  -v, --version     Display version number

Examples:
  wxt Check process using port 8080
  wxt -y Start all docker containers
  wxt -n Check system memory usage
  wxt --help
```

## 4. Project Structure

```
wxt-fast-shell/
├── src/
│   ├── index.ts                # Program entry point
│   ├── cli/
│   │   ├── index.ts            # CLI entry point
│   │   ├── interactive.ts      # Interactive mode
│   │   └── oneshot.ts         # One-shot mode
│   ├── services/
│   │   ├── llm/
│   │   │   ├── base.ts         # LLM Provider base class
│   │   │   ├── openai.ts       # OpenAI service
│   │   │   ├── claude.ts       # Claude service
│   │   │   └── ollama.ts       # Ollama service

   │   ├── command/
│   │   │   ├── generator.ts    # Command generator
│   │   │   ├── executor.ts     # Command executor
│   │   │   └── safety.ts       # Safety checker
│   │   ├── history/
│   │   │   └── history.ts      # History service
│   │   └── config/
│   │       └── config.ts      # Config service
│   ├── ui/
│   │   ├── display.ts          # Display utilities
│   │   ├── input.ts            # Input handling
│   │   └── confirm.ts          # Confirmation dialogs
│   └── types/
│       └── index.ts            # Type definitions
├── prompts/
│   └── system.txt              # LLM system prompt
├── bin/
│   └── wxt                     # Executable file
├── package.json
├── tsconfig.json
└── README.md
```

## 5. Core Module Design

### 5.1 CLI Entry (cli/index.ts)

```typescript
import { Command } from 'commander';
import { interactiveMode } from './interactive';
import { oneshotMode } from './oneshot';

export function createCLI(): Command {
  const program = new Command();

  program
    .name('wxt')
    .description('AI Command Assistant - Generate Shell commands using natural language')
    .version('1.0.0')
    .option('-y, --yes', 'Auto-execute recommended command')
    .option('-n, --no-exec', 'Generate commands only, don't execute')
    .option('-c, --copy', 'Copy command to clipboard')
    .option('-p, --provider <name>', 'LLM provider', 'openai')
    .option('-m, --model <name>', 'Specify model')
    .argument('[query]', 'Natural language description')
    .action(async (query, options) => {
      if (!query) {
        // Interactive mode
        await interactiveMode(options);
      } else {
        // One-shot mode
        await oneshotMode(query, options);
      }
    });

  return program;
}
```

### 5.2 Interactive Mode (cli/interactive.ts)

```typescript
import { chalk } from 'chalk';
import { input, confirm } from '@inquirer/prompts';
import { generateCommands } from '../services/command/generator';
import { executeCommand } from '../services/command/executor';
import { checkSafety } from '../services/command/safety';

export async function interactiveMode(options: Options): Promise<void> {
  console.log(chalk.cyan('🤖 WXT Shell - AI Command Assistant'));
  console.log(chalk.gray('━'.repeat(64)));

  while (true) {
    const query = await input({
      message: 'Enter your request (Ctrl+C to exit):',
    });

    // Generate commands
    const commands = await generateCommands(query, options);

    // Display command list
    displayCommands(commands);

    // User selection
    const choice = await input({
      message: `Select [1-${commands.length}, c=copy, r=regen, q=quit]:`,
    });

    if (choice === 'q') break;
    if (choice === 'r') continue;

    const index = parseInt(choice) - 1;
    const command = commands[index];

    // Safety check
    if (await checkSafety(command)) {
      const confirmed = await confirm({
        message: 'Confirm execution?',
        default: true,
      });

      if (confirmed) {
        await executeCommand(command);
      }
    }
  }
}
```

### 5.3 LLM Service (services/llm/openai.ts)

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
    return `You are a Shell command expert. Generate corresponding commands based on user's natural language description.

System information:
- OS: ${osInfo.platform}
- Architecture: ${osInfo.arch}

Requirements:
1. Generate 1-3 candidate commands
2. Commands must work on current operating system
3. Return in JSON format

Return format:
{
  "commands": [
    {
      "command": "command string",
      "description": "command description",
      "isRecommended": true
    }
  ]
}`;
  }
}
```

### 5.4 Command Executor (services/command/executor.ts)

```typescript
import { execa } from 'execa';
import { chalk } from 'chalk';

export async function executeCommand(command: string): Promise<void> {
  console.log(chalk.yellow('✅ Executing:'), command);
  console.log();

  try {
    const { stdout, stderr } = await execa('sh', ['-c', command], {
      stdio: 'inherit',
    });

    if (stdout) console.log(stdout);
    if (stderr) console.error(chalk.red(stderr));
  } catch (error) {
    console.error(chalk.red('Command execution failed:'), error);
  }
}
```

## 6. LLM Prompt Template

```txt
# prompts/system.txt
You are a Shell command assistant. Users will describe operations they want to execute using natural language,
and you need to understand the semantics and return corresponding commands.

System information:
- OS: {platform}
- Architecture: {arch}
- Shell: {shell}

Operation principles:
1. Based on user description, generate 1-3 most suitable commands
2. Prioritize simple and safe commands
3. Consider OS differences (macOS/Linux)
4. Provide brief description of commands

Return format (JSON):
{
  "commands": [
    {
      "command": "command string",
      "description": "brief description",
      "isRecommended": true
    }
  ]
}

User input: {user_input}
```

## 7. Configuration File

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

## 8. Type Definitions

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

## 9. Implementation Plan

### Phase 1: Project Initialization
- [ ] Project scaffolding setup
- [ ] TypeScript configuration
- [ ] Basic dependencies installation
- [ ] CLI entry framework setup

### Phase 2: Core Business Logic
- [ ] LLM Provider interface design
- [ ] OpenAI service implementation
- [ ] Command generator
- [ ] Command executor

### Phase 3: Interactive Features
- [ ] Interactive mode implementation
- [ ] Command display and selection
- [ ] Confirmation dialogs
- [ ] Safety checks

### Phase 4: Configuration & History
- [ ] Configuration file management
- [ ] Environment variable support
- [ ] History recording storage

### Phase 5: Extended Features
- [ ] Claude Provider
- [ ] Ollama Provider
- [ ] Clipboard integration

## 10. Release Plan

### 10.1 npm Release

```json
// package.json
{
  "name": "wxt-shell",
  "version": "1.0.0",
  "description": "AI Command Assistant - Generate Shell commands using natural language",
  "main": "dist/index.js",
  "bin": {
    "wxt": "./wxt"
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
```

### 10.2 Installation & Usage

```bash
# Global installation
npm install -g wxt-shell

# Usage
wxt

# Or use with npx
npx wxt-shell
```

## 11. Technical Comparison Summary

| Feature | TUI Approach | CLI Approach |
|---------|---------------|---------------|
| Development complexity | High (React, state management) | Low (simple input/output) |
| Startup speed | Slower | Faster |
| Developer habits | "App-like" feel | Fits shell habits |
| Visual feedback | Rich | Clean |
| Maintenance cost | Higher | Lower |
| Compatibility | Some terminals may have issues | Good compatibility |

**Recommend using CLI approach** for the following reasons:
1. Simple scenario, doesn' need complex UI
2. Developers more accustomed to CLI interaction
3. Higher development efficiency, less code
4. Fast startup, ready to use
5. Can be part of shell tool chain
