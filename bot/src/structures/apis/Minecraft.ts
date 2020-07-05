import axios from "axios";
import { AkairoClient } from "discord-akairo";
import { number } from "prop-types";

interface PlayerInfo {
  error: boolean;
  message?: string;
  username?: string;
  uuid?: string;
  rawUuid?: string;
  headImage?: string;
  bodyImage?: string;
  nameHistory?: { name: string; changedToAt?: number }[];
}
interface ServerInfo {
  error: boolean;
  ip: string;
  message?: string;
  online?: boolean;
  maxPlayers?: number;
  onlinePlayers?: number;
  type?: string;
  motd?: string;
  icon?: string;
  host?: string;
  port?: number;
}
export class MinecraftAPI {
  client: AkairoClient;
  public constructor(client: AkairoClient) {
    this.client = client;
  }
  public async getPlayerInfo(player: string): Promise<PlayerInfo> {
    const endpoint = `https://playerdb.co/api/player/minecraft/${player}`;
    let res = null;
    try {
      res = (await axios.get(endpoint)).data;
      return {
        error: false,
        headImage: res.data.player.avatar as string,
        username: res.data.player.username as string,
        uuid: res.data.player.id as string,
        rawUuid: res.data.player.raw_id as string,
        bodyImage: `https://minotar.net/armor/body/${res.data.player.raw_id}/100.png`,
        nameHistory: res.data.player.meta["name_history"],
      };
    } catch (e) {
      res = e.response.data;
      return { error: true, message: `${res.code}: ${res.message}` };
    }
  }
  public async getServerInfo(
    host: string,
    port: number = 25565
  ): Promise<ServerInfo> {
    if (host.startsWith("http://") || host.startsWith("https://"))
      host = host.substring(host.indexOf("/") + 2, host.length).split("/")[0];
    const endpoint = `http://mcapi.us/server/status?ip=${host}`;
    let res = null;
    try {
      res = (await axios.get(endpoint)).data;
      return {
        ip: host,
        error: false,
        motd: res.motd
          .split("\n")
          .map((e) => e.trim())
          .join("\n")
          .replace(/§\w/gi, ""),
        icon: `https://eu.mc-api.net/v3/server/favicon/${host}`,
        type: res.server.name,
        maxPlayers: res.players.max,
        onlinePlayers: res.players.now,
        online: res.online,
        port,
        host,
      };
    } catch (e) {
      res = e.response.data;
      return { error: true, ip: host, message: res.error };
    }
  }
}
