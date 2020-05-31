import { Command } from "discord-akairo";
import { Message, GuildMember, User, MessageEmbed } from "discord.js";
import { Repository } from "typeorm";

import { Warn } from "../../models/Warn";
import { Mute } from "../../models/Mute";
import { colors } from "../../Config";

export default class ModlogsCommand extends Command {
  public constructor() {
    super("modlogs", {
      aliases: ["modlogs", "modlog", "infractions"],
      category: "Moderation",
      description: {
        content: "Check the mod log of a member",
        usage: "modlogs <member>",
        examples: ["modlogs FlameXode"],
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
      user: member.user.id,
      guild: message.guild.id,
    });
    if (!warns.length)
      return message.util.send(
        `**${member.user.tag}**, you've been a good boi! No mod logs found`
      );
    const muteRepo: Repository<Mute> = this.client.db.getRepository(Mute);
    const mutes: Mute[] = await muteRepo.find({
      user: member.user.id,
      guild: message.guild.id,
    });
    const logs = await Promise.all(
      [...warns, ...mutes]
        .sort((a, b) => a.time - b.time)
        .map(async (v: Warn | Mute, i: number) => {
          const mod: User = await this.client.users
            .fetch(v.moderator)
            .catch(() => null);
          if (mod)
            return {
              index: i + 1,
              moderator: mod.tag,
              //@ts-ignore
              time: v.end ? v.end : v.time,
              reason: v.reason,
            };
        })
        .reverse()
    );

    return message.util.send(
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(
          `Mod logs | ${member.user.tag}`,
          member.user.displayAvatarURL({ dynamic: true })
        )
        .setDescription(
          logs
            .map(
              (v) =>
                `\`#${v.index}\` Moderator: **${v.moderator}** | Reason: **${v.reason}**`
            )
            .join("\n")
        )
    );
  }
}
