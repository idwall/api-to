/**
 * Schema
 */
import * as hapi from "hapi";
import {
    Schema as JoiSchema,
    SchemaMap as JoiSchemaMap,
} from "joi";

/**
 * Validation type
 */
export type ValidationType
    = "query"
    | "payload"
    | "params"
    | "headers"
    ;

export type JoiValidationObject =
    JoiSchema | JoiSchemaMap | Array<JoiSchema | JoiSchemaMap>;

export type Validation =
    boolean | JoiValidationObject;

export type Methods =
    hapi.HTTP_METHODS | "*" | Array<"*" | hapi.HTTP_METHODS>;

export type Configuration =
    hapi.RouteAdditionalConfigurationOptions | ((server: hapi.Server) => hapi.RouteAdditionalConfigurationOptions);

export type ConfigurationType = keyof hapi.RouteAdditionalConfigurationOptions;

export const RouterName = Symbol("router.name");
export const RouterPath = Symbol("router.path");
export const RoutePath = Symbol("route.path");
export const RouteMethod = Symbol("route.method");
export const RouteConfig = Symbol("route.config");
export const RouteHandlers = Symbol("router.routes");
export const RouteAuth = Symbol("router.auth");

/**
 * Router decorator
 * @param name Name of the router
 * @param path Path prefix of all routes in this router
 */
export function router(name?: string, prefix?: string): (target: any) => void {
    return (target: any) => {
        if (!name) {
            name = target.name;
        }
        Reflect.metadata(RouterPath, prefix || "")(target);
        Reflect.metadata(RouterName, name)(target);
    };
}

/**
 * Route decorator
 * @param method HTTP Method
 * @param path Endpoint path
 * @param cfg Route configuration
 */
export function route(method: Methods, path: string, cfg?: Configuration) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (!path || !method) {
            throw new Error(`Handler"s method and path are required.`);
        }
        Reflect.defineMetadata(RoutePath, path, descriptor.value);
        Reflect.defineMetadata(RouteMethod, method, descriptor.value);
        if (!cfg) {
            cfg = {};
        }
        if (Reflect.hasMetadata(RouteConfig, descriptor.value)) {
            cfg = Object.assign({}, Reflect.getMetadata(RouteConfig, descriptor.value), cfg);
        }
        Reflect.defineMetadata(RouteConfig, cfg, descriptor.value);
        let handlers: any[] = [];
        if (Reflect.hasMetadata(RouteHandlers, target.constructor)) {
            handlers = Reflect.getMetadata(RouteHandlers, target.constructor);
        }
        handlers.push(descriptor.value);
        Reflect.defineMetadata(RouteHandlers, handlers, target.constructor);
    };
}

/**
 * Validates the request before dispatching
 * @param type Type of validation
 * @param schema Joi schema for data validation
 */
export function validate(type: ValidationType, schema: Validation) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let cfg: any = {};
        if (Reflect.hasMetadata(RouteConfig, descriptor.value)) {
            cfg = Object.assign({}, Reflect.getMetadata(RouteConfig, descriptor.value));
        }
        if (!cfg.validate) {
            cfg.validate = {};
        } else if (cfg.validate[type]) {
            schema = Object.assign({}, cfg.validate[type], schema);
        }
        cfg.validate[type] = schema;
        Reflect.defineMetadata(RouteConfig, cfg, descriptor.value);
    };
}

/**
 * Configuration decorator
 * @param type Type of configuration
 * @param value Configuration value
 */
export function config(type: ConfigurationType, value: any) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let cfg: any = {};
        if (Reflect.hasMetadata(RouteConfig, descriptor.value)) {
            cfg = Object.assign({}, Reflect.getMetadata(RouteConfig, descriptor.value));
        }
        if (typeof value === "object") {
            cfg[type] = Object.assign({}, cfg[type], value);
        } else {
            cfg[type] = value;
        }
        Reflect.defineMetadata(RouteConfig, cfg, descriptor.value);
    };
}

export function plugin(name: string, option: any) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let cfg: any = {};
        if (Reflect.hasMetadata(RouteConfig, descriptor.value)) {
            cfg = Object.assign({}, Reflect.getMetadata(RouteConfig, descriptor.value));
        }
        cfg.plugins = cfg.plugins || {};
        cfg.plugins[name] = name in cfg.plugins ? cfg.plugins[name] : {};
        cfg.plugins[name] = Object.assign({}, cfg.plugins[name], option);
        Reflect.defineMetadata(RouteConfig, cfg, descriptor.value);
    };
}

export function auth(type: string) {
    return config("auth", type);
}

export function exposed() {
    return config("auth", false);
}

export function restricted() {
    return config("auth", "internal");
}

export function payload(schema: Validation) {
    return validate("payload", schema);
}

export function query(schema: Validation) {
    return validate("query", schema);
}

export function headers(schema: Validation) {
    return validate("headers", schema);
}

export function params(schema: Validation) {
    return validate("params", schema);
}

export function all(path: string, cfg?: any) {
    return route("*", path, cfg);
}

export function get(path: string, cfg?: any) {
    return route("GET", path, cfg);
}

export function post(path: string, cfg?: any) {
    return route("POST", path, cfg);
}

export function put(path: string, cfg?: any) {
    return route("PUT", path, cfg);
}

export function patch(path: string, cfg?: any) {
    return route("PATCH", path, cfg);
}

export function del(path: string, cfg?: any) {
    return route("DELETE", path, cfg);
}

export function options(path: string, cfg?: any) {
    return route("OPTIONS", path, cfg);
}

export function head(path: string, cfg?: any) {
    return route("HEAD", path, cfg);
}
