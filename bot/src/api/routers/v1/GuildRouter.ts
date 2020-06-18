import { Router, Request, Response, Application } from "express";
import { AkairoClient } from "discord-akairo";
import { Guild } from "discord.js";
import { restAuth } from "../../../Config";
import { requireAuth } from "../../../Utils";

export default class GuildRouter {
  protected app: Application;
  protected client: AkairoClient;
  protected router: Router;

  public constructor(app: Application, client: AkairoClient) {
    this.app = app;
    this.client = client;
    this.router = Router();

    this.app.use(this.router);

    // http://localhost:8888/v1/get/guild/:id
    this.router.get("/v1/get/guild/:id", (req: Request, res: Response) => {
      const guild: Guild = this.client.guilds.cache.get(req.params.id);
      if (!guild)
        return res
          .status(404)
          .send({ error: true, message: "Guild not found." });
      return res.status(200).send({
        error: false,
        name: guild.name,
        id: guild.id,
        owner: guild.owner.user.id,
        members: guild.memberCount,
      });
    });

    // http://localhost:8888/v1/post/guild-name/:id
    this.router.post(
      "/v1/post/guild-name/:id",
      requireAuth,
      (req: Request, res: Response) => {
        const guild = this.client.guilds.cache.get(req.params.id);
        if (!guild)
          return res
            .status(404)
            .send({ error: true, message: "Guild not found." });

        if (!req.body.name)
          return res
            .status(404)
            .send({ error: true, message: "No guild name provided." });
        if (req.body.name.length > 32)
          return res.status(400).send({
            error: true,
            message:
              "Guild name invalid. Guild name must be shorter than 32 characters.",
          });
        if (!guild.me.permissions.has("MANAGE_GUILD"))
          return res.status(401).send({
            error: true,
            message: `Bot does not have permission MANAGE_GUILD in ${guild.name}`,
          });

        guild.setName(req.body.name);
        return res.status(201).send({
          error: false,
          message: `Successfully renamed the guild to ${req.body.name}!`,
        });
      }
    );
  }
}
