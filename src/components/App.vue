<template>
  <div class="vue-extension-app">
    <div class="header">
      <h1>AI Tools</h1>
      <div class="tab-switcher">
        <button
          :class="['tab-btn', { active: activeTab === 'chat' }]"
          @click="activeTab = 'chat'"
        >
          Ollama
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'markdown' }]"
          @click="activeTab = 'markdown'"
        >
          Markdown
        </button>
      </div>
    </div>

    <div class="content">
      <OllamaChat v-show="activeTab === 'chat'" @openSettings="openSettings" />

      <div v-show="activeTab === 'markdown'" class="markdown-tools">
        <div class="feature-card">
          <h3>Export</h3>
          <div class="btn-row">
            <button class="btn btn-primary" :disabled="loading" @click="exportMarkdown('selection')">
              Export Selection
            </button>
            <button class="btn" :disabled="loading" @click="exportMarkdown('article')">
              Export Page
            </button>
          </div>

          <div class="btn-row" v-if="markdown">
            <button class="btn" @click="copyMarkdown">Copy Markdown</button>
            <button class="btn" @click="downloadMarkdown">Download .md</button>
          </div>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="loading" class="hint">Processing page content...</p>
        </div>

        <div class="feature-card">
          <h3>Preview</h3>
          <div v-if="!markdown" class="empty">Click button above to export</div>
          <textarea v-else class="preview" readonly :value="markdown" />
        </div>
      </div>

      <div class="status-card">
        <h3>Status</h3>
        <div class="status-item">
          <span>Extension:</span>
          <span :class="{ active: extensionEnabled }">
            {{ extensionEnabled ? 'Enabled' : 'Disabled' }}
          </span>
        </div>
        <div class="status-item">
          <span>Version:</span>
          <span>{{ version }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import OllamaChat from './OllamaChat.vue'

type ExportMode = 'selection' | 'article'

interface ExportResponse {
  title: string
  url: string
  markdown: string
}

const activeTab = ref('chat')
const extensionEnabled = ref(false)
const version = ref('1.0.0')
const loading = ref(false)
const error = ref('')
const markdown = ref('')
const lastTitle = ref('')

onMounted(async () => {
  const result = await chrome.storage.sync.get(['enabled'])
  extensionEnabled.value = result.enabled ?? true

  const manifest = chrome.runtime.getManifest()
  version.value = manifest.version
})

function openSettings() {
  chrome.runtime.openOptionsPage?.()
}

async function getActiveTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) throw new Error('Cannot find current tab')
  return tab.id
}

async function exportMarkdown(mode: ExportMode) {
  loading.value = true
  error.value = ''

  try {
    const tabId = await getActiveTabId()

    const res = (await chrome.tabs.sendMessage(tabId, {
      action: 'exportMarkdown',
      mode
    })) as ExportResponse

    markdown.value = res.markdown
    lastTitle.value = res.title || 'page'
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

async function copyMarkdown() {
  if (!markdown.value) return
  await navigator.clipboard.writeText(markdown.value)
}

function downloadMarkdown() {
  if (!markdown.value) return

  const blob = new Blob([markdown.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const safeTitle = (lastTitle.value || 'page')
    .replace(/[\\/:*?"<>|]/g, '_')
    .slice(0, 80)

  const a = document.createElement('a')
  a.href = url
  a.download = `${safeTitle}.md`
  a.click()

  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.vue-extension-app {
  width: 360px;
  min-height: 500px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #ffffff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e5e5;
  background: #fafafa;
}

.header h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.tab-switcher {
  display: flex;
  gap: 4px;
  background: #f0f0f0;
  padding: 3px;
  border-radius: 6px;
}

.tab-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.tab-btn.active {
  background: white;
  color: #333;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.content {
  padding: 16px;
}

.markdown-tools {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-card,
.status-card {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.feature-card h3,
.status-card h3 {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #666;
}

.btn-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn:hover {
  background: #f5f5f5;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.btn-primary:hover {
  background: #1565c0;
}

.status-card {
  margin-top: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.status-item span:first-child {
  font-weight: 500;
}

.status-item .active {
  color: #2e7d32;
  font-weight: bold;
}

.preview {
  width: 100%;
  height: 200px;
  resize: vertical;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
  padding: 8px;
  font-size: 12px;
  line-height: 1.45;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: #fff;
  box-sizing: border-box;
}

.empty {
  font-size: 12px;
  color: #888;
  padding: 6px 0;
}

.hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: #666;
}

.error {
  margin: 10px 0 0;
  font-size: 12px;
  color: #c62828;
  white-space: pre-wrap;
}
</style>
