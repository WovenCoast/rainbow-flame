import { Command } from "discord-akairo";
import { Message, GuildMember, MessageEmbed } from "discord.js";
import { Rank } from "../../models/Rank";
import { loading } from "../../Emojis";
import { colors } from "../../Config";

const pageWidth = 10;

export default class LeaderboardCommand extends Command {
  constructor() {
    super("leaderboard", {
      aliases: ["leaderboard", "lb"],
      category: "Levels",
      description: {
        content: "View the leaderboard of this server",
        usage: "leaderboard [member]",
        examples: ["leaderboard", "leaderboard FlameXode"],
      },
      ratelimit: 3,
      args: [
        {
          id: "member",
          type: "member",
          default: (msg: Message) => msg.member,
        },
      ],
    });
  }

  public async exec(message: Message, { member }: { member: GuildMember }) {
    if (member.user.bot)
      return await message.util.send(`:x: \`${member.user.tag}\` is a bot!`);
    if (member.guild.id !== message.guild.id)
      return await message.util.send(
        `:x: \`${member.user.tag}\` is from another guild!`
      );
    const msg = await message.util.send(
      `${loading} Retrieving leaderboard info...`
    );
    const rankRepo = this.client.db.getRepository(Rank);
    const rank = await rankRepo.findOne({
      guild: message.guild.id,
      user: member.user.id,
    });
    if (!rank) return msg.edit(`:x: That person doesn't have a rank!`);
    const ranks = (
      await rankRepo.find({ guild: message.guild.id })
    ).sort((a, b) => (a.level === b.level ? b.xp - a.xp : b.level - a.level));
    const position = ranks.indexOf(
      ranks.find((r) => rank.guild === r.guild && r.user === rank.user)
    );
    const pageIndex =
      Math.floor(
        (position / ranks.length) * Math.ceil(ranks.length / pageWidth)
      ) + 1;
    const page = ranks.slice(
      (pageIndex - 1) * pageWidth,
      pageIndex * pageWidth
    );
    return msg.edit(
      `:white_check_mark: Successfully found leaderboard information about **${member.user.tag}**!`,
      new MessageEmbed()
        .setColor(colors.info)
        .setDescription(
          page
            .map((r, i) =>
              `#${
                i + (pageIndex - 1) * pageWidth !== position
                  ? ""
                  : ":arrow_forward:"
              } \`#${i + 1 + (pageIndex - 1) * pageWidth}\`: <@${
                r.user
              }> [ Level **${r.level}** | **${r.xp} XP** ]`.trim()
            )
            .join("\n")
        )
    );
  }
}
