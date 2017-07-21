/**
 * Logging service
 */

import * as knex from "knex";
import { IService } from "../../core/dependencies/service";

export const DatabaseServiceId = Symbol("database");

export interface IDatabaseService extends IService {

    knex: knex;

}
