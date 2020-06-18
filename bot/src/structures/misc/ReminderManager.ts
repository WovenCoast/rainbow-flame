import { MessageEmbed, User, TextChannel } from "discord.js";
import { AkairoClient } from "discord-akairo";
import { Repository } from "typeorm";
import { Reminder } from "../../models/Reminder";
import { colors } from "../../Config";

export default {
  async end(
    client: AkairoClient,
    reminderRepo: Repository<Reminder>,
    reminderId: string
  ) {
    const reminder: Reminder = (
      await reminderRepo.find({ uniqueId: reminderId })
    )[0];
    reminderRepo.delete({ uniqueId: reminderId });

    let user: User = client.users.cache.get(reminder.user);
    if (!user) return;
    if (user.partial) user = await user.fetch();

    const message = new MessageEmbed()
      .setColor(colors.primary)
      .setDescription(
        `${user.tag} wanted me to remind you to **${reminder.content}**.`
      )
      .setFooter(`Reminded at`)
      .setTimestamp(reminder.end);

    const channel: TextChannel = client.channels.cache.get(
      reminder.channel
    ) as TextChannel;
    if (!channel) {
      user.send(message);
      return;
    }
    channel.send(
      `<@${user.id}> just a small reminder to **${reminder.content}**`,
      message
    );
  },
};
