import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { loading } from "../../Emojis";

export default class RestartCommand extends Command {
  constructor() {
    super("restart", {
      aliases: ["restart"],
      ownerOnly: true,
      category: "Bot Owner",
      description: {
        content: "Restarts the bot",
        usage: "restart",
        examples: ["restart"],
      },
      ratelimit: 2,
    });
  }
  async exec(message: Message) {
    const msg = await message.util.send(`${loading} Restarting...`);
    await this.client.settings.set(null, "restart.invoked", true);
    await this.client.settings.set(null, "restart.message", msg.id);
    await this.client.settings.set(null, "restart.channel", msg.channel.id);
    await this.client.settings.set(null, "restart.timestamp", Date.now());
    process.exit(0);
  }
}
