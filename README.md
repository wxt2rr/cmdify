# Cmdify - AI Command Assistant

A CLI tool that generates Shell commands using natural language.

## Features

- 🤖 **AI-Powered**: Automatically generates Shell commands from natural language descriptions
- 🔒 **Safety Checks**: Automatically detects dangerous commands (like `rm -rf`) and requires confirmation
- 📋 **Multiple Options**: Returns 1-3 candidate commands for selection
- ⚡ **Multiple Modes**: Supports interactive mode, one-shot mode, and generate-only mode
- ⚙️ **Flexible Config**: Supports configuration files and environment variables
- 📜 **Command History**: View, search, and navigate through command history with pagination

## Installation

### Method 1: Global Installation (Recommended)

```bash
cd /path/to/cmdify
npm install -g .
```

### Method 2: Install from npm

```bash
npm install -g cmdify
```

### Method 3: Using npm link (for development)

```bash
cd /path/to/cmdify
npm link

# Run directly
cmdify
```

### Method 4: Run directly (local development)

```bash
cd /path/to/cmdify

# Run
npm run dev

# Or
npm run build
node dist/index.js
```

### Verify Installation

```bash
# Check if installed successfully
which cmdify

# Show help information
cmdify --help
```

## Configuration

### Method 1: Environment Variable (Recommended)

```bash
# Temporary setting
export OPENAI_API_KEY=your_api_key_here

# Permanently save to ~/.zshrc (zsh) or ~/.bashrc (bash)
echo 'export OPENAI_API_KEY=your_api_key_here' >> ~/.zshrc
source ~/.zshrc
```

### Method 2: Configuration File

Configure in `~/.cmdify/config.json`:

```bash
mkdir -p ~/.cmdify
cat > ~/.cmdify/config.json << 'EOF'
{
  "llm": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "apiKey": "your_api_key_here",
    "baseUrl": "https://api.openai.com/v1"
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
EOF
```

## Usage

### Interactive Mode

Run `cmdify` directly to enter interactive mode:

```bash
$ cmdify

🤖 Cmdify - AI Command Assistant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Enter your request (Ctrl+C to exit): check processes using port 8080

⏳ Generating commands...

📋 Generated commands:

[1] lsof -i :8080    ⭐ Recommended
    Check specified port usage

[2] netstat -tulnp | grep 8080
    Use netstat to check port

[3] ss -tululnp | grep 8080
    Use ss command to check port

Select [1-3, c=copy, r=regen, q=quit]: 1

✅ Executing: lsof -i :8080

COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    12345  user   24u  IPv4  ...    0t0  TCP *:8080
```

### One-Shot Mode

Auto-execute the recommended command (first one):

```bash
$ cmdify -y start all docker containers

⏳ Generating commands...

✅ Executing: docker start $(docker ps -a -q)
```

### Generate-Only Mode

Generate commands only, without execution:

```bash
$ cmdify -n check system memory usage

⏳ Generating commands...

📋 Generated commands:

[1] free -h
    Check system memory usage    ⭐ Recommended

[2] vmstat -s
    Use vmstat to view memory stats
```

## Command Options

| Option | Description |
|---------|-------------|
| `-y, --yes` | Auto-execute recommended command without confirmation |
| `-n, --no-exec` | Generate commands only, don't execute |
| `-c, --copy` | Copy command to clipboard |
| `-p, --provider <name>` | LLM provider (default: openai) |
| `-m, --model <name>` | Specify model |
| `-h, --help` | Display help information |
| `-V, --version` | Display version number |

## Command History

### View History

```bash
$ cmdify history
# Or using alias
$ cf his
```

### Search History

```bash
$ cmdify history -s keyword
# Or
$ cf his -s keyword
```

### Open History File

```bash
$ cmdify history -o
# Or
$ cf his -o
```

### History Navigation

Use keyboard to navigate through history records:

- `↑/↓` or `k/j` - Select items up/down
- `←/→` or `h/l` or `n/p` - Change pages
- `Enter` - Execute selected command with confirmation
- `q` or `ESC` - Quit

Selected items are marked with a `→` arrow.

History is saved in `~/.cmdify/history.txt`

## Usage Examples

### Check Port Usage

```bash
$ cmdify check process using port 8080
```

### Docker Operations

```bash
$ cmdify start all stopped docker containers
$ cmdify view all docker images
$ cmdify stop all docker containers
```

### System Monitoring

```bash
$ cmdify check system CPU usage
$ cmdify check system memory usage
$ cmdify check disk usage
```

### Process Management

```bash
$ cmdify view node related processes
$ cmdify kill process using port 8080
```

### Network Operations

```bash
$ cmdify test connection to google.com
$ cmdify view local IP address
$ cmdify view all listening ports
```

## Development

### Run Development Mode

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## Project Structure

```
cmdify/
├── src/
│   ├── cli/              # CLI command handling
│   │   ├── index.ts      # CLI entry point
│   │   ├── interactive.ts # Interactive mode
│   │   ├── history.ts    # History command
│   │   └── oneshot.ts    # One-shot mode
│   ├── services/          # Business logic
│   │   ├── llm/          # LLM service
│   │   ├── command/       # Command handling
│   │   └── config/       # Config management
│   ├── ui/               # UI display
│   └── types/            # TypeScript types
├── bin/
│   └── cmdify             # Executable file
├── prompts/
│   └── system.txt        # LLM system prompt
└── package.json
```

## Tech Stack

- **Node.js + TypeScript** - Runtime and type system
- **commander** - CLI framework
- **openai** - OpenAI API SDK
- **chalk** - Terminal colored output
- **execa** - Command execution
- **cosmiconfig** - Config file management

## License

MIT
