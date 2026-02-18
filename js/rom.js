import { Utils } from './utils.js';
import { LZ77 } from './lz77.js';

export class RomHandler {
    constructor() {
        this.data = null;
        this.gameCode = "";
    }

    load(arrayBuffer) {
        this.data = new Uint8Array(arrayBuffer);
        const codeBytes = this.data.subarray(0xAC, 0xB0);
        this.gameCode = String.fromCharCode(...codeBytes);
    }

    // --- SPRITE LOGIC ---
    
    getSpritePointers() {
        // Addresses for the "Front Sprite Table" and "Normal Palette Table"
        if (this.gameCode === "BPRE") { // FireRed
            return { sprites: 0x2350AC, palettes: 0x23730C };
        }
        if (this.gameCode === "BPEE") { // Emerald
            return { sprites: 0x32FC48, palettes: 0x32FD2C };
        }
        return null;
    }

    getPokemonSprite(id) {
        if (!this.data) return null;
        const tables = this.getSpritePointers();
        if (!tables) return null;

        // 1. Get Sprite Graphics
        // The table is an array of 8-byte entries. 
        // We want the Pointer (first 4 bytes).
        const spriteTableEntry = tables.sprites + (id * 8);
        const spritePtr = Utils.readU32(this.data, spriteTableEntry);
        const spriteOffset = spritePtr & 0x01FFFFFF; // Remove 08 prefix

        // 2. Get Palette
        // Table is array of 8-byte entries too.
        const palTableEntry = tables.palettes + (id * 8);
        const palPtr = Utils.readU32(this.data, palTableEntry);
        const palOffset = palPtr & 0x01FFFFFF;

        // 3. Decompress
        // Both graphics and palettes are LZ77 compressed in Gen 3
        const tiles = LZ77.decompress(this.data, spriteOffset);
        const rawPal = LZ77.decompress(this.data, palOffset);

        if (!tiles || !rawPal) return null;

        // 4. Convert Palette to standard array of uint16
        const palette = [];
        for (let i = 0; i < rawPal.length; i += 2) {
            palette.push(rawPal[i] | (rawPal[i+1] << 8));
        }

        return { tiles, palette };
    }

    // ... (Keep existing readBytes/writeByte/find methods from previous versions) ...
    
    readBytes(offset, len) { return this.data.subarray(offset, offset + len); }
    writeByte(offset, val) { this.data[offset] = val; }
    download() { /* ... existing download logic ... */ }
}            return {
                "Header": 0x0000A0,
                "Pokemon Names": 0x317F98,
                "Move Names": 0x31977C,
                "Item Data": 0x5839A0,
                "Starters": 0x27242C
            };
        }
        return {};
    }

    readBytes(offset, length) {
        if (!this.data) return [];
        return this.data.subarray(offset, offset + length);
    }

    writeByte(offset, value) {
        if (this.data && offset < this.data.length) {
            this.data[offset] = value;
        }
    }

    // Read a string starting at offset until 0xFF
    readString(offset, maxLength = 20) {
        if (!this.data) return "";
        let bytes = [];
        for(let i=0; i<maxLength; i++) {
            let b = this.data[offset + i];
            if(b === 0xFF) break;
            bytes.push(b);
        }
        return PokeText.decode(bytes);
    }

    find(byteSequence, startOffset = 0) {
        if (!this.data || byteSequence.length === 0) return -1;
        for (let i = startOffset; i < this.data.length - byteSequence.length; i++) {
            let match = true;
            for (let j = 0; j < byteSequence.length; j++) {
                if (this.data[i + j] !== byteSequence[j]) {
                    match = false;
                    break;
                }
            }
            if (match) return i;
        }
        return -1;
    }

    download() {
        const blob = new Blob([this.data], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "HM_Edit_" + this.filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
