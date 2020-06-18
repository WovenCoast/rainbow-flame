import { Command } from "discord-akairo";
import { Message } from "discord.js";

import { FlameGuild } from "../../structures/discord.js/Guild";
import { MessageEmbed, TextChannel } from "discord.js";
import { colors } from "../../Config";
import { convertDuration, getSongs, range } from "../../Utils";
import { loading } from "../../Emojis";

export default class RadioCommand extends Command {
  constructor() {
    super("radio", {
      aliases: ["radio", "rad"],
      category: "Music",
      channel: "guild",
      description: {
        content: "Start playing a radio station",
        usage: "radio <query:string>",
        examples: ["radio Maldives", "radio Kiss UK"],
      },
      ratelimit: 3,
      args: [
        {
          id: "query",
          type: "string",
          prompt: {
            start: (msg: Message) =>
              `you need to give a search term to search for a radio stream!`,
          },
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { query }: { query: string }
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
    const streams = await this.client.apis.radioGarden.searchStations(query);
    if (streams.length !== 1) {
      await msg.edit(
        `${message.author}, select a radio stream`,
        new MessageEmbed()
          .setColor(colors.info)
          .setAuthor(
            `Select a radio | ${message.author.tag}`,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setDescription(
            streams.map(
              (s, i) =>
                `${i + 1}: \`${s.locationCode}\` **${s.name}**, ${s.location}`
            )
          )
          .setFooter("Reply with 'cancel' to cancel!")
      );
      const collector = message.channel.createMessageCollector(
        (msg: Message) =>
          msg.author.id === message.author.id &&
          [...range(1, streams.length), "cancel"]
            .map((e) => `${e}`)
            .includes(msg.content.toLowerCase()),
        { max: 1, time: 6e4 }
      );
      collector.on("collect", async (msg: Message) => {
        if (msg.content.toLowerCase() === "cancel")
          return message.channel.send(`${msg.author}, cancelled.`);
        const stream =
          streams[(new Number(msg.content.toLowerCase().trim()) as number) - 1];
        const track = (
          await getSongs(
            this.client.manager,
            await this.client.apis.radioGarden.getSourceURL(stream)
          )
        ).tracks[0];
        track.info.title = stream.name;
        track.info.author = stream.location;
        await (message.guild as FlameGuild).music.startPlaying(
          message.member.voice.channel,
          message.channel as TextChannel,
          track
        );
      });
      collector.on("end", (messages) => {
        if (messages.size === 0)
          return message.channel.send(
            `${message.author}, timed out, no stream was selected.`
          );
      });
      return;
    } else {
      await msg.edit(`${loading} Got one radio stream, playing...`);
      const stream =
        streams[(new Number(msg.content.toLowerCase().trim()) as number) - 1];
      const track = (
        await getSongs(
          this.client.manager,
          await this.client.apis.radioGarden.getSourceURL(stream)
        )
      ).tracks[0];
      track.info.title = stream.name;
      track.info.author = stream.location;
      await (message.guild as FlameGuild).music.startPlaying(
        message.member.voice.channel,
        message.channel as TextChannel,
        track
      );
      await msg.edit(
        `:white_check_mark: Successfully started playing **${stream.name}** in *${stream.location}*`
      );
      return;
    }
  }
}
