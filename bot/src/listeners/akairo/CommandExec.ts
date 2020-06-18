import { Listener, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { colors, prefix } from "../../Config";
import { titleCase, convertMs } from "../../Utils";

export default class CommandExecListener extends Listener {
  constructor() {
    super("commandexec", {
      emitter: "commandHandler",
      event: "commandStarted",
      category: "akairo",
    });
  }

  public async exec(msg: Message, command: Command, args: any[]) {
    console.log("akairo", `{user} executed {command} in {guild}`, {
      user: msg.author.tag,
      command: command.id,
      guild: msg.guild.name,
    });
  }
}
