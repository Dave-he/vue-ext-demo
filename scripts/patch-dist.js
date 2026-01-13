#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const distPopupHtml = join(process.cwd(), 'dist', 'popup', 'index.html')

if (!existsSync(distPopupHtml)) {
	console.log('[33m[1m[0m')
	console.log('[33m[1m⚠️ dist/popup/index.html not found, skip patch[0m')
	process.exit(0)
}

const html = readFileSync(distPopupHtml, 'utf-8')

// Vite 生成的 popup/index.html 内 script src 默认是相对 popup/ 的路径
// 但构建产物的 js 在 dist/assets/js 下，因此需要回退一级
const patched = html
	.replace('src="assets/js/popup.js"', 'src="../assets/js/popup.js"')
	.replace('href="assets/css/popup.css"', 'href="../assets/css/popup.css"')

if (patched !== html) {
	writeFileSync(distPopupHtml, patched, 'utf-8')
	console.log('✅ Patched dist/popup/index.html asset paths')
} else {
	console.log('ℹ️ dist/popup/index.html already patched (or no matching patterns)')
}
