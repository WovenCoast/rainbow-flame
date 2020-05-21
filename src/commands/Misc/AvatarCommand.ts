import { Command } from "discord-akairo";
import { Message, GuildMember, MessageEmbed, ImageSize } from "discord.js";
import { colors } from "../../Config";

export default class AvatarCommand extends Command {
  public constructor() {
    super("avatar", {
      aliases: ["avatar", "av", "avtr", "picture"],
      category: "Misc",
      description: {
        content: "Display the avatar of a member",
        usage: "avatar [member]",
        examples: [
          "avatar FlameXode",
          "avatar 502446928303226890",
          "avatar @FlameXode#1553",
          "avatar",
          "avatar --size=4096",
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: "member",
          type: "member",
          match: "rest",
          default: (msg: Message) => msg.member,
        },
        {
          id: "size",
          type: (_: Message, str: string): null | Number => {
            if (
              str &&
              !isNaN(Number(str)) &&
              [16, 32, 64, 128, 256, 512, 1024, 2048, 4096].includes(
                Number(str)
              )
            )
              return Number(str);
            return null;
          },
          match: "option",
          flag: ["-s=", "-size=", "--size="],
          default: 2048,
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { member, size }: { member: GuildMember; size: number }
  ): Promise<Message> {
    return message.util.send(
      new MessageEmbed()
        .setAuthor(`Avatar | ${member.user.tag}`)
        .setColor(colors.info)
        .setDescription(
          `[Download Avatar](${member.user.displayAvatarURL({
            dynamic: true,
            size: size as ImageSize,
          })})`
        )
        .setImage(
          member.user.displayAvatarURL({
            dynamic: true,
            size: size as ImageSize,
          })
        )
    );
  }
}
