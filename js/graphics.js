export const GBA_Graphics = {
    // Convert 15-bit BGR GBA color to CSS RGB
    toRGB: (val) => {
        const r = (val & 0x1F) * 8;
        const g = ((val >> 5) & 0x1F) * 8;
        const b = ((val >> 10) & 0x1F) * 8;
        return [r, g, b, 255];
    },

    drawSprite: (canvas, tiles, palette) => {
        const ctx = canvas.getContext('2d');
        const width = 64; // Standard Pokemon sprite width
        const height = 64;
        
        // Resize canvas
        canvas.width = width;
        canvas.height = height;
        
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        // Decode 4bpp Tiles
        // 1 Tile = 8x8 pixels = 32 bytes
        // Each byte in 'tiles' contains 2 pixels (low nibble, high nibble)
        
        let tileIndex = 0;
        for (let ty = 0; ty < height; ty += 8) {
            for (let tx = 0; tx < width; tx += 8) {
                // Process one 8x8 tile
                for (let y = 0; y < 8; y++) {
                    for (let x = 0; x < 4; x++) {
                        // Read byte containing 2 pixels
                        if (tileIndex >= tiles.length) break;
                        const b = tiles[tileIndex++];
                        
                        // Pixel 1 (Lower Nibble)
                        const p1 = b & 0xF;
                        const c1 = GBA_Graphics.toRGB(palette[p1]);
                        
                        // Pixel 2 (Upper Nibble)
                        const p2 = (b >> 4) & 0xF;
                        const c2 = GBA_Graphics.toRGB(palette[p2]);

                        // Write Pixel 1 to Canvas Array
                        // (tx + x*2) is the X coord, (ty + y) is Y coord
                        const idx1 = ((ty + y) * width + (tx + (x * 2))) * 4;
                        data[idx1] = c1[0]; data[idx1+1] = c1[1]; data[idx1+2] = c1[2]; 
                        data[idx1+3] = (p1 === 0) ? 0 : 255; // Transparency if index 0

                        // Write Pixel 2
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
