#!/usr/bin/env node

import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

const sourceManifest = join(process.cwd(), 'src', 'manifest.json')
const destManifest = join(process.cwd(), 'dist', 'manifest.json')

if (existsSync(sourceManifest)) {
  copyFileSync(sourceManifest, destManifest)
  console.log('✅ manifest.json copied to dist/')
} else {
  console.error('❌ Source manifest.json not found')
  process.exit(1)
}