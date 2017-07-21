import * as fs from "fs";
import * as nconf from "nconf";
import * as path from "path";

import { inject, injectable } from "inversify";

import { IConfigService } from "./interface";

@injectable()
export class ConfigService implements IConfigService {

    private data: any;
    private env: {
        commit: string;
        environment: string;
        version: string;
    } = {
        commit: "default",
        environment: "development",
        version: "default",
    };
    private location: string;

    public get options(): any {
        return this.data;
    }

    public initialize(location: string): void {
        this.location = location;
        this.loadEnvironment();
        this.loadOptions();
    }

    public get version(): string {
        return this.env.version;
    }

    public get commit(): string {
        return this.env.commit;
    }

    public get environment(): string {
        return this.env.environment;
    }

    private loadEnvironment(): void {
        this.env.environment = process.env.NODE_ENV || "development";
        this.env.version = process.env.API_VERSION || "default";
        this.env.commit = process.env.API_COMMIT || "default";
    }

    private loadOptions(): void {

        const yaml = require("nconf-yaml");

        nconf.file({
            file: path.join(this.location, "default.yml"),
            format: yaml,
        });

        const defaults = JSON.parse(JSON.stringify(nconf.get(undefined)));
        const environment: string = path.join(this.location, `${this.environment}.yml`);
        if (!fs.existsSync(environment)) {
            throw new Error(`Configuration for environment "${this.environment}" not found.`);
        }

        nconf.file({
            file: environment,
            format: yaml,
        }).env("__").defaults(defaults);

        this.data = JSON.parse(JSON.stringify(nconf.get()));

    }

}
