#!/usr/bin/env node

import { writeFileSync, existsSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'

const distSettings = join(process.cwd(), 'dist', 'settings')

if (!existsSync(distSettings)) {
  mkdirSync(distSettings, { recursive: true })
}

const settingsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ollama Settings</title>
  <link rel="stylesheet" href="../assets/css/settings.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="../assets/js/settings.js"></script>
</body>
</html>`

writeFileSync(join(distSettings, 'index.html'), settingsHtml)

const vueFiles = ['Settings.vue', 'main.ts'].filter(file => {
  const filePath = join(distSettings, file)
  if (existsSync(filePath)) {
    rmSync(filePath)
    return true
  }
  return false
})

if (vueFiles.length > 0) {
  console.log(`✅ settings/index.html created, cleaned up ${vueFiles.join(', ')}`)
} else {
  console.log('✅ settings/index.html created in dist/')
}
