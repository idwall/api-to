import "reflect-metadata";

import * as fs from "fs";
import * as path from "path";

import { safeLoad } from "js-yaml";
import { promisify } from "util";

import { Server } from "hapi";
import { IRouter, RouterId } from "./core/http/router";

/**
 * Services
 */
import { Container } from "./core/dependencies/container";

import { ConfigService } from "./services/config/implementation";
import { ConfigServiceId, IConfigService } from "./services/config/interface";

import { DatabaseService } from "./services/database/implementation";
import { DatabaseServiceId, IDatabaseService } from "./services/database/interface";

import { LogService } from "./services/log/implementation";
import { ILogService, LogServiceId } from "./services/log/interface";

/**
 * Plugins
 */
import { plugin as logging } from "./plugins/logging";

/**
 * Routers
 */
import * as Routers from "./routers";

/**
 * Process events
 */
function initializeProcess(logger: ILogService) {

    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
        logger.error({ reason }, "Unhandled Rejection");
    });

    process.on("uncaughtException", (error: Error) => {
        logger.error({
            message: error.message,
            name: error.name,
            stack: error.stack,
        }, "Uncaught Exception");
    });

}

/**
 * Router initialization
 */
function registerRouters() {
    /* apito:routers start */
    Container.bind(RouterId).to(Routers.IndexRouter).inSingletonScope();
    /* apito:routers end */
}

/**
 * Bind all injectable services
 */
function bindServices() {
    Container.bind(Server).toConstantValue(new Server());
    Container.bind(ConfigServiceId).to(ConfigService).inSingletonScope();
    Container.bind(LogServiceId).to(LogService).inSingletonScope();
    /* apito:services start */
    Container.bind(DatabaseServiceId).to(DatabaseService).inSingletonScope();
    /* apito:services end */
}

/**
 * Bootstrap
 */
setImmediate(async function bootstrap() {

    let logger: ILogService = null;
    let config: IConfigService = null;
    let database: IDatabaseService = null;

    try {

        bindServices();

        // Instances
        const server = Container.get<Server>(Server);

        config = Container.get<IConfigService>(ConfigServiceId);
        config.initialize(`${__dirname}/config`);

        logger = Container.get<ILogService>(LogServiceId);
        logger.initialize();

        /* apito:routers_init start */
        database = Container.get<IDatabaseService>(DatabaseServiceId);
        database.initialize();
        /* apito:routers_init end */

        initializeProcess(logger);
        registerRouters();

        // Server initialization
        server.connection(config.options.http);

        // Register plugins
        await server.register({ register: logging() });

        // Routers initialization
        try {
            const routes: IRouter[] = Container.getAll<IRouter>(RouterId);
            for (const route of routes) {
                try {
                    await route.initialize(server);
                } catch (err) {
                    logger.fatal({ err }, "failed to initialize router");
                    process.exit(1);
                }
            }
        } catch (err) {
            logger.fatal({ err }, "error retrieving routers");
        }

        // Server startup
        const failed = await server.start();
        if (failed) {
            logger.fatal({ err: failed });
            process.exit(1);
        }

        logger.trace({
            commit: config.commit,
            environment: config.environment,
            url: server.info.uri,
            version: config.version,
        }, "server initialized");

    } catch (err) {

        if (logger) {
            logger.error({ err }, "initialization error");
        } else {
            // tslint:disable-next-line:no-console
            console.error({ err });
        }

    }

});
