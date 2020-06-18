import { AkairoClient } from "discord-akairo";
import express, { Application } from "express";
import { createServer } from "http";
import cors from "cors";
import { port } from "../Config";
import { FlameConsole } from "../structures/Console";

import V1Router from "./routers/V1Router";

export default class API {
  protected client: AkairoClient;
  protected server: Application;

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
      (console as FlameConsole).log("express", "{method}: {path}", {
        path: req.path,
        method: req.method,
      });
      next();
    });

    new V1Router(this.server, this.client);

    createServer(this.server).listen(port, () =>
      (console as FlameConsole).log(
        "express",
        `API hosted at port {port} is online and ready!`,
        { port }
      )
    );
  }
}
