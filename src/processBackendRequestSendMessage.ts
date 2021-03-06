import {IHttp, IModify, IPersistence, IRead} from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import {
    BlockBuilder,
    BlockElementType,
    BlockType,
    ButtonStyle,
    IBlockElement,
    IButtonElement,
    IInputBlock,
    IInputElement,
    IPlainTextInputElement,
    TextObjectType,
} from '@rocket.chat/apps-engine/definition/uikit';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { createMessage } from './helper/Message';
import {IBackendRequest, IButton, IFromBackendRequestSendMessage} from './IBackendReques.daun';

export async function processBackendRequestSendMessage_test(request: IBackendRequest, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
    const message = modify.getCreator().startMessage();
    const block = modify.getCreator().getBlockBuilder();
    const payload = request.payload as IFromBackendRequestSendMessage;
    const blockElements: Array<IBlockElement> = [];

    const bt = block.newButtonElement({
        actionId: 'push-button',
        style: ButtonStyle.PRIMARY,
        text: block.newPlainTextObject('Button text'),
        value: 'button-text-action',
    });
    const input = block.newPlainTextInputElement({
        placeholder: block.newPlainTextObject('plchldr'),
        actionId: 'input-bot-text',
        multiline: false,
    });

    block.addInputBlock({
        label: block.newPlainTextObject('Label'),
        element: input,
    });
    // block.addInputBlock()
    message.setText('Example text');
    message.setBlocks(block);

    let sender: IUser | undefined;

    if (request.bot?.username) {
        sender = await read.getUserReader().getByUsername(request.bot.username);
    }
    let room: IRoom | undefined;
    if (payload.message.room?.id) {
        room = await read.getRoomReader().getById(payload.message.room.id);
    } else if (payload.message.room?.slugifiedName) {
        room = await read.getRoomReader().getByName(payload.message.room.slugifiedName);
    } else {
        // this.app.;
        throw new Error('Can\'t indentify target room');
    }

    if (!room) {
        throw new Error('Can\'t indentify target room');
    }
    if (!sender) {
        throw new Error('Can\'t indentify sender');
    }
    message.setRoom(room);
    // message.setSender(sender);

    await modify.getCreator().finish(message);
}

export const processBackendRequestSendMessage = async (request: IBackendRequest,
                                                       read: IRead,
                                                       http: IHttp,
                                                       persistence: IPersistence,
                                                       modify: IModify) => {
    const payload = request.payload as IFromBackendRequestSendMessage;

    if (!payload.message.room) {
        return;
    }

    await createMessage(request.bot?.username,
                        read,
                        modify,
                        payload.message,
                        payload.buttons);
};
