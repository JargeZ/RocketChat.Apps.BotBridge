import {IHttp, IModify, IPersistence, IRead} from '@rocket.chat/apps-engine/definition/accessors';
import {IMessage} from '@rocket.chat/apps-engine/definition/messages';
import {IUser} from '@rocket.chat/apps-engine/definition/users';
import { PostMessageSentHandler } from './handler/PostMessageSentHandler';
import { getAppSettingValue } from './helper/Settings';
import {processBackendRequestSendMessage, processBackendRequestSendMessage_test} from './processBackendRequestSendMessage';

export const sendMessageToBackend = async (message: IMessage, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify, botUser: IUser) => {

    const data = {
        event: 'new_message',
        bot: botUser,
        payload: {
            id: message.id,
            threadId: message.threadId,
            text: message?.text,
            attachments: message.attachments,
            room: message.room,
            sender: message.sender,
            file: message.file,
        },
    };

    const backURL = await getAppSettingValue(read, 'backend-url');
    const response = await http.post(backURL, {
        data,
        strictSSL: false,
        rejectUnauthorized: false,
        timeout: 3000,
    });

    // await processBackendRequestSendMessage('', read, http, persistence, modify);
    // if (response.data.event === 'message_from_backend') {
    // await processBackendRequestSendMessage_test({
    //         event: 'message_from_backend',
    //         bot: botUser,
    //         payload: {
    //             buttons: [],
    //             message: {
    //                 text: 'asd',
    //                 room: message.room,
    //             },
    //         },
    //     }, read, http, persistence, modify);
    // }
};
