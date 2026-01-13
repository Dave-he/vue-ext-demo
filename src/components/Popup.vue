<template>
	<div class="popup-container">
		<div class="popup-header">
			<h2>页面转 Markdown</h2>
		</div>

		<div class="popup-content">
			<div class="feature-card">
				<h3>导出</h3>
				<div class="btn-row">
					<button class="btn btn-primary" :disabled="loading" @click="exportMarkdown('selection')">
						仅导出选中文本
					</button>
					<button class="btn" :disabled="loading" @click="exportMarkdown('article')">
						导出整页正文
					</button>
				</div>

				<div class="btn-row" v-if="markdown">
					<button class="btn" @click="copyMarkdown">复制 Markdown</button>
					<button class="btn" @click="downloadMarkdown">下载 .md</button>
				</div>

				<p v-if="error" class="error">{{ error }}</p>
				<p v-if="loading" class="hint">正在整理页面内容…</p>
			</div>

			<div class="status-card">
				<h3>预览</h3>
				<div v-if="!markdown" class="empty">点击上方按钮开始导出</div>
				<textarea v-else class="preview" readonly :value="markdown" />
			</div>

			<div class="status-card">
				<h3>状态</h3>
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

type ExportMode = 'selection' | 'article'

interface ExportResponse {
	title: string
	url: string
	markdown: string
}

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

async function getActiveTabId(): Promise<number> {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
	if (!tab?.id) throw new Error('未找到当前 Tab')
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

		if (mode === 'selection' && res.markdown.trim().endsWith('> ' + res.url) === false) {
			// no-op：只是保留一个可扩展的位置
		}
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
.popup-container {
	width: 360px;
	padding: 16px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	background: #ffffff;
}

.popup-header h2 {
	margin: 0 0 12px 0;
	font-size: 16px;
	color: #333;
}

.popup-content {
	display: flex;
	flex-direction: column;
	gap: 12px;
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
	height: 220px;
	resize: vertical;
	border-radius: 6px;
	border: 1px solid #e5e5e5;
	padding: 8px;
	font-size: 12px;
	line-height: 1.45;
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
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
