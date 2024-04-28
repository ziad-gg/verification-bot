const canvafy = require('canvafy');
const fs = require('fs');

async function main() {
    const build = new canvafy.Security()
        .setAvatar('https://images-ext-1.discordapp.net/external/2dZVVL6feMSM7lxfFkKVW__LToSOzmToSEmocJV5vcA/https/cdn.discordapp.com/embed/avatars/0.png?format=webp&quality=lossless&width=460&height=460')
        .setCreatedTimestamp(Date.now() - 10)
        .setSuspectTimestamp(10)
        .setBorder("#f0f0f0")
        .setLocale("en")
        .setAvatarBorder("#f0f0f0")
        .setOverlayOpacity(0.9);

    const output = await build.build();

    fs.writeFileSync('scripts/Security.png', output);
    console.log('updated');
};

main();