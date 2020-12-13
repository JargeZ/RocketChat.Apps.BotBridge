import {IHttp, IModify, IPersistence, IRead} from '@rocket.chat/apps-engine/definition/accessors';
import {UIKitBlockInteractionContext} from '@rocket.chat/apps-engine/definition/uikit';
import { getAppSettingValue } from './helper/Settings';
import { IBackendRequest } from './IBackendReques.daun';

export async function handleButtonClick(context: UIKitBlockInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
    const backendUrl: string = await read.getEnvironmentReader().getSettings().getValueById('backend-url');
    const contextEvent = context.getInteractionData();
    const data: IBackendRequest = {
        event: 'button_click',
        bot: contextEvent.message?.sender,
        payload: {
            action: contextEvent.value,
            message: contextEvent.message,
            user: contextEvent.user,
        },
    };

    const backURL = await getAppSettingValue(read, 'backend-url');
    const response = await http.post(backURL, {
        data,
        strictSSL: false,
        rejectUnauthorized: false,
        timeout: 3000,
    });
}
