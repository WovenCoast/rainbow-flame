import { AkairoClient, CommandHandler, ListenerHandler } from "discord-akairo";
import { join } from "path";
import { prefix, owners, dbName, lavalink, userID } from "../Config";
import { Connection } from "typeorm";
import Database from "../structures/Database";
import Guild from "../structures/discord.js/Guild";
Guild; // TypeScript removes unused imports when compiling. Don't remove this line.
import { Message } from "discord.js";
import { Manager } from "@lavacord/discord.js";

declare module "discord-akairo" {
  interface AkairoClient {
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
    db: Connection;
    manager: Manager;
  }
}

interface BotOptions {
  token?: string;
  owners?: string | string[];
}

export default class BotClient extends AkairoClient {
  public config: BotOptions;
  public db: Connection;
  public manager: Manager = new Manager(this, [lavalink]);
  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: join(__dirname, "../listeners"),
  });
  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: join(__dirname, "../commands"),
    prefix: prefix,
    allowMention: true,
    handleEdits: true,
    commandUtil: true,
    commandUtilLifetime: 3e5,
    defaultCooldown: 6e4,
    argumentDefaults: {
      prompt: {
        modifyStart: (_: Message, str: string): string =>
          `${_.author}, ${str}\n\nType \`cancel\` to cancel the command...`,
        modifyRetry: (_: Message, str: string): string =>
          `${_.author}, ${str}\n\nType \`cancel\` to cancel the command...`,
        timeout: "You took too long! The command has been cancelled...",
        ended:
          "You exceeded the maximum amount of tries, this command has been cancelled...",
        cancel: "The command has been cancelled...",
        retries: 3,
        time: 3e4,
      },
      otherwise: "",
    },
    ignorePermissions: owners,
  });

  public constructor(config: BotOptions) {
    super({
      ownerID: owners,
    });
    this.config = config;
  }

  private async _init(): Promise<void> {
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler,
      process,
    });

    this.commandHandler.loadAll();
    this.listenerHandler.loadAll();

    this.db = Database.get(dbName);
    await this.db.connect();
    await this.db.synchronize();
  }

  public async start(): Promise<string> {
    await this._init();
    return await this.login(this.token);
  }
}
