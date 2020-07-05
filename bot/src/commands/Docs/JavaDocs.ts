import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { removeHTMLTags } from "../../Utils";
import he from "he";
import { loading } from "../../Emojis";
import { colors } from "../../Config";

export default class JavaDocsCommand extends Command {
  public constructor() {
    super("javadocs", {
      aliases: ["javadocs", "java-docs", "java"],
      category: "Docs",
      description: {
        content: "Search for an java element",
        usage: "javadocs <query:string>",
        examples: ["javadocs div"],
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
      `java ${query}`
    );
    if (!data || !data.AbstractURL.length || !data.Abstract.length)
      return msg.edit(`:x: No information found for query \`${query}\`.`);
    return msg.edit(
      `:white_check_mark: Found information for query \`${query}\`!`,
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(
          `Java (${data.AbstractSource})`,
          "https://banner2.cleanpng.com/20180805/iot/kisspng-logo-java-runtime-environment-programming-language-java-util-concurrentmodificationexception-Ömer-5b6766ab2d98b8.1809687115335031471868.jpg"
        )
        .setDescription(
          `${he
            .decode(
              removeHTMLTags(
                data.Abstract.replace(/\<code\>/gi, "```java\n").replace(
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
