import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { removeHTMLTags } from "../../Utils";
import { loading } from "../../Emojis";
import { colors } from "../../Config";

export default class GitDocsCommand extends Command {
  public constructor() {
    super("gitdocs", {
      aliases: ["gitdocs", "git-docs", "git"],
      category: "Docs",
      description: {
        content: "Search for a git command",
        usage: "gitdocs <query:string>",
        examples: ["gitdocs branch"],
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
    const data = await this.client.apis.duckDuckGo.searchInstant(
      `git ${query}`
    );
    if (!data || !data.AbstractURL.length || !data.Abstract.length)
      return msg.edit(`:x: No information found for query \`${query}\`.`);
    return msg.edit(
      `:white_check_mark: Found information for query \`${query}\`!`,
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(
          `Git (${data.AbstractSource})`,
          "https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png"
        )
        .setDescription(
          `${removeHTMLTags(
            data.Abstract.replace(/(\<|\<\/)code\>/gi, "```").trim()
          )} [Learn More](${data.AbstractURL})`
        )
        .setFooter(
          "Powered by DuckDuckGo",
          "https://duckduckgo.com/favicon.ico"
        )
    );
  }
}
