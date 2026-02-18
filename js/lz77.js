export const LZ77 = {
    decompress: (data, offset) => {
        if (data[offset] !== 0x10) return null; // Not LZ77

        const size = (data[offset + 1] | (data[offset + 2] << 8) | (data[offset + 3] << 16)) >> 8;
        const result = new Uint8Array(size);
        let dst = 0;
        let src = offset + 4;

        while (dst < size) {
            const flags = data[src++];
            for (let i = 0; i < 8; i++) {
                if (dst >= size) break;
                if ((flags & (0x80 >> i)) === 0) {
                    result[dst++] = data[src++];
                } else {
                    const byte1 = data[src++];
                    const byte2 = data[src++];
                    
                    const disp = (((byte1 & 0xF) << 8) | byte2) + 1;
                    const amount = ((byte1 >> 4) & 0xF) + 3;

                    for (let j = 0; j < amount; j++) {
                        if (dst >= size) break;
                        result[dst] = result[dst - disp];
                        dst++;
                    }
                }
            }
        }
        return result;
    }
};
