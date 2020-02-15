const sulla = require("sulla-hotfix");
const CommandParser = require("./src/CommandParser");
const commandOrquester = require("./src/InitCommand");
const express = require("express");
const { config } = require("./src/config/index");
const debug = require("debug")("app:server");

const commandParser = new CommandParser();

const app = express();
app.use(express.json());

async function start(client) {
  client.onStateChanged(state => {
    debug("statechanged", state);
    if (state === "CONFLICT") client.forceRefocus();
  });

  client.onMessage(async message => {
    try {
      const { body, from, type } = message;
      if (type == "chat") {
        const { command, params } = commandParser.parser(body);
        debug(
          `- ${from} envia: ${body} = commando "${command}", parametros [${params}]`
        );
        await commandOrquester.execute({
          command,
          params,
          context: message,
          client
        });
      }
    } catch (err) {
      console.log(err);
      client.kill();
    }
  });
}

sulla
  .create("session", {
    throwErrorOnTosBlock: true,
    headless: !config.dev
  })
  .then(async client => await start(client))
  .catch(e => {
    debug("error", e);
  });

app.get("/", async (req, res) => {
  return res.sendFile("./index.html", { root: __dirname });
});

app.listen(config.port, function() {
  debug(`Example app listening on port ${config.port}!`);
});
