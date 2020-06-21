import { AkairoClient } from "discord-akairo";
import express, { Application } from "express";
import { createServer } from "http";
import cors from "cors";
import { apiPort as port } from "../Config";
import { FlameConsole } from "../structures/Console";

import OAuth2Router from "./routers/OAuth2Router";
import GuildRouter from "./routers/GuildRouter";

export default class API {
  protected client: AkairoClient;
  protected server: Application;
  oauth: any;

  public constructor(client: AkairoClient) {
    this.client = client;
  }

  public start(): void {
    this.server = express();
    this.server.use(express.json());
    this.server.use(
      cors({
        origin: true,
        credentials: true,
      })
    );
    this.server.use("*", (req, res, next) => {
      (console as FlameConsole).log(
        "express",
        "API {method} request at {path}",
        {
          path: req.baseUrl,
          method: req.method,
        }
      );
      next();
    });

    new OAuth2Router(this.server, this.client);
    new GuildRouter(this.server, this.client);

    createServer(this.server).listen(port, () =>
      (console as FlameConsole).log(
        "express",
        `API hosted at port {port} is online and ready!`,
        { port }
      )
    );
  }
}
