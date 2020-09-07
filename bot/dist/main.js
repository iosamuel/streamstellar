"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @author: Samuel Burbano
 * @version: 1.0
 */
const graphql_request_1 = require("graphql-request");
const commands_1 = __importDefault(require("./lib/commands"));
const tmi = require("tmi.js");
require("dotenv").config();
const client = new tmi.client({
    identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.OAUTH_TOKEN
    },
    channels: (_a = process.env.CHANNELS_NAME) === null || _a === void 0 ? void 0 : _a.split(",")
});
const cmd = new commands_1.default(client);
client.on("message", (target, context, msg, self) => {
    if (self)
        return;
    cmd.resolve(target, context, msg);
});
client.on("connected", (addr, port) => {
    graphql_request_1.request("http://localhost:5001/v1/graphql", 
    /* GraphQL */ `
      mutation MyMutation {
        insert_lobby_one(object: { channel: "iosamuel" }) {
          id
          channel
        }
      }
    `).catch(() => { });
    console.log(`* Connected to ${addr}:${port}`);
});
client.connect();
