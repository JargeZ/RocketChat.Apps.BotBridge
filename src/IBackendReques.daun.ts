import {IMessage} from '@rocket.chat/apps-engine/definition/messages';
import {IUser} from '@rocket.chat/apps-engine/definition/users';

export interface IButton {
    text: string;
    action: string;
    style: 'primary' | 'danger' | undefined;
}

export interface IFromBackendRequestSendMessage {
    message: Partial<IMessage>;
    buttons: Array<IButton>;
}

// export interface IBidgeMessage{
//     text: string;
//     bu
// }

export interface IToBackendNewMessage {
    message: IMessage;
}

export interface IToBackendButtonClick {
    action: string | undefined;
    message: IMessage | undefined;
    user: IUser;
}

export interface IBackendRequest {
    event: 'message_from_backend' | 'button_click';
    payload: IFromBackendRequestSendMessage | IToBackendButtonClick;
    bot: IUser | undefined;
}
