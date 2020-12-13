import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import {IUser} from '@rocket.chat/apps-engine/definition/users';
import { IBackendRequest } from '../IBackendReques.daun';
import { processBackendRequestSendMessage } from '../processBackendRequestSendMessage';

export class BackendRequestEndpoint extends ApiEndpoint {
    public path = 'webhook';

    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<IApiResponse> {

        let parsedRequest: IBackendRequest;
        if (request.headers['content-type'] === 'application/x-www-form-urlencoded') {
            parsedRequest = JSON.parse(request.content.payload);
        } else {
            parsedRequest = request.content;
        }

        console.log('WebHook request ----', request);

        switch (parsedRequest.event) {
            case 'message_from_backend': {
                await processBackendRequestSendMessage(parsedRequest, read, http, persis, modify);
            }
        }

        return this.success();
    }
}
