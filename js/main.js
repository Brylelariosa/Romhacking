import { RomHandler } from './rom.js';
import { Utils } from './utils.js';

const romHandler = new RomHandler();

// DOM Elements
const fileInput = document.getElementById('fileInput');
const btnLoad = document.getElementById('btnLoad');
const btnSave = document.getElementById('btnSave');
const btnGo = document.getElementById('btnGo');
const offsetInput = document.getElementById('offsetInput');
const hexGrid = document.getElementById('hexGrid');
const romInfoDiv = document.getElementById('romInfo');
const statusText = document.getElementById('statusText');

// State
let currentOffset = 0;
const ROWS_TO_RENDER = 50; // Render 50 lines at a time for performance

// --- Event Listeners ---

btnLoad.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        romHandler.load(event.target.result, file.name);
        initUI();
    };
    reader.readAsArrayBuffer(file);
});

btnSave.addEventListener('click', () => {
    romHandler.download();
});

btnGo.addEventListener('click', () => {
    const hex = offsetInput.value;
    const offset = parseInt(hex, 16);
    if (!isNaN(offset)) {
        renderHexView(offset);
    }
});

// --- Functions ---

function initUI() {
    btnSave.disabled = false;
    const info = romHandler.getHeaderInfo();
    
    statusText.textContent = `Loaded: ${info.title} (${info.code})`;
    
    romInfoDiv.innerHTML = `
        <strong>Title:</strong> ${info.title}<br>
        <strong>Code:</strong> ${info.code}<br>
        <strong>Size:</strong> ${(romHandler.data.length / 1024 / 1024).toFixed(1)} MB
    `;

    renderHexView(0);
}

function renderHexView(startOffset) {
    currentOffset = startOffset;
    hexGrid.innerHTML = '';

    for (let i = 0; i < ROWS_TO_RENDER; i++) {
        const rowOffset = startOffset + (i * 16);
        if (rowOffset >= romHandler.data.length) break;

        const bytes = romHandler.readBytes(rowOffset, 16);
        const rowEl = document.createElement('div');
        rowEl.className = 'hex-row';

        // 1. Offset Column
        const offsetEl = document.createElement('span');
        offsetEl.className = 'offset-label';
        offsetEl.textContent = Utils.toHex(rowOffset, 6);

        // 2. Bytes Column
        const bytesEl = document.createElement('div');
        bytesEl.className = 'bytes';
        
        let asciiStr = '';

        bytes.forEach((byte, index) => {
            const byteSpan = document.createElement('span');
            byteSpan.textContent = Utils.toHex(byte);
            
            // Allow clicking a byte to edit (Simple prompt for now)
            byteSpan.addEventListener('click', () => {
                const newVal = prompt(`Edit byte at ${Utils.toHex(rowOffset + index)}`, Utils.toHex(byte));
                if (newVal && /^[0-9A-Fa-f]{2}$/.test(newVal)) {
                    romHandler.writeByte(rowOffset + index, parseInt(newVal, 16));
                    renderHexView(currentOffset); // Refresh
                }
            });
            
            bytesEl.appendChild(byteSpan);
            asciiStr += Utils.getPrintableChar(byte);
        });

        // 3. ASCII Column
        const asciiEl = document.createElement('div');
        asciiEl.className = 'ascii';
        asciiEl.textContent = asciiStr;

        rowEl.appendChild(offsetEl);
        rowEl.appendChild(bytesEl);
        rowEl.appendChild(asciiEl);
        hexGrid.appendChild(rowEl);
    }
}
