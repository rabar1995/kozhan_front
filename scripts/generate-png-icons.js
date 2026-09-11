import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c;
    }
    return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
        crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(8 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcBuf = Buffer.alloc(4 + len);
    buf.copy(crcBuf, 0, 4, 8 + len);
    const crcVal = crc32(crcBuf);
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
}

function generatePNG(width, height) {
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // color type RGBA
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace
    const ihdrChunk = createChunk('IHDR', ihdr);

    // Raw image data: filter byte (0) + width * 4 bytes per row
    const rowLength = 1 + width * 4;
    const rawData = Buffer.alloc(rowLength * height);

    const cx = width / 2;
    const cy = height / 2;
    const rOuter = width * 0.42;
    const rCorner = width * 0.22;

    for (let y = 0; y < height; y++) {
        const rowOffset = y * rowLength;
        rawData[rowOffset] = 0; // None filter

        for (let x = 0; x < width; x++) {
            const pixelOffset = rowOffset + 1 + x * 4;

            // Background rounded rectangle
            const dx = Math.max(0, Math.abs(x - cx) - (cx - rCorner));
            const dy = Math.max(0, Math.abs(y - cy) - (cy - rCorner));
            const distCorner = Math.sqrt(dx * dx + dy * dy);

            if (distCorner > rCorner) {
                // Transparent outside rounded rect
                rawData[pixelOffset] = 0;
                rawData[pixelOffset + 1] = 0;
                rawData[pixelOffset + 2] = 0;
                rawData[pixelOffset + 3] = 0;
                continue;
            }

            // Indigo gradient background: (79, 70, 229) to (15, 23, 42)
            const t = (x + y) / (width + height);
            let r = Math.round(79 * (1 - t) + 15 * t);
            let g = Math.round(70 * (1 - t) + 23 * t);
            let b = Math.round(229 * (1 - t) + 42 * t);
            let a = 255;

            // Arrow shapes & central circle
            const distCenter = Math.hypot(x - cx, y - cy);

            // Ring
            if (Math.abs(distCenter - width * 0.35) < width * 0.015) {
                r = 99; g = 102; b = 241; a = 200;
            }

            // Top Arrow (Incoming/Right)
            if (y > cy - width * 0.12 && y < cy - width * 0.05 && x > cx - width * 0.25 && x < cx + width * 0.25) {
                r = 129; g = 140; b = 248; a = 255;
            }
            // Bottom Arrow (Outgoing/Left)
            if (y > cy + width * 0.05 && y < cy + width * 0.12 && x > cx - width * 0.25 && x < cx + width * 0.25) {
                r = 16; g = 185; b = 129; a = 255;
            }

            // Central Green Dot
            if (distCenter < width * 0.07) {
                r = 16; g = 185; b = 129; a = 255;
            } else if (distCenter < width * 0.085) {
                r = 255; g = 255; b = 255; a = 255;
            }

            rawData[pixelOffset] = r;
            rawData[pixelOffset + 1] = g;
            rawData[pixelOffset + 2] = b;
            rawData[pixelOffset + 3] = a;
        }
    }

    const compressedData = zlib.deflateSync(rawData);
    const idatChunk = createChunk('IDAT', compressedData);
    const iendChunk = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('./public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192, 512x512, apple-touch-icon
const p192 = generatePNG(192, 192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), p192);

const p512 = generatePNG(512, 512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), p512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), p512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), p192);

console.log('PWA PNG icons generated successfully in /public!');
