export const LZ77 = {
    decompress: (data, offset) => {
        // GBA LZ77 header is usually 0x10
        if (data[offset] !== 0x10) return null;

        const size = (data[offset + 1] | (data[offset + 2] << 8) | (data[offset + 3] << 16)) >> 8;
        const result = new Uint8Array(size);
        let dst = 0;
        let src = offset + 4;

        while (dst < size) {
            const flags = data[src++];
            for (let i = 0; i < 8; i++) {
                if (dst >= size) break;
                if ((flags & (0x80 >> i)) === 0) {
                    // Direct copy
                    result[dst++] = data[src++];
                } else {
                    // Compressed block
                    const block = (data[src] << 8) | data[src + 1];
                    src += 2;
                    
                    const amount = ((block >> 4) & 0xF) + 3;
                    const disp = (block & 0xF) << 8 | ((block >> 8) & 0xFF); // Displacement
                    const dispVal = (block & 0xF) << 8 | (block >> 8); // Fixed displacement logic
                    
                    // Actually, GBA logic:
                    // block is 16 bits: C D ...
                    // Amount = (High nibble of byte 1) + 3
                    // Disp = (Low nibble of byte 1 << 8) | byte 2
                    
                    // Re-reading byte pair properly:
                    const byte1 = data[src-2];
                    const byte2 = data[src-1];
                    
                    const copyAmount = ((byte1 >> 4) & 0xF) + 3;
                    const copyDisp = (((byte1 & 0xF) << 8) | byte2) + 1;

                    for (let j = 0; j < copyAmount; j++) {
                        if (dst >= size) break;
                        result[dst] = result[dst - copyDisp];
                        dst++;
                    }
                }
            }
        }
        return result;
    }
};
