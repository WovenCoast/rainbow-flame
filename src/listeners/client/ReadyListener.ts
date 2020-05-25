import { Listener } from "discord-akairo";
import { TextChannel, Message } from "discord.js";
import { Repository } from "typeorm";
import { Giveaway } from "../../models/Giveaway";
import GiveawayManager from "../../structures/giveaways/GiveawayManager";

export default class ReadyListener extends Listener {
  public constructor() {
    super("ready", {
      emitter: "client",
      event: "ready",
      category: "client",
    });
  }

  public async exec(): Promise<void> {
    await this.client.manager.connect();
    this.client.manager.on("error", (error, node) =>
      console.error(error, node)
    );

    const giveawayRepo: Repository<Giveaway> = this.client.db.getRepository(
      Giveaway
    );

    console.log(`${this.client.user.tag} is online and ready!`);

    const giveaways: Giveaway[] = await giveawayRepo.find();
    giveaways
      .filter((g) => g.end <= Date.now()) // Giveaways that have finished
      .map(async (g) => {
        const msg: Message = await (
          await (this.client.channels.cache.get(
            g.channel
          ) as TextChannel).messages
            .fetch()
            .catch(() => null)
        ).get(g.message);
        GiveawayManager.end(giveawayRepo, msg); // End them as soon as the bot is alive
      });
    giveaways
      .filter((g) => !(g.end <= Date.now())) // Giveaways that have not finished
      .map(async (g) => {
        const msg: Message = await (
          await (this.client.channels.cache.get(
            g.channel
          ) as TextChannel).messages.fetch()
        ).get(g.message);
        if (!msg) giveawayRepo.delete(g);
        // Restart the timeout with the correct time
        setTimeout(() => {
          GiveawayManager.end(giveawayRepo, msg);
        }, g.end - Date.now());
      });
  }
}
