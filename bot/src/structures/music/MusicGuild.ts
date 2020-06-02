import { Guild, VoiceChannel, TextChannel } from "discord.js";
import { AkairoClient } from "discord-akairo";
import {
  TrackData,
  Player,
  LavalinkEvent,
  PlayerEqualizerBand,
} from "lavacord";

enum Loop {
  "one",
  "all",
  "shuffle",
}
export default class Music {
  guild: Guild;
  client: AkairoClient;
  voiceChannel: VoiceChannel;
  textChannel: TextChannel;
  playing: boolean = false;
  playHead: number = -1;
  player: Player;
  loop: Loop;
  songs: TrackData[] = [];
  constructor(guild: Guild, client: AkairoClient) {
    this.client = client;
    this.guild = guild;
  }

  async stopPlaying(): Promise<boolean> {
    if (!this.playing) return false;
    await this.client.manager.leave(this.guild.id);
    this.playing = false;
    this.textChannel = null;
    this.voiceChannel = null;
    this.player = null;
    this.songs = [];
    this.playHead = -1;
    this.loop = Loop.all;
  }

  async startPlaying(
    voiceChannel: VoiceChannel,
    textChannel: TextChannel,
    song: TrackData
  ): Promise<void> {
    if (this.playing) {
      await this.addToQueue(song);
      return;
    }
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.player = await this.client.manager.join({
      channel: voiceChannel.id,
      guild: voiceChannel.guild.id,
      node: [
        ...this.client.manager.idealNodes,
        this.client.manager.nodes.get("main"),
      ][0].id,
    });
    this.songs.push(song);
    this.playHead = this.songs.indexOf(song);
    this.playing = true;
    this.loop = Loop.all;
    await this.player.play(this.songs[this.playHead].track);
    this.textChannel.send(
      `:arrow_forward: Playing **${
        this.songs[this.playHead].info.title
      }** by **${this.songs[this.playHead].info.author}**`
    );
    this.player.on("end", (data: LavalinkEvent) => {
      if (data.reason === "LOAD_FAILED")
        return this.player.play(this.songs[this.playHead].track);
      if (this.voiceChannel.members.filter((m) => !m.voice.deaf).size <= 1) {
        this.textChannel.send(
          ":octagonal_sign: No one is in the voice channel to listen to me, quitting voice channel."
        );
        return this.stopPlaying();
      }
      if (data.reason === "REPLACED") return;
      switch (this.loop) {
        case Loop.all:
          this.playHead = this.playHead + 1;
          if (this.playHead >= this.songs.length) this.playHead = 0;
          break;
        case Loop.one:
          this.playHead = this.playHead;
          break;
        case Loop.shuffle:
          this.playHead = Math.floor(Math.random() * this.songs.length);
          break;
      }
      this.player.play(this.songs[this.playHead].track);
      this.textChannel.send(
        `:arrow_forward: Playing **${
          this.songs[this.playHead].info.title
        }** by **${this.songs[this.playHead].info.author}**`
      );
    });
  }

  async addToQueue(song: TrackData): Promise<boolean> {
    try {
      if (this.songs.indexOf(song) !== -1) {
        this.textChannel.send(
          `:octagonal_sign: That song is already in the queue!`
        );
        return false;
      }
      this.songs.push(song);
      this.textChannel.send(
        `:white_check_mark: Successfully added **${song.info.title}** by **${song.info.author}** to the queue!`
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  async pause() {
    return await this.player.pause(!this.player.paused);
  }

  get duration() {
    return this.player.state.position;
  }

  set duration(pos: number) {
    this.player.seek(pos);
  }

  get volume() {
    return this.player.state.volume;
  }

  set volume(v: number) {
    this.player.volume(v);
  }

  get equalizer() {
    return this.player.state.equalizer;
  }

  set equalizer(eq: PlayerEqualizerBand[]) {
    this.player.equalizer(eq);
  }
}
