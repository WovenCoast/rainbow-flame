import { Listener, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { colors, prefix } from "../../Config";
import { titleCase } from "../../Utils";

export default class ErrorListener extends Listener {
  constructor() {
    super("error", {
      emitter: "commandHandler",
      event: "error",
      category: "akairo",
    });
  }

  public async exec(error: Error, msg: Message, command: Command | null) {
    console.error("akairo", error);
    msg.util.send(
      new MessageEmbed()
        .setColor(colors.error)
        .setAuthor(
          `Error | ${command.id}`,
          msg.author.displayAvatarURL({ dynamic: true })
        )
        .setDescription(`\`\`\`\n${error}\`\`\``)
        .setFooter(
          `Error in CommandHandler`,
          msg.guild.iconURL({ dynamic: true })
        )
    );
  }
}
