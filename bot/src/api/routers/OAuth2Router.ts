import { Router, Request, Response, Application } from "express";
import { AkairoClient } from "discord-akairo";
import fetch from "node-fetch";
import session from "express-session";
import OAuth2 from "../../structures/OAuth2";
import { callbackUrl, clientSecret, userID, redirectUri } from "../../Config";

export default class OAuth2Router {
  protected app: Application;
  protected client: AkairoClient;
  protected router: Router;
  protected oauth: OAuth2;

  public constructor(app: Application, client: AkairoClient) {
    this.app = app;
    this.client = client;
    this.router = Router();
    this.oauth = new OAuth2(client);

    this.app.use(
      session({
        secret:
          Math.random().toString(36).substring(7) +
          Math.random().toString(36).substring(7) +
          Math.random().toString(36).substring(7),
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: "auto",
          sameSite: false,
          httpOnly: false,
          maxAge: 6048e5, // 1 week
        },
      })
    );

    this.router.get("/oauth/login", (req: Request, res: Response) => {
      return res.redirect(
        `https://discord.com/api/oauth2/authorize?client_id=${userID}&redirect_uri=${encodeURIComponent(
          callbackUrl
        )}&response_type=code&scope=${encodeURIComponent("identify guilds")}`
      );
    });

    this.router.get("/oauth/logout", (req: Request, res: Response) => {
      req.session.destroy(null);
      return res.redirect(redirectUri);
    });

    this.router.get("/oauth/callback", (req: Request, res: Response) => {
      fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //@ts-ignore
        body: new URLSearchParams({
          client_id: userID,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code: req.query.code,
          redirect_uri: callbackUrl,
          scope: "identify",
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.error)
            res
              .status(500)
              .send(`${response.error}: ${response["error_description"]}`);
          req.session.token = response["access_token"];
          res.redirect(redirectUri);
        });
    });

    this.router.get("/oauth/details", async (req: Request, res: Response) => {
      const details = await this.oauth.resolveInformation(req);
      return res.status(200).send(details);
    });

    this.app.use(this.router);
  }
}
