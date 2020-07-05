import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { colors } from '../../Config';
import urban from 'urban';

export default class UrbanCommand extends Command {
  constructor() {
    super('urban', {
      aliases: ['urban', 'meaningof', 'dictionary'],
      category: 'NSFW',
      description: {
        content: 'Search for a word within the Urban Dictionary',
        usage: 'urban <word>',
        examples: ['urban FlameXode'],
      },
      ratelimit: 3,
      args: [
        {
          id: 'word',
          type: 'string',
          prompt: {
            start: (msg: Message) => `You need to specify a word to search for!`,
          },
        },
      ],
    });
  }

  async exec(message: Message, { word }: { word: string }) {
    message.util.send(new MessageEmbed().setColor(colors.info).setTitle('Hold on there, searching...'));
    urban(word).first((o) => {
      if (!o) {
        return message.util.send(new MessageEmbed().setColor(colors.error).setTitle('An error occoured!'));
      }
      message.util.send(
        new MessageEmbed()
          .setColor(colors.success)
          .setURL(o.permalink)
          .setTitle(word)
          .addField('Definition', o.definition, true)
          .addField('Example', o.example, true)
          .addField('Author', o.author, true)
          .setFooter(`👍 ${o.thumbs_up} 👎 ${o.thumbs_down}`)
      );
    });
  }
}
