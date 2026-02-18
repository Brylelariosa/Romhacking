export const Utils = {
    toHex: (num, padding = 2) => {
        if (num === null || num === undefined) return "--";
        return num.toString(16).toUpperCase().padStart(padding, '0');
    },
    getPrintableChar: (code) => {
        return (code >= 32 && code <= 126) ? String.fromCharCode(code) : '.';
    },
    readU32: (data, offset) => {
        if (offset + 4 > data.length) return 0;
        return data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24);
    },
    readU16: (data, offset) => {
        if (offset + 2 > data.length) return 0;
        return data[offset] | (data[offset + 1] << 8);
    }
};
