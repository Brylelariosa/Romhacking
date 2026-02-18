import { Utils } from './utils.js';
import { LZ77 } from './lz77.js';

export class RomHandler {
    constructor() {
        this.data = null;
        this.filename = "rom.gba";
        this.gameCode = "";
    }

    load(arrayBuffer, name) {
        this.data = new Uint8Array(arrayBuffer);
        this.filename = name;
        const codeBytes = this.data.subarray(0xAC, 0xB0);
        this.gameCode = "";
        for(let b of codeBytes) this.gameCode += String.fromCharCode(b);
    }

    readBytes(offset, length) { return this.data.subarray(offset, offset + length); }
    
    writeByte(offset, value) {
        if (this.data && offset < this.data.length) this.data[offset] = value;
    }

    // --- SPRITE POINTERS ---
    getSpritePointers() {
        if (this.gameCode === "BPRE") return { sprites: 0x2350AC, palettes: 0x23730C }; // FireRed
        if (this.gameCode === "BPEE") return { sprites: 0x32FC48, palettes: 0x32FD2C }; // Emerald
        return null;
    }

    getPokemonSprite(id) {
        if (!this.data) return null;
        const tables = this.getSpritePointers();
        if (!tables) return null;

        // Calculate Pointers (Table entry is 8 bytes: 4 byte ptr, 4 byte junk)
        const spritePtr = Utils.readU32(this.data, tables.sprites + (id * 8));
        const palPtr = Utils.readU32(this.data, tables.palettes + (id * 8));
        
        // Decompress
        const tiles = LZ77.decompress(this.data, spritePtr & 0x01FFFFFF);
        const rawPal = LZ77.decompress(this.data, palPtr & 0x01FFFFFF);

        if (!tiles || !rawPal) return null;

        // Format Palette
        const palette = [];
        for (let i = 0; i < rawPal.length; i += 2) {
            palette.push(rawPal[i] | (rawPal[i+1] << 8));
        }

        return { tiles, palette };
    }

    download() {
        const blob = new Blob([this.data], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "HM_Edit_" + this.filename;
        a.click();
    }
}
