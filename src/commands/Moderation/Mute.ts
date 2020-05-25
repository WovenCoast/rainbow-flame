import { Command } from "discord-akairo";
import { Message, GuildMember } from "discord.js";
import { Repository } from "typeorm";

import { Mute } from "../../models/Mute";
import MuteManager from "../../structures/moderation/MuteManager";

export default class MuteCommand extends Command {
  public constructor() {
    super("mute", {
      aliases: ["mute"],
      category: "Moderation",
      description: {
        content: "Mute a member in this server",
        usage: "mute <member> <reason>",
        examples: ["mute FlameXode Stopped my music"],
      },
      ratelimit: 3,
      userPermissions: ["KICK_MEMBERS"],
      clientPermissions: ["MANAGE_ROLES", "MANAGE_CHANNELS"],
      args: [
        {
          id: "member",
          type: "member",
          prompt: {
            start: (msg: Message) => `please provide a member to mute`,
            retry: (msg: Message) => `please provide a valid member to mute`,
          },
        },
        {
          id: "reason",
          type: "string",
          match: "rest",
          default: "No reason at all",
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { member, reason }: { member: GuildMember; reason: string }
  ): Promise<Message> {
    const muteRepo: Repository<Mute> = this.client.db.getRepository(Mute);
    if (
      (member.user.id === message.guild.ownerID
        ? Infinity
        : member.roles.highest.position) <=
      message.member.roles.highest.position
    )
      return message.util.reply(
        "the member you tried to mute has more permissions than you!"
      );
    if (
      (member.user.id === message.guild.ownerID
        ? Infinity
        : member.roles.highest.position) <=
      message.guild.me.roles.highest.position
    )
      return message.util.reply(
        "you're trying to mute a member that I can't mute!"
      );
    const mute: Mute = (
      await muteRepo.find({
        user: member.user.id,
        guild: member.guild.id,
        active: true,
      })
    )[0];
    if (mute)
      return message.util.reply(
        "the member you tried to mute is already muted!"
      );
    try {
      await MuteManager.mute(muteRepo, {
        moderator: message.author,
        reason,
        member,
      });
      return message.util.send(
        `**${member.user.tag}** has been muted by **${message.author.tag}** for **${reason}**!`
      );
    } catch (e) {
      message.util.reply(
        `Something went terribly wrong:- \`\`\`${e.stack}\`\`\``
      );
    }
  }
}
