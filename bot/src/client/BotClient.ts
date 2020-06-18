import { AkairoClient, CommandHandler, ListenerHandler } from "discord-akairo";
import { join } from "path";
import { prefix, owners, dbName, lavalink, colors } from "../Config";
import { Connection } from "typeorm";
import Database from "../structures/Database";
import { FlameGuild } from "../structures/discord.js/Guild";
FlameGuild;
import { Message } from "discord.js";
import { Manager } from "@lavacord/discord.js";
import { APIManager } from "../structures/APIManager";
import { FlameConsole } from "../structures/Console";
import { MessageEmbed } from "discord.js";
import SettingsProvider from "../structures/SettingsProvider";
import { Setting } from "../models/Settings";
global.console = new FlameConsole(process.stdout, process.stderr, false);

declare module "discord-akairo" {
  interface AkairoClient {
    console: FlameConsole;
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
    db: Connection;
    settings: SettingsProvider;
    manager: Manager;
    apis: APIManager;
  }
}

interface BotOptions {
  token?: string;
  owners?: string | string[];
}

export default class BotClient extends AkairoClient {
  public config: BotOptions;
  public db: Connection;
  public settings: SettingsProvider;
  public console: FlameConsole = new FlameConsole(
    process.stdout,
    process.stderr,
    false
  );
  public manager: Manager = new Manager(this, [lavalink]);
  public apis: APIManager = new APIManager(this);
  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: join(__dirname, "../listeners"),
  });
  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: join(__dirname, "../commands"),
    prefix: prefix,
    automateCategories: true,
    blockBots: true,
    allowMention: true,
    handleEdits: true,
    commandUtil: true,
    commandUtilLifetime: 3e5,
    defaultCooldown: 6e4,
    argumentDefaults: {
      prompt: {
        modifyStart: (_: Message, str: string): MessageEmbed =>
          new MessageEmbed()
            .setColor(colors.primary)
            .setDescription(
              `${_.author}, ${str}\n\nType \`cancel\` to cancel the command...`
            )
            .setFooter("Type 'cancel' or wait until prompt ends at")
            .setTimestamp(Date.now() + 3e4),
        modifyRetry: (_: Message, str: string): MessageEmbed =>
          new MessageEmbed()
            .setColor(colors.primary)
            .setDescription(
              `${_.author}, ${str}\n\nType \`cancel\` to cancel the command...`
            )
            .setFooter("Type 'cancel' or wait until prompt ends at")
            .setTimestamp(Date.now() + 3e4),
        timeout: new MessageEmbed()
          .setColor(colors.error)
          .setDescription(
            "You took too long! The command has been cancelled..."
          ),
        ended: new MessageEmbed()
          .setColor(colors.error)
          .setDescription(
            "You exceeded the maximum amount of tries, this command has been cancelled..."
          ),
        cancel: new MessageEmbed()
          .setColor(colors.error)
          .setDescription("The command has been cancelled..."),
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

    this.settings = new SettingsProvider(this.db.getRepository(Setting));
  }

  public async start(): Promise<string> {
    await this._init();
    return await this.login(this.token);
  }
}
