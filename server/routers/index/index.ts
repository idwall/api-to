import { injectable } from "inversify";

import { get, router } from "../../core/http/decorators";
import { IRequest, IResponse, Router } from "../../core/http/router";

@injectable()
@router()
export class IndexRouter extends Router {

    @get("/")
    public async index(request: IRequest, response: IResponse): Promise<string> {
        return "apito";
    }

}
