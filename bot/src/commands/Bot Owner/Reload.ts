import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { performance } from "perf_hooks";
import { convertMs } from "../../Utils";

export default class ReloadCommand extends Command {
  constructor() {
    super("reload", {
      aliases: ["reload"],
      category: "Bot Owner",
      description: {
        content: "Reload all the commands and events of this bot!",
        usage: "reload",
        examples: ["reload"],
      },
      ownerOnly: true,
    });
  }

  public async exec(message: Message): Promise<any> {
    const commandReloadStart = performance.now();
    this.client.commandHandler.reloadAll();
    const commandReload = performance.now() - commandReloadStart;

    const eventReloadStart = performance.now();
    this.client.listenerHandler.reloadAll();
    const eventReload = performance.now() - eventReloadStart;

    return await message.util.send(
      `:white_check_mark: Commands were reloaded in **${convertMs(
        commandReload
      )}** and events were reloaded in **${convertMs(eventReload)}**.`
    );
  }
}
