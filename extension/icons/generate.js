#!/usr/bin/env node
/**
 * Generates the extension icons as simple PNGs using a canvas.
 * Run once: node extension/icons/generate.js
 * The icons are committed — this is just the generator.
 */
const fs = require('fs');
const path = require('path');

// We can't use canvas in a pure-node environment without dependencies.
// Instead, generate a minimal valid PNG via raw bytes (a 1x1 is too small).
// The simplest approach: write an SVG file and let the extension use SVG icons.
// But manifest v3 wants PNG. So we generate a tiny but valid PNG.

// Minimal PNG encoder for a solid-color square (no dependencies).
function makePNG(size, r, g, b) {
  // PNG signature
  var sig = [137, 80, 78, 71, 13, 10, 26, 10];

  // IHDR chunk
  var width = size, height = size;
  var ihdr = [0, 0, 0, 13, 73, 72, 68, 82]; // length=13, type=IHDR
  // width (4 bytes BE)
  ihdr.push((width >> 24) & 0xff, (width >> 16) & 0xff, (width >> 8) & 0xff, width & 0xff);
  ihdr.push((height >> 24) & 0xff, (height >> 16) & 0xff, (height >> 8) & 0xff, height & 0xff);
  ihdr.push(8, 2, 0, 0, 0); // bit depth 8, color type 2 (RGB), compression 0, filter 0, interlace 0
  // CRC32
  ihdr = ihdr.concat(crc32(ihdr.slice(4, 4 + 4 + 13 + 0)));

  // IDAT chunk — raw pixel data with zlib compression
  var rawPixels = [];
  for (var y = 0; y < height; y++) {
    rawPixels.push(0); // filter type 0 (none)
    for (var x = 0; x < width; x++) {
      rawPixels.push(r, g, b);
    }
  }
  var compressed = zlibDeflate(rawPixels);
  var idat = [0, 0, 0, 0, 73, 68, 65, 84]; // length placeholder, type=IDAT
  var len = compressed.length;
  idat[0] = (len >> 24) & 0xff; idat[1] = (len >> 16) & 0xff;
  idat[2] = (len >> 8) & 0xff; idat[3] = len & 0xff;
  idat = idat.concat(compressed);
  idat = idat.concat(crc32(idat.slice(4, 4 + 4 + len)));

  // IEND chunk
  var iend = [0, 0, 0, 0, 73, 69, 78, 68];
  iend = iend.concat(crc32(iend.slice(4, 4 + 4)));

  return Buffer.from(sig.concat(ihdr, idat, iend));
}

// Minimal CRC32
function crc32(data) {
  var crc = 0xffffffff;
  for (var i = 0; i < data.length; i++) {
    crc = crc ^ data[i];
    for (var j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  crc = (crc ^ 0xffffffff) >>> 0;
  return [(crc >> 24) & 0xff, (crc >> 16) & 0xff, (crc >> 8) & 0xff, crc & 0xff];
}

// Minimal zlib deflate (stored block — no compression, just wrapping)
function zlibDeflate(data) {
  var result = [0x78, 0x01]; // zlib header (CMF=78, FLG=01)
  var offset = 0;
  while (offset < data.length) {
    var chunk = data.slice(offset, offset + 65535);
    var isLast = (offset + chunk.length >= data.length) ? 1 : 0;
    result.push(isLast); // BFINAL
    result.push(1); // BTYPE=00 (stored)
    var len = chunk.length;
    result.push(len & 0xff, (len >> 8) & 0xff);
    var nlen = (~len) & 0xffff;
    result.push(nlen & 0xff, (nlen >> 8) & 0xff);
    result = result.concat(chunk);
    offset += chunk.length;
  }
  // Adler-32 checksum
  var a = 1, b = 0;
  for (var i = 0; i < data.length; i++) {
    a = (a + data[i]) % 65521;
    b = (b + a) % 65521;
  }
  var adler = ((b << 16) | a) >>> 0;
  result.push((adler >> 24) & 0xff, (adler >> 16) & 0xff, (adler >> 8) & 0xff, adler & 0xff);
  return result;
}

// Generate icons
var dir = path.resolve(__dirname);
[16, 48, 128].forEach(function(size) {
  var png = makePNG(size, 178, 34, 52); // #b22234 — the hot red
  fs.writeFileSync(path.join(dir, 'icon' + size + '.png'), png);
  console.log('Generated icon' + size + '.png (' + png.length + ' bytes)');
});
