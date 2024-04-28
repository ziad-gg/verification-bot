const { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { CommandBuilder } = require('handler.dts');

const { GenerateButtons, DumpCallBack } = require('@/src/based');

CommandBuilder.$N`setup`.$M(Execution);

/**
 * @param {Message} message 
 */
async function Execution(message) {
    if (!message.member.permissions.has('Administrator')) return message.replyNoMention(`Missing Permissions`);

    const channelId = message.args(0) && message.args(0).toDiscordId();
    const roleId = message.args(1) && message.args(1).toDiscordId();
    const messageId = message.args(2) && message.args(2).toDiscordId();

    const channel = message.guild.channels.cache.get(channelId);
    const role = message.guild.roles.cache.get(roleId);
    const CopyMessage = await message.channel.messages.fetch(messageId || 1).catch(DumpCallBack);

    if (!channel || !role) return message.replyNoMention(`Invalid ${!channel ? 'Channel' : 'Role'} Id`);

    let EmbedPreviewBuilder = new EmbedBuilder()
        .setDescription('editable embed');

    if (CopyMessage && CopyMessage.embeds?.[0]) {
        EmbedPreviewBuilder = EmbedBuilder.from(CopyMessage.embeds[0])
    }

    const ButtonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`ve-${role.id}`)
            .setLabel('Verify')
            .setEmoji('1081597929061630048')
            .setStyle(ButtonStyle.Primary)
    );

    const prototype = getAllFuncs(EmbedPreviewBuilder).map(v => new Object({ id: `e-${v}`, label: v }).valueOf())
    const rows = GenerateButtons(prototype);

    const rows_buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`e-setLabel`)
            .setLabel('setLabel')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`e-setStyle`)
            .setLabel('setStyle')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`e-setEmoji`)
            .setLabel('setEmoji')
            .setStyle(ButtonStyle.Primary)
    );

    const rows_controller = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`cn-${channel.id}`)
            .setLabel('send ✅')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`cn-delete`)
            .setLabel('delete 🧺')
            .setStyle(ButtonStyle.Danger),
    );

    const EmbedPerviewMessage = await message.channel.send({ embeds: [EmbedPreviewBuilder], components: [ButtonRow] });

    EmbedPerviewMessage.reply({
        components: [...rows, rows_buttons, rows_controller]
    });

    message.deletable && message.delete().catch(DumpCallBack);
};

/**
 * 
 * @param {Object} toCheck 
 * @returns {string[]}
 */
function getAllFuncs(toCheck) {
    const props = [];
    let obj = toCheck;
    do {
        props.push(...Object.getOwnPropertyNames(obj));
    } while (obj = Object.getPrototypeOf(obj));

    return props.sort().filter((e, i, arr) => {
        if (e != arr[i + 1] && typeof toCheck[e] == 'function' && e.startsWith('set')) return true;
    });
};