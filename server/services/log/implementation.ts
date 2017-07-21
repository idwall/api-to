import { createLogger, LoggerOptions, LogLevel } from "bunyan";
import { inject, injectable } from "inversify";
import { ConfigServiceId, IConfigService } from "../config/interface";
import { ILogService } from "./interface";

interface ILogEntry {
    type: string;
    args: any;
}

@injectable()
export class LogService implements ILogService {

    @inject(ConfigServiceId)
    private config: IConfigService;

    private logger: any = null;

    public initialize(): void {

        const options = JSON.parse(JSON.stringify(this.config.options.log));
        const bunyanOptions = options as LoggerOptions;

        const hasPretty = "pretty" in options;
        const setPretty = process.env.LOG_PRETTY || false;
        const jsonLogs = "LOG_JSON" in process.env;

        if (!jsonLogs) {
            if (hasPretty || setPretty) {
                const PrettyStream = require("bunyan-prettystream");
                const allPretty = new PrettyStream();
                allPretty.pipe(process.stdout);
                bunyanOptions.streams = [{
                    level: "trace",
                    stream: allPretty,
                    type: "raw",
                }];
            }
        }

        if (hasPretty) {
            // tslint:disable-next-line:no-string-literal
            delete options["pretty"];
        }

        bunyanOptions.level = (process.env.LOG_LEVEL || bunyanOptions.level) as LogLevel;
        this.logger = createLogger(bunyanOptions);

    }

    public debug(...args: any[]): void {
        this.logger.debug.apply(this.logger, arguments);
    }

    public trace(...args: any[]): void {
        this.logger.trace.apply(this.logger, arguments);
    }

    public info(...args: any[]): void {
        this.logger.info.apply(this.logger, arguments);
    }

    public warn(...args: any[]): void {
        this.logger.warn.apply(this.logger, arguments);
    }

    public error(...args: any[]): void {
        this.logger.error.apply(this.logger, arguments);
    }

    public fatal(...args: any[]): void {
        this.logger.fatal.apply(this.logger, arguments);
    }

}
