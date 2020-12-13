import {
    IAppAccessors,
    IConfigurationExtend, IConfigurationModify,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {ApiSecurity, ApiVisibility} from '@rocket.chat/apps-engine/definition/api';
import {App} from '@rocket.chat/apps-engine/definition/App';
import {IMessage, IPostMessageSent} from '@rocket.chat/apps-engine/definition/messages';
import {IAppInfo} from '@rocket.chat/apps-engine/definition/metadata';
import {ISetting, SettingType} from '@rocket.chat/apps-engine/definition/settings';
import {
    IUIKitInteractionHandler,
    IUIKitResponse,
    UIKitBlockInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';
import {BackendRequestEndpoint} from './src/api/BackendRequestEndpoint';
import { handleButtonClick } from './src/handleButtonClick';
import { PostMessageSentHandler } from './src/handler/PostMessageSentHandler';

export class BotBridgeApp extends App implements IPostMessageSent, IUIKitInteractionHandler {
    public bots: {} = {};
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }
    public async onEnable(environment: IEnvironmentRead, configurationModify: IConfigurationModify): Promise<boolean> {
        const controlledBotsList: string = await environment.getSettings().getValueById('controlled-bots');
        await this.updateControlledBots(controlledBotsList);
        return true;
    }
    public async updateControlledBots(botsList: string): Promise<void> {
        const selfUser = await this.getAccessors().reader.getUserReader().getAppUser(this.getID());
        this.bots = {};
        if (selfUser) {
            this.bots[selfUser.id] = selfUser;
        }
        botsList.split(/,\ ?/).map((botUsername) => {
            this.getAccessors().reader.getUserReader().getByUsername(botUsername).then((user) => {
                this.bots[user.id] = user;
            });
        });
    }
    public async onSettingUpdated(setting: ISetting, configurationModify: IConfigurationModify, read: IRead, http: IHttp): Promise<void> {
        switch (setting.id) {
            case 'controlled-bots': {
                const controlledBotsList: string = setting.value;
                this.updateControlledBots(controlledBotsList);
            }
        }
    }

    public async initialize(configurationExtend: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
        const selfUser = await this.getAccessors().reader.getUserReader().getAppUser(this.getID());
        console.debug('Initialize', selfUser);
        if (selfUser) {
            this.bots[selfUser.id] = selfUser;
        }

        await configurationExtend.settings.provideSetting({
            id: 'backend-url',
            required: true,
            type: SettingType.STRING,
            public: false,
            packageValue: 'http://localhost:3228',
            i18nLabel: 'Backend url',
        });
        await configurationExtend.settings.provideSetting({
            id: 'controlled-bots',
            required: false,
            type: SettingType.STRING,
            public: false,
            packageValue: undefined,
            i18nLabel: 'Controlled bots',
            i18nDescription: 'comma-separated list of accounts usernames',
        });

        await configurationExtend.api.provideApi({
            visibility: ApiVisibility.PRIVATE,
            security: ApiSecurity.UNSECURE,
            endpoints: [
                new BackendRequestEndpoint(this),
            ],
        });
    }

    public async executePostMessageSent(message: IMessage,
                                        read: IRead,
                                        http: IHttp,
                                        persistence: IPersistence,
                                        modify: IModify): Promise<void> {
        const handler = new PostMessageSentHandler(this, message, read, http, persistence, modify);
        await handler.run();
    }

    public async executeBlockActionHandler(
        context: UIKitBlockInteractionContext,
        read: IRead, http: IHttp, persistence: IPersistence, modify: IModify,
    ): Promise<IUIKitResponse> {
        const data = context.getInteractionData();
        switch (data.actionId) {
            case 'push-bot-button': {

                await handleButtonClick(context, read, http, persistence, modify);

                const room = context.getInteractionData().room;
                if (!room) {
                    return {success: false};
                }

                return {
                    success: true,
                };
            }
        }
        return {success: false};
    }
}
