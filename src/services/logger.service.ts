import { Injectable, LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileLoggerService implements LoggerService {
  private readonly logFilePath: string;

  constructor() {
    // 确保日志目录存在
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    this.logFilePath = path.join(logDir, 'app.log');
  }

  private writeToFile(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.logFilePath, logMessage);
  }

  log(message: string) {
    this.writeToFile(`[INFO] ${message}`);
  }

  error(message: string, trace?: string) {
    this.writeToFile(`[ERROR] ${message}${trace ? `\n${trace}` : ''}`);
  }

  warn(message: string) {
    this.writeToFile(`[WARN] ${message}`);
  }

  debug(message: string) {
    this.writeToFile(`[DEBUG] ${message}`);
  }

  verbose(message: string) {
    this.writeToFile(`[VERBOSE] ${message}`);
  }
}
