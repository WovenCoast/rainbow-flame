import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { removeHTMLTags } from "../../Utils";
import he from "he";
import { loading } from "../../Emojis";
import { colors } from "../../Config";

export default class JavascriptDocsCommand extends Command {
  public constructor() {
    super("jsdocs", {
      aliases: [
        "javascriptdocs",
        "jsdocs",
        "javascript-docs",
        "js-docs",
        "javascript",
        "js",
      ],
      category: "Docs",
      description: {
        content: "Search for a Javascript term",
        usage: "jsdocs <query:string>",
        examples: ["jsdocs tostring"],
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
      `javascript ${query}`
    );
    if (!data || !data.AbstractURL.length || !data.Abstract.length)
      return msg.edit(`:x: No information found for query \`${query}\`.`);
    return msg.edit(
      `:white_check_mark: Found information for query \`${query}\`!`,
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(
          `JavaScript (${data.AbstractSource})`,
          "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTmJF7cfGQA0DijXhp7CV7SXQ5UmGRAaMgduA&usqp=CAU"
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
