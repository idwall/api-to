import * as hapi from "hapi";
import * as hoek from "hoek";

import { Container } from "../core/dependencies/container";

import { ILogService, LogServiceId } from "../services/log/interface";

export const PluginName: string = "server_logging";
export const PluginVersion: string = "1.0.0";

export type PluginFunction = hapi.PluginFunction<{}>;

export function plugin(): PluginFunction {

    function init(server: hapi.Server, options: {}, next: (error?: Error) => void) {

        const logger: ILogService = Container.get<ILogService>(LogServiceId);

        server.ext("onRequest", (request: any, reply) => {
            request.benchmark = new hoek.Bench();
            return reply.continue();
        });

        server.on("response", (request: any | hapi.Request) => {

            let elapsed = -1;
            if (request.benchmark && request.benchmark.elapsed) {
                elapsed = request.benchmark.elapsed();
            }

            let address = request.info.remoteAddress;
            if ("x-forwarded-for" in request.headers) {
                address = request.headers["x-forwarded-for"].split(",")[0];
            }

            logger.info({
                request: {
                    address,
                    method: request.method,
                    path: request.path,
                    status: request.response.statusCode,
                    time: elapsed,
                },
            }, "request");

        });

        next();

    }

    (init as PluginFunction).attributes = {
        name: PluginName,
        version: PluginVersion,
    };

    return init;

}
