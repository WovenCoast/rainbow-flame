import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { removeHTMLTags } from "../../Utils";
import he from "he";
import { loading } from "../../Emojis";
import { colors } from "../../Config";

export default class RubyDocsCommand extends Command {
  public constructor() {
    super("rubydocs", {
      aliases: ["rubydocs", "ruby-docs", "ruby"],
      category: "Docs",
      description: {
        content: "Search within the ruby documentation",
        usage: "rubydocs <query:string>",
        examples: ["rubydocs embedded ruby"],
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
      `ruby on rails ${query}`
    );
    if (!data || !data.AbstractURL.length || !data.Abstract.length)
      return msg.edit(`:x: No information found for query \`${query}\`.`);
    return msg.edit(
      `:white_check_mark: Found information for query \`${query}\`!`,
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(
          `Ruby On Rails (${data.AbstractSource})`,
          "https://duckduckgo.com/i/04e12505.png"
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
