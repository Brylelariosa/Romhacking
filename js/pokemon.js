import { Utils } from './utils.js';
import { PokeText } from './text.js';

export class PokemonEditor {
    constructor(romHandler) {
        this.rom = romHandler;
    }

    getOffsets() {
        const code = this.rom.gameCode;
        if (code === "BPRE") return { names: 0x245EE0, stats: 0x254784 };
        if (code === "BPEE") return { names: 0x317F98, stats: 0x3203CC };
        return null;
    }

    getPokemon(id) {
        const offsets = this.getOffsets();
        if (!offsets) return null;

        // Name
        const nameOffset = offsets.names + (id * 11);
        let nameBytes = [];
        for(let i=0; i<10; i++) nameBytes.push(this.rom.data[nameOffset+i]);
        const name = PokeText.decode(nameBytes);

        // Stats
        const statOffset = offsets.stats + (id * 28);
        const d = this.rom.data;
        
        const stats = {
            hp: d[statOffset + 0], atk: d[statOffset + 1], def: d[statOffset + 2],
            spd: d[statOffset + 3], spa: d[statOffset + 4], spd_def: d[statOffset + 5],
            type1: d[statOffset + 6], type2: d[statOffset + 7],
            offset: statOffset
        };

        return { id, name, stats };
    }

    saveStats(id, newStats) {
        const offsets = this.getOffsets();
        if (!offsets) return;
        const offset = offsets.stats + (id * 28);
        
        this.rom.writeByte(offset + 0, newStats.hp);
        this.rom.writeByte(offset + 1, newStats.atk);
        this.rom.writeByte(offset + 2, newStats.def);
        this.rom.writeByte(offset + 3, newStats.spd);
        this.rom.writeByte(offset + 4, newStats.spa);
        this.rom.writeByte(offset + 5, newStats.spd_def);
        this.rom.writeByte(offset + 6, newStats.type1);
        this.rom.writeByte(offset + 7, newStats.type2);
    }
}

export const TypeMap = {
    0x00: "Normal", 0x01: "Fighting", 0x02: "Flying", 0x03: "Poison", 
    0x04: "Ground", 0x05: "Rock", 0x06: "Bug", 0x07: "Ghost", 
    0x08: "Steel", 0x09: "???", 0x0A: "Fire", 0x0B: "Water", 
    0x0C: "Grass", 0x0D: "Electric", 0x0E: "Psychic", 0x0F: "Ice", 
    0x10: "Dragon", 0x11: "Dark"
};
