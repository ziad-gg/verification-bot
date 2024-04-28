const { Client } = require('discord.js');
const { EventBuilder } = require('handler.dts');

EventBuilder.$N`ready`.$E(Execution).$O().$L();

/**
 * @param {Client} client 
 */
function Execution(client) {
    console.log(`Client Is Ready ${client.user.tag}`);
};