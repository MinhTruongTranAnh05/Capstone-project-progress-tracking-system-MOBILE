// Generate simple PNG icon programmatically
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(size, color) {
  const width = size;
  const height = size;
  // RGBA pixel data with filter byte (0) at start of each row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const offset = y * rowSize + 1 + x * 4;
      // Make it orange (E65100 = 230, 81, 0)
      rawData[offset] = color[0];     // R
      rawData[offset + 1] = color[1]; // G
      rawData[offset + 2] = color[2]; // B
      rawData[offset + 3] = color[3]; // A
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;   // bit depth
  ihdrData[9] = 6;   // color type (RGBA)
  ihdrData[10] = 0;  // compression
  ihdrData[11] = 0;  // filter
  ihdrData[12] = 0;  // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idat = makeChunk('IDAT', compressed);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Orange color (E65100)
const orange = [230, 81, 0, 255];

// Generate icons
const assetsDir = path.join(__dirname, '..', 'assets');

fs.writeFileSync(path.join(assetsDir, 'icon.png'), createPNG(1024, orange));
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), createPNG(1024, orange));
fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), createPNG(1242, orange));
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), createPNG(64, orange));

console.log('Generated all icon files');
