import { Listener } from "discord-akairo";
import { TextChannel, Message } from "discord.js";
import { FlameConsole } from "../../structures/Console";
import API from "../../api/API";

import { Repository } from "typeorm";
import ReminderManager from "../../structures/misc/ReminderManager";
import { Reminder } from "../../models/Reminder";
import GiveawayManager from "../../structures/misc/GiveawayManager";
import { Giveaway } from "../../models/Giveaway";

export default class ReadyListener extends Listener {
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
