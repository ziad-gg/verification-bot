const sharp = require('sharp');
const fs = require('fs');

async function main() {
    const image = fs.readFileSync('scripts/images/edited.png');

    const modifier = sharp(image).resize({ width: 1200, height: 400, fit: 'fill' }).toBuffer()
};

main();