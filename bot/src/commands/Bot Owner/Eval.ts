import { Command } from "discord-akairo";
import { Message } from "discord.js";
//@ts-ignore
import util, { convertMs, sanitize } from "../../Utils";
import { colors } from "../../Config";
import { performance } from "perf_hooks";
import { inspect } from "util";
import { MessageEmbed } from "discord.js";

export default class EvalCommand extends Command {
  public constructor() {
    super("eval", {
      aliases: ["eval"],
      category: "Bot Owner",
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
    const hastebin = "https://haste.wovencoast.me/";
    const start = performance.now();
    try {
      let result: any = eval(input);
      if (result instanceof Promise) {
        result = await result;
      }
      if (typeof result !== "string") {
        result = inspect(result);
      }
      if (result.length > 1024) {
        result = await this.client.apis.hastebin.post(
          sanitize(result),
          hastebin
        );
      }
      const duration = performance.now() - start;
      const isURL = result.startsWith("http");
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
            `${isURL ? "" : "```\n"}${sanitize(result)}${isURL ? "" : "```"}`
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
          .addField("Error", `\`\`\`\n${e}\`\`\``)
          .setFooter(`Evaluated in ${convertMs(duration)}`)
      );
    }
  }
}
