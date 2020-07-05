import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { colors } from "../../Config";
import { loading } from "../../Emojis";

export default class UrbanCommand extends Command {
  constructor() {
    super("urban", {
      aliases: ["urban", "meaningof", "dictionary"],
      category: "NSFW",
      channel: "guild",
      description: {
        content: "Search for a word within the Urban Dictionary",
        usage: "urban <word>",
        examples: ["urban FlameXode"],
      },
      ratelimit: 3,
      args: [
        {
          id: "word",
          type: "string",
          prompt: {
            start: (msg: Message) =>
              `You need to specify a word to search for!`,
          },
        },
      ],
    });
  }

  async exec(message: Message, { word }: { word: string }) {
    const msg = await message.util.send(`${loading} Searching...`);
    const words = await this.client.apis.urban.getWordInfo(word);
    if (!words[0])
      return await msg.edit(`:x: Could not find any word matching \`${word}\``);
    msg.edit(
      `:white_check_mark: Found a word that matches the query \`${word}\`!`,
      new MessageEmbed()
        .setColor(colors.info)
        .setURL(words[0].link)
        .setTitle(words[0].term)
        .addField("Definition", words[0].definition, true)
        .addField("Example", words[0].example, true)
        .addField("Author", words[0].author, true)
        .setFooter(
          `👍 ${words[0].thumbsUp} 👎 ${words[0].thumbsDown}\nPowered by Urban Dictionary`,
          "https://www.urbandictionary.com/favicon.ico"
        )
    );
  }
}
