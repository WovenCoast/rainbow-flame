import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { performance } from "perf_hooks";
import { convertMs, exec } from "../../Utils";

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
    console.log("akairo", "Reloading bot, instantiated by {user}", {
      user: message.author.tag,
    });
    const msg = await message.channel.send(
      "<a:loading:720659901235331142> Pulling from git..."
    );
    const gitTimeStart = performance.now();
    try {
      await exec("git pull");
    } catch (e) {
      return msg.edit(`:x: Git pull failed with this error \`\`\`\n${e}\`\`\``);
    }
    const gitTime = performance.now() - gitTimeStart;

    msg.edit("<a:loading:720659901235331142> Building files...");
    const buildTimeStart = performance.now();
    try {
      await exec("cd ./bot && tsc");
    } catch (e) {
      return msg.edit(`:x: Build failed with this error \`\`\`\n${e}\`\`\``);
    }
    const buildTime = performance.now() - buildTimeStart;

    await msg.edit("<a:loading:720659901235331142> Reloading commands...");
    const commandReloadStart = performance.now();
    this.client.commandHandler.reloadAll();
    const commandReload = performance.now() - commandReloadStart;

    await msg.edit("<a:loading:720659901235331142> Reloading events...");
    const eventReloadStart = performance.now();
    this.client.listenerHandler.reloadAll();
    const eventReload = performance.now() - eventReloadStart;

    return await msg.edit(
      `:white_check_mark: Files were pulled in **${convertMs(
        gitTime
      )}**, rebuilt in **${convertMs(
        buildTime
      )}**, commands were reloaded in **${convertMs(
        commandReload
      )}** and events were reloaded in **${convertMs(eventReload)}**.`
    );
  }
}
