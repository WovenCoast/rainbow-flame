import { Guild, VoiceChannel, TextChannel } from "discord.js";
import { AkairoClient } from "discord-akairo";
import { TrackData, Player, LavalinkEvent } from "lavacord";

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

  async stopPlaying(guild: Guild): Promise<boolean> {
    if (!this.playing) return false;
    await this.client.manager.leave(guild.id);
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
      return await this.addToQueue(song);
    }
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.player = await this.client.manager.join({
      channel: voiceChannel.id,
      guild: voiceChannel.guild.id,
      node: this.client.manager.idealNodes[0].id,
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

  async addToQueue(song: TrackData): Promise<void> {
    this.songs.push(song);
    try {
      this.textChannel.send(
        `:white_check_mark: Successfully added **${
          this.songs[this.playHead].info.title
        }** by **${this.songs[this.playHead].info.author}** to the queue!`
      );
      return;
    } catch (e) {
      return;
    }
  }
}
