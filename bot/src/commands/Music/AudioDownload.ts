import { Command } from "discord-akairo";
import { Message } from "discord.js";
import tinyurl from "tinyurl";
import ytsearch from "yt-search";
import ytdl from "ytdl-core";
import { loading } from "../../Emojis";
import { convertMs } from "../../Utils";
import { performance } from "perf_hooks";

export default class AudioDownloadCommand extends Command {
  public constructor() {
    super("audiodownload", {
      aliases: ["audiodownload", "adownload", "mp3"],
      category: "Music",
      description: {
        content: "Send a link to download a YouTube video in mp3 format",
        usage: "audiodownload <search:string>",
        examples: ["audiodownload Stargazing Ducky Productions"],
      },
      ratelimit: 3,
      args: [
        {
          id: "search",
          default: "string",
          prompt: {
            start: (msg: Message) => `you need to provide a search query!`,
          },
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { search }: { search: string }
  ): Promise<any> {
    const timeStart = performance.now();
    const msg = await message.channel.send(`${loading} Searching...`);
    const res = await ytsearch(search);
    if (!res.videos[0])
      return msg.edit(
        `:x: Something went wrong with the search, try the command again!`
      );
    const info = await ytdl.getInfo(res.videos[0].videoId);
    const format = ytdl.chooseFormat(info.formats, { filter: "audioonly" });
    if (format) {
      const shortenedUrl = await tinyurl.shorten(format.url);
      await msg.edit(
        `:white_check_mark: Successfully found the information in ${convertMs(
          performance.now() - timeStart
        )}, *${info.title}* by **${info.author.name}**: <${shortenedUrl}>`
      );
    } else {
      await msg.edit(
        `:x: Faied to find a video format in ${
          performance.now() - timeStart
        }, *${info.title}* by **${info.author.name}**: Cannot be downloaded :(`
      );
    }
  }
}
