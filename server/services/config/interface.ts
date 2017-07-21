/**
 * Configuration interface
 */

export const ConfigServiceId = Symbol("config");

export interface IConfigService {

    options: any;
    version: string;
    commit: string;
    environment: string;

    initialize(location: string): void;

}
