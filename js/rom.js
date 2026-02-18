import { Utils } from './utils.js';
import { PokeText } from './text.js';

export class RomHandler {
    constructor() {
        this.data = null;
        this.filename = "rom.gba";
        this.gameCode = "";
    }

    load(arrayBuffer, name) {
        this.data = new Uint8Array(arrayBuffer);
        this.filename = name;
        this.detectGame();
    }

    detectGame() {
        // Read Game Code at 0xAC
        let code = "";
        for(let i=0xAC; i<0xB0; i++) code += String.fromCharCode(this.data[i]);
        this.gameCode = code;
    }

    // Get bookmarks based on detected game
    getBookmarks() {
        // BPRE = FireRed (US), BPEE = Emerald (US)
        if (this.gameCode === "BPRE") {
            return {
                "Header": 0x0000A0,
                "Pokemon Names": 0x245EE0,
                "Move Names": 0x247094,
                "Item Data": 0x3DB028,
                "Wild Pokemon (Route 1)": 0x3C9CB8, 
                "Starters Script": 0x169BB0
            };
        } else if (this.gameCode === "BPEE") {
            return {
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
