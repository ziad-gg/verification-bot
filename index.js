const { Client } = require('discord.js');
const { Application } = require('handler.dts');

const client = new Client({
    intents: 3276799
});

new Application(client, {
    prefix: '-',
    commands: __dirname.concat('/client/commands'),
    events: __dirname.concat('/client/events'),
});

require('module-alias')();
require('dotenv').config();
require('@/src/based.js');
require('@/src/manager.js');
require('@/server/index.js');

client.Application.build();

client.login(process.env.TOKEN);