import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { removeHTMLTags } from "../../Utils";
import he from "he";
import { loading } from "../../Emojis";
import { colors } from "../../Config";

export default class GitDocsCommand extends Command {
  public constructor() {
    super("gitdocs", {
      aliases: ["cssdocs", "css-docs", "css"],
      category: "Docs",
      description: {
        content: "Search for a css command",
        usage: "cssdocs <query:string>",
        examples: ["cssdocs branch"],
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
      `css ${query}`
    );
    if (!data || !data.AbstractURL.length || !data.Abstract.length)
      return msg.edit(`:x: No information found for query \`${query}\`.`);
    return msg.edit(
      `:white_check_mark: Found information for query \`${query}\`!`,
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(
          `Git (${data.AbstractSource})`,
          "https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582747_960_720.png"
        )
        .setDescription(
          `${he
            .decode(
              removeHTMLTags(
                data.Abstract.replace(/\<code\>/gi, "```sh\n").replace(
                  /\<\/code\>/gi,
                  "\n```"
                )
              )
            )
            .trim()} [Learn More](${data.AbstractURL})`
        )
        .setFooter(
          "Powered by DuckDuckGo",
          "https://duckduckgo.com/favicon.ico"
        )
    );
  }
}
