// @ts-ignore
global.fetch = require("node-fetch");
import { request as gFetch } from "graphql-request";

class Commands {
  private commands = new Map();

  constructor(public client: any) {
    this.commands.set("join", this.join);
  }

  public resolve(target: any, context: any, msg: string) {
    const message = msg.toLowerCase();

    if (message.startsWith("!")) {
      const [command, ...args] = message.replace("!", "").split(" ");
      if (this.commands.has(command))
        Reflect.apply(this.commands.get(command), this, [
          target,
          context,
          args
        ]);
    }
  }

  private join(target: any, context: any) {
    const lobby = target.replace("#", "");

    fetch(`https://api.twitch.tv/kraken/users?login=${context.username}`, {
      // @ts-ignore
      headers: {
        Accept: "application/vnd.twitchtv.v5+json",
        "Client-ID": process.env.CLIENT_ID
      }
    })
      .then(res => res.json())
      .then(({ users: [user] }) => {
        const { display_name, name, logo } = user;

        gFetch(
          "http://localhost:5001/v1/graphql",
          /* GraphQL */ `
            mutation InsertPlayer(
              $display_name: String
              $logo: String
              $lobby: String
            ) {
              insert_players_one(
                object: {
                  display_name: $display_name
                  logo: $logo
                  lobby: $lobby
                }
              ) {
                id
                display_name
                logo
                lobby
              }
            }
          `,
          {
            display_name,
            logo,
            lobby
          }
        );

        this.client.say(
          target,
          `Current lobby: ${Object.keys(lobby).join(" - ")}`
        );
      });
  }
}

export default Commands;
