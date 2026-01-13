#!/usr/bin/env node

import { existsSync } from 'fs'
import { join } from 'path'

const distPath = join(process.cwd(), 'dist')
const requiredFiles = [
  'manifest.json',
  'assets/js/background.js',
  'assets/js/content.js',
  'assets/js/popup.js',
  'assets/css/content.css',
  'assets/css/popup.css',
  'popup/index.html'
]

const optionalFiles = [
  'assets/icons/icon16.svg',
  'assets/icons/icon48.svg',
  'assets/icons/icon128.svg'
]

console.log('🔍 Extension Build Verification')
console.log('================================')

let allRequiredFilesExist = true

console.log('\n📋 Required Files:')
requiredFiles.forEach(file => {
  const fullPath = join(distPath, file)
  const exists = existsSync(fullPath)
  console.log(`  ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allRequiredFilesExist = false
})

console.log('\n📋 Optional Files:')
optionalFiles.forEach(file => {
  const fullPath = join(distPath, file)
  const exists = existsSync(fullPath)
  console.log(`  ${exists ? '✅' : '⚠️'} ${file}`)
})

if (allRequiredFilesExist) {
  console.log('\n🎉 All required files are present!')
  console.log('\n🚀 Ready to install in browser:')
  console.log('   1. Open chrome://extensions/')
  console.log('   2. Enable Developer mode')
  console.log('   3. Load unpacked extension')
  console.log('   4. Select the "dist" folder')
} else {
  console.log('\n❌ Some required files are missing!')
  console.log('Please run "pnpm build" again.')
}

console.log('')