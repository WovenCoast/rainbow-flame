import { Command } from "discord-akairo";
import { Message } from "discord.js";

import { FlameGuild } from "../../structures/discord.js/Guild";

export default class SkipCommand extends Command {
  constructor() {
    super("skip", {
      aliases: ["skip", "next"],
      category: "Music",
      channel: "guild",
      description: {
        content: "Skip this song if playing any",
        usage: "skip",
        examples: ["skip"],
      },
      ratelimit: 5,
    });
  }

  public async exec(message: Message): Promise<any> {
    if (!(message.guild as FlameGuild).music.playing)
      return message.util.reply(
        "I need to be playing something to be able to skip it!"
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
    const song = (message.guild as FlameGuild).music.songs[
      (message.guild as FlameGuild).music.playHead
    ];
    (message.guild as FlameGuild).music.player.emit("end", {
      type: "TrackEndEvent",
    });
    return message.util.send(
      `:white_check_mark: Successfully skipped the song **${song.info.title}** by *${song.info.author}*!`
    );
  }
}
