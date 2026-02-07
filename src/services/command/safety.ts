import { configService } from '../config/config.js';

export function getDangerousPatterns(): string[] {
  const config = configService.getConfig();
  return config.safety.dangerousPatterns;
}

export function isDangerousCommand(command: string): boolean {
  const patterns = getDangerousPatterns();
  const normalizedCmd = command.toLowerCase();

  for (const pattern of patterns) {
    if (normalizedCmd.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  return false;
}

export function requiresSudo(command: string): boolean {
  const sudoCommands = ['systemctl', 'apt', 'yum', 'dnf', 'apk'];
  return sudoCommands.some(cmd => command.startsWith(cmd));
}

export async function confirmExecution(command: string): Promise<boolean> {
  const config = configService.getConfig();

  if (!config.safety.confirmDangerous) {
    return true;
  }

  if (isDangerousCommand(command)) {
    return false; // Dangerous commands need separate handling
  }

  return true;
}

export function getWarningMessage(command: string): string | null {
  if (isDangerousCommand(command)) {
    return 'Warning: dangerous command';
  }

  if (requiresSudo(command)) {
    return 'Warning: may require sudo';
  }

  return null;
}
