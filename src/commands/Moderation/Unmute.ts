import { Command } from "discord-akairo";
import { Message, GuildMember } from "discord.js";
import { Repository } from "typeorm";

import { Mute } from "../../models/Mute";
import MuteManager from "../../structures/moderation/MuteManager";

export default class UnmuteCommand extends Command {
  public constructor() {
    super("unmute", {
      aliases: ["unmute"],
      category: "Moderation",
      description: {
        content: "Unmute a member in this server",
        usage: "unmute <member> <reason>",
        examples: ["unmute FlameXode Stopped my music"],
      },
      ratelimit: 3,
      userPermissions: ["KICK_MEMBERS"],
      args: [
        {
          id: "member",
          type: "member",
          prompt: {
            start: (msg: Message) => `please provide a member to unmute`,
            retry: (msg: Message) => `please provide a valid member to unmute`,
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
      member.roles.highest.position >= message.member.roles.highest.position &&
      message.author.id !== message.guild.ownerID
    )
      return message.util.reply(
        "the member you tried to unmute has more permissions than you!"
      );
    await MuteManager.unmute(muteRepo, { member, reason });
    return message.util.send(
      `**${member.user.tag}** has been unmuted by **${message.author.tag}** for **${reason}**!`
    );
  }
}
