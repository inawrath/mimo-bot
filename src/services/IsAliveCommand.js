const moment = require('moment');
moment.locale('es');

class IsAliveCommand {
  constructor() {
    this._command = "!alive";
    this._start = moment();
  }

  get command() {
    return this._command;
  }

  async execute({ command, params, context, client }) {
    const { from } = context;
    const end = new Date();

    await client.sendText(from, `Estoy vivo ${this._start.fromNow()}`);
  }
}

module.exports = IsAliveCommand;
