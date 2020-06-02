import { Command } from "discord-akairo";
import { Message } from "discord.js";

import { FlameGuild } from "../../structures/discord.js/Guild";

export default class LeaveCommand extends Command {
  constructor() {
    super("leave", {
      aliases: ["leave", "fuckoff", "shutup"],
      category: "Music",
      channel: "guild",
      description: {
        content: "Leave the voice channel if connected to one",
        usage: "leave",
        examples: ["leave"],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message) {
    if (!(message.guild as FlameGuild).music.playing) {
      message.guild.me.voice ? message.guild.me.voice.channel.leave() : null;
      return message.util.reply(
        "I can't leave a voice channel that I'm not in!"
      );
    }
    if (
      !(
        (message.guild as FlameGuild).music.voiceChannel.members.size <= 2 ||
        message.member.permissions.has("PRIORITY_SPEAKER")
      )
    )
      return message.util.reply(
        "you need to be alone or have `PRIORITY_SPEAKER` for this command to work!"
      );

    await (message.guild as FlameGuild).music.stopPlaying();
    message.util.send(
      ":white_check_mark: Successfully left the voice channel!"
    );
  }
}
