import { ConnectionManager } from "typeorm";
import { dbName } from "../Config";

import { Warn } from "../models/Warn";
import { Giveaway } from "../models/Giveaway";
import { Mute } from "../models/Mute";
import { Reminder } from "../models/Reminder";
import { Rank } from "../models/Rank";
import { Setting } from "../models/Settings";

const connectionManager: ConnectionManager = new ConnectionManager();
connectionManager.create({
  name: dbName,
  type: "sqlite",
  database: "./db.sqlite",
  entities: [Setting, Warn, Giveaway, Mute, Reminder, Rank],
});
export default connectionManager;
