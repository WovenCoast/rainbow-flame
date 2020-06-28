import { Listener, AkairoClient } from "discord-akairo";
import { TextChannel, Message } from "discord.js";
import { FlameConsole } from "../../structures/Console";
import { getRandom, pluralify, convertMs } from "../../Utils";
import { debug, prefix } from "../../Config";
import API from "../../api/API";

import { Repository } from "typeorm";
import ReminderManager from "../../structures/misc/ReminderManager";
import { Reminder } from "../../models/Reminder";
import GiveawayManager from "../../structures/misc/GiveawayManager";
import { Giveaway } from "../../models/Giveaway";

const statuses = ["online", "idle", "dnd"];
const presences = [
  (client: AkairoClient) => `${pluralify(client.guilds.cache.size, "guild")}`,
  (client: AkairoClient) => `${pluralify(client.users.cache.size, "user")}`,
  (client: AkairoClient) =>
    `${pluralify(client.users.cache.filter((u) => !u.bot).size, "human")}`,
  (client: AkairoClient) =>
    `${pluralify(client.users.cache.filter((u) => u.bot).size, "bot")}`,
  (client: AkairoClient) =>
    `${pluralify(client.channels.cache.size, "channel")}`,
];
export default class ReadyListener extends Listener {
  private currentStatus: number = -1;
  public constructor() {
    super("ready", {
      emitter: "client",
      event: "ready",
      category: "client",
    });
  }

  public async exec(): Promise<void> {
    (console as FlameConsole).log("discord.js", `{user} is online and ready!`, {
      user: this.client.user.tag,
    });
    if (!debug) {
      setInterval(() => {
        this.currentStatus++;
        this.currentStatus = this.currentStatus % statuses.length;
        this.client.user.setPresence({
          status: statuses[this.currentStatus] as "online" | "idle" | "dnd",
          activity: {
            type: "WATCHING",
            name: `${getRandom(presences)(this.client)} | ${prefix} help`,
          },
        });
      }, 15e3);
    }
    // Restart invoked by owner
    if (this.client.settings.get(null, "restart.invoked", false) === true) {
      this.client.settings.set(null, "restart.invoked", false);
      const timestampStart: number = this.client.settings.get(
        null,
        "restart.timestamp",
        null
      );
      this.client.settings.set(null, "restart.timestamp", null);
      const channel: TextChannel = (await this.client.channels.fetch(
        this.client.settings.get(null, "restart.channel", null)
      )) as TextChannel;
      this.client.settings.set(null, "restart.channel", null);
      const message: Message = await channel.messages.fetch(
        this.client.settings.get(null, "restart.message", null)
      );
      this.client.settings.set(null, "restart.message", null);
      const timestamp = Date.now() - timestampStart;
      await message.edit(
        `:white_check_mark: Successfully restarted the bot in **${convertMs(
          timestamp
        )}**!`
      );
    }
    // API
    new API(this.client).start();
    // Lavalink
    this.client.manager.on("ready", (node) => {
      (console as FlameConsole).log(
        "lavalink",
        `Lavalink ID {node} is ready!`,
        { node: node.id }
      );
    });
    this.client.manager.on("error", (error, node) => {
      (console as FlameConsole).error("lavalink", node.id, error);
    });
    await this.client.manager.connect();

    // Reminders
    try {
      const reminderRepo: Repository<Reminder> = this.client.db.getRepository(
        Reminder
      );
      const reminders: Reminder[] = await reminderRepo.find();
      await Promise.all(
        reminders.map(async (r) => {
          if (r.end <= Date.now()) {
            ReminderManager.end(this.client, reminderRepo, r.uniqueId);
          } else {
            setTimeout(() => {
              ReminderManager.end(this.client, reminderRepo, r.uniqueId);
            }, r.end - Date.now());
          }
        })
      );

      // Giveaways
      const giveawayRepo: Repository<Giveaway> = this.client.db.getRepository(
        Giveaway
      );
      const giveaways: Giveaway[] = await giveawayRepo.find();
      await Promise.all(
        giveaways.map(async (g) => {
          const msg: Message = await (
            await (this.client.channels.cache.get(
              g.channel
            ) as TextChannel).messages.fetch()
          ).get(g.message);
          if (!msg) giveawayRepo.delete(g);
          if (!g.end || g.end <= Date.now()) {
            GiveawayManager.end(giveawayRepo, msg);
          } else {
            setTimeout(() => {
              GiveawayManager.end(giveawayRepo, msg);
            }, g.end - Date.now());
          }
        })
      );
    } catch (e) {
      return;
    }
  }
}
