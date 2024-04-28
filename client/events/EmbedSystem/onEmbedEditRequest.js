const { ButtonInteraction, ModalBuilder } = require('discord.js');
const { EventBuilder } = require('handler.dts');

const { GenerateTextInput } = require('@/src/utils');

EventBuilder.$N`interactionCreate`.$E(onEmbedEditRequest).$L();

/**
 * @param {ButtonInteraction} interaction 
 */
async function onEmbedEditRequest(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('e')) return;
    if (!interaction.member.permissions.has('Administrator')) return interaction.reply({ content: 'Missing permissions', ephemeral: true });

    const modal = new ModalBuilder()
        .setCustomId('EmbedUpdateRequest')
        .setTitle(`Embed.${interaction.customId}`);

    const ValueInput = GenerateTextInput(interaction.customId);

    if (interaction.customId.includes('Author')) {
        const nameInput = GenerateTextInput('author_name', false);
        const iconURLInput = GenerateTextInput('author_iconURL');
        modal.addComponents(nameInput, iconURLInput);
    } else if (interaction.customId.includes('Footer')) {
        const nameInput = GenerateTextInput('footer_text', false);
        const iconURLInput = GenerateTextInput('footer_iconURL');
        modal.addComponents(nameInput, iconURLInput);
    } else if (interaction.customId.includes('Field')) {
        const nameInput = GenerateTextInput('field_name', false, true);
        const valueInput = GenerateTextInput('field_value', false, true);
        const inline = GenerateTextInput('field_inline', false);

        modal.addComponents(nameInput, valueInput, inline);
    } else {
        modal.addComponents(ValueInput);
    }

    await interaction.showModal(modal);
};
