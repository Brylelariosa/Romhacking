export const Utils = {
    toHex: (num, padding = 2) => {
        if (num === null || num === undefined) return "--";
        return num.toString(16).toUpperCase().padStart(padding, '0');
    },

    getPrintableChar: (code) => {
        // Simple ASCII range. A real Pokemon tool would use a custom table here.
        return (code >= 32 && code <= 126) ? String.fromCharCode(code) : '.';
    },

    // Convert string "00 A2 FF" to [0x00, 0xA2, 0xFF]
    parseHexString: (str) => {
        return str.replace(/\s+/g, '').match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
    },

    // Read 32-bit integer (Little Endian)
    readU32: (data, offset) => {
        if (offset + 4 > data.length) return 0;
        return data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24);
    },

    // Read 16-bit integer (Little Endian)
    readU16: (data, offset) => {
        if (offset + 2 > data.length) return 0;
        return data[offset] | (data[offset + 1] << 8);
    }
};
