const { EmbedBuilder, ButtonInteraction } = require('discord.js');
const { EventBuilder } = require('handler.dts');
const funcaptcha = require('funcaptcha');

const Base = require('@/src/base.js');
const { GetChallengeImage, GenerateButtons, GenerateVerificationImage } = require('@/src/based');

EventBuilder.$N`interactionCreate`.$E(Execution).$L();

/** 
 * @type {Map<string, Verifications>}
 */
const Verifications = new Map();
const row1Buttons = [
    { id: 'choice-1', label: '1️⃣' },
    { id: 'choice-2', label: '2️⃣' },
    { id: 'choice-3', label: '3️⃣' },
    { id: 'choice-4', label: '4️⃣' },
    { id: 'choice-5', label: '5️⃣' },
    { id: 'choice-6', label: '6️⃣' }
];

/**
 * @param {ButtonInteraction} interaction 
 */
async function Execution(interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('v')) {
        await interaction.deferReply({ ephemeral: true });
        const data = Verifications.get(interaction.user.id);

        if (data && data.cooldown.nextAttempt > Date.now()) return interaction.editReply('Please wait for 1 minute before attempting another verification. ⏳');

        Verifications.set(interaction.user.id, {
            cooldown: {
                nextAttempt: Date.now() + 90000,
                challengeTime: Date.now() + 60000
            }
        });

        await interaction.editReply(`Preparing verification... 🔄`);

        const roleId = interaction.customId.split('-')[1];
        const role = await interaction.guild.roles.fetch(roleId).catch(e => null);

        if (!role) return interaction.editReply('Unfortunately, the verification reward is no longer available. ❌');

        const token = await Base.getToken(Base.toCookie());
        await interaction.editReply(`Fetching authentication token... 🌐`);

        const auth = {
            cookie: Base.toCookie(),
            token: token
        };

        const attempt = await Base.post(Base.GroupJoin(5210711), auth);

        const decoded = Base.toJson(attempt.headers['rblx-challenge-metadata']);
        await interaction.editReply(`Authentication successful! ✅`);

        const challengeToken = await Base.getChallangeToken(decoded);
        await interaction.editReply(`Retrieving challenge token... 🔑`);

        if (challengeToken.token.includes("sup=1")) return interaction.editReply(`Please try again later. ❌`);

        const session = new funcaptcha.Session(challengeToken);
        const challenge = await session.getChallenge();

        await interaction.editReply(`Challenge received! 🧩`);

        const images = await Promise.all([...challenge.imgs]);

        await interaction.editReply(`Challenge images received! 🖼️`);

        const embedSolution = new EmbedBuilder()
            .setTitle(`${challenge.wave + 1}/${challenge.waves}`)
            .setImage('attachment://solution.png');

        const embedInstruction = new EmbedBuilder()
            .setDescription(challenge.instruction.replace(/<\/?[^>]+(>|$)/g, "").replace('left', 'top left'))
            .setImage(`attachment://challenge.png`)

        const challengeImages = await GetChallengeImage(images[0]);
        const rows = GenerateButtons(row1Buttons.slice(0, challenge.data.game_data.game_difficulty));

        Verifications.set(interaction.user.id, {
            challenge,
            images: images,
            cooldown: {
                nextAttempt: Date.now() + 130_000,
                challengeTime: Date.now() + 100_000
            }
        });

        await interaction.editReply({
            embeds: [embedSolution, embedInstruction],
            components: rows,
            files: [challengeImages.ChallengeRef, challengeImages.ChallengeTest]
        });

    } else if (interaction.customId.startsWith('choice')) {
        const data = Verifications.get(interaction.user.id);
        const emptyResponse = { content: '', embeds: [], components: [], files: [] };

        if (!data) return interaction.update({ content: 'Regrettably, the session has been terminated. ❌', ...emptyResponse });

        if (data && data.cooldown.challengeTime < Date.now()) {
            Verifications.delete(interaction.user.id);
            return interaction.update({ content: 'Verification session expired. ⌛', ...emptyResponse });
        };

        const challenge = data.challenge;
        const images = data.images;

        const index = (+interaction.customId.split('-')[1]) - 1;
        const answer = await challenge.answer(index);

        if (answer.response == 'answered') {
            const messageReference = interaction.message?.reference;
            const message = await interaction.channel.messages.fetch(messageReference?.messageId || 1).catch(e => null)
            if (!message) return interaction.update({ content: 'The verification reward (message) seems invalid. ❌', ...emptyResponse })

            const roleId = message.components?.[0]?.components?.[0]?.customId?.split('-')?.[1];
            const role = await interaction.guild.roles.fetch(roleId || 1);
            if (!role) return interaction.update({ content: 'The verification reward (role) seems invalid. ❌', ...emptyResponse })

            const image = await GenerateVerificationImage(interaction.user.displayAvatarURL(), answer.solved)

            if (answer.solved) interaction.member.roles.add(role.id).catch(console.log);

            return interaction.update({ ...emptyResponse, files: [image] });
        };

        const message = interaction.message;
        const nextImage = images[challenge.wave];

        const embedSolution = EmbedBuilder.from(message.embeds[0])
            .setTitle(`${challenge.wave + 1}/${challenge.waves}`)
            .setImage('attachment://solution.png');

        const embedInstruction = EmbedBuilder.from(message.embeds[1])
            .setImage(`attachment://challenge.png`);

        const challengeImages = await GetChallengeImage(nextImage);

        await interaction.update({
            embeds: [embedSolution, embedInstruction],
            files: [challengeImages.ChallengeRef, challengeImages.ChallengeTest]
        });
    }
};