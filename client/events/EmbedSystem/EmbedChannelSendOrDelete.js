const { ButtonInteraction, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { EventBuilder } = require('handler.dts');

const { DumpCallBack } = require('@/src/utils');

EventBuilder.$N`interactionCreate`.$E(EmbedChannelSendOrDelete).$L();

/**
 * @param {ButtonInteraction} interaction 
 */
async function EmbedChannelSendOrDelete(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('cn')) return;
    if (!interaction.member.permissions.has('Administrator')) return interaction.reply({ content: 'Missing permissions', ephemeral: true });

    const m = interaction.message.reference?.messageId;

    const message = await interaction.channel.messages.fetch(m || 1).catch(DumpCallBack);
    if (!message) return interaction.update({ content: 'Try Again', components: [] });

    if (interaction.customId.includes('delete')) {
        message.delete().catch(DumpCallBack);
        interaction.update({ components: [], content: 'Message Was Deleted 🧺' }).catch(DumpCallBack);
    } else {
        const button = ButtonBuilder.from(message.components[0].components[0]);
        button.setCustomId(button.data.custom_id.replace('e', ''));

        const ActionRow = new ActionRowBuilder().addComponents(button);

        const channelId = interaction.customId.split('-')[1];
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) {
            message.delete().catch(DumpCallBack);
            return interaction.update({ components: [], content: 'Try Again :)' }).catch(DumpCallBack);
        };

        const Embed = EmbedBuilder.from(message.embeds[0]);

        channel.send({ embeds: [Embed], components: [ActionRow] }).then((m) => {
            message.delete().catch(DumpCallBack);
            interaction.update({ components: [], content: 'Message Was Send Successfully ✅' }).catch(DumpCallBack);
        }).catch(() => {
            message.delete().catch(DumpCallBack);
            interaction.update({ components: [], content: 'Error While Sending Message ❌❗' }).catch(DumpCallBack);
        });

    }
};