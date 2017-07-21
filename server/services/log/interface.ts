/**
 * Logging service
 */
export const LogServiceId = Symbol("log");

export interface ILogService {

    initialize(): void;

    debug(...args: any[]): void;
    trace(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    fatal(...args: any[]): void;

}
