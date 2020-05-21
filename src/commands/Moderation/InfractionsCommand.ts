import { Command } from "discord-akairo";
import { Message, GuildMember, User, MessageEmbed } from "discord.js";
import { Repository } from "typeorm";

import { Warn } from "../../models/Warn";
import { colors } from "../../Config";

export default class InfractionsCommand extends Command {
  public constructor() {
    super("infractions", {
      aliases: ["infractions"],
      category: "Moderation",
      description: {
        content: "Check the infractions of a member",
        usage: "infractions <member>",
        examples: ["infractions FlameXode"],
      },
      ratelimit: 3,
      userPermissions: ["MANAGE_MESSAGES"],
      args: [
        {
          id: "member",
          type: "member",
          default: (msg: Message) => msg.member,
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { member }: { member: GuildMember }
  ): Promise<Message> {
    const warnRepo: Repository<Warn> = this.client.db.getRepository(Warn);
    const warns: Warn[] = await warnRepo.find({
      user: member.id,
      guild: message.guild.id,
    });
    if (!warns.length)
      return message.util.send(
        `**${member.user.tag}**, you've been a good boi! No infractions found`
      );

    const infractions = await Promise.all(
      [...warns]
        .sort((a, b) => a.time - b.time)
        .map(async (v, i: number) => {
          const mod: User = await this.client.users
            .fetch(v.moderator)
            .catch(() => null);
          if (mod)
            return {
              index: i + 1,
              moderator: mod.tag,
              time: v.time,
              reason: v.reason,
            };
        })
        .reverse()
    );

    return message.util.send(
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(
          `Infractions | ${member.user.tag}`,
          member.user.displayAvatarURL({ dynamic: true })
        )
        .setDescription(
          infractions
            .map(
              (v) =>
                `\`#${v.index}\` Moderator: **${v.moderator}** | Reason: **${v.reason}**`
            )
            .join("\n")
        )
    );
  }
}
