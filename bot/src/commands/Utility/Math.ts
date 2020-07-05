import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { evaluate } from "mathjs";
import { performance } from "perf_hooks";
import { colors } from "../../Config";
import { loading } from "../../Emojis";
import { convertMs } from "../../Utils";

export default class MathCommand extends Command {
  constructor() {
    super("math", {
      aliases: ["math"],
      category: "Utility",
      description: {
        content: "Do some math with math.js",
        usage: "math [math:string]",
        examples: ["math 2 + 2 * 2"],
      },
      ratelimit: 3,
      cooldown: 0,
      args: [
        {
          id: "query",
          type: "string",
          match: "rest",
        },
      ],
    });
  }

  public async exec(message: Message, { query }: { query: string }) {
    const msg = await message.util.send(`${loading} Evaluating...`);
    const timeStart = performance.now();
    const answer = evaluate(query);
    const time = performance.now() - timeStart;
    msg.edit(
      `:white_check_mark: Successfully evaluated the query \`${query}\`!`,
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(`Math | ${message.author.tag}`)
        .addField("Query", query)
        .addField("Answer", answer)
        .setFooter(`Evaluated in ${convertMs(time)}`)
    );
  }
}
