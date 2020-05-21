import { Command } from "discord-akairo";
import { Message, GuildMember } from "discord.js";
import { Repository } from "typeorm";

import { Warn } from "../../models/Warn";

export default class WarnCommand extends Command {
  public constructor() {
    super("warn", {
      aliases: ["warn"],
      category: "Moderation",
      description: {
        content: "Warn a member in this server",
        usage: "warn <member> <reason>",
        examples: ["warn FlameXode Stopped my music"],
      },
      ratelimit: 3,
      userPermissions: ["MANAGE_MESSAGES"],
      args: [
        {
          id: "member",
          type: "member",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a member to warn`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid member to warn`,
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
    const warnRepo: Repository<Warn> = this.client.db.getRepository(Warn);
    if (
      member.roles.highest.position >= message.member.roles.highest.position &&
      message.author.id !== message.guild.ownerID
    )
      return message.util.reply(
        "the member you tried to warn has more permissions than you!"
      );
    await warnRepo.insert({
      guild: message.guild.id,
      user: member.id,
      moderator: message.author.id,
      time: Date.now(),
      reason,
    });
    return message.util.send(
      `**${member.user.tag}** has been warned by **${message.author.tag}** for **${reason}**!`
    );
  }
}
