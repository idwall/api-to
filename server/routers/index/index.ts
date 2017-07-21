import { inject, injectable } from "inversify";

import { get, router } from "../../core/http/decorators";
import { IRequest, IResponse, Router } from "../../core/http/router";
import { ConfigServiceId, IConfigService } from "../../services/config/interface";

/**
 * Response interface
 */
interface IVersionResponse {
    commit: string;
    environment: string;
    version: string;
    something: string;
}

@injectable()
@router()
export class IndexRouter extends Router {

    @inject(ConfigServiceId)
    private config: IConfigService;

    @get("/")
    public async index(request: IRequest, response: IResponse): Promise<string> {
        return "apito";
    }

    @get("/version")
    public async version(request: IRequest, response: IResponse): Promise<IVersionResponse> {
        return {
            commit: this.config.commit,
            environment: this.config.environment,
            something: this.config.options.this.is.something,
            version: this.config.version,
        };
    }

}
