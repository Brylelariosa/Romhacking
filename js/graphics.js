export const GBA_Graphics = {
    toRGB: (val) => {
        const r = (val & 0x1F) * 8;
        const g = ((val >> 5) & 0x1F) * 8;
        const b = ((val >> 10) & 0x1F) * 8;
        return [r, g, b, 255];
    },

    drawSprite: (canvas, tiles, palette) => {
        const ctx = canvas.getContext('2d');
        const width = 64; 
        const height = 64;
        
        canvas.width = width;
        canvas.height = height;
        
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        
        let tileIndex = 0;
        for (let ty = 0; ty < height; ty += 8) {
            for (let tx = 0; tx < width; tx += 8) {
                for (let y = 0; y < 8; y++) {
                    for (let x = 0; x < 4; x++) {
                        if (tileIndex >= tiles.length) break;
                        const b = tiles[tileIndex++];
                        
                        const p1 = b & 0xF;
                        const c1 = GBA_Graphics.toRGB(palette[p1]);
                        const idx1 = ((ty + y) * width + (tx + (x * 2))) * 4;
                        data[idx1] = c1[0]; data[idx1+1] = c1[1]; data[idx1+2] = c1[2]; 
                        data[idx1+3] = (p1 === 0) ? 0 : 255; 

                        const p2 = (b >> 4) & 0xF;
                        const c2 = GBA_Graphics.toRGB(palette[p2]);
                        const idx2 = ((ty + y) * width + (tx + (x * 2) + 1)) * 4;
                        data[idx2] = c2[0]; data[idx2+1] = c2[1]; data[idx2+2] = c2[2]; 
                        data[idx2+3] = (p2 === 0) ? 0 : 255;
                    }
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
};
