const Canvas = require('@napi-rs/canvas');
const fs = require('fs');

(async function () {
    try {

        const boxes = [
            { name: 'sol', x: 0, y: 200, width: 200, height: 200 },
            { name: 'box_1', x: 0, y: 0, width: 200, height: 200 },
            { name: 'box_2', x: 200, y: 0, width: 200, height: 200 },
            { name: 'box_3', x: 400, y: 0, width: 200, height: 200 },
            { name: 'box_4', x: 600, y: 0, width: 200, height: 200 },
            { name: 'box_5', x: 800, y: 0, width: 200, height: 200 },
            { name: 'box_6', x: 1000, y: 0, width: 200, height: 200 }
        ];

        const canvas = Canvas.createCanvas(200, 200);
        const context = canvas.getContext('2d');

        const background = await Canvas.loadImage('./captcha.png');

        for (const box of boxes) {
            if (box.name == 'sol') {
                canvas.height = 200;
                canvas.width =  125;
            } else {
                canvas.height = 200;
                canvas.width = 200;
            }

            context.drawImage(background, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);

            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(`boxes/${box.name}.png`, buffer);

            console.log(`${box.name} extracted successfully.`);
        }

        console.log('All boxes extracted successfully.');
    } catch (error) {
        console.error('An error occurred while extracting the boxes:', error);
    }
})();
