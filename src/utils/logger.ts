import chalk from 'chalk';

export interface Logger {
  error: (message: string, error?: any) => void;
  warn: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  debug: (message: string, data?: any) => void;
  success: (message: string, data?: any) => void;
  request: (req: any) => void;
  response: (res: any, body: any) => void;
}

export const logger: Logger = {
  error: (message: string, error?: any) => {
    console.error(chalk.red(`[ERROR] ${message}`), error);
  },
  warn: (message: string, data?: any) => {
    console.log(chalk.yellow(`[WARN] ${message}`), data ? data : '');
  },
  info: (message: string, data?: any) => {
    console.log(chalk.blue(`[INFO] ${message}`), data ? data : '');
  },
  debug: (message: string, data?: any) => {
    console.log(chalk.gray(`[DEBUG] ${message}`), data ? data : '');
  },
  success: (message: string, data?: any) => {
    console.log(chalk.green(`[SUCCESS] ${message}`), data ? data : '');
  },
  request: (req: any) => {
    console.log(chalk.yellow('\n=== Incoming Request ==='));
    console.log(chalk.yellow('Timestamp:'), new Date().toISOString());
    console.log(chalk.yellow('Method:'), req.method);
    console.log(chalk.yellow('URL:'), req.url);
    console.log(chalk.yellow('Protocol:'), req.protocol);
    console.log(chalk.yellow('SSL/TLS:'), req.secure ? 'Yes' : 'No');
    console.log(chalk.yellow('Headers:'), JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(chalk.yellow('Body:'), JSON.stringify(req.body, null, 2));
    }
  },
  response: (res: any, body: any) => {
    console.log(chalk.cyan('\n=== Outgoing Response ==='));
    console.log(chalk.cyan('Timestamp:'), new Date().toISOString());
    console.log(chalk.cyan('Status:'), res.statusCode);
    console.log(chalk.cyan('Headers:'), JSON.stringify(res.getHeaders(), null, 2));
    console.log(chalk.cyan('Body:'), JSON.stringify(body, null, 2));
  }
};