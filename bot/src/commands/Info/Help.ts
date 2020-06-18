import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { colors } from "../../Config";
import { pluralify } from "../../Utils";

export default class HelpCommand extends Command {
  constructor() {
    super("help", {
      aliases: ["help", "h", "commandinfo"],
      category: "Info",
      ratelimit: 5,
      description: {
        content: "Display the commands of me",
        usage: "help [category|command:string]",
        examples: ["help ping", "help misc"],
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
    const embed = new MessageEmbed()
      .setAuthor(
        `Help | ${message.author.tag}`,
        message.author.displayAvatarURL({ dynamic: true })
      )
      .setColor(colors.info);
    if (!arg) {
      for (const category of this.handler.categories.values()) {
        embed.addField(
          `${category.id}: ${pluralify(category.size, "command")}`,
          category.map((cmd) => `\`${cmd.id}\``).join(", ")
        );
      }
    } else {
      const category = this.client.commandHandler.findCategory(arg);
      if (!category) {
        const command = this.client.commandHandler.findCommand(arg);
        if (!command)
          return message.util.reply(
            `\`${arg}\` is not a valid category or command!`
          );
        const commandInfo = {
          Name: command.id,
          Description:
            command.description.content ||
            "*Responsible developer did not provide a description*",
          Category: command.categoryID,
          Aliases: command.aliases,
          Usage: command.description.usage || command.id,
          Examples: command.description.examples || command.id,
          "User Perms": command.userPermissions || "None",
          "Client Perms": command.clientPermissions || "None",
        };
        embed.setDescription(
          Object.keys(commandInfo)
            .map(
              (key) =>
                `${key}: ${
                  commandInfo[key] instanceof Array
                    ? (commandInfo[key] as Array<string>)
                        .map((s) => `\`${s}\``)
                        .join(", ")
                    : `\`${commandInfo[key]}\``
                }`
            )
            .join("\n")
        );
      } else {
        embed.setTitle(category.id).setDescription(
          category
            .map((cmd) =>
              this.client.commandHandler.runPermissionChecks(message, cmd)
                ? `\`${this.prefix} ${cmd.id}\``
                : null
            )
            .filter((c) => c !== null)
            .join(", ")
        );
      }
    }
    return message.util.send(embed);
  }
}
