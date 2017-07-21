import * as knex from "knex";

import { createLogger, LoggerOptions, LogLevel } from "bunyan";
import { inject, injectable } from "inversify";

import { ILogService, LogServiceId } from "../log/interface";
import { IDatabaseService } from "./interface";

import { ConfigServiceId, IConfigService } from "../config/interface";

interface ILogEntry {
    type: string;
    args: any;
}

@injectable()
export class DatabaseService implements IDatabaseService {

    @inject(LogServiceId)
    private logger: ILogService;

    @inject(ConfigServiceId)
    private config: IConfigService;

    private db: knex;

    public initialize(): void {
        const options = this.config.options.database as knex.Config;
        if (!options.pool) {
            options.pool = {};
        }

        this.db = knex({
            client: options.client || "pg",
            connection: options.connection || "postgres://postgres:postgres@postgres:5432/postgres",
            debug: this.config.environment === "development" || options.debug,
            dialect: options.dialect || "postgres",
            pool: {
                afterCreate: (conn, done) => {
                    conn.query("SELECT 1", (err) => {
                        if (err) {
                            done(err, conn);
                        }
                        done(null, conn);
                    });
                },
                max: options.pool.max || 4,
                min: options.pool.min || 1,
            },
            useNullAsDefault: options.useNullAsDefault || false,
        });
    }

    public get knex(): knex {
        return this.db;
    }

}
