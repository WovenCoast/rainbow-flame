import { Command } from "discord-akairo";
import { Message } from "discord.js";
import ms from "ms";
import { convertDuration } from "../../Utils";

import { FlameGuild } from "../../structures/discord.js/Guild";

export default class DurationCommand extends Command {
  constructor() {
    super("duration", {
      aliases: ["duration"],
      category: "Music",
      channel: "guild",
      description: {
        content: "View or set the current duration of music",
        usage: "duration [newPosition:number]",
        examples: ["duration", "duration 1m"],
      },
      ratelimit: 3,
      args: [
        {
          id: "newDuration",
          type: (msg: Message, str: string) => (str ? Number(ms(str)) : null),
          default: null,
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { newDuration }: { newDuration: number }
  ): Promise<any> {
    if (!(message.guild as FlameGuild).music.playing)
      return message.util.reply(
        "I need to be playing something to be able to change its volume!"
      );
    if (!newDuration)
      return message.util.send(
        `:fast_forward: The current position is **${convertDuration(
          (message.guild as FlameGuild).music.duration / 1000
        )}**/**${convertDuration(
          (message.guild as FlameGuild).music.songs[
            (message.guild as FlameGuild).music.playHead
          ].info.length / 1000
        )}**`
      );
    if (
      !(
        (message.guild as FlameGuild).music.voiceChannel.members.size <= 2 ||
        message.member.permissions.has("PRIORITY_SPEAKER")
      )
    )
      return message.util.reply(
        "you need to be alone or have `PRIORITY_SPEAKER` for this command to work!"
      );
    if (
      !(message.guild as FlameGuild).music.songs[
        (message.guild as FlameGuild).music.playHead
      ].info.isSeekable
    )
      return message.util.reply(
        "the song being played right now is not a seekable song!"
      );
    if (
      (message.guild as FlameGuild).music.songs[
        (message.guild as FlameGuild).music.playHead
      ].info.length > newDuration
    )
      return message.util.reply(
        "that duration is bigger than the amount to set the duration to!"
      );
    (message.guild as FlameGuild).music.duration = newDuration;
    return message.util.send(
      `:white_check_mark: Successfully set the duration to **${convertDuration(
        (message.guild as FlameGuild).music.duration / 1000
      )}**!`
    );
  }
}
