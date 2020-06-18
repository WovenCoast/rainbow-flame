import { Listener } from "discord-akairo";
import { Guild } from "discord.js";

export default class BotJoinedGuildListener extends Listener {
  constructor() {
    super("botjoinedguild", {
      emitter: "client",
      event: "guildCreate",
      category: "client",
    });
  }

  public async exec(guild: Guild) {
    console.log("discord.js", "{user} joined {guild}", {
      user: this.client.user.tag,
      guild: guild.name,
    });
  }
}
