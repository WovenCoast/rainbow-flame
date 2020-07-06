import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { colors } from '../../Config';

export default class HexCommand extends Command {
  constructor() {
    super('hex', {
      aliases: ['hex'],
      category: 'Utility',
      description: {
        content: 'Display a hex or make a random one (if you use no arguments)',
        usage: 'hex [s:string]',
        examples: ['hex ff9966', 'hex'],
      },
      ratelimit: 3,
      cooldown: 0,
      args: [
        {
          id: 's',
          type: 'string',
          default: 'random',
        },
      ],
    });
  }

  public async exec(message: Message, { s }: { s: string }) {
    if (s !== 'random' && !/^([0-9a-f]{3}){1,2}$/i.test(s)) {
      return message.util.send(
        new MessageEmbed().setColor(colors.error).setTitle('Invalid usage. Please put a valid hex code in.')
      );
    }
    if (s === 'random') s = Math.random().toString(16).slice(2, 8);
    if (s.length === 3) s = [...s].map((x) => x + x).join('');
    return message.util.send(
      new MessageEmbed()
        .setColor('#' + s)
        .setTitle('#' + s)
        .setThumbnail(`https://via.placeholder.com/150/${s}?text=+`)
        .addField(
          'RGB',
          parseInt(s.slice(0, 2), 16) + ', ' + parseInt(s.slice(2, 4), 16) + ', ' + parseInt(s.slice(4), 16)
        )
    );
  }
}
