#!/usr/bin/env node

import { writeFileSync } from 'fs'
import { join } from 'path'

// 创建简单的 SVG 图标
const createIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#42b883"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/4}" fill="#ffffff"/>
</svg>`

const sizes = [16, 48, 128]
const iconsDir = join(process.cwd(), 'dist', 'assets', 'icons')

sizes.forEach(size => {
  const svg = createIcon(size)
  writeFileSync(join(iconsDir, `icon${size}.svg`), svg)
  console.log(`✅ Created icon${size}.svg`)
})

console.log('🎉 Icons generated successfully!')