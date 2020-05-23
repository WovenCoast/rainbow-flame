import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { sanitize, convertMs } from "../../Utils";
import { colors } from "../../Config";
import { performance } from "perf_hooks";
import { inspect } from "util";
import { MessageEmbed } from "discord.js";
import axios from "axios";

export default class EvalCommand extends Command {
  public constructor() {
    super("eval", {
      aliases: ["eval"],
      category: "Misc",
      description: {
        content: "Evaluate some JavaScript code on me",
        usage: "eval",
        examples: ["eval client.token"],
      },
      ratelimit: 3,
      ownerOnly: true,
      args: [
        {
          id: "input",
          match: "rest",
          prompt: {
            start: (msg: Message) =>
              `you need to specify some code to evaluate!`,
          },
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { input }: { input: string }
  ): Promise<any> {
    const hastebin = "https://hasteb.in";
    const start = performance.now();
    try {
      let result: any = eval(input);
      if (result instanceof Promise) {
        result = await result;
      }
      if (typeof result != "string") {
        result = inspect(result);
      }
      if (result.length > 1024) {
        result = await axios
          .post(
            `${hastebin}${hastebin.endsWith("/") ? "" : "/"}documents`,
            result
          )
          .then(
            (response) =>
              `${hastebin}${hastebin.endsWith("/") ? "" : "/"}${
                response.data.key
              }.log`
          )
          .catch(console.error);
      }
      const duration = performance.now() - start;
      return message.util.send(
        new MessageEmbed()
          .setAuthor(
            `Eval | ${message.author.tag}`,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setColor(colors.info)
          .addField("Input", `\`\`\`${input}\`\`\``)
          .addField(
            "Output",
            `${result.startsWith("http") ? "" : "```"}${result}${
              result.startsWith("http") ? "" : "```"
            }`
          )
          .setFooter(`Evaluated in ${convertMs(duration)}`)
      );
    } catch (e) {
      const duration = performance.now() - start;
      return message.util.send(
        new MessageEmbed()
          .setAuthor(
            `Eval | ${message.author.tag}`,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setColor(colors.error)
          .addField("Input", `\`\`\`${input}\`\`\``)
          .addField("Error", `\`\`\`${e}\`\`\``)
          .setFooter(`Evaluated in ${convertMs(duration)}`)
      );
    }
  }
}
