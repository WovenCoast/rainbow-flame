import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { colors } from '../../Config';
import { evaluate } from 'mathjs';

export default class MathCommand extends Command {
  constructor() {
    super('math', {
      aliases: ['math'],
      category: 'Utility',
      description: {
        content: 'Do some math with math.js',
        usage: 'math [math:string]',
        examples: ['math 2 + 2 * 2'],
      },
      ratelimit: 3,
      cooldown: 0,
      args: [
        {
          id: 'math',
          type: 'string',
          match: 'restContent',
        },
      ],
    });
  }

  public async exec(message: Message, { math }: { math: string }) {
    return message.util.send(new MessageEmbed().setColor(colors.info).setTitle(evaluate(math)));
  }
}
