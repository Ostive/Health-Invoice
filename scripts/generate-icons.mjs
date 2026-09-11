// Regenerates every favicon / app icon from public/icon.svg.
// Usage: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'

const TILE = '<rect width="512" height="512" rx="112" fill="#55309e"/>'
const svg = await readFile('public/icon.svg', 'utf8')
if (!svg.includes(TILE)) throw new Error('Background tile not found in public/icon.svg')

// iOS, Android and Windows apply their own mask: give them a square, full-bleed tile
const fullBleed = svg.replace(TILE, '<rect width="512" height="512" fill="#55309e"/>')
// Maskable icons are cropped to a circle: shrink the drawing into the safe zone
const maskable = svg
  .replace(TILE, '<rect width="512" height="512" fill="#55309e"/><g transform="translate(38.4 38.4) scale(0.85)">')
  .replace('</svg>', '</g></svg>')

const png = (source, size) => sharp(Buffer.from(source), { density: 288 }).resize(size, size).png().toBuffer()

const targets = [
  ...[16, 32, 96].map(s => [`favicon-${s}x${s}.png`, s, svg]),
  ...[36, 48, 72, 96, 144, 192].map(s => [`android-icon-${s}x${s}.png`, s, svg]),
  ...[57, 60, 72, 76, 114, 120, 144, 152, 180].map(s => [`apple-icon-${s}x${s}.png`, s, fullBleed]),
  ['apple-icon.png', 180, fullBleed],
  ['apple-icon-precomposed.png', 180, fullBleed],
  ...[70, 144, 150, 310].map(s => [`ms-icon-${s}x${s}.png`, s, fullBleed]),
  ['icon-192.png', 192, svg],
  ['icon-512.png', 512, svg],
  ['icon-maskable-512.png', 512, maskable],
]

for (const [name, size, source] of targets) {
  await writeFile(`public/${name}`, await png(source, size))
}

// favicon.ico: PNG entries packed in an ICO container
const icoSizes = [16, 32, 48]
const images = await Promise.all(icoSizes.map(s => png(svg, s)))
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(images.length, 4)
const directory = Buffer.alloc(16 * images.length)
let offset = header.length + directory.length
images.forEach((image, i) => {
  const entry = i * 16
  directory.writeUInt8(icoSizes[i], entry)
  directory.writeUInt8(icoSizes[i], entry + 1)
  directory.writeUInt16LE(1, entry + 4)
  directory.writeUInt16LE(32, entry + 6)
  directory.writeUInt32LE(image.length, entry + 8)
  directory.writeUInt32LE(offset, entry + 12)
  offset += image.length
})
await writeFile('public/favicon.ico', Buffer.concat([header, directory, ...images]))

console.log(`${targets.length + 1} icônes générées dans public/`)
