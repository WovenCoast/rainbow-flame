import dotenv from "dotenv";
import { join, dirname } from "path";
dotenv.config({ path: join(dirname(require.main.filename), "../.env") });

export let token: string = process.env.DISCORD_TOKEN;
export let prefix: string = process.env.PREFIX;
export let owners: string[] = [];
