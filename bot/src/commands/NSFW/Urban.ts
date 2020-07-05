import { Command } from "discord-akairo";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import urban from "urban";

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
              `you need to specify a word to search for!`,
          },
        },
      ],
    });
  }

  async exec(message: Message, { word }: { word: string }) {
    if (!(message.channel as TextChannel).nsfw)
      return message.util.send(
        `:octagonal_sign: This is an NSFW command and can be used in NSFW channels only!`
      );
  }
}
