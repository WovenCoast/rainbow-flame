import { Application } from "express";
import { AkairoClient } from "discord-akairo";
import GuildRouter from "./v1/GuildRouter";

export default class V1Router {
  protected app: Application;
  protected client: AkairoClient;

  public constructor(app: Application, client: AkairoClient) {
    this.app = app;
    this.client = client;

    new GuildRouter(app, client);
  }
}
