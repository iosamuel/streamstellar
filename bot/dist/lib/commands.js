"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
global.fetch = require("node-fetch");
const graphql_request_1 = require("graphql-request");
class Commands {
    constructor(client) {
        this.client = client;
        this.commands = new Map();
        this.commands.set("join", this.join);
    }
    resolve(target, context, msg) {
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
    join(target, context) {
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
            graphql_request_1.request("http://localhost:5001/v1/graphql", 
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
          `, {
                display_name,
                logo,
                lobby
            }).then(data => {
                console.log(data);
            });
            this.client.say(target, `Current lobby: ${Object.keys(lobby).join(" - ")}`);
        });
    }
}
exports.default = Commands;
