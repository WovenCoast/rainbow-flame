import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { colors } from "../../Config";

export default class HelpCommand extends Command {
  constructor() {
    super("help", {
      aliases: ["help", "h", "commandinfo"],
      ratelimit: 5,
      description: {
        content: "Display the commands of me",
        usage: "help [category|command:string]",
        examples: ["help ping", "help musc"],
      },
      args: [
        {
          id: "arg",
          type: "string",
          default: null,
        },
      ],
    });
  }

  public async exec(message: Message, { arg }: { arg: string }): Promise<any> {
    if (!arg) {
      const embed = new MessageEmbed()
        .setAuthor(
          `Help | ${message.author.tag}`,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setColor(colors.info);
      return message.util.send(embed);
    }
  }
}
