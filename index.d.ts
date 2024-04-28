
interface Verifications {
    challenge: import('funcaptcha/lib/challenge').Challenge,
    images: [],
    cooldown: {
        nextAttemp: number,
        challenge_time: number
    }
};

type VerificationMap = Map<string, Verifications>

type Interaction = import('discord.js').Interaction<true> | import('discord.js').ChatInputCommandInteraction<true> | import('discord.js').ButtonInteraction<true>
type REF = import('discord.js').MessageReference