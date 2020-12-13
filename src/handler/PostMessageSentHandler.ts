import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ILivechatMessage, ILivechatRoom } from '@rocket.chat/apps-engine/definition/livechat';
import { RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { UserType } from '@rocket.chat/apps-engine/definition/users';
import { BotBridgeApp } from '../../BotBridgeApp';
import { sendMessageToBackend } from '../sendMessageToBackend';

export class PostMessageSentHandler {
    constructor(private readonly app: BotBridgeApp,
                private readonly message: ILivechatMessage,
                private readonly read: IRead,
                private readonly http: IHttp,
                private readonly persistence: IPersistence,
                private readonly modify: IModify) {}

    // todo: mentions
    // todo: setting for triggered on every message
    public async run() {
        const { text, editedAt, room, token, sender } = this.message;

        if (sender.type === UserType.BOT) {
            return;
        }
        const isPersonalMessage = room.type === RoomType.DIRECT_MESSAGE;
        if (!isPersonalMessage) {
            return;
        }

        const targetBotUid = room.userIds?.filter((uid) => !!this.app.bots[uid])[0];
        if (!targetBotUid) {
            return;
        }

        if (sender.id === targetBotUid) {
            return;
        }

        try {
            await sendMessageToBackend(this.message, this.read, this.http, this.persistence, this.modify, this.app.bots[targetBotUid]);
        } catch (error) {
            this.app.getLogger().error(`Error send message to backend: ${error.message}`);
        }
    }
}
