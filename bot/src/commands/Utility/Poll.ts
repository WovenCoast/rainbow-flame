import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { loading } from "../../Emojis";
import { colors } from "../../Config";

const reactions = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export default class PollCommand extends Command {
  public constructor() {
    super("poll", {
      aliases: ["poll"],
      category: "Utility",
      description: {
        content: "Create a poll in your server",
        usage: "poll {question} [items:string[]]",
        examples: [
          'poll "What is the meaning of life?" "42" "Who knows?" "The observable universe?"',
        ],
      },
      ratelimit: 3,
      separator: " ",
      args: [
        {
          id: "question",
          type: "string",
          prompt: {
            start: (msg: Message) =>
              `you need to provide a question for the poll!`,
          },
        },
        {
          id: "itemString",
          type: "string",
          match: "rest",
          prompt: {
            start: (msg: Message) =>
              `you need to provide items for the poll! (Separate multiple items with commas)`,
            time: 12e4,
          },
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { question, itemString }: { question: string; itemString: string }
  ): Promise<any> {
    const items = itemString.split(",").map((e) => e.trim());
    if (items.length === 1)
      return message.util.send(
        `:x: \`${itemString}\` has only one item in it! Use \`,\` to separate multiple items!`
      );
    if (items.length >= 10)
      return message.util.send(`:x: Maximum 10 items are allowed in a poll!`);
    if (
      items.map((item, index) => `${reactions[index]} ${item}`).join("\n")
        .length >= 2048
    )
      return message.util.send(`:x: Too many characters in the item string.`);
    const msg = await message.util.send(`${loading} Making poll...`);
    for (let i = 0; i < items.length; i++) {
      await msg.react(reactions[i]);
    }
    return await msg.edit(
      `:white_check_mark: Poll by **${message.author.tag}** asking \`${question}\`!`,
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(`${question}`, message.guild.iconURL({ dynamic: true }))
        .setDescription(
          `${items
            .map((item, index) => `${reactions[index]} ${item}`)
            .join("\n")}`
        )
        .setFooter(
          `Poll by ${message.author.tag}`,
          message.author.displayAvatarURL({ dynamic: true })
        )
    );
  }
}
