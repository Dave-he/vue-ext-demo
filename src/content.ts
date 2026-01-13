import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Readability } from '@mozilla/readability'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import App from './components/App.vue'

type ExportMode = 'selection' | 'article'

interface ExportRequest {
	action: 'exportMarkdown'
	mode: ExportMode
}

interface ExportResponse {
	title: string
	url: string
	markdown: string
}

function createTurndownService() {
	const service = new TurndownService({
		headingStyle: 'atx',
		codeBlockStyle: 'fenced',
		bulletListMarker: '-',
		emDelimiter: '*'
	})

	// GitHub Flavored Markdown：表格、删除线、任务列表等
	service.use(gfm)

	// 更好地保留换行
	service.keep(['br'])

	// 避免导出大量无意义内容
	service.remove(['script', 'style', 'noscript'])

	return service
}

function selectionToHtml(): string | null {
	const selection = window.getSelection()
	if (!selection || selection.rangeCount === 0) return null

	const container = document.createElement('div')
	for (let i = 0; i < selection.rangeCount; i++) {
		container.appendChild(selection.getRangeAt(i).cloneContents())
	}

	const html = container.innerHTML.trim()
	return html.length ? html : null
}

function exportSelectionMarkdown(): ExportResponse {
	const title = document.title || 'Untitled'
	const url = location.href

	const html = selectionToHtml()
	const turndown = createTurndownService()

	const markdownBody = html
		? turndown.turndown(html)
		: (window.getSelection()?.toString() || '').trim()

	return {
		title,
		url,
		markdown: `# ${title}\n\n> ${url}\n\n${markdownBody}`.trim() + '\n'
	}
}

function exportArticleMarkdown(): ExportResponse {
	const url = location.href

	// Readability 需要干净的 DOM 副本
	const doc = document.cloneNode(true) as Document
	const reader = new Readability(doc)
	const article = reader.parse()

	const title = article?.title || document.title || 'Untitled'
	const contentHtml = article?.content || document.body?.innerHTML || ''

	const turndown = createTurndownService()
	const markdownBody = turndown.turndown(contentHtml)

	return {
		title,
		url,
		markdown: `# ${title}\n\n> ${url}\n\n${markdownBody}`.trim() + '\n'
	}
}

function safeErrorMarkdown(e: unknown) {
	const title = document.title || 'Untitled'
	const url = location.href
	return {
		title,
		url,
		markdown: `# ${title}\n\n> ${url}\n\n导出失败：${String(e)}` + '\n'
	} satisfies ExportResponse
}

// 创建应用实例（保留现有注入 UI，避免破坏原演示）
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const mountPoint = document.createElement('div')
mountPoint.id = 'vue-extension-root'
document.body.appendChild(mountPoint)

app.mount('#vue-extension-root')

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request: ExportRequest, _sender, sendResponse) => {
	if (request.action === 'exportMarkdown') {
		try {
			const res = request.mode === 'selection' ? exportSelectionMarkdown() : exportArticleMarkdown()
			sendResponse(res)
		} catch (e) {
			sendResponse(safeErrorMarkdown(e))
		}
		return true
	}
	return true
})

console.log('Vue extension content script loaded')
