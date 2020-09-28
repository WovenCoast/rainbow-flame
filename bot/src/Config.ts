import dotenv from "dotenv";
import { join, dirname } from "path";
dotenv.config({ path: join(dirname(require.main.filename), "../../.env") });
import { LavalinkNodeOptions } from "lavacord";
const pckg = require("../../package.json");

export let version: string = `v${pckg.version}`;
export let debug: boolean = process.env.DEBUG === "true";
export let apiPort: string = process.env.API_PORT;
export let token: string = process.env.DISCORD_TOKEN;
export let prefix: string = process.env.PREFIX;
export let userID: string = process.env.CLIENT_ID;
export let clientId: string = process.env.CLIENT_ID;
export let clientSecret: string = process.env.CLIENT_SECRET;
export let restAuth: string = process.env.REST_SECRET;
export let callbackUrl: string = debug
  ? "http://localhost:7001/oauth/callback"
  : "https://api.rainbowflame.quniverse.xyz/oauth/callback";
export let redirectUri: string = debug
  ? "http://localhost:5432/"
  : "https://dash.rainbowflame.quniverse.xyz/";
export let owners: string[] = [
  "502446928303226890",
  "511518299201470465",
  "633191338233561110",
];
export let dbName: string = "FlameDB";
export let lavalink: LavalinkNodeOptions = {
  id: "main",
  host: process.env.LAVALINK_HOST,
  port: process.env.LAVALINK_PORT,
  password: process.env.LAVALINK_SECRET,
};
interface Colors {
  scheme: string[];
  primary: string;
  secondary: string;
  info: string;
  error: string;
  success: string;
}
export let colors: Colors = {
  scheme: ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA"],
  primary: "#FFFFFF",
  secondary: "#EEEEEE",
  info: "#92DFF3",
  error: "#FF9AA2",
  success: "#B5EAD7",
};
