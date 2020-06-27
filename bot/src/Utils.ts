import childProcess from "child_process";
import axios from "axios";
import { URLSearchParams } from "url";
import { LavalinkNode } from "@lavacord/discord.js";
import { Manager, TrackResponse } from "lavacord";
import { Request, Response } from "express";
import { restAuth } from "./Config";

export function randomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}
export function convertMs(ms: number): string {
  const showWith0 = (value) => (value < 10 ? `0${value}` : value);
  const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  if (days !== 0) return `${showWith0(days)}d`;
  if (hours !== 0) return `${showWith0(hours)}h`;
  if (minutes !== 0) return `${showWith0(minutes)}min`;
  if (seconds !== 0) return `${showWith0(seconds)}s`;
  if (ms >= 1) return `${showWith0(Math.ceil(ms))}ms`;
  return `${(ms * 1000).toFixed(2)}μs`;
}
export function convertBytes(bytes: number): string {
  const decimals = 2;
  if (bytes == 0) return "0 Bytes";
  var k = 1024,
    dm = decimals <= 0 ? 0 : decimals || 2,
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
export function convertDuration(duration: number): string {
  const showWith0 = (value) => (value < 10 ? `0${value}` : value);
  const seconds = showWith0(Math.floor(duration % 60));
  const minutes = showWith0(Math.floor(duration / 60) % 60);
  const hours = showWith0(Math.floor((duration / 60 / 60) % 24));
  const days = showWith0(Math.floor((duration / 60 / 60 / 24) % 7));
  const weeks = showWith0(Math.floor((duration / 60 / 60 / 24 / 7) % 4));
  const months = showWith0(Math.floor((duration / 60 / 60 / 24 / 7 / 4) % 12));
  const years = showWith0(Math.floor(duration / 60 / 60 / 24 / 7 / 4 / 12));
  return `${years !== "00" ? years + ":" : ""}${
    months !== "00" ? months + ":" : ""
  }${weeks !== "00" ? weeks + ":" : ""}${days !== "00" ? days + ":" : ""}${
    hours !== "00" ? hours + ":" : ""
  }${minutes}:${seconds}`;
}
export function getRandom(arr: any[]): any {
  return arr[randomValue(0, arr.length)];
}
export function range(
  min: number,
  max: number,
  increment: number = 1
): Array<number> {
  const arr = [];
  for (let i = min; i <= max; i += increment) {
    arr.push(i);
  }
  return arr;
}
export function titleCase(string: string): string {
  return string
    .split(" ")
    .map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase())
    .join(" ");
}
export function pluralify(
  amount: number,
  string: string,
  pluralModifier: string = "s"
): string {
  if (amount === 0) return "No " + string + pluralModifier;
  if (amount === 1) return amount + " " + string;
  else return amount + " " + string + pluralModifier;
}
export function trimArray(
  arr: Array<string>,
  maxLen: number = 10
): Array<string> {
  if (arr.length > maxLen) {
    arr.push(`${arr.length - maxLen} more`);
    return arr;
  }
  return arr;
}
export function sanitize(string: string): string {
  return string.replace(
    new RegExp(
      `${Object.keys(process.env)
        .filter((e) => ["TOKEN", "SECRET"].some((s) => e.endsWith(s)))
        .map((k) => process.env[k])
        .join("|")}`,
      "gi"
    ),
    "nu cyka blyat"
  );
}
export function delay(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
export function exec(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, (err, stdout, stderr) => {
      if (err) reject(stdout);
      else resolve(stdout);
    });
  });
}
export function shuffle<K extends any>(array: Array<K>): Array<K> {
  return array.sort(() => Math.random() - 0.5);
}

export function chunk(length: number, string: string): Array<string> {
  return string.match(new RegExp(`(.|[\\r\\n]){1,${length}}`, "g"));
}
export async function getSongs(
  manager: Manager,
  search: string
): Promise<TrackResponse> {
  const node: LavalinkNode = manager.nodes.get("main");
  const params = new URLSearchParams();
  params.append("identifier", search);

  return axios
    .get(`http://${node.host}:${node.port}/loadtracks?${params}`, {
      headers: { Authorization: node.password },
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return null;
    });
}
export async function getBase64(url: string): Promise<Object> {
  try {
    var result = await axios
      .get(url, {
        responseType: "arraybuffer",
      })
      .then((response) =>
        Buffer.from(response.data, "binary").toString("base64")
      );

    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e };
  }
}
export function requireAuth(req: Request, res: Response, next: Function) {
  if (req.headers.authorization !== restAuth)
    return res.status(401).send({
      error: true,
      message: "Unauthorized",
    });
  next(req, res);
}
export default {
  randomValue,
  convertMs,
  convertBytes,
  convertDuration,
  getRandom,
  range,
  titleCase,
  pluralify,
  trimArray,
  sanitize,
  delay,
  exec,
  shuffle,
  chunk,
  getSongs,
  getBase64,
  requireAuth,
};
