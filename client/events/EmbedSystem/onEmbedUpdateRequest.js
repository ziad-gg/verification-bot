const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalSubmitInteraction } = require('discord.js');
const { EventBuilder } = require('handler.dts');

const { DumpCallBack } = require('@/src/based');

EventBuilder.$N`interactionCreate`.$E(onEmbedUpdateRequest).$L();

/**
 * @param {ModalSubmitInteraction} interaction 
 */
async function onEmbedUpdateRequest(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith('EmbedUpdateRequest')) return;
    if (!interaction.member.permissions.has('Administrator')) return interaction.reply({ content: 'Missing permissions', ephemeral: true });

    const m = interaction.message.reference?.messageId;

    const message = await interaction.channel.messages.fetch(m || 1).catch(DumpCallBack);
    if (!message) return interaction.update({ content: 'Try Again', components: [] });

    const embed = EmbedBuilder.from(message.embeds[0]);
    const row = new ActionRowBuilder().addComponents(ButtonBuilder.from(message.components[0].components[0]));

    let interactionType = interaction.fields.components[0].components.at(0).customId;
    const getField = (index) => interaction.fields.components[index].components[0].value;

    if (interactionType.includes('author')) {
        const authorName = getField(0);
        const authorIconURL = getField(1);

        const authorData = {};

        if (authorName) authorData.name = authorName;
        if (authorIconURL) authorData.iconURL = authorIconURL;

        try {
            embed.setAuthor(!authorData.name ? null : authorData);
        } catch {
            return interaction.reply({ content: `Failed To Author`, ephemeral: true });
        };
    } else if (interactionType.includes('footer')) {
        const footerText = getField(0);
        const footerIconURL = getField(1);

        const footerData = {};

        if (footerText) footerData.text = footerText;
        if (footerIconURL) footerData.iconURL = footerIconURL;

        try {
            embed.setFooter(!footerData.text ? null : footerData);
        } catch {
            return interaction.reply({ content: `Failed To Footer`, ephemeral: true });
        };
    } else if (interactionType.includes('field')) {
        const fieldName = getField(0);
        const fieldValue = getField(1);
        const fieldInline = getField(2) == 'yes' ? true : false;

        let fieldData = embed.data?.fields?.[0] ? embed.data?.fields : [];

        if (fieldValue == 'delete' && fieldData.length >= 1) {
            fieldData = fieldData.filter(field => field.name != fieldName);
        } else {
            fieldData.push({ name: fieldName, value: fieldValue, inline: fieldInline });
        }

        try {
            embed.setFields(fieldData);
        } catch {
            return interaction.reply({ content: `Failed To Add A Field`, ephemeral: true });
        };
    } else if (interactionType.includes('setLabel')) {
        const button = ButtonBuilder.from(message.components[0].components[0]);

        const ActionFunction = interactionType.split('-')[1];
        const interactionValue = interaction.fields.getTextInputValue(interactionType) || null;

        try {
            row.setComponents(button[ActionFunction](interactionValue));
        } catch (e) {
            console.log(e);
            await interaction.reply({ content: `Failed To ${interactionType}`, ephemeral: true });
        }
    } else if (interactionType.includes('setStyle')) {
        const button = ButtonBuilder.from(message.components[0].components[0]);

        const ActionFunction = interactionType.split('-')[1];
        const interactionValue = interaction.fields.getTextInputValue(interactionType) || null;

        try {
            row.setComponents(button[ActionFunction](interactionValue));
        } catch (e) {
            console.log(e);
            await interaction.reply({ content: `Failed To ${interactionType}`, ephemeral: true });
        }
    } else if (interactionType.includes('setEmoji')) {
        const button = ButtonBuilder.from(message.components[0].components[0]);

        const ActionFunction = interactionType.split('-')[1];
        const interactionValue = interaction.fields.getTextInputValue(interactionType) || null;

        try {
            row.setComponents(button[ActionFunction](interactionValue));
        } catch (e) {
            console.log(e);
            await interaction.reply({ content: `Failed To ${interactionType}`, ephemeral: true });
        }
    } else {
        interactionType = interactionType.split('-')[1];

        const interactionValue = interactionType.includes('Time') ?
            Date.now() :
            interaction.fields.getTextInputValue('e-' + interactionType) || null;

        try {
            embed[interactionType](interactionValue);
        } catch {
            await interaction.reply({ content: `Failed To ${interactionType}`, ephemeral: true });
        }
    }

    !interaction.replied && message.edit({ embeds: [embed], components: [row] }).then(() => {
        interaction.deferUpdate();
    }).catch(e => {
        interaction.reply({ content: `Failed To ${interactionType}`, ephemeral: true });
    });

};