const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const canvafy = require('canvafy');
const sharp = require('sharp');

String.prototype.toDiscordId = function () {
    return this.replace(/[<@#&!>]/g, '');
};

module.exports.FromCaptcha = async function (ImageBuffer) {
    const boxes = [
        { name: 'sol', x: 0, y: 200, width: 200, height: 200 },
        { name: 'box_1', x: 0, y: 0, width: 200, height: 200 },
        { name: 'box_2', x: 200, y: 0, width: 200, height: 200 },
        { name: 'box_3', x: 400, y: 0, width: 200, height: 200 },
        { name: 'box_4', x: 600, y: 0, width: 200, height: 200 },
        { name: 'box_5', x: 800, y: 0, width: 200, height: 200 },
        { name: 'box_6', x: 1000, y: 0, width: 200, height: 200 }
    ];

    const Attach = [];

    const canvas = Canvas.createCanvas(200, 200);
    const context = canvas.getContext('2d');

    const background = await Canvas.loadImage(ImageBuffer);

    for (const box of boxes) {

        if (box.name == 'sol') {
            canvas.height = 200;
            canvas.width = 125;
        } else {
            canvas.height = 200;
            canvas.width = 200;
        }

        context.drawImage(background, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);

        const buffer = canvas.toBuffer('image/png');
        const name = box.name == 'sol' ? 'ref' : box.name

        Attach.push({ type: name, image: new AttachmentBuilder(buffer, { name: `${box.name}.png` }) });
    };

    return Attach;
};

module.exports.GetChallengeImage = async function (ImageBuffer) {
    const canvas = Canvas.createCanvas(1200, 200);
    const context = canvas.getContext('2d');

    const background = await Canvas.loadImage(ImageBuffer);
    context.drawImage(background, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

    const canvas2 = Canvas.createCanvas(140, 205);
    const context2 = canvas2.getContext('2d');

    context2.drawImage(background, 0, 205, canvas2.width, canvas2.height, 0, 0, canvas2.width, canvas2.height);

    const buffer = await sharp(canvas.toBuffer('image/png')).resize({ width: 1400, height: 400, fit: 'fill' }).toBuffer();
    const buffer2 = canvas2.toBuffer('image/png');

    const Attachment = new AttachmentBuilder(buffer, { name: 'challenge.png' });
    const Attachment2 = new AttachmentBuilder(buffer2, { name: 'solution.png' });

    return { ChallengeTest: Attachment, ChallengeRef: Attachment2 };
};

/**
 * 
 * @param {Array<{ id: string, label: string }>} props 
 * @returns {ActionRowBuilder<ButtonBuilder>[]}
 */
module.exports.GenerateButtons = function (props) {
    const rows = [];
    let currentRow = new ActionRowBuilder();

    props.forEach((property, index) => {
        if (currentRow.components.length === 5) {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder();
        }

        currentRow.addComponents(
            new ButtonBuilder()
                .setLabel(property.label)
                .setCustomId(property.id)
                .setStyle(ButtonStyle.Secondary)
        );

        if (index === props.length - 1) {
            rows.push(currentRow);
        }
    });

    return rows;
};

module.exports.GenerateVerificationImage = async function (Avatar = '', Verified = false) {
    const build = new canvafy.Security()
        .setAvatar(Avatar)
        .setCreatedTimestamp(Date.now() - 10)
        .setSuspectTimestamp(Verified ? 1 : Date.now())
        .setBorder("#f0f0f0")
        .setLocale("en")
        .setAvatarBorder("#f0f0f0")
        .setOverlayOpacity(0.9);

    const buffer = await build.build();
    const Attach = new AttachmentBuilder(buffer, { name: 'Verification.png' });

    return Attach;
};

/**
 * 
 * @param {string} id 
 * @param {boolean} long 
 * @returns {ActionRowBuilder<TextInputBuilder>}
 */
module.exports.GenerateTextInput = function (id, long = true, required = false) {
    const iconURLInput = new TextInputBuilder()
        .setCustomId(id)
        .setLabel(`What's your ${id.replace('set', '')}`)
        .setStyle(long ? TextInputStyle.Paragraph : TextInputStyle.Short)
        .setRequired(required);

    return new ActionRowBuilder().addComponents(iconURLInput)
}

module.exports.DumpCallBack = () => null;