/* eslint-disable @typescript-eslint/no-explicit-any */
import { isString } from "@/utils/is";
import chalk from "chalk";

export default class Logger {
  constructor(private name: string) {}

  private getContextAndMessagesToPrint(args: unknown[]): {
    messages: unknown[];
    context: string;
  } {
    if (args.length <= 1) {
      return { messages: args, context: this.name };
    }

    const lastArg = args[args.length - 1];
    const isContext = isString(lastArg);
    if (isContext === false) {
      return { messages: args, context: this.name };
    }

    return {
      messages: args.slice(0, args.length - 1),
      context: `${this.name} - ${lastArg}`,
    };
  }

  log(message: any, context?: string): void;
  log(message: any, ...optionalParams: [...any, string?]): void;
  log(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);

    console.log(`${chalk.green(`[Log ${context}]`)}: `, ...messages);
  }

  debug(message: any, context?: string): void;
  debug(message: any, ...optionalParams: [...any, string?]): void;
  debug(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);

    console.debug(
      `${chalk.magentaBright(`[Debug ${context}]`)}: `,
      ...messages
    );
  }

  warn(message: any, context?: string): void;
  warn(message: any, ...optionalParams: [...any, string?]): void;
  warn(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);

    console.warn(`${chalk.yellow(`[Warn ${context}]`)}: `, ...messages);
  }

  error(message: any, context?: string): void;
  error(message: any, ...optionalParams: [...any, string?]): void;
  error(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);

    console.error(`${chalk.red(`[Error ${context}]`)}: `, ...messages);
  }
}
