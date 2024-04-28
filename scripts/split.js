const Canvas = require('@napi-rs/canvas');
const fs = require('fs');

async function main() {
    const canvas = Canvas.createCanvas(1200, 200);
    const context = canvas.getContext('2d');

    const background = await Canvas.loadImage('scripts/captcha.png');
    context.drawImage(background, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

    const buffer = canvas.toBuffer('image/png');

    fs.writeFileSync(`scripts/images/edited.png`, buffer);

    console.log(` extracted successfully.`);
}

main()