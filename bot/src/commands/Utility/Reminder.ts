import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { convertMs } from "../../Utils";
import ms from "ms";

import { Repository } from "typeorm";
import { Reminder } from "../../models/Reminder";
import ReminderManager from "../../structures/misc/ReminderManager";

export default class ReminderCommand extends Command {
  public constructor() {
    super("reminder", {
      aliases: ["reminder"],
      category: "Utility",
      description: {
        content: "Make a reminder",
        usage: "reminder {time} [item]",
        examples: ["reminder 10m Break is over, start working!"],
      },
      ratelimit: 3,
      args: [
        {
          id: "time",
          type: (msg: Message, str: string) =>
            str ? (isNaN(Number(ms(str))) ? null : Number(ms(str))) : null,
          prompt: {
            start: () =>
              `you need to provide a time duration for the reminder!`,
            retry: () =>
              `you need to provide a valid time duration for the reminder!`,
          },
        },
        {
          id: "content",
          type: "string",
          match: "rest",
          prompt: {
            start: (msg: Message) =>
              `you need to provide something that I should remind you of!`,
          },
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { time, content }: { time: number; content: string }
  ): Promise<any> {
    const reminderRepo: Repository<Reminder> = this.client.db.getRepository(
      Reminder
    );
    const end: number = Date.now() + time;
    const uniqueId: string = Math.random().toString(36).substr(2, 9);
    reminderRepo.insert({
      channel: message.channel.id,
      user: message.author.id,
      uniqueId,
      content,
      end,
    });
    setTimeout(() => {
      ReminderManager.end(this.client, reminderRepo, uniqueId);
    }, time);

    return message.channel.send(
      `:white_check_mark: Successfully added a reminder to **${content}** in ${convertMs(
        time
      )}!`
    );
  }
}
