import { IMessageBuilder, IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import {IMessage} from '@rocket.chat/apps-engine/definition/messages';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { BlockBuilder, ButtonStyle, IBlockElement, IButtonElement } from '@rocket.chat/apps-engine/definition/uikit';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import {IButton, IFromBackendRequestSendMessage} from '../IBackendReques.daun';

function buildButton(block: BlockBuilder, button: IButton): IButtonElement {
    return block.newButtonElement({
        actionId: 'push-bot-button',
        style: { primary: ButtonStyle.PRIMARY, danger: ButtonStyle.DANGER }[button.style || 'primary'],
        text: block.newPlainTextObject(button.text),
        value: button.action,
    });
}

export const createMessage = async (senderUsername: string | undefined,
                                    read: IRead,
                                    modify: IModify,
                                    message: Partial<IMessage>,
                                    buttons: Array<IButton>): Promise<any> => {

    const targetRoom = message.room;
    let room: IRoom | undefined;
    if (targetRoom?.id) {
        room = await read.getRoomReader().getById(targetRoom.id);
    } else if (targetRoom?.slugifiedName) {
        room = await read.getRoomReader().getByName(targetRoom.slugifiedName);
    } else {
        throw new Error('Can\'t indentify target room');
    }
    if (!room) {
        throw new Error('Can\'t indentify target room');
    }

    let sender: IUser | undefined;
    if (senderUsername === 'self_app') {
        sender = await read.getUserReader().getAppUser('41315b7b-6c01-4ede-8201-2c3927404e41');
    } else if (senderUsername) {
        sender = await read.getUserReader().getByUsername(senderUsername);
    }

    if (!sender) {
        throw new Error('Can\'t indentify sender');
    }

    console.log('message ---', message);

    if (message.text) {
        const textMessage = modify.getCreator().startMessage();
        textMessage.setRoom(room);
        textMessage.setSender(sender);
        textMessage.setText(message.text);
        if (message.attachments) {
            textMessage.setAttachments(message.attachments);
        }
        await modify.getCreator().finish(textMessage);
    }

    const block = modify.getCreator().getBlockBuilder();
    let interactiveMessage: IMessageBuilder | undefined;
    if (buttons?.length) {
        console.log('---- building buttons');
        const actionElements: Array<IBlockElement> = [];
        interactiveMessage = modify.getCreator().startMessage();
        const buttonElements = buttons.map((button) => buildButton(block, button));
        actionElements.push(...buttonElements);
        block.addActionsBlock({ elements: actionElements });
    }

    if (interactiveMessage) {
        console.log('---- Interactive message has been presented');
        interactiveMessage.setRoom(room);
        interactiveMessage.setSender(sender);
        interactiveMessage.setBlocks(block);
        await modify.getCreator().finish(interactiveMessage);
    }
};
