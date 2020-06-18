import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { colors } from "../../Config";

import { FlameGuild } from "../../structures/discord.js/Guild";
import { convertDuration } from "../../Utils";

const pageWidth = 5;

export default class QueueCommand extends Command {
  constructor() {
    super("queue", {
      aliases: ["queue", "q"],
      category: "Music",
      channel: "guild",
      description: {
        content: "View the queue",
        usage: "queue [page:number]",
        examples: ["queue", "queue 2"],
      },
      ratelimit: 3,
      args: [
        {
          id: "pageIn",
          type: "number",
          default: null,
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { pageIn }: { pageIn: number }
  ): Promise<any> {
    if (!(message.guild as FlameGuild).music.playing)
      return message.util.reply(
        "I need to be playing something to be able to change its volume!"
      );
    const page =
      pageIn ||
      Math.floor(
        ((message.guild as FlameGuild).music.playHead /
          (message.guild as FlameGuild).music.songs.length) *
          Math.ceil(
            (message.guild as FlameGuild).music.songs.length / pageWidth
          )
      ) + 1;
    if (
      page >
      Math.ceil((message.guild as FlameGuild).music.songs.length / pageWidth)
    )
      return message.util.reply("that page doesn't exist!");
    const songs = (message.guild as FlameGuild).music.songs.slice(
      (page - 1) * pageWidth,
      page * pageWidth
    );
    return message.util.send(
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(
          `Queue | ${message.guild.name}`,
          message.guild.iconURL({ dynamic: true })
        )
        .setDescription(
          songs
            .map((s, i) =>
              `${
                i + (page - 1) * pageWidth !==
                (message.guild as FlameGuild).music.playHead
                  ? ""
                  : ":arrow_forward:"
              } ${i + 1 + (page - 1) * pageWidth}: **[${s.info.title}](${
                s.info.uri
              })** by **${s.info.author}**, *${convertDuration(
                s.info.length / 1000
              )}*`.trim()
            )
            .join("\n")
        )
        .setFooter(
          `Total duration: ${convertDuration(
            songs.map((s) => s.info.length).reduce((acc, d) => acc + d, 0)
          )}\nPage ${page} of ${Math.ceil(
            (message.guild as FlameGuild).music.songs.length / pageWidth
          )}`
        )
    );
  }
}
