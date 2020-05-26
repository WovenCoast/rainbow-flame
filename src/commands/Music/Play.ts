import { Command } from "discord-akairo";
import { Message, TextChannel } from "discord.js";
import { getSongs, convertDuration } from "../../Utils";

import { FlameGuild } from "../../structures/discord.js/Guild";
import { TrackData, TrackResponse, LoadType } from "lavacord";
import { MessageEmbed } from "discord.js";
import { colors } from "../../Config";

const searchTypes = {
  yt: "ytsearch",
  ytsearch: "ytsearch",
  youtube: "ytsearch",
  sc: "scsearch",
  scsearch: "scsearch",
  soundcloud: "scsearch",
};

export default class PlayCommand extends Command {
  public constructor() {
    super("play", {
      aliases: ["play"],
      category: "Music",
      description: {
        content: "Play some music",
        usage: "play <song:string>",
        examples: ["play never gonna let you down"],
      },
      ratelimit: 3,
      args: [
        {
          id: "search",
          type: "string",
          match: "rest",
          prompt: {
            start: (_: Message) =>
              "you need to provide a link or a song search term!",
          },
        },
        {
          id: "searchType",
          type: (msg: Message, str: string) =>
            Object.keys(searchTypes).includes(str) ? searchTypes[str] : null,
          flag: ["-search=", "--search=", "--searchType=", "-s=", "--s="],
          default: "ytsearch",
        },
      ],
      userPermissions: ["CONNECT"],
      clientPermissions: ["CONNECT", "SPEAK"],
      channel: "guild",
    });
  }

  public async exec(
    message: Message,
    { search, searchType }: { search: string; searchType: string }
  ): Promise<any> {
    if (!message.member.voice)
      return message.util.reply("you must be connected to a voice channel!");
    const res: TrackResponse = await getSongs(
      this.client.manager,
      `${search.startsWith("http") ? "" : searchType + ":"}${search}`
    );
    if (res.loadType === LoadType.NO_MATCHES)
      return message.util.send(":shrug: Couldn't find any song with that name");
    if (res.loadType === LoadType.LOAD_FAILED) {
      return message.util.send(":shrug: Something went wrong on our side.");
    }
    if (res.loadType === LoadType.PLAYLIST_LOADED) {
      const songs: TrackData[] = res.tracks;
      songs.map((s: TrackData, index: number) => {
        if (index === 0) return true;
        return (message.guild as FlameGuild).music.songs.push(s);
      });
      await (message.guild as FlameGuild).music.startPlaying(
        message.member.voice.channel,
        message.channel as TextChannel,
        songs[0]
      );
      await message.channel.send(
        `:white_check_mark: Successfully loaded the playlist **${res.playlistInfo.name}**!`
      );
      return;
    }
    if (res.loadType === LoadType.TRACK_LOADED) {
      const song = res.tracks[0];
      if (song.info.isStream)
        return message.util.send(
          `:octagonal_sign: **${song.info.title}** by **${song.info.author}** is a live stream!`
        );
      await (message.guild as FlameGuild).music.startPlaying(
        message.member.voice.channel,
        message.channel as TextChannel,
        song
      );
    }
    if (res.loadType === LoadType.SEARCH_RESULT) {
      const songs = res.tracks.slice(0, 5);
      await message.channel.send(
        new MessageEmbed()
          .setColor(colors.info)
          .setAuthor(
            `Select a song | ${message.author.tag}`,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setDescription(
            songs.map(
              (s, i) =>
                `${i + 1}: **[${s.info.title}](${s.info.uri})** by **${
                  s.info.author
                }**, ${convertDuration(s.info.length / 1000)}`
            )
          )
          .setFooter("Reply with 'cancel' to cancel!")
      );
      const collector = message.channel.createMessageCollector(
        (msg: Message) =>
          msg.author.id === message.author.id &&
          [...Object.keys(songs), "cancel"].includes(msg.content.toLowerCase()),
        { max: 1, time: 6e4 }
      );
      collector.on("collect", async (msg: Message) => {
        if (msg.content.toLowerCase() === "cancel")
          return message.channel.send(`${msg.author}, cancelled.`);
        const song = res.tracks[0];
        await (message.guild as FlameGuild).music.startPlaying(
          message.member.voice.channel,
          message.channel as TextChannel,
          song
        );
      });
      collector.on("end", (messages) => {
        if (messages.size === 0)
          return message.channel.send(
            `${message.author}, timed out, no songs were selected.`
          );
      });
      return;
    }
  }
}
