import { RomHandler } from './rom.js';
import { Utils } from './utils.js';

const rom = new RomHandler();

const els = {
    file: document.getElementById('fileInput'),
    load: document.getElementById('btnLoad'),
    save: document.getElementById('btnSave'),
    bookmarks: document.getElementById('bookmarkSelect'),
    go: document.getElementById('btnGo'),
    search: document.getElementById('btnSearch'),
    searchInput: document.getElementById('searchInput'),
    offset: document.getElementById('offsetInput'),
    grid: document.getElementById('hexGrid'),
    
    // Editor elements
    lblOffset: document.getElementById('lblOffset'),
    byteInput: document.getElementById('byteInput'),
    btnWrite: document.getElementById('btnWrite'),
    textPreview: document.getElementById('textPreview'),

    inspector: {
        u8: document.getElementById('val-u8'),
        u16: document.getElementById('val-u16'),
        u32: document.getElementById('val-u32'),
        ptr: document.getElementById('val-ptr')
    }
};

let currentOffset = 0;
let selectedOffset = -1;

// --- Init & Events ---

els.load.addEventListener('click', () => els.file.click());

els.file.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        rom.load(ev.target.result, file.name);
        initUI();
    };
    reader.readAsArrayBuffer(file);
});

els.save.addEventListener('click', () => rom.download());

// Go Button
els.go.addEventListener('click', () => {
    const val = parseInt(els.offset.value, 16);
    if (!isNaN(val)) renderGrid(val);
});

// Bookmarks Dropdown
els.bookmarks.addEventListener('change', (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
        renderGrid(val);
        selectByte(val);
    }
});

// Write Button (Sidebar)
els.btnWrite.addEventListener('click', writeByteValue);
els.byteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') writeByteValue();
});

function writeByteValue() {
    if (selectedOffset === -1) return;
    const val = parseInt(els.byteInput.value, 16);
    if (!isNaN(val) && val >= 0 && val <= 255) {
        rom.writeByte(selectedOffset, val);
        renderGrid(currentOffset); // Refresh grid
        selectByte(selectedOffset); // Refresh inspector
    }
}

// Search Button
els.search.addEventListener('click', () => {
    const bytes = Utils.parseHexString(els.searchInput.value);
    if (bytes.length === 0) return alert("Invalid Hex");
    
    els.search.textContent = "...";
    setTimeout(() => {
        const foundAt = rom.find(bytes, currentOffset);
        els.search.textContent = "🔍";
        if (foundAt !== -1) {
            renderGrid(foundAt);
            selectByte(foundAt);
        } else {
            alert("Not found");
        }
    }, 10);
});

// Inspector Pointer Click
els.inspector.ptr.addEventListener('click', () => {
    const ptrText = els.inspector.ptr.textContent;
    if (ptrText !== "-" && ptrText !== "No") {
        const ptrVal = parseInt(ptrText, 16);
        const physicalOffset = ptrVal & 0x01FFFFFF;
        renderGrid(physicalOffset);
        selectByte(physicalOffset);
    }
});

// --- Logic ---

function initUI() {
    els.save.disabled = false;
    els.bookmarks.disabled = false;
    
    // Load Bookmarks
    const marks = rom.getBookmarks();
    els.bookmarks.innerHTML = '<option value="">-- Jump to... --</option>';
    for (let [name, offset] of Object.entries(marks)) {
        const opt = document.createElement('option');
        opt.value = offset;
        opt.textContent = name;
        els.bookmarks.appendChild(opt);
    }

    renderGrid(0);
}

function renderGrid(startOffset) {
    startOffset = Math.floor(startOffset / 16) * 16;
    currentOffset = startOffset;
    els.offset.value = Utils.toHex(startOffset, 6);
    els.grid.innerHTML = '';

    for (let i = 0; i < 50; i++) {
        const rowOffset = startOffset + (i * 16);
        if (rowOffset >= rom.data.length) break;

        const row = document.createElement('div');
        row.className = 'hex-row';

        // Offset Label
        const offSpan = document.createElement('span');
        offSpan.className = 'offset-label';
        offSpan.textContent = Utils.toHex(rowOffset, 6);
        row.appendChild(offSpan);

        // Bytes
        const bytesDiv = document.createElement('div');
        bytesDiv.className = 'bytes';
        
        let asciiStr = "";
        const rowData = rom.readBytes(rowOffset, 16);

        rowData.forEach((byte, idx) => {
            const bSpan = document.createElement('span');
            bSpan.textContent = Utils.toHex(byte);
            bSpan.dataset.offset = rowOffset + idx;
            
            bSpan.onclick = () => selectByte(rowOffset + idx);
            
            if (selectedOffset === rowOffset + idx) bSpan.classList.add('selected');
            
            bytesDiv.appendChild(bSpan);
            asciiStr += Utils.getPrintableChar(byte);
        });
        row.appendChild(bytesDiv);

        // Standard ASCII
        const asciiDiv = document.createElement('span');
        asciiDiv.className = 'ascii';
        asciiDiv.textContent = asciiStr;
        row.appendChild(asciiDiv);

        els.grid.appendChild(row);
    }
}

function selectByte(offset) {
    selectedOffset = offset;
    els.lblOffset.textContent = Utils.toHex(offset, 6);
    
    // Update highlight
    document.querySelectorAll('.bytes span').forEach(b => b.classList.remove('selected'));
    const target = document.querySelector(`.bytes span[data-offset="${offset}"]`);
    if (target) target.classList.add('selected');

    // Pre-fill editor
    if (rom.data) {
        els.byteInput.value = Utils.toHex(rom.data[offset]);
    }

    updateInspector(offset);
}

