import { Listener, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { colors, prefix } from "../../Config";
import { titleCase, convertMs } from "../../Utils";

export default class CooldownListener extends Listener {
  constructor() {
    super("cooldown", {
      emitter: "commandHandler",
      event: "cooldown",
      category: "akairo",
    });
  }

  public async exec(msg: Message, command: Command | null, remaining: number) {
    console.log(
      "akairo",
      `{user} tried to execute {command} with a cooldown of {cooldown}`,
      {
        user: msg.author.tag,
        command: command.id,
        cooldown: convertMs(remaining),
      }
    );
    msg.util.send(
      new MessageEmbed()
        .setColor(colors.error)
        .setAuthor(
          `Cooldown | ${msg.author.tag}`,
          msg.author.displayAvatarURL({ dynamic: true })
        )
        .setDescription(
          `You can use the command **${command.id}** in **${convertMs(
            remaining
          )}**`
        )
        .setFooter(
          `Cooldown ends in ${convertMs(remaining)}`,
          msg.guild.iconURL({ dynamic: true })
        )
    );
  }
}
