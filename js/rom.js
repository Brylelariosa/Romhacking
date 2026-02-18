import { Utils } from './utils.js';

export class RomHandler {
    constructor() {
        this.data = null; // Uint8Array
        this.filename = "rom.gba";
    }

    load(arrayBuffer, name) {
        this.data = new Uint8Array(arrayBuffer);
        this.filename = name;
    }

    // Read bytes at a specific offset
    readBytes(offset, length) {
        if (!this.data) return [];
        return this.data.subarray(offset, offset + length);
    }

    // Write a byte
    writeByte(offset, value) {
        if (this.data && offset < this.data.length) {
            this.data[offset] = value;
        }
    }

    // Get ROM Header info (Pokemon Game Code is usually at 0xAC)
    getHeaderInfo() {
        if (!this.data) return null;
        
        // Game Title is at 0xA0 (12 bytes)
        let titleBytes = this.readBytes(0xA0, 12);
        let title = "";
        for(let b of titleBytes) title += String.fromCharCode(b);

        // Game Code is at 0xAC (4 bytes) - e.g., BPRE for FireRed
        let codeBytes = this.readBytes(0xAC, 4);
        let code = "";
        for(let b of codeBytes) code += String.fromCharCode(b);

        return { title, code };
    }

    download() {
        const blob = new Blob([this.data], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "edited_" + this.filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
