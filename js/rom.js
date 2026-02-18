import { Utils } from './utils.js';

export class RomHandler {
    constructor() {
        this.data = null; 
        this.filename = "rom.gba";
    }

    load(arrayBuffer, name) {
        this.data = new Uint8Array(arrayBuffer);
        this.filename = name;
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

    getHeaderInfo() {
        if (!this.data) return null;
        let title = "";
        for(let i=0xA0; i<0xAC; i++) title += String.fromCharCode(this.data[i]);
        let code = "";
        for(let i=0xAC; i<0xB0; i++) code += String.fromCharCode(this.data[i]);
        return { title, code };
    }

    // New: Search for a byte sequence
    find(byteSequence, startOffset = 0) {
        if (!this.data || byteSequence.length === 0) return -1;
        
        // Simple linear search (Performance warning on large ROMs!)
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
        a.download = "edited_" + this.filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
