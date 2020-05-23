import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { convertMs } from "../../Utils";

export default class PingCommand extends Command {
  public constructor() {
    super("ping", {
      aliases: ["ping", "pong", "p"],
      category: "Misc",
      description: {
        content: "Check the latency from the bot to the discord api",
        usage: "ping",
        examples: ["ping"],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message): Promise<Message> {
    const msg = await message.util.send(`Pinging...`);
    return await msg.edit(
      `:ping_pong: Pong! Gateway: **${convertMs(
        this.client.ws.ping
      )}**, HTTP API: **${convertMs(
        Math.abs(Math.round((Date.now() - msg.createdTimestamp) / 2))
      )}**`
    );
  }
}
