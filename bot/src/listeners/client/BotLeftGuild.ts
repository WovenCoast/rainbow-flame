import { Listener } from "discord-akairo";
import { Guild } from "discord.js";

export default class BotLeftGuildListener extends Listener {
  constructor() {
    super("botleftguild", {
      emitter: "client",
      event: "guildDelete",
      category: "client",
    });
  }

  public async exec(guild: Guild) {
    console.log("discord.js", "{user} left {guild}", {
      user: this.client.user.tag,
      guild: guild.name,
    });
  }
}