function updateInspector(offset) {
    if (!rom.data) return;

    const u8 = rom.data[offset];
    const u16 = Utils.readU16(rom.data, offset);
    const u32 = Utils.readU32(rom.data, offset);

    els.inspector.u8.textContent = u8;
    els.inspector.u16.textContent = u16;
    els.inspector.u32.textContent = u32;
    
    // Pointer Check
    const isPtr = (u32 >= 0x08000000 && u32 <= 0x09FFFFFF);
    if (isPtr) {
        els.inspector.ptr.textContent = Utils.toHex(u32, 8);
        els.inspector.ptr.style.display = 'inline';
    } else {
        els.inspector.ptr.textContent = "No";
    }

    // Text Decoder Preview (Read next 20 bytes as string)
    const textStr = rom.readString(offset, 30);
    els.textPreview.textContent = textStr || "(No text)";
    }    const reader = new FileReader();
    reader.onload = (ev) => {
        rom.load(ev.target.result, file.name);
        initUI();
    };
    reader.readAsArrayBuffer(file);
});

els.save.addEventListener('click', () => rom.download());

els.go.addEventListener('click', () => {
    const val = parseInt(els.offset.value, 16);
    if (!isNaN(val)) renderGrid(val);
});

els.search.addEventListener('click', () => {
    const bytes = Utils.parseHexString(els.searchInput.value);
    if (bytes.length === 0) return alert("Invalid Hex");
    
    els.search.textContent = "⌛"; // Loading indicator
    setTimeout(() => {
        const foundAt = rom.find(bytes, currentOffset);
        els.search.textContent = "🔍";
        if (foundAt !== -1) {
            renderGrid(foundAt);
            selectByte(foundAt);
        } else {
            alert("Not found");
        }
    }, 10); // Small delay to let UI update
});

// Pointer click handler
els.inspector.ptr.addEventListener('click', () => {
    const ptrText = els.inspector.ptr.textContent;
    if (ptrText !== "-" && ptrText !== "No") {
        // Convert "08000100" -> 0x100 (Remove 08 prefix)
        const ptrVal = parseInt(ptrText, 16);
        const physicalOffset = ptrVal & 0x01FFFFFF; // Strip the 08/09 prefix
        renderGrid(physicalOffset);
        selectByte(physicalOffset);
    }
});

// --- Core Functions ---

function initUI() {
    els.save.disabled = false;
    const info = rom.getHeaderInfo();
    els.info.innerHTML = `
        <strong>${info.title}</strong><br>
        Code: ${info.code}<br>
        Size: ${(rom.data.length / 1024 / 1024).toFixed(2)} MB
    `;
    renderGrid(0);
}

function renderGrid(startOffset) {
    // Snap to nearest 16
    startOffset = Math.floor(startOffset / 16) * 16;
    currentOffset = startOffset;
    els.offset.value = Utils.toHex(startOffset, 6);
    els.grid.innerHTML = '';

    for (let i = 0; i < 50; i++) {
        const rowOffset = startOffset + (i * 16);
        if (rowOffset >= rom.data.length) break;

        const row = document.createElement('div');
        row.className = 'hex-row';

        // Offset
        const offSpan = document.createElement('span');
        offSpan.className = 'offset-label';
        offSpan.textContent = Utils.toHex(rowOffset, 6);
        row.appendChild(offSpan);

        // Bytes
        const bytesDiv = document.createElement('div');
        bytesDiv.className = 'bytes';
        
        let asciiStr = "";
        const rowData = rom.readBytes(rowOffset, 16);

        rowData.forEach((byte, idx) => {
            const bSpan = document.createElement('span');
            bSpan.textContent = Utils.toHex(byte);
            bSpan.dataset.offset = rowOffset + idx; // Store offset
            
            bSpan.onclick = () => selectByte(rowOffset + idx);
            
            if (selectedOffset === rowOffset + idx) bSpan.classList.add('selected');
            
            bytesDiv.appendChild(bSpan);
            asciiStr += Utils.getPrintableChar(byte);
        });
        row.appendChild(bytesDiv);

        // ASCII
        const asciiDiv = document.createElement('span');
        asciiDiv.className = 'ascii';
        asciiDiv.textContent = asciiStr;
        row.appendChild(asciiDiv);

        els.grid.appendChild(row);
    }
}

function selectByte(offset) {
    selectedOffset = offset;
    
    // Refresh grid highlight
    const allBytes = document.querySelectorAll('.bytes span');
    allBytes.forEach(b => b.classList.remove('selected'));
    const target = document.querySelector(`.bytes span[data-offset="${offset}"]`);
    if (target) target.classList.add('selected');

    updateInspector(offset);
}

function updateInspector(offset) {
    if (!rom.data) return;

    const u8 = rom.data[offset];
    const u16 = Utils.readU16(rom.data, offset);
    const u32 = Utils.readU32(rom.data, offset);

    els.inspector.u8.textContent = u8;
    els.inspector.u16.textContent = u16;
    els.inspector.u32.textContent = u32;
    els.inspector.hex.textContent = Utils.toHex(u32, 8);
    els.inspector.bin.textContent = u8.toString(2).padStart(8, '0');

    // Check if it's a valid ROM pointer (08XXXXXX or 09XXXXXX)
    // 0x08000000 = 134217728
    const isPtr = (u32 >= 0x08000000 && u32 <= 0x09FFFFFF);
    
    if (isPtr) {
        els.inspector.ptr.textContent = Utils.toHex(u32, 8);
        els.inspector.ptr.style.display = 'inline';
    } else {
        els.inspector.ptr.textContent = "No";
    }
}
