import * as Boom from "boom";
import * as hapi from "hapi";
import * as decorators from "./decorators";

import { inject, injectable } from "inversify";

import { ILogService, LogServiceId } from "../../services/log/interface";

export type RouteConfig =
    hapi.RouteAdditionalConfigurationOptions |
    ((server: hapi.Server) => hapi.RouteAdditionalConfigurationOptions);

export interface IRouter {
    readonly name: string;
    readonly path: string;
    initialize(server: hapi.Server, routeConfig?: RouteConfig): Promise<boolean>;
}

export interface IRequest<T = any> extends hapi.Request {
    payload: T;
}

export interface IResponse extends hapi.Response {
    (...args: any[]): any;
}

export const RouterId = Symbol("router");

@injectable()
export class Router implements IRouter {

    @inject(LogServiceId)
    protected logger: ILogService;

    private routeName: string = "";
    private routePath: string = "";
    private handlers: any[] = [];

    constructor() {
        this.routeName = Reflect.getMetadata(decorators.RouterName, this.constructor);
        this.routePath = Reflect.getMetadata(decorators.RouterPath, this.constructor).replace(/\/$/g, "");
        this.handlers = Reflect.getMetadata(decorators.RouteHandlers, this.constructor) as any[];
    }

    public get name(): string {
        return this.routeName;
    }

    public get path(): string {
        return this.routePath;
    }

    public async initialize(server: hapi.Server, routeConfig?: RouteConfig): Promise<boolean> {

        const instance = this;

        for (const handler of this.handlers) {

            let path = Reflect.getMetadata(decorators.RoutePath, handler);
            const method = Reflect.getMetadata(decorators.RouteMethod, handler);
            const config = Reflect.getMetadata(decorators.RouteConfig, handler);

            path = path.replace(/\/$/g, "");

            let finalPath = path;
            if (path.length > 0 && path[0] !== "~") {
                finalPath = this.path + path;
            } else {
                finalPath = path.substr(1);
            }

            if (!finalPath.startsWith("/")) {
                finalPath = "/" + finalPath;
            }

            const router = this;
            const route: any = {
                config: routeConfig || {},
                // tslint:disable-next-line:object-literal-shorthand only-arrow-functions
                handler: async function(request, response): Promise<any> {
                    const args = Array.prototype.slice.call(arguments);
                    try {
                        const data = await handler.apply(instance, args);
                        if (!response._replied) {
                            response(data);
                        }
                    } catch (err) {
                        router.logger.error({ err }, "Route Error");
                        response(err.isBoom ? Boom.wrap(err) : Boom.badImplementation("Route Error"));
                    }
                },
                method,
                path: finalPath,
            };

            if (config) {
                route.config = config;
            } else {
                route.config = {};
            }

            route.config.plugins = route.config.plugins || {};

            if (method !== "GET" && method !== "HEAD" && !route.config.payload) {
                Object.assign(route.config, { payload: {} });
            }

            if (method !== "GET" && method !== "HEAD" && !route.config.payload.maxBytes) {
                Object.assign(route.config.payload, { maxBytes: 5 * (10 ** 7) });
            }

            this.logger.trace({ path: finalPath, method }, "initializing route");
            server.route(route);

        }

        return true;

    }

}
