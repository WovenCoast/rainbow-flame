import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { convertMs } from "../../Utils";
import { loading } from "../../Emojis";
import { FlameGuild } from "../../structures/discord.js/Guild";
import axios from "axios";
import { colors } from "../../Config";

export default class DjsDocsCommand extends Command {
  public constructor() {
    super("djsdocs", {
      aliases: ["djsdocs", "djs-docs", "djs"],
      category: "Docs",
      description: {
        content: "Search in the Discord.js documentation",
        usage: "djsdocs <query:string>",
        examples: ["djsdocs rpc destroy"],
      },
      ratelimit: 3,
      args: [
        {
          id: "query",
          type: "string",
          match: "rest",
          prompt: {
            start: (msg: Message) => `you need to specify a query!`,
          },
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { query }: { query: string }
  ): Promise<any> {
    const msg = await message.util.send(`${loading} Searching...`);
    const params = {
      src: this.library(query.split(" ")).searchLibrary,
      q: query,
    };
    const embedData = (
      await axios.get(
        `https://djsdocs.sorta.moe/v2/embed?${new URLSearchParams(
          params
        ).toString()}`
      )
    ).data;
    if (!embedData)
      return msg.edit(`:x: No information found for query \`${query}\`.`);
    const embed = new MessageEmbed(embedData).setColor(colors.info);
    return msg.edit(
      `:white_check_mark: Found information for query \`${params.q}\`!`,
      embed
    );
  }
  private library(
    array: string[]
  ): { searching: string; searchLibrary: string } {
    const libraries = [
      "master",
      "stable",
      "rpc",
      "commando",
      "akairo",
      "akairo-master",
    ];

    const library = libraries.indexOf(
      libraries.some((l) => array.indexOf(l) !== -1)
        ? libraries.find((l) => array.indexOf(l) !== -1)
        : "stable"
    );
    const searchLibrary = array.splice(library, 1)[0] || "stable";
    const searching = array.join(" ");

    return {
      searching,
      searchLibrary,
    };
  }
}
