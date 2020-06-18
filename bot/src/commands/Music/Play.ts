import { Command } from "discord-akairo";
import { Message, TextChannel } from "discord.js";
import { getSongs, convertDuration, titleCase, range } from "../../Utils";

import { FlameGuild } from "../../structures/discord.js/Guild";
import { TrackData, TrackResponse, LoadType } from "lavacord";
import { MessageEmbed } from "discord.js";
import { colors } from "../../Config";
import { loading } from "../../Emojis";

const searchTypes = {
  yt: "ytsearch",
  ytsearch: "ytsearch",
  youtube: "ytsearch",
  sc: "scsearch",
  scsearch: "scsearch",
  soundcloud: "scsearch",
};
const audioFormats = ["mp3", "wav", "m4a"];

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
          type: (msg: Message, str: string) =>
            msg.attachments.filter((attachment) =>
              audioFormats.some((filetype) => attachment.url.endsWith(filetype))
            ).size === 0
              ? str
              : msg.attachments.find((attachment) =>
                  audioFormats.some((filetype) =>
                    attachment.url.endsWith(filetype)
                  )
                ).url,
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
    if (!message.member.voice.channel)
      return message.util.reply("you must be connected to a voice channel!");
    if (
      !message.member.voice.channel
        .permissionsFor(message.guild.me)
        .has("CONNECT")
    )
      return message.util.reply(
        "you must be connected to a voice channel that I can join!"
      );
    if (
      !message.member.voice.channel
        .permissionsFor(message.guild.me)
        .has("SPEAK")
    )
      return message.util.reply(
        "you must be connected to a voice channel that I can speak in!"
      );
    const msg = await message.channel.send(`${loading} Searching...`);
    const res: TrackResponse = await getSongs(
      this.client.manager,
      `${search.startsWith("http") ? "" : searchType + ":"}${search}`
    );
    if (res.loadType === LoadType.NO_MATCHES)
      return msg.edit(":shrug: Couldn't find any song with that name");
    if (res.loadType === LoadType.LOAD_FAILED) {
      return msg.edit(
        //@ts-ignore
        `:x: Something went wrong on our side, \`${res.exception.message}\``
      );
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
      await msg.edit(
        `:white_check_mark: Successfully loaded the playlist **${res.playlistInfo.name}**!`
      );
      return;
    }
    if (res.loadType === LoadType.TRACK_LOADED) {
      const song = res.tracks[0];
      if (song.info.title === "Unknown title")
        song.info.title = song.info.uri.startsWith(
          "https://cdn.discordapp.com/"
        )
          ? titleCase(
              song.info.uri
                .split("/")
                .filter((e) => e.trim() !== "")
                .pop()
                .split(".")[0]
                .replace(/_/gi, " ")
            )
          : titleCase(
              song.info.uri
                .split("/")
                .filter((e) => e.trim() !== "")
                .pop()
                .replace(/\./gi, " ")
            );
      if (song.info.author === "Unknown artist")
        song.info.author = message.author.tag;
      await (message.guild as FlameGuild).music.startPlaying(
        message.member.voice.channel,
        message.channel as TextChannel,
        song
      );
      await msg.edit(`:white_check_mark: Track loaded successfully!`);
    }
    if (res.loadType === LoadType.SEARCH_RESULT) {
      const songs = res.tracks.slice(0, 5);
      await msg.edit(
        `${message.author}, select a song`,
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
          [...range(1, songs.length), "cancel"]
            .map((e) => `${e}`)
            .includes(msg.content.toLowerCase()),
        { max: 1, time: 6e4 }
      );
      collector.on("collect", async (msg: Message) => {
        if (msg.content.toLowerCase() === "cancel")
          return message.channel.send(`${msg.author}, cancelled.`);
        const song =
          songs[(new Number(msg.content.toLowerCase().trim()) as number) - 1];
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
