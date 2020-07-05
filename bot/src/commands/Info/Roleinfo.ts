import { Command } from 'discord-akairo';
import { Message, MessageEmbed, Role } from 'discord.js';
import { colors } from '../../Config';

export default class RoleinfoCommand extends Command {
  constructor() {
    super('roleinfo', {
      aliases: ['roleinfo'],
      category: 'Info',
      description: {
        content: 'View some information of a role',
        usage: 'roleinfo [role:string|Mention<Role>]',
        examples: ['roleinfo Member'],
      },
      ratelimit: 3,
      cooldown: 0,
      args: [
        {
          id: 'role',
          type: 'role',
        },
      ],
    });
  }

  public async exec(message: Message, { role }: { role: Role }) {
    return message.util.send(
      new MessageEmbed()
        .setColor(colors.info)
        .setFooter('Created at: ' + role.createdAt.toLocaleString())
        .addField('Role Name', '<@&' + role.id + '>', true)
        .addField('ID', role.id, true)
        .addField('Hoisted', role.hoist ? 'Yes' : 'No', true)
        .addField('Color', role.hexColor, true)
        .addField('Mentionable', role.mentionable ? 'Yes' : 'No', true)
        .addField('Users in Role: ', role.members.size, true)
    );
  }
}
