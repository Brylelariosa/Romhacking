export const Utils = {
    // Convert number to Hex String (e.g., 255 -> "FF")
    toHex: (num, padding = 2) => {
        return num.toString(16).toUpperCase().padStart(padding, '0');
    },

    // Check if a character is printable in standard ASCII
    getPrintableChar: (code) => {
        return (code >= 32 && code <= 126) ? String.fromCharCode(code) : '.';
    }
};
